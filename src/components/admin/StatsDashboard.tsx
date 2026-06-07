'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { fetchStats, type DayCount, type LabelCount, type Stats } from '@/lib/stats'
import { haptic } from '@/lib/telegram'

const RANGES: { days: number; label: string }[] = [
  { days: 1, label: 'сутки' },
  { days: 7, label: '7 дн' },
  { days: 30, label: '30 дн' },
  { days: 90, label: '90 дн' },
  { days: 365, label: 'год' },
]

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
const fmtMoney = (minor: number) => `${Math.round(minor / 100).toLocaleString('ru')} ₽`

export default function StatsDashboard() {
  const [range, setRange] = useState<number>(30)
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (days: number) => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetchStats(days))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить статистику')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(range)
  }, [range, load])

  const rangeLabel = RANGES.find((r) => r.days === range)?.label ?? `${range} дн`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex gap-1 overflow-x-auto rounded-full p-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}
        >
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => {
                haptic('light')
                setRange(r.days)
              }}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: range === r.days ? 'var(--rose-dim)' : 'transparent',
                color: range === r.days ? 'var(--rose)' : 'rgba(255,255,255,0.45)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(range)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}
        >
          <ArrowClockwise
            size={14}
            color="rgba(255,255,255,0.6)"
            className={loading ? 'animate-spin-slow' : ''}
          />
        </button>
      </div>

      {error && (
        <p
          className="rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          {error}
        </p>
      )}

      {!data && loading && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Загрузка…
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label={`Выручка · ${rangeLabel}`}
              value={fmtMoney(data.revenue.in_range_minor)}
              cur={data.revenue.in_range_minor}
              prev={data.revenue.prev_range_minor}
              accent
            />
            <KpiCard
              label={`Платящих · ${rangeLabel}`}
              value={data.revenue.payers_in_range.toLocaleString('ru')}
              cur={data.revenue.payers_in_range}
              prev={data.revenue.payers_prev_range}
            />
            <KpiCard
              label={`Новые · ${rangeLabel}`}
              value={data.users.new_in_range.toLocaleString('ru')}
              cur={data.users.new_in_range}
              prev={data.users.new_prev_range}
            />
            <KpiCard
              label={`Генерации · ${rangeLabel}`}
              value={data.generations.in_range.toLocaleString('ru')}
              cur={data.generations.in_range}
              prev={data.generations.prev_range}
            />
          </div>

          <Section title="Деньги">
            <Sparkline
              data={data.revenue.series.map((d) => ({ day: d.day, count: d.minor }))}
              color="#5FD296"
              label={`выручка по дням · ${rangeLabel}`}
              fmt={fmtMoney}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Выручка всего" value={data.revenue.total_minor} money />
              <Metric label="Средний чек" value={data.revenue.aov_minor} money sub="AOV" />
              <Metric label="Доход с платящего" value={data.revenue.arppu_minor} money sub="ARPPU" />
              <Metric
                label="Конверсия оплат"
                value={pct(data.revenue.orders_paid, data.revenue.orders_created)}
                suffix="%"
                sub={`${data.revenue.orders_paid}/${data.revenue.orders_created} счетов`}
              />
              <Metric label="Возвраты" value={data.revenue.refunded_minor} money />
              <Metric
                label="Токенов на балансах"
                value={data.monetization.tokens_outstanding}
                sub="не потрачены"
              />
            </div>
            {data.revenue.top_spenders.length > 0 && (
              <BarList color="#5FD296" items={data.revenue.top_spenders} title="Топ по тратам, ₽" />
            )}
          </Section>

          <Section title="Операции">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric
                label="Заявки на вывод"
                value={data.operations.pending_withdrawals}
                sub={
                  data.operations.pending_withdrawals > 0
                    ? `${fmtMoney(data.operations.pending_withdrawal_minor)} ждут`
                    : 'нет ожидающих'
                }
                alert={data.operations.pending_withdrawals > 0}
              />
              <Metric label="Генераций в работе" value={data.operations.jobs_in_flight} />
              <Metric
                label={`Ошибок · ${rangeLabel}`}
                value={data.operations.failed_in_range}
                alert={data.operations.failed_in_range > 0}
              />
              <Metric
                label="Заблокировали бота"
                value={data.users.blocked}
                sub={`${pct(data.users.blocked, data.users.total)}% базы`}
              />
            </div>
          </Section>

          <Section title="Пользователи">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Всего" value={data.users.total} />
              <Metric
                label={`Активные · ${rangeLabel}`}
                value={data.users.active_in_range}
                sub="делали генерацию"
                accent
              />
            </div>
            <Sparkline
              data={data.users.new_series}
              color="var(--rose)"
              label="новые регистрации по дням"
            />
            <Sparkline
              data={data.users.active_series}
              color="#3FD4E0"
              label="активные по дням (DAU)"
            />
            <BarList
              color="#7B5CF6"
              title="Источники"
              items={[
                { label: 'Рефералы', count: data.users.from_referral },
                { label: 'Трафик-партнёры', count: data.users.from_traffic },
                { label: 'Органика', count: data.users.organic },
              ]}
            />
          </Section>

          <Section title="Воронка (за всё время)">
            <FunnelBar
              label="Зарегистрировались"
              value={data.funnel.total}
              total={data.funnel.total}
              color="rgba(255,255,255,0.5)"
            />
            <FunnelBar
              label="Хоть раз генерили"
              value={data.funnel.ever_generated}
              total={data.funnel.total}
              color="#3FD4E0"
            />
            <FunnelBar
              label="Довели до результата"
              value={data.funnel.ever_completed}
              total={data.funnel.total}
              color="#5FD296"
            />
            <FunnelBar
              label="Хоть раз платили"
              value={data.funnel.ever_paid}
              total={data.funnel.total}
              color="var(--rose)"
            />
          </Section>

          <Section title="Генерации">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Всего" value={data.generations.total} />
              <Metric label={`За ${rangeLabel}`} value={data.generations.in_range} accent />
              <Metric
                label="Успешно"
                value={data.generations.completed}
                sub={`${pct(data.generations.completed, data.generations.total)}%`}
              />
              <Metric
                label="Ошибки"
                value={data.generations.failed}
                sub={`${pct(data.generations.failed, data.generations.total)}%`}
              />
              <Metric
                label="Отказ модерации"
                value={data.generations.rejected}
                sub={`${pct(data.generations.rejected, data.generations.total)}%`}
              />
            </div>
            <Sparkline data={data.generations.series} color="#3FD4E0" label="генерации по дням" />
            {data.generations.top_styles.length > 0 ? (
              <BarList color="#FF8A4C" items={data.generations.top_styles} title="Популярные виды" />
            ) : (
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Популярные виды появятся по мере новых генераций.
              </p>
            )}
          </Section>

          <Section title="Токены">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Куплено" value={data.monetization.tokens_purchased} />
              <Metric label="Потрачено" value={data.monetization.tokens_consumed} />
              <Metric label="Повторные покупатели" value={data.monetization.repeat_buyers} />
              <Metric label="Оплат всего" value={data.monetization.paid_orders} />
            </div>
            {data.monetization.pack_mix.length > 0 && (
              <BarList color="#5FD296" items={data.monetization.pack_mix} title="Что покупают" />
            )}
          </Section>

          <Section title="Рефералы">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Пришли по рефералке" value={data.referral.referred_users} />
              <Metric label="Пришли по трафику" value={data.referral.traffic_users} />
              <Metric label="Выплачено бонусов" value={data.referral.payout_minor} money />
            </div>
            {data.referral.top_referrers.length > 0 && (
              <BarList
                color="var(--rose)"
                items={data.referral.top_referrers}
                title="Топ рефереров (приглашено)"
              />
            )}
          </Section>

          <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            обновлено {new Date(data.generated_at).toLocaleTimeString('ru')} · кэш 60с
          </p>
        </>
      )}
    </div>
  )
}

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (prev <= 0 && cur <= 0) return null
  if (prev <= 0) {
    return (
      <span className="text-[10px] font-medium" style={{ color: '#5FD296' }}>
        ▲ ново
      </span>
    )
  }
  const d = Math.round(((cur - prev) / prev) * 100)
  const flat = d === 0
  const up = d > 0
  const color = flat ? 'rgba(255,255,255,0.4)' : up ? '#5FD296' : '#ff9aae'
  const arrow = flat ? '–' : up ? '▲' : '▼'
  return (
    <span className="text-[10px] font-medium tabular-nums" style={{ color }}>
      {arrow} {Math.abs(d)}% к пред.
    </span>
  )
}

