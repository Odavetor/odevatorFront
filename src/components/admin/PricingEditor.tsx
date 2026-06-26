'use client'

import { useEffect, useState } from 'react'
import { CurrencyCircleDollar, FloppyDisk, Info, Lightning, X } from '@phosphor-icons/react'
import {
  fetchPricingConfig,
  updatePricingConfig,
  fetchPackPricing,
  updatePackPricing,
  fetchFxRates,
  updateFxRate,
  type PricingConfigItem,
  type PackPricingItem,
  type FxRateItem,
} from '@/lib/pricing'
import { hapticNotify, haptic } from '@/lib/telegram'

const CURRENCY_LABEL: Record<string, string> = {
  USD: 'Доллар (англ. язык)',
  EUR: 'Евро (нем. язык)',
}

function FxRatesSection({ onError }: { onError: (m: string | null) => void }) {
  const [rates, setRates] = useState<FxRateItem[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingCur, setSavingCur] = useState<string | null>(null)

  async function load() {
    try {
      const r = await fetchFxRates()
      setRates(r)
      setDrafts(Object.fromEntries(r.map((x) => [x.currency, String(x.rub_per_unit)])))
    } catch {
      setRates([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function save(currency: string) {
    const v = Number(drafts[currency])
    if (!Number.isFinite(v) || v <= 0) {
      hapticNotify('warning')
      onError('Курс должен быть числом больше 0')
      return
    }
    setSavingCur(currency)
    onError(null)
    try {
      await updateFxRate(currency, v)
      hapticNotify('success')
      await load()
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось сохранить курс')
    } finally {
      setSavingCur(null)
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Курсы валют (показ цен)
        </h3>
        <span
          className="font-mono uppercase"
          style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}
        >
          ₽ за 1 единицу
        </span>
      </div>
      <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Цены в шопе показываются в €/$ по языку (списание всё равно в ₽). Сколько рублей в 1 €/$.
        Пусто/живой курс обновляется автоматически; здесь можно зафиксировать вручную.
      </p>
      <div
        className="divide-y rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {rates.map((rate) => (
          <div key={rate.currency} className="flex items-center gap-2 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {CURRENCY_LABEL[rate.currency] ?? rate.currency}
              </p>
              <p className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                1 {rate.currency} = … ₽ {rate.manual ? '(вручную)' : '(авто)'}
              </p>
            </div>
            <input
              value={drafts[rate.currency] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [rate.currency]: e.target.value }))}
              inputMode="decimal"
              className="w-24 rounded-lg px-2.5 py-1.5 text-right font-mono text-sm"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
              }}
            />
            <button
              onClick={() => {
                haptic('light')
                save(rate.currency)
              }}
              disabled={savingCur === rate.currency}
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
            >
              <FloppyDisk size={13} weight="fill" color="var(--rose)" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

const KNOWN_KEYS: Record<string, string> = {
  'generation.model_2_per_minor': 'Цена за 1 фото · модель v2',
  'generation.model_3_per_minor': 'Цена за 1 фото · модель v3',
}

const TIER_LABELS: Record<string, string> = {
  standard: 'Стандарт',
  weekly_promo: 'Акции',
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
  const [packDrafts, setPackDrafts] = useState<
    Record<string, { price: string; active: boolean; discount: string }>
  >({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  function packKey(p: PackPricingItem) {
    return `${p.tier}:${p.quantity}`
  }

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
        setPackDrafts(
          Object.fromEntries(
            p.value.map((x) => [
              packKey(x),
              {
                price: minorToRub(x.price_minor),
                active: x.is_active,
                discount: x.discount_price_minor != null ? minorToRub(x.discount_price_minor) : '',
              },
            ]),
          ),
        )
      } else {
        setPacks([])
      }
      if (g.status === 'rejected' && p.status === 'rejected') {
        setError(
          'Бэк не отвечает на /admin/pricing и /admin/payments/packs — возможно эндпоинты ещё не реализованы',
        )
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
      hapticNotify('warning')
      setError('Цена должна быть числом ≥ 0')
      return
    }
    setSavingKey(item.key)
    try {
      await updatePricingConfig(item.key, rubToMinor(num))
      haptic('light')
      hapticNotify('success')
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
      hapticNotify('warning')
      setError('Цена должна быть числом ≥ 0')
      return
    }
    const discountRaw = d.discount.trim()
    let discountMinor: number | null = null
    if (discountRaw !== '') {
      const dn = Number(discountRaw)
      if (Number.isNaN(dn) || dn < 0) {
        hapticNotify('warning')
        setError('Цена со скидкой должна быть числом ≥ 0')
        return
      }
      if (rubToMinor(dn) >= rubToMinor(num)) {
        hapticNotify('warning')
        setError('Цена со скидкой должна быть меньше обычной')
        return
      }
      discountMinor = rubToMinor(dn)
    }
    setSavingKey(k)
    try {
      await updatePackPricing(p.tier, p.quantity, {
        price_minor: rubToMinor(num),
        is_active: d.active,
        discount_price_minor: discountMinor,
      })
      haptic('light')
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSavingKey(null)
    }
  }

  // Группируем паки по tier для рендера
  const packsByTier = packs
    .filter((p) => p.tier === 'standard')
    .reduce<Record<string, PackPricingItem[]>>((acc, p) => {
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

      <div
        className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
        style={{ background: 'rgba(201,150,106,0.08)', border: '1px solid rgba(201,150,106,0.22)' }}
      >
        <Info size={14} weight="fill" color="var(--gold)" className="mt-0.5 flex-shrink-0" />
        <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Цены в <strong>рублях</strong> (можно с копейками через точку, напр. <strong>49</strong>{' '}
          или <strong>49.90</strong>). Глобальные цены — для всех генераций по умолчанию; у
          конкретной опции/сценария можно задать своё значение, оно перебьёт глобальное. У пака
          можно задать <strong>цену со скидкой</strong> — тогда в магазине обычная цена показывается
          зачёркнутой, а списывается цена со скидкой. Пусто = скидки нет.
        </div>
      </div>

      <FxRatesSection onError={setError} />

      {loading && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Загрузка…
        </p>
      )}

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
              <div
                key={item.key}
                className="flex flex-col gap-1.5 rounded-xl px-3 py-2.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                      {known ?? item.key}
                    </span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
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
                    className="flex-1 rounded-lg px-3 py-1.5 font-mono text-sm"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'white',
                    }}
                  />
                  <button
                    onClick={() => handleSaveGlobal(item)}
                    disabled={!changed || savingKey === item.key}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{
                      background: changed ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                      border: changed
                        ? '1px solid var(--border-rose)'
                        : '1px solid var(--border-1)',
                      color: changed ? 'var(--rose)' : 'rgba(255,255,255,0.3)',
                      opacity: savingKey === item.key ? 0.5 : 1,
                    }}
                  >
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
              className="mb-0.5 font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}
            >
              {TIER_LABELS[tier] ?? tier}
            </p>
            <div className="flex flex-col gap-1.5">
              {packsByTier[tier].map((p) => {
                const k = packKey(p)
                const d = packDrafts[k] ?? {
                  price: minorToRub(p.price_minor),
                  active: p.is_active,
                  discount:
                    p.discount_price_minor != null ? minorToRub(p.discount_price_minor) : '',
                }
                const savedDiscount =
                  p.discount_price_minor != null ? minorToRub(p.discount_price_minor) : ''
                const changed =
                  d.price !== minorToRub(p.price_minor) ||
                  d.active !== p.is_active ||
                  d.discount.trim() !== savedDiscount
                return (
                  <div
                    key={k}
                    className="flex flex-col gap-2 rounded-xl px-3 py-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      opacity: d.active ? 1 : 0.55,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="font-display flex-shrink-0"
                        style={{ fontSize: 22, color: 'var(--text)', minWidth: 32 }}
                      >
                        {p.quantity}
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={d.price}
                        onChange={(e) =>
                          setPackDrafts((prev) => ({
                            ...prev,
                            [k]: { ...d, price: e.target.value },
                          }))
                        }
                        className="flex-1 rounded-lg px-2.5 py-1.5 font-mono text-sm"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                        }}
                      />
                      <span
                        className="flex-shrink-0 font-mono text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.45)', minWidth: 56 }}
                      >
                        = {(Number(d.price) || 0).toFixed(2)} ₽
                      </span>
                      <button
                        onClick={() =>
                          setPackDrafts((prev) => ({ ...prev, [k]: { ...d, active: !d.active } }))
                        }
                        title={d.active ? 'Выключить' : 'Включить'}
                        className="flex-shrink-0 rounded px-2 py-1 text-[10px] font-medium"
                        style={{
                          background: d.active ? 'rgba(95,210,150,0.10)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${d.active ? 'rgba(95,210,150,0.28)' : 'var(--border-1)'}`,
                          color: d.active ? '#5fd296' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {d.active ? 'on' : 'off'}
                      </button>
                      <button
                        onClick={() => handleSavePack(p)}
                        disabled={!changed || savingKey === k}
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                        style={{
                          background: changed ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                          border: changed
                            ? '1px solid var(--border-rose)'
                            : '1px solid var(--border-1)',
                          color: changed ? 'var(--rose)' : 'rgba(255,255,255,0.3)',
                          opacity: savingKey === k ? 0.5 : 1,
                        }}
                      >
                        <FloppyDisk size={11} weight="fill" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pl-[40px]">
                      <span
                        className="flex-shrink-0 font-mono text-[10px] uppercase"
                        style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}
                      >
                        скидка
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="нет"
                        value={d.discount}
                        onChange={(e) =>
                          setPackDrafts((prev) => ({
                            ...prev,
                            [k]: { ...d, discount: e.target.value },
                          }))
                        }
                        className="flex-1 rounded-lg px-2.5 py-1.5 font-mono text-sm"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(201,150,106,0.28)',
                          color: 'white',
                        }}
                      />
                      <span
                        className="flex-shrink-0 font-mono text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.45)', minWidth: 56 }}
                      >
                        {d.discount.trim() === ''
                          ? '— ₽'
                          : `= ${(Number(d.discount) || 0).toFixed(2)} ₽`}
                      </span>
                    </div>
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
