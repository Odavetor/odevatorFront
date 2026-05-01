'use client'

import { motion } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import CurrencyPill from '@/components/CurrencyPill'
import { useUser } from '@/components/TelegramProvider'
import {
  User,
  Lightning,
  CurrencyRub,
  Sparkle,
  Calendar,
} from '@phosphor-icons/react'

function StatBlock({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
  label: string
  value: string
  icon: React.ElementType
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-2 rounded-2xl p-4"
      style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(224,63,106,0.1)', border: '1px solid rgba(224,63,106,0.15)' }}
      >
        <Icon size={16} color="#e03f6a" weight="fill" />
      </div>
      <p className="font-mono text-xl font-medium text-cream-100">{value}</p>
      <p className="text-cream-700 text-gr-2xs">{label}</p>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { tgUser, userData } = useUser()

  const memberSince = userData?.reg_date
    ? new Date(userData.reg_date).toLocaleDateString('ru', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pt-7 pb-6 flex flex-col items-start gap-5"
      >
        <div className="w-full flex items-center justify-between">
          <h1 className="font-display text-gr-xl text-cream-100">Профиль</h1>
          <CurrencyPill />
        </div>
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(224,63,106,0.15) 0%, rgba(180,30,60,0.1) 100%)',
              border: '1px solid rgba(224,63,106,0.22)',
              boxShadow: '0 0 32px rgba(224,63,106,0.1)',
            }}
          >
            {tgUser?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tgUser.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={36} color="#e03f6a" weight="duotone" />
            )}
          </div>
          {/* Online dot */}
          <div
            className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full"
            style={{ background: '#4ade80', border: '2px solid #0d0b10' }}
          />
        </div>

        {/* Name */}
        <div>
          <p className="font-display text-gr-xl text-cream-100 leading-tight">
            {tgUser?.first_name ?? 'Гость'}
            {tgUser?.last_name ? ` ${tgUser.last_name}` : ''}
          </p>
          {tgUser?.username && (
            <p className="text-cream-700 text-sm mt-0.5">@{tgUser.username}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar size={13} color="#7a4a5e" />
            <p className="text-cream-700 text-gr-2xs">С {memberSince}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-3 pb-5">
        <StatBlock
          label="Баланс"
          value={userData ? `${userData.balance.toLocaleString('ru')} ₽` : '—'}
          icon={CurrencyRub}
          delay={0.05}
        />
        <StatBlock
          label="Слотов"
          value={userData ? String(userData.active_processes) : '—'}
          icon={Lightning}
          delay={0.1}
        />
        <StatBlock
          label="Всего обработок"
          value={userData ? String(userData.generations) : '—'}
          icon={Sparkle}
          delay={0.15}
        />
        <StatBlock
          label="ID"
          value={tgUser ? String(tgUser.id) : '—'}
          icon={User}
          delay={0.2}
        />
      </div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mx-5 rounded-2xl p-4"
        style={{ background: 'rgba(22,18,28,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-cream-700 text-gr-2xs leading-relaxed">
          История генераций хранится <span className="text-cream-500">3 дня</span>.
          Результаты доступны во вкладке «История».
        </p>
      </motion.div>

      <BottomNav />
    </div>
  )
}
