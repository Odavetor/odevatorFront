'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowClockwise,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  ChartLineUp,
  Archive,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import {
  listCampaigns,
  createCampaign,
  fetchCampaignAnalytics,
  archiveCampaign,
  restoreCampaign,
  type Campaign,
  type CampaignAnalytics,
  type CampaignDayCount,
} from '@/lib/campaign'
import { haptic, hapticNotify } from '@/lib/telegram'

const fmtMoney = (minor: number) => `${Math.round(minor / 100).toLocaleString('ru')} ₽`
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

export default function CampaignsAdmin() {
  const [selected, setSelected] = useState<Campaign | null>(null)

  if (selected) {
    return <CampaignDetail campaign={selected} onBack={() => setSelected(null)} />
  }
  return <CampaignList onOpen={setSelected} />
}

function CampaignList({ onOpen }: { onOpen: (c: Campaign) => void }) {
  const [items, setItems] = useState<Campaign[]>([])
  const [includeArchived, setIncludeArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async (archived: boolean) => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listCampaigns(archived))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить ссылки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(includeArchived)
  }, [includeArchived, load])

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed || creating) return
    setCreating(true)
    setError(null)
    try {
      await createCampaign(trimmed)
      hapticNotify('success')
      setName('')
      await load(includeArchived)
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось создать ссылку')
    } finally {
      setCreating(false)
    }
  }

  async function toggleArchive(c: Campaign) {
    setBusyId(c.id)
    setError(null)
    try {
      if (c.archived) await restoreCampaign(c.id)
      else await archiveCampaign(c.id)
      haptic('light')
      await load(includeArchived)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить ссылку')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex flex-col gap-2.5 rounded-2xl px-3.5 py-3.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Новая рекламная ссылка
        </span>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
            placeholder="Название канала, напр. «Telegram-ads июнь»"
            maxLength={120}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold"
            style={{
              background: 'var(--rose-dim)',
              border: '1px solid var(--border-rose)',
              color: 'var(--rose)',
              opacity: !name.trim() || creating ? 0.5 : 1,
            }}
          >
            <Plus size={15} weight="bold" />
            Создать
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            haptic('light')
            setIncludeArchived((v) => !v)
          }}
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: includeArchived ? 'var(--rose-dim)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-1)',
            color: includeArchived ? 'var(--rose)' : 'rgba(255,255,255,0.45)',
          }}
        >
          Показать архив
        </button>
        <button
          onClick={() => load(includeArchived)}
          className="flex h-8 w-8 items-center justify-center rounded-lg"
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

      {!loading && items.length === 0 && (
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Ссылок пока нет. Создайте первую — она появится здесь с аналитикой.
        </p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              busy={busyId === c.id}
              onOpen={() => onOpen(c)}
              onToggleArchive={() => toggleArchive(c)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignRow({
  campaign,
  busy,
  onOpen,
  onToggleArchive,
}: {
  campaign: Campaign
  busy: boolean
  onOpen: () => void
  onToggleArchive: () => void
}) {
  const conv = pct(campaign.stats.payers, campaign.stats.users)
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl px-3.5 py-3.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: campaign.archived ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {campaign.name}
            {campaign.archived && (
              <span
                className="ml-2 text-[10px] font-normal"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                в архиве
              </span>
            )}
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
            код {campaign.code} · {new Date(campaign.created_at).toLocaleDateString('ru')}
          </span>
        </div>
        <CopyLinkButton link={campaign.deep_link} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="Юзеры" value={campaign.stats.users.toLocaleString('ru')} />
        <MiniStat label="Платят" value={campaign.stats.payers.toLocaleString('ru')} />
        <MiniStat label="CR" value={`${conv}%`} accent />
        <MiniStat label="Выручка" value={fmtMoney(campaign.stats.revenue_minor)} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text)',
          }}
        >
          <ChartLineUp size={13} weight="bold" /> Аналитика
        </button>
        <button
          onClick={onToggleArchive}
          disabled={busy}
          className="flex flex-shrink-0 items-center justify-center rounded-lg px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            opacity: busy ? 0.5 : 1,
          }}
        >
          {campaign.archived ? <ArrowCounterClockwise size={14} /> : <Archive size={14} />}
        </button>
      </div>
    </div>
  )
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      hapticNotify('success')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      hapticNotify('error')
    }
  }
  return (
    <button
      onClick={copy}
      className="flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
      style={{
        background: copied ? 'rgba(95,210,150,0.12)' : 'rgba(255,255,255,0.06)',
        border: copied ? '1px solid rgba(95,210,150,0.3)' : '1px solid rgba(255,255,255,0.1)',
        color: copied ? '#5fd296' : 'rgba(255,255,255,0.7)',
      }}
    >
      {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
      {copied ? 'Скопировано' : 'Ссылка'}
    </button>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl px-2 py-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </span>
      <span
        className="font-sans tabular-nums"
        style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--rose)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: '7 дн' },
  { days: 30, label: '30 дн' },
  { days: 90, label: '90 дн' },
  { days: 365, label: 'год' },
]

