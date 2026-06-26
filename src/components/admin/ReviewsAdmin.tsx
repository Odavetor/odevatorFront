'use client'

import { useCallback, useEffect, useState } from 'react'
import { Archive, ArrowClockwise, ArrowCounterClockwise, Star, Trash } from '@phosphor-icons/react'
import {
  archiveReview,
  deleteReview,
  fetchReviewStats,
  listReviews,
  restoreReview,
  type Review,
  type ReviewKind,
  type ReviewStats,
} from '@/lib/reviews'
import { haptic, hapticNotify } from '@/lib/telegram'

const KINDS: { v: ReviewKind; label: string }[] = [
  { v: 'user', label: 'Сервис' },
  { v: 'referrer', label: 'Партнёрка' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          weight={n <= rating ? 'fill' : 'regular'}
          color={n <= rating ? '#F5C451' : 'rgba(255,255,255,0.25)'}
        />
      ))}
    </span>
  )
}

export default function ReviewsAdmin() {
  const [kind, setKind] = useState<ReviewKind>('user')
  const [showArchived, setShowArchived] = useState(false)
  const [items, setItems] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (k: ReviewKind, archived: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const [list, st] = await Promise.all([listReviews(k, archived), fetchReviewStats(k)])
      setItems(list)
      setStats(st)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить отзывы')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(kind, showArchived)
  }, [kind, showArchived, load])

  async function act(id: number, fn: () => Promise<void>) {
    setBusyId(id)
    setError(null)
    try {
      await fn()
      hapticNotify('success')
      await load(kind, showArchived)
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось обновить отзыв')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex gap-1 rounded-full p-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}
        >
          {KINDS.map((t) => (
            <button
              key={t.v}
              onClick={() => {
                haptic('light')
                setKind(t.v)
              }}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: kind === t.v ? 'var(--rose-dim)' : 'transparent',
                color: kind === t.v ? 'var(--rose)' : 'rgba(255,255,255,0.45)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(kind, showArchived)}
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

      {stats && (
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2.5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Активных отзывов: {stats.count}
          </span>
          {stats.count > 0 && (
            <span className="flex items-center gap-1.5">
              <Stars rating={Math.round(stats.average)} />
              <span
                className="font-sans text-[12px] tabular-nums"
                style={{ color: 'var(--text)', fontWeight: 700 }}
              >
                {stats.average.toFixed(1)}
              </span>
            </span>
          )}
        </div>
      )}

      <button
        onClick={() => {
          haptic('light')
          setShowArchived((v) => !v)
        }}
        className="self-start text-[11px] font-medium"
        style={{ color: 'var(--rose)' }}
      >
        {showArchived ? '← к активным' : 'показать архив →'}
      </button>

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
          Отзывов нет.
        </p>
      )}

      {items.map((rv) => {
        const handle = rv.username ? `@${rv.username}` : `id ${rv.telegram_id}`
        const archived = Boolean(rv.archived_at)
        return (
          <div
            key={rv.id}
            className="flex flex-col gap-2 rounded-xl px-3 py-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: archived ? 0.6 : 1,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <Stars rating={rv.rating} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {new Date(rv.created_at).toLocaleString('ru')}
              </span>
            </div>
            {rv.body && (
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {rv.body}
              </p>
            )}
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {handle}
            </span>
            <div className="flex gap-2">
              {archived ? (
                <button
                  onClick={() => act(rv.id, () => restoreReview(kind, rv.id))}
                  disabled={busyId === rv.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-1)',
                    color: 'rgba(255,255,255,0.7)',
                    opacity: busyId === rv.id ? 0.5 : 1,
                  }}
                >
                  <ArrowCounterClockwise size={13} weight="bold" /> Вернуть
                </button>
              ) : (
                <button
                  onClick={() => act(rv.id, () => archiveReview(kind, rv.id))}
                  disabled={busyId === rv.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-1)',
                    color: 'rgba(255,255,255,0.7)',
                    opacity: busyId === rv.id ? 0.5 : 1,
                  }}
                >
                  <Archive size={13} weight="bold" /> В архив
                </button>
              )}
              <button
                onClick={() => act(rv.id, () => deleteReview(kind, rv.id))}
                disabled={busyId === rv.id}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
                style={{
                  background: 'rgba(180,30,60,0.12)',
                  border: '1px solid rgba(180,30,60,0.28)',
                  color: '#ff9aae',
                  opacity: busyId === rv.id ? 0.5 : 1,
                }}
              >
                <Trash size={13} weight="bold" /> Удалить
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
