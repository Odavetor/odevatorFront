'use client'

import { useCallback, useEffect, useState } from 'react'
import { getGenerationPackCatalog, initGenerationPackPayment } from '@entities/pack'
import type {
  GenerationPackCatalog,
  GenerationPackOption,
  PaymentMethodId,
} from '@shared/api'
import { useUser } from '@entities/user'
import { haptic, hapticNotify, openLink } from '@shared/lib'

export type BuyStep = 'select' | 'pending' | 'success'
export type Tier = 'standard' | 'weekly_promo'

const FALLBACK_OPTIONS: GenerationPackOption[] = [
  { quantity: 1, price_minor: 4900, currency: 'RUB' },
  { quantity: 3, price_minor: 12900, currency: 'RUB' },
  { quantity: 10, price_minor: 39900, currency: 'RUB' },
]

const CORE_QUANTITIES = [1, 3, 10] as const

function ensureCoreOptions(opts: GenerationPackOption[]): GenerationPackOption[] {
  const byQty = new Map(opts.map((o) => [o.quantity, o]))
  const result: GenerationPackOption[] = []
  for (const q of CORE_QUANTITIES) {
    const fromBack = byQty.get(q)
    if (fromBack) {
      result.push(fromBack)
      continue
    }
    const stub = FALLBACK_OPTIONS.find((o) => o.quantity === q)
    if (stub) result.push(stub)
  }
  for (const opt of opts) {
    if (!CORE_QUANTITIES.includes(opt.quantity as 1 | 3 | 10)) {
      result.push(opt)
    }
  }
  return result
}

export interface UseBuyPackResult {
  step: BuyStep
  tier: Tier
  hasPromo: boolean
  options: GenerationPackOption[]
  standardPriceByQty: Record<number, number>
  selectedOption: GenerationPackOption | null
  selectedMethod: PaymentMethodId | null
  redirectUrl: string | null
  loading: boolean
  error: string | null

  setTier: (t: Tier) => void
  selectQuantity: (q: number) => void
  selectMethod: (m: PaymentMethodId) => void
  pay: (errorFallback: string, errorNoLink: string) => Promise<void>
  reopen: () => void
  check: () => Promise<boolean>
  reset: () => void
}

export function useBuyPack(): UseBuyPackResult {
  const { wallet, refreshBalance } = useUser()

  const [step, setStep] = useState<BuyStep>('select')
  const [tier, setTier] = useState<Tier>('standard')
  const [catalog, setCatalog] = useState<GenerationPackCatalog | null>(null)
  const [selectedQty, setSelectedQty] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [walletAtInit, setWalletAtInit] = useState(0)

  useEffect(() => {
    let cancelled = false
    getGenerationPackCatalog()
      .then((c) => {
        if (!cancelled) setCatalog(c)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const tierData = catalog?.tiers.find((t) => t.id === tier)
  const options =
    tier === 'weekly_promo'
      ? (tierData?.options ?? [])
      : ensureCoreOptions(tierData?.options?.length ? tierData.options : FALLBACK_OPTIONS)

  const standardTier = catalog?.tiers.find((t) => t.id === 'standard')
  const standardOptions = standardTier?.options?.length ? standardTier.options : FALLBACK_OPTIONS
  const standardPriceByQty: Record<number, number> = {}
  for (const o of standardOptions) standardPriceByQty[o.quantity] = o.price_minor

  const hasPromo = Boolean(catalog?.tiers.find((t) => t.id === 'weekly_promo')?.options?.length)
  const selectedOption = options.find((o) => o.quantity === selectedQty) ?? null

  const selectQuantity = useCallback((q: number) => {
    haptic('light')
    setSelectedQty(q)
  }, [])

  const selectMethod = useCallback((m: PaymentMethodId) => {
    haptic('light')
    setSelectedMethod(m)
  }, [])

  const pay = useCallback(
    async (errorFallback: string, errorNoLink: string) => {
      if (!selectedOption || !selectedMethod) return
      setLoading(true)
      setError(null)
      haptic('medium')
      try {
        setWalletAtInit(wallet?.prepaid_generations_remaining ?? 0)
        const r = await initGenerationPackPayment({
          tier,
          quantity: selectedOption.quantity,
          paymentMethod: selectedMethod,
        })
        const url = r.redirect ?? r.return ?? null
        if (!url) throw new Error(errorNoLink)
        setRedirectUrl(url)
        setStep('pending')
        openLink(url)
      } catch (e) {
        hapticNotify('error')
        setError(e instanceof Error ? e.message : errorFallback)
      } finally {
        setLoading(false)
      }
    },
    [selectedOption, selectedMethod, tier, wallet?.prepaid_generations_remaining],
  )

  const reopen = useCallback(() => {
    if (!redirectUrl) return
    haptic('light')
    openLink(redirectUrl)
  }, [redirectUrl])

  const check = useCallback(async (): Promise<boolean> => {
    if (!selectedOption) return false
    setLoading(true)
    haptic('light')
    try {
      await refreshBalance()
      const after = wallet?.prepaid_generations_remaining ?? 0
      if (after > walletAtInit) {
        hapticNotify('success')
        setStep('success')
        return true
      }
      hapticNotify('warning')
      return false
    } finally {
      setLoading(false)
    }
  }, [selectedOption, refreshBalance, wallet?.prepaid_generations_remaining, walletAtInit])

  const reset = useCallback(() => {
    setStep('select')
    setSelectedQty(null)
    setSelectedMethod(null)
    setRedirectUrl(null)
    setError(null)
  }, [])

  return {
    step,
    tier,
    hasPromo,
    options,
    standardPriceByQty,
    selectedOption,
    selectedMethod,
    redirectUrl,
    loading,
    error,
    setTier,
    selectQuantity,
    selectMethod,
    pay,
    reopen,
    check,
    reset,
  }
}