function CampaignDetail({ campaign, onBack }: { campaign: Campaign; onBack: () => void }) {
  const [range, setRange] = useState(30)
  const [data, setData] = useState<CampaignAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (days: number) => {
      setLoading(true)
      setError(null)
      try {
        setData(await fetchCampaignAnalytics(campaign.id, days))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось загрузить аналитику')
      } finally {
        setLoading(false)
      }
    },
    [campaign.id],
  )

  useEffect(() => {
    load(range)
  }, [range, load])

  const rangeLabel = RANGES.find((r) => r.days === range)?.label ?? `${range} дн`
  const c = data?.campaign ?? campaign

  return (
    <div className="flex flex-col gap-5 lg:max-w-3xl">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            haptic('light')
            onBack()
          }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ArrowLeft size={16} color="rgba(255,255,255,0.6)" />
        </button>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {c.name}
          </span>
          <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
            код {c.code}
          </span>
        </div>
      </div>

      <CopyLinkRow link={c.deep_link} />

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

      {data && (
        <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <Kpi
              label={`Регистрации · ${rangeLabel}`}
              value={data.users_in_range.toLocaleString('ru')}
            />
            <Kpi
              label={`Выручка · ${rangeLabel}`}
              value={fmtMoney(data.revenue_in_range_minor)}
              accent
            />
            <Kpi label="Всего привлечено" value={data.funnel.users.toLocaleString('ru')} />
            <Kpi label="Выручка всего" value={fmtMoney(c.stats.revenue_minor)} />
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Воронка (за всё время)
            </h3>
            <Funnel
              label="Перешли и зарегистрировались"
              value={data.funnel.users}
              total={data.funnel.users}
              color="rgba(255,255,255,0.5)"
            />
            <Funnel
              label="Хоть раз генерили"
              value={data.funnel.ever_generated}
              total={data.funnel.users}
              color="#3FD4E0"
            />
            <Funnel
              label="Довели до результата"
              value={data.funnel.ever_completed}
              total={data.funnel.users}
              color="#5FD296"
            />
            <Funnel
              label="Хоть раз платили"
              value={data.funnel.ever_paid}
              total={data.funnel.users}
              color="var(--rose)"
            />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Динамика
            </h3>
            <Sparkline
              data={data.signup_series}
              color="var(--rose)"
              label={`регистрации по дням · ${rangeLabel}`}
            />
            <Sparkline
              data={data.revenue_series.map((d) => ({ day: d.day, count: d.minor }))}
              color="#5FD296"
              label={`выручка по дням · ${rangeLabel}`}
              fmt={fmtMoney}
            />
          </section>

          <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ссылка создана {new Date(c.created_at).toLocaleDateString('ru')} · код {c.code}
          </p>
        </>
      )}
    </div>
  )
}

function CopyLinkRow({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      hapticNotify('success')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      hapticNotify('error')
    }
  }
  return (
    <button
      onClick={copy}
      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span className="truncate text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {link || '—'}
      </span>
      <span
        className="flex flex-shrink-0 items-center gap-1 text-[11px] font-medium"
        style={{ color: copied ? '#5fd296' : 'var(--rose)' }}
      >
        {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
        {copied ? 'Готово' : 'Копировать'}
      </span>
    </button>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
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
    </div>
  )
}

function Funnel({
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

function Sparkline({
  data,
  color,
  label,
  fmt,
}: {
  data: CampaignDayCount[]
  color: string
  label: string
  fmt?: (v: number) => string
}) {
  if (data.length < 2) {
    return (
      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}: мало данных для графика
      </p>
    )
  }
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
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: 40 }}
      >
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
