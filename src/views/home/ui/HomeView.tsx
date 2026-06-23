'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchHistory, type HistoryItem } from '@entities/generation'
import {
  getPhotoCatalogCached,
  PHOTO_FILTER_CATEGORIES,
  HERO_SAMPLES,
  type FilterCategory,
  type HeroSample,
} from '@entities/catalog'
import { useUser } from '@entities/user'
import { tt, useLang } from '@shared/lib'
import { BottomNav } from '@widgets/bottom-nav'
import { EditorialHeader as HomeHeader } from '@widgets/editorial-header'
import { CinematicHero } from '@widgets/cinematic-hero'
import { StyleBento } from '@widgets/style-bento'
import { RecentGallery } from '@widgets/recent-gallery'

const ROTATE_MS = 4500
const RESUME_DELAY_MS = 4000

function categoriesToHero(cats: FilterCategory[]): HeroSample[] {
  return cats
    .map((cat) => {
      const opt = cat.options[0]
      if (!opt) return null
      return {
        id: cat.id,
        before: opt.beforeExample,
        after: opt.afterExample,
        category: cat.label,
        label: opt.label,
      } satisfies HeroSample
    })
    .filter((x): x is HeroSample => x !== null)
}

export function HomeView() {
  const router = useRouter()
  const { tgUser, userData, isAdmin } = useUser()
  const [recent, setRecent] = useState<HistoryItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoPaused, setAutoPaused] = useState(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [photoCategories, setPhotoCategories] = useState<FilterCategory[] | null>(null)

  useEffect(() => {
    if (tgUser && isAdmin) router.replace('/admin')
  }, [tgUser, isAdmin, router])

  useEffect(() => {
    let cancelled = false
    fetchHistory({ userId: tgUser?.id ?? 0, page: 1, perPage: 6 })
      .then((d) => {
        if (!cancelled) setRecent(d.items ?? [])
      })
      .catch(() => null)
    return () => {
      cancelled = true
    }
  }, [tgUser?.id])

  useEffect(() => {
    let cancelled = false
    getPhotoCatalogCached()
      .then((d) => {
        if (cancelled || !d.categories?.length) return
        setPhotoCategories(d.categories)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const heroSamples: HeroSample[] = useMemo(() => {
    if (photoCategories?.length) {
      const built = categoriesToHero(photoCategories)
      if (built.length > 0) return built
    }
    const fromHardcoded = categoriesToHero(PHOTO_FILTER_CATEGORIES)
    if (fromHardcoded.length > 0) return fromHardcoded
    return HERO_SAMPLES
  }, [photoCategories])

  useEffect(() => {
    if (autoPaused || heroSamples.length <= 1) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % heroSamples.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [autoPaused, heroSamples.length])

  useEffect(() => {
    if (activeIndex >= heroSamples.length) setActiveIndex(0)
  }, [activeIndex, heroSamples.length])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const handleComparingChange = useCallback((comparing: boolean) => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
    if (comparing) {
      setAutoPaused(true)
    } else {
      resumeTimerRef.current = setTimeout(() => setAutoPaused(false), RESUME_DELAY_MS)
    }
  }, [])

  useLang()
  const slotsCount = userData?.active_processes ?? 0
  const hasCredits = slotsCount > 0
  const ctaHref = hasCredits ? '/generate' : '/shop'
  const ctaLabel = hasCredits
    ? tt({ ru: 'Создать фото', en: 'Create photo', de: 'Foto erstellen' })
    : tt({ ru: 'Купить слоты', en: 'Buy slots', de: 'Slots kaufen' })

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <HomeHeader firstName={tgUser?.first_name ?? tt({ ru: 'Гость', en: 'Guest', de: 'Gast' })} />

      <CinematicHero
        samples={heroSamples}
        activeIndex={activeIndex}
        onSelectIndex={setActiveIndex}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        hasCredits={hasCredits}
        slotsCount={slotsCount}
        onComparingChange={handleComparingChange}
      />

      <StyleBento />
      <RecentGallery items={recent} />

      <div className="h-12" />

      <BottomNav />
    </div>
  )
}