function KpiCard({
  label,
  value,
  cur,
  prev,
  accent,
}: {
  label: string
  value: string
  cur: number
  prev: number
  accent?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-2xl px-3.5 py-3"
      style={{
        background: accent
          ? 'linear-gradient(135deg, rgba(95,210,150,0.10), rgba(255,255,255,0.03))'
          : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span
        className="font-sans tabular-nums"
        style={{
          fontSize: 21,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      <Delta cur={cur} prev={prev} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Metric({
  label,
  value,
  sub,
  accent,
  alert,
  money,
  suffix,
}: {
  label: string
  value: number
  sub?: string
  accent?: boolean
  alert?: boolean
  money?: boolean
  suffix?: string
}) {
  const display = money ? fmtMoney(value) : `${value.toLocaleString('ru')}${suffix ?? ''}`
  const color = alert ? '#ff9aae' : accent ? 'var(--rose)' : 'var(--text)'
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
      style={{
        background: alert ? 'rgba(180,30,60,0.10)' : 'rgba(255,255,255,0.04)',
        border: alert ? '1px solid rgba(180,30,60,0.22)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span
        className="font-sans tabular-nums"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color, lineHeight: 1.1 }}
      >
        {display}
      </span>
      {sub && (
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function Sparkline({
  data,
  color,
  label,
  fmt,
}: {
  data: DayCount[]
  color: string
  label: string
  fmt?: (v: number) => string
}) {
  if (data.length < 2) return null
  const counts = data.map((d) => d.count)
  const w = 100
  const h = 30
  const max = Math.max(1, ...counts)
  const peak = Math.max(...counts)
  const step = w / (counts.length - 1)
  const line = counts
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(' ')
  const area = `0,${h} ${line} ${w},${h}`
  return (
    <div className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 40 }}>
        <polygon points={area} fill={color} opacity={0.12} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {label}
        </span>
        <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
          пик {fmt ? fmt(peak) : peak.toLocaleString('ru')}
        </span>
      </div>
    </div>
  )
}

function BarList({ items, color, title }: { items: LabelCount[]; color: string; title?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div className="flex flex-col gap-2">
      {title && (
        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {title}
        </span>
      )}
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span
            className="w-24 flex-shrink-0 truncate text-[11px]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {it.label}
          </span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${(it.count / max) * 100}%`, background: color }}
            />
          </div>
          <span
            className="w-12 flex-shrink-0 text-right text-[11px] tabular-nums"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {it.count.toLocaleString('ru')}
          </span>
        </div>
      ))}
    </div>
  )
}

function FunnelBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const p = pct(value, total)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {label}
        </span>
        <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {value.toLocaleString('ru')} · {p}%
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${p}%`, background: color, transition: 'width 0.4s ease' }}
        />
      </div>
    </div>
  )
}
