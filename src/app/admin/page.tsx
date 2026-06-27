'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react'
import { useUser } from '@/components/TelegramProvider'
import { haptic } from '@/lib/telegram'
import HeroEditor from '@/components/admin/HeroEditor'
import PhotoCatalogEditor from '@/components/admin/PhotoCatalogEditor'
import TextsEditor from '@/components/admin/TextsEditor'
import PricingEditor from '@/components/admin/PricingEditor'
import CreditsAdmin from '@/components/admin/CreditsAdmin'
import BroadcastEditor from '@/components/admin/BroadcastEditor'
import StatsDashboard from '@/components/admin/StatsDashboard'
import WithdrawalsAdmin from '@/components/admin/WithdrawalsAdmin'
import ReviewsAdmin from '@/components/admin/ReviewsAdmin'
import CampaignsAdmin from '@/components/admin/CampaignsAdmin'
import LegalEditor from '@/components/admin/LegalEditor'
import { useContent } from '@/lib/content'

type Tab =
  | 'Статистика'
  | 'Ссылки'
  | 'Главная'
  | 'Фото'
  | 'Цены'
  | 'Токены'
  | 'Тексты'
  | 'Документы'
  | 'Рассылка'
  | 'Выводы'
  | 'Отзывы'
const TABS: Tab[] = [
  'Статистика',
  'Ссылки',
  'Главная',
  'Фото',
  'Цены',
  'Токены',
  'Тексты',
  'Документы',
  'Рассылка',
  'Выводы',
  'Отзывы',
]

export default function AdminPage() {
  const router = useRouter()
  const { tgUser, isAdmin } = useUser()
  const [tab, setTab] = useState<Tab>('Главная')
  const [readyChecked, setReadyChecked] = useState(false)
  const titleAdmin = useContent('page.title.admin')
  const subtitleAdmin = useContent('page.title.admin_subtitle')

  // Гейтинг — после загрузки tgUser, если не админ, кикаем на главную.
  useEffect(() => {
    if (tgUser === null) return
    setReadyChecked(true)
    if (!isAdmin) router.replace('/')
  }, [tgUser, isAdmin, router])

  useEffect(() => {
    document.body.classList.add('admin-fullwidth')
    return () => document.body.classList.remove('admin-fullwidth')
  }, [])

  // Кросс-табовая навигация: HeroEditor может попросить открыть «Фото».
  useEffect(() => {
    function onGoto(e: Event) {
      const detail = (e as CustomEvent<Tab>).detail
      if (detail && TABS.includes(detail)) setTab(detail)
    }
    window.addEventListener('velvet:admin:goto', onGoto)
    return () => window.removeEventListener('velvet:admin:goto', onGoto)
  }, [])

  if (!readyChecked) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Проверка доступа…
        </p>
      </div>
    )
  }
  if (!isAdmin) return null

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 pb-4 pt-6 md:px-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              haptic()
              router.push('/')
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.6)" />
          </button>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-white">{titleAdmin}</h1>
            <p
              className="text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {subtitleAdmin}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            background: 'var(--rose-dim)',
            border: '1px solid var(--border-rose)',
            color: 'var(--rose)',
          }}
        >
          <ShieldCheck size={12} weight="fill" />
          admin
        </div>
      </motion.header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 pb-10 md:flex-row md:items-start md:gap-8 md:px-8">
        <div
          className="flex max-w-full self-start overflow-x-auto rounded-full p-1 md:hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                haptic('light')
                setTab(t)
              }}
              className="relative flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {tab === t && (
                <motion.div
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.11)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className="relative z-10"
                style={{ color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)' }}
              >
                {t}
              </span>
            </button>
          ))}
        </div>

        <nav
          className="sticky top-4 hidden w-52 flex-shrink-0 flex-col gap-1 self-start rounded-2xl p-2 md:flex"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {TABS.map((t) => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => {
                  haptic('light')
                  setTab(t)
                }}
                className="rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors"
                style={{
                  background: active ? 'var(--rose-dim)' : 'transparent',
                  border: active ? '1px solid var(--border-rose)' : '1px solid transparent',
                  color: active ? 'var(--rose)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {t}
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === 'Статистика' && <StatsDashboard />}
          {tab === 'Ссылки' && <CampaignsAdmin />}
          {tab === 'Главная' && <HeroEditor />}
          {tab === 'Фото' && <PhotoCatalogEditor />}
          {tab === 'Цены' && <PricingEditor />}
          {tab === 'Токены' && <CreditsAdmin />}
          {tab === 'Тексты' && <TextsEditor />}
          {tab === 'Документы' && <LegalEditor />}
          {tab === 'Рассылка' && <BroadcastEditor />}
          {tab === 'Выводы' && <WithdrawalsAdmin />}
          {tab === 'Отзывы' && <ReviewsAdmin />}
        </div>
      </div>
    </div>
  )
}
