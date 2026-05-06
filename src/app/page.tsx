'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchHistory } from '@/lib/history'
import { fetchPhotoCatalog } from '@/lib/catalog'
import type { HistoryItem } from '@/types'
import BottomNav from '@/components/BottomNav'
import { useUser } from '@/components/TelegramProvider'
import { HERO_SAMPLES } from '@/data/hero-samples'
import type { HeroSample } from '@/data/hero-samples'
import type { FilterCategory } from '@/data/generate-options'
import { PHOTO_FILTER_CATEGORIES } from '@/data/generate-options'
import HomeHeader from '@/components/home/EditorialHeader'
import CinematicHero from '@/components/home/CinematicHero'
import StyleBento from '@/components/home/StyleBento'
import ScenariosStrip from '@/components/home/ScenariosStrip'
import RecentGallery from '@/components/home/RecentGallery'

const ROTATE_MS = 4500
const RESUME_DELAY_MS = 4000

// Берём первый вариант каждой категории как hero-пример. Категория = sample.category, опция = sample.label.
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

export default function HomePage() {
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

  // Тянем каталог фото с бэка → строим из него hero-сэмплы (первый вариант каждой категории).
  // Если бэк недоступен — оставляем null, фолбэк на HERO_SAMPLES сработает в useMemo ниже.
  useEffect(() => {
    let cancelled = false
    fetchPhotoCatalog()
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
    // Приоритет 1: каталог с бэка
    if (photoCategories?.length) {
      const built = categoriesToHero(photoCategories)
      if (built.length > 0) return built
    }
    // Приоритет 2: захардкоженный каталог из generate-options.ts
    const fromHardcoded = categoriesToHero(PHOTO_FILTER_CATEGORIES)
    if (fromHardcoded.length > 0) return fromHardcoded
    // Приоритет 3: HERO_SAMPLES (для dev / отладки)
    return HERO_SAMPLES
  }, [photoCategories])

  useEffect(() => {
    if (autoPaused || heroSamples.length <= 1) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % heroSamples.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [autoPaused, heroSamples.length])

  // Если активный индекс уехал за пределы (после рефреша каталога) — сбросить
  useEffect(() => {
    if (activeIndex >= heroSamples.length) setActiveIndex(0)
  }, [activeIndex, heroSamples.length])

  // Очищаем timer при размонтировании, чтобы не дёргать setState на отмонтированном
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  // Колбэк для CinematicHero: пока юзер таскает разделитель — пауза;
  // после отпускания — RESUME_DELAY_MS оверлей-таймер до возобновления ротации.
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

  const slotsCount = userData?.active_processes ?? 0
  const hasCredits = slotsCount > 0
  const ctaHref = hasCredits ? '/generate' : '/shop'
  const ctaLabel = hasCredits ? 'Создать фото' : 'Купить слоты'

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <HomeHeader firstName={tgUser?.first_name ?? 'Гость'} />

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
      <ScenariosStrip />
      <RecentGallery items={recent} />

      <div className="h-12" />

      <BottomNav />
    </div>
  )
}
