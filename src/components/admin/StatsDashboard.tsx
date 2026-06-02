'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { fetchStats, type DayCount, type LabelCount, type Stats } from '@/lib/stats'
import { haptic } from '@/lib/telegram'

const RANGES = [7, 30, 90] as const
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}>
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => {
                haptic('light')
                setRange(d)
              }}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: range === d ? 'var(--rose-dim)' : 'transparent',
                color: range === d ? 'var(--rose)' : 'rgba(255,255,255,0.45)',
              }}
            >
              {d} дн
            </button>
          ))}
        </div>
        <button
          onClick={() => load(range)}
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}
        >
          <ArrowClockwise size={14} color="rgba(255,255,255,0.6)" className={loading ? 'animate-spin-slow' : ''} />
        </button>
      </div>

      {error && (
        <p className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.22)', color: '#ff9aae' }}>
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
          <Section title="Пользователи">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Всего" value={data.users.total} />
              <Metric label={`Новые · ${range}дн`} value={data.users.new_in_range} accent />
              <Metric label={`Активные · ${range}дн`} value={data.users.active_in_range} sub="делали генерацию" />
              <Metric label="Заблокировали бота" value={data.users.blocked} />
            </div>
            <Sparkline data={data.users.new_series} color="var(--rose)" label="новые регистрации по дням" />
            <BarList
              color="#7B5CF6"
              items={[
                { label: 'Рефералы', count: data.users.from_referral },
                { label: 'Трафик-партнёры', count: data.users.from_traffic },
                { label: 'Органика', count: data.users.organic },
              ]}
            />
          </Section>

          <Section title="Воронка (за всё время)">
            <FunnelBar label="Зарегистрировались" value={data.funnel.total} total={data.funnel.total} color="rgba(255,255,255,0.5)" />
            <FunnelBar label="Хоть раз генерили" value={data.funnel.ever_generated} total={data.funnel.total} color="#3FD4E0" />
            <FunnelBar label="Довели до результата" value={data.funnel.ever_completed} total={data.funnel.total} color="#5FD296" />
            <FunnelBar label="Хоть раз платили" value={data.funnel.ever_paid} total={data.funnel.total} color="var(--rose)" />
          </Section>

          <Section title="Генерации">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Всего" value={data.generations.total} />
              <Metric label={`За ${range}дн`} value={data.generations.in_range} accent />
              <Metric label="Успешно" value={data.generations.completed} sub={`${pct(data.generations.completed, data.generations.total)}%`} />
              <Metric label="Отказ модерации" value={data.generations.rejected} sub={`${pct(data.generations.rejected, data.generations.total)}%`} />
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

          <Section title="Монетизация">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Платящих" value={data.monetization.paying_users} sub={`${pct(data.monetization.paying_users, data.users.total)}% конверсия`} accent />
              <Metric label="Оплат" value={data.monetization.paid_orders} />
              <Metric label="Повторные покупатели" value={data.monetization.repeat_buyers} />
              <Metric label="Токенов куплено" value={data.monetization.tokens_purchased} />
              <Metric label="Токенов потрачено" value={data.monetization.tokens_consumed} />
              <Metric label="Токенов на балансах" value={data.monetization.tokens_outstanding} sub="не сгоревшие" />
            </div>
            {data.monetization.pack_mix.length > 0 && (
              <BarList color="#5FD296" items={data.monetization.pack_mix} title="Что покупают" />
            )}
          </Section>

          <Section title="Рефералы">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric label="Пришли по рефералке" value={data.referral.referred_users} />
              <Metric label="Пришли по трафику" value={data.referral.traffic_users} />
              <Metric label="Выплачено бонусов" value={Math.round(data.referral.payout_minor / 100)} sub="₽" />
            </div>
            {data.referral.top_referrers.length > 0 && (
              <BarList color="var(--rose)" items={data.referral.top_referrers} title="Топ рефереров (приглашено)" />
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

function Metric({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span className="font-sans tabular-nums" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color: accent ? 'var(--rose)' : 'var(--text)', lineHeight: 1.1 }}>
        {value.toLocaleString('ru')}
      </span>
      {sub && (
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function Sparkline({ data, color, label }: { data: DayCount[]; color: string; label: string }) {
  if (data.length < 2) return null
  const counts = data.map((d) => d.count)
  const w = 100
  const h = 30
  const max = Math.max(1, ...counts)
  const step = w / (counts.length - 1)
  const line = counts.map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`).join(' ')
  const area = `0,${h} ${line} ${w},${h}`
  return (
    <div className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 40 }}>
        <polygon points={area} fill={color} opacity={0.12} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </span>
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
          <span className="w-24 flex-shrink-0 truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {it.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full" style={{ width: `${(it.count / max) * 100}%`, background: color }} />
          </div>
          <span className="w-9 flex-shrink-0 text-right text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {it.count.toLocaleString('ru')}
          </span>
        </div>
      ))}
    </div>
  )
}

function FunnelBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
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
      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}
