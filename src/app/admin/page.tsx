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
import BroadcastEditor from '@/components/admin/BroadcastEditor'
import { useContent } from '@/lib/content'

type Tab = 'Главная' | 'Фото' | 'Цены' | 'Тексты' | 'Рассылка'
const TABS: Tab[] = ['Главная', 'Фото', 'Цены', 'Тексты', 'Рассылка']

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
        className="flex items-center justify-between px-5 pb-4 pt-6"
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

      <div className="flex flex-col gap-4 px-5 pb-10">
        <div
          className="flex max-w-full self-start overflow-x-auto rounded-full p-1"
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

        {tab === 'Главная' && <HeroEditor />}
        {tab === 'Фото' && <PhotoCatalogEditor />}
        {tab === 'Цены' && <PricingEditor />}
        {tab === 'Тексты' && <TextsEditor />}
        {tab === 'Рассылка' && <BroadcastEditor />}
      </div>
    </div>
  )
}
