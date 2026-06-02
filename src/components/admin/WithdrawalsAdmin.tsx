'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowClockwise, Check, X } from '@phosphor-icons/react'
import {
  approveWithdrawal,
  listWithdrawals,
  rejectWithdrawal,
  type Withdrawal,
  type WithdrawalStatus,
} from '@/lib/referral'
import { haptic, hapticNotify } from '@/lib/telegram'

const STATUS: Record<WithdrawalStatus, { label: string; color: string }> = {
  pending: { label: 'ожидает', color: '#C9966A' },
  approved: { label: 'выплачено', color: '#5FD296' },
  rejected: { label: 'отклонено', color: '#ff9aae' },
}

const fmtRub = (minor: number) => (minor / 100).toLocaleString('ru')

export default function WithdrawalsAdmin() {
  const [items, setItems] = useState<Withdrawal[]>([])
  const [onlyPending, setOnlyPending] = useState(true)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (pending: boolean) => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listWithdrawals(pending))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить заявки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(onlyPending)
  }, [onlyPending, load])

  async function decide(w: Withdrawal, approve: boolean) {
    setBusyId(w.id)
    setError(null)
    try {
      if (approve) await approveWithdrawal(w.id, '')
      else await rejectWithdrawal(w.id, '')
      hapticNotify('success')
      haptic('light')
      await load(onlyPending)
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось обновить заявку')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-1)' }}>
          {[
            { v: true, label: 'Ожидают' },
            { v: false, label: 'Все' },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => {
                haptic('light')
                setOnlyPending(t.v)
              }}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: onlyPending === t.v ? 'var(--rose-dim)' : 'transparent',
                color: onlyPending === t.v ? 'var(--rose)' : 'rgba(255,255,255,0.45)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(onlyPending)}
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

      {!loading && items.length === 0 && (
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Заявок нет.
        </p>
      )}

      {items.map((w) => {
        const meta = STATUS[w.status]
        const handle = w.username ? `@${w.username}` : `id ${w.telegram_id}`
        return (
          <div
            key={w.id}
            className="flex flex-col gap-2 rounded-xl px-3 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans tabular-nums" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                {fmtRub(w.amount_minor)} ₽
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>{handle}</span>
              <span className="break-all" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Реквизиты: {w.details}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {new Date(w.created_at).toLocaleString('ru')}
              </span>
            </div>
            {w.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => decide(w, true)}
                  disabled={busyId === w.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
                  style={{ background: 'rgba(95,210,150,0.12)', border: '1px solid rgba(95,210,150,0.3)', color: '#5fd296', opacity: busyId === w.id ? 0.5 : 1 }}
                >
                  <Check size={13} weight="bold" /> Подтвердить
                </button>
                <button
                  onClick={() => decide(w, false)}
                  disabled={busyId === w.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
                  style={{ background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.28)', color: '#ff9aae', opacity: busyId === w.id ? 0.5 : 1 }}
                >
                  <X size={13} weight="bold" /> Отклонить
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
