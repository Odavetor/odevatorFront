import { fmtRub } from '@entities/pack'
import { PAYMENT_METHOD } from '@shared/api'

export interface StatusMeta {
  label: string
  color: string
  bg: string
  border: string
}

export function getStatusMeta(status: string): StatusMeta {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'success' || s === 'paid' || s === 'succeeded') {
    return {
      label: 'оплачено',
      color: 'var(--splash-green)',
      bg: 'var(--splash-green-bg)',
      border: 'rgba(95,210,150,0.32)',
    }
  }
  if (s === 'pending' || s === 'created' || s === 'processing' || s === 'awaiting_payment') {
    return {
      label: 'ожидает',
      color: 'var(--splash-orange)',
      bg: 'var(--splash-orange-bg)',
      border: 'rgba(255,138,76,0.32)',
    }
  }
  if (s === 'failed' || s === 'error' || s === 'declined' || s === 'cancelled' || s === 'canceled') {
    return {
      label: 'ошибка',
      color: '#e07070',
      bg: 'rgba(220,80,80,0.12)',
      border: 'rgba(220,80,80,0.32)',
    }
  }
  if (s === 'refunded' || s === 'refund') {
    return {
      label: 'возврат',
      color: 'rgba(255,255,255,0.6)',
      bg: 'rgba(255,255,255,0.06)',
      border: 'rgba(255,255,255,0.12)',
    }
  }
  return {
    label: status,
    color: 'rgba(255,255,255,0.6)',
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.12)',
  }
}

export function getMethodLabel(method: number): string {
  if (method === PAYMENT_METHOD.SBP) return 'СБП'
  if (method === PAYMENT_METHOD.CRYPTO) return 'Крипта'
  return 'Платёж'
}

export function fmtAmount(amount_minor: number): string {
  return `${fmtRub(amount_minor)} ₽`
}

export function fmtRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    const m = Math.max(1, Math.floor(diff / minute))
    return `${m} мин назад`
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return `${h} ч назад`
  }
  if (diff < 2 * day) return 'вчера'
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
}
