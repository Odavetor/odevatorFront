'use client'

import { useEffect, useState } from 'react'
import { CurrencyCircleDollar, FloppyDisk, Info, Lightning, X } from '@phosphor-icons/react'
import {
  fetchPricingConfig,
  updatePricingConfig,
  fetchPackPricing,
  updatePackPricing,
  type PricingConfigItem,
  type PackPricingItem,
} from '@/lib/pricing'
import { hapticNotify, haptic } from '@/lib/telegram'

const KNOWN_KEYS: Record<string, string> = {
  'generation.model_2_per_minor': 'Цена за 1 фото · модель v2',
  'generation.model_3_per_minor': 'Цена за 1 фото · модель v3',
}

const TIER_LABELS: Record<string, string> = {
  'standard': 'Стандарт',
  'weekly_promo': 'Акции',
}

const fmtRub = (minor: number) => (minor / 100).toFixed(2)
const minorToRub = (minor: number) => String(minor / 100)
const rubToMinor = (rub: number) => Math.round(rub * 100)

export default function PricingEditor() {
  const [globals, setGlobals] = useState<PricingConfigItem[]>([])
  const [packs, setPacks] = useState<PackPricingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [packDrafts, setPackDrafts] = useState<Record<string, { price: string; active: boolean }>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  function packKey(p: PackPricingItem) { return `${p.tier}:${p.quantity}` }

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const [g, p] = await Promise.allSettled([fetchPricingConfig(), fetchPackPricing()])
      if (g.status === 'fulfilled') {
        setGlobals(g.value)
        setDrafts(Object.fromEntries(g.value.map((x) => [x.key, minorToRub(x.value_minor)])))
      } else {
        setGlobals([])
      }
      if (p.status === 'fulfilled') {
        setPacks(p.value)
        setPackDrafts(Object.fromEntries(
          p.value.map((x) => [packKey(x), { price: minorToRub(x.price_minor), active: x.is_active }]),
        ))
      } else {
        setPacks([])
      }
      if (g.status === 'rejected' && p.status === 'rejected') {
        setError('Бэк не отвечает на /admin/pricing и /admin/payments/packs — возможно эндпоинты ещё не реализованы')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSaveGlobal(item: PricingConfigItem) {
    const raw = drafts[item.key] ?? ''
    const num = Number(raw)
    if (Number.isNaN(num) || num < 0) {
      hapticNotify('warning'); setError('Цена должна быть числом ≥ 0'); return
    }
    setSavingKey(item.key)
    try {
      await updatePricingConfig(item.key, rubToMinor(num))
      haptic('light'); hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSavingKey(null)
    }
  }

  async function handleSavePack(p: PackPricingItem) {
    const k = packKey(p)
    const d = packDrafts[k]
    if (!d) return
    const num = Number(d.price)
    if (Number.isNaN(num) || num < 0) {
      hapticNotify('warning'); setError('Цена должна быть числом ≥ 0'); return
    }
    setSavingKey(k)
    try {
      await updatePackPricing(p.tier, p.quantity, { price_minor: rubToMinor(num), is_active: d.active })
      haptic('light'); hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSavingKey(null)
    }
  }

  // Группируем паки по tier для рендера
  const packsByTier = packs.reduce<Record<string, PackPricingItem[]>>((acc, p) => {
    if (!acc[p.tier]) acc[p.tier] = []
    acc[p.tier].push(p)
    return acc
  }, {})
  for (const t of Object.keys(packsByTier)) {
    packsByTier[t].sort((a, b) => a.quantity - b.quantity)
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2"
             style={{ background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.22)', color: '#ff9aae' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={12} /></button>
        </div>
      )}

      <div
        className="rounded-2xl px-3.5 py-3 flex items-start gap-2.5"
        style={{ background: 'rgba(201,150,106,0.08)', border: '1px solid rgba(201,150,106,0.22)' }}
      >
        <Info size={14} weight="fill" color="var(--gold)" className="flex-shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Цены в <strong>рублях</strong> (можно с копейками через точку, напр. <strong>49</strong> или <strong>49.90</strong>).
          Глобальные цены — для всех генераций по умолчанию; у конкретной опции/сценария можно задать своё значение,
          оно перебьёт глобальное. Тир «Акции» — отдельные акционные цены, кредиты по ним не сгорают.
        </div>
      </div>

      {loading && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Загрузка…</p>}

      {/* GLOBAL PRICING */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Lightning size={14} weight="fill" color="var(--rose)" />
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Глобальные цены генерации
          </h3>
        </div>

        {globals.length === 0 && !loading && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Нет данных. Бэк должен отдавать /api/v1/admin/pricing с массивом ключей.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {globals.map((item) => {
            const draftValue = drafts[item.key] ?? minorToRub(item.value_minor)
            const changed = draftValue !== minorToRub(item.value_minor)
            const known = KNOWN_KEYS[item.key]
            return (
              <div key={item.key}
                className="rounded-xl px-3 py-2.5 flex flex-col gap-1.5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {known ?? item.key}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {item.key}
                    </span>
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--gold)' }}>
                    {fmtRub(item.value_minor)} ₽
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={draftValue}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [item.key]: e.target.value }))}
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm font-mono"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  <button
                    onClick={() => handleSaveGlobal(item)}
                    disabled={!changed || savingKey === item.key}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                    style={{
                      background: changed ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                      border: changed ? '1px solid var(--border-rose)' : '1px solid var(--border-1)',
                      color: changed ? 'var(--rose)' : 'rgba(255,255,255,0.3)',
                      opacity: savingKey === item.key ? 0.5 : 1,
                    }}>
                    <FloppyDisk size={12} weight="fill" /> Сохранить
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* PACKS PRICING */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CurrencyCircleDollar size={14} weight="fill" color="var(--gold)" />
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Цены пакетов в магазине
          </h3>
        </div>

        {packs.length === 0 && !loading && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Нет данных. Бэк должен отдавать /api/v1/admin/payments/packs с массивом пакетов.
          </p>
        )}

        {Object.keys(packsByTier).map((tier) => (
          <div key={tier} className="flex flex-col gap-2">
            <p
              className="font-mono uppercase mb-0.5"
              style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}>
              {TIER_LABELS[tier] ?? tier}
            </p>
            <div className="flex flex-col gap-1.5">
              {packsByTier[tier].map((p) => {
                const k = packKey(p)
                const d = packDrafts[k] ?? { price: minorToRub(p.price_minor), active: p.is_active }
                const changed = d.price !== minorToRub(p.price_minor) || d.active !== p.is_active
                return (
                  <div key={k}
                    className="rounded-xl px-3 py-2 flex items-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      opacity: d.active ? 1 : 0.55,
                    }}>
                    <div className="font-display flex-shrink-0" style={{ fontSize: 22, color: 'var(--text)', minWidth: 32 }}>
                      {p.quantity}
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={d.price}
                      onChange={(e) => setPackDrafts((prev) => ({
                        ...prev, [k]: { ...d, price: e.target.value },
                      }))}
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-sm font-mono"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                    <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)', minWidth: 56 }}>
                      = {(Number(d.price) || 0).toFixed(2)} ₽
                    </span>
                    <button
                      onClick={() => setPackDrafts((prev) => ({ ...prev, [k]: { ...d, active: !d.active } }))}
                      title={d.active ? 'Выключить' : 'Включить'}
                      className="px-2 py-1 rounded text-[10px] font-medium flex-shrink-0"
                      style={{
                        background: d.active ? 'rgba(95,210,150,0.10)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${d.active ? 'rgba(95,210,150,0.28)' : 'var(--border-1)'}`,
                        color: d.active ? '#5fd296' : 'rgba(255,255,255,0.4)',
                      }}>
                      {d.active ? 'on' : 'off'}
                    </button>
                    <button
                      onClick={() => handleSavePack(p)}
                      disabled={!changed || savingKey === k}
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: changed ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                        border: changed ? '1px solid var(--border-rose)' : '1px solid var(--border-1)',
                        color: changed ? 'var(--rose)' : 'rgba(255,255,255,0.3)',
                        opacity: savingKey === k ? 0.5 : 1,
                      }}>
                      <FloppyDisk size={11} weight="fill" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
