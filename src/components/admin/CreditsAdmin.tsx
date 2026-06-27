'use client'

import { useState } from 'react'
import { Lightning, MagnifyingGlass, Plus, X } from '@phosphor-icons/react'
import { grantCredits, lookupCredits, type CreditResult } from '@/lib/credits'
import { haptic, hapticNotify } from '@/lib/telegram'

const PRESETS = [1, 5, 10, 25, 50]

export default function CreditsAdmin() {
  const [tgId, setTgId] = useState('')
  const [amount, setAmount] = useState('10')
  const [busy, setBusy] = useState<'lookup' | 'grant' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    kind: 'lookup' | 'grant'
    granted?: number
    r: CreditResult
  } | null>(null)

  const validId = /^\d{4,}$/.test(tgId.trim())

  async function doLookup() {
    if (!validId) {
      setError('Укажи корректный Telegram ID (только цифры).')
      return
    }
    setBusy('lookup')
    setError(null)
    setResult(null)
    try {
      const r = await lookupCredits(tgId.trim())
      setResult({ kind: 'lookup', r })
      hapticNotify(r.found ? 'success' : 'warning')
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось проверить')
    } finally {
      setBusy(null)
    }
  }

  async function doGrant() {
    const n = Number(amount)
    if (!validId) {
      setError('Укажи корректный Telegram ID (только цифры).')
      return
    }
    if (!Number.isInteger(n) || n <= 0) {
      setError('Количество должно быть целым числом > 0.')
      return
    }
    setBusy('grant')
    setError(null)
    setResult(null)
    try {
      const r = await grantCredits(tgId.trim(), n)
      setResult({ kind: 'grant', granted: n, r })
      hapticNotify(r.found ? 'success' : 'warning')
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось выдать')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div
          className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Начисление токенов (генераций) пользователю по его Telegram ID. Пользователь должен хотя бы
        раз открыть бота или приложение, иначе его аккаунта ещё нет. После начисления ему придёт
        сообщение в боте.
      </p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)' }}
          >
            Telegram ID
          </span>
          <input
            value={tgId}
            inputMode="numeric"
            onChange={(e) => setTgId(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="напр. 8718429729"
            className="rounded-xl px-3 py-2.5 text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)' }}
          >
            Количество токенов
          </span>
          <input
            value={amount}
            inputMode="numeric"
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            className="rounded-xl px-3 py-2.5 text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          />
          <div className="mt-1 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  haptic('light')
                  setAmount(String(p))
                }}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: String(p) === amount ? 'var(--rose-dim)' : 'rgba(255,255,255,0.05)',
                  border:
                    String(p) === amount
                      ? '1px solid var(--border-rose)'
                      : '1px solid rgba(255,255,255,0.08)',
                  color: String(p) === amount ? 'var(--rose)' : 'rgba(255,255,255,0.6)',
                }}
              >
                +{p}
              </button>
            ))}
          </div>
        </label>

        <div className="mt-1 flex gap-2">
          <button
            onClick={doLookup}
            disabled={busy !== null || !validId}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              opacity: busy !== null || !validId ? 0.5 : 1,
            }}
          >
            <MagnifyingGlass size={14} weight="bold" />
            {busy === 'lookup' ? 'Проверяю…' : 'Проверить баланс'}
          </button>
          <button
            onClick={doGrant}
            disabled={busy !== null || !validId}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold"
            style={{
              background: 'var(--rose-dim)',
              border: '1px solid var(--border-rose)',
              color: 'var(--rose)',
              opacity: busy !== null || !validId ? 0.5 : 1,
            }}
          >
            <Plus size={14} weight="bold" />
            {busy === 'grant' ? 'Начисляю…' : 'Начислить токены'}
          </button>
        </div>
      </div>

      {result && (
        <div
          className="flex flex-col gap-1.5 rounded-2xl px-4 py-3"
          style={{
            background: result.r.found ? 'rgba(95,210,150,0.10)' : 'rgba(255,138,76,0.10)',
            border: `1px solid ${result.r.found ? 'rgba(95,210,150,0.28)' : 'rgba(255,138,76,0.28)'}`,
          }}
        >
          {result.r.found ? (
            <>
              <span className="text-sm font-medium" style={{ color: 'white' }}>
                {result.kind === 'grant'
                  ? `✅ Начислено +${result.granted} токенов`
                  : '👤 Пользователь найден'}
              </span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {result.r.username ? `@${result.r.username.replace(/^@/, '')} · ` : ''}id #
                {result.r.user_id}
              </span>
              <span
                className="mt-0.5 flex items-center gap-1 text-sm font-semibold"
                style={{ color: '#5fd296' }}
              >
                <Lightning size={14} weight="fill" />
                Баланс: {result.r.total_credits} токенов
              </span>
            </>
          ) : (
            <span className="text-sm" style={{ color: '#ffb84d' }}>
              ⚠️ Пользователь с таким Telegram ID не найден — он ещё не открывал бота/приложение.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
