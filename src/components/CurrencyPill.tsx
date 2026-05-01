'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Lightning, Diamond, Plus } from '@phosphor-icons/react'
import { useUser } from './TelegramProvider'

function CurrencyPillBase() {
  const { userData } = useUser()

  return (
    <Link
      href="/shop"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
      style={{
        background: 'rgba(18,18,24,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Lightning size={13} weight="fill" color="#E03F6A" />
      <span className="font-mono text-xs font-medium leading-none" style={{ color: 'rgba(255,255,255,0.92)', minWidth: 14 }}>
        {userData?.active_processes ?? '—'}
      </span>

      <div className="w-px h-3" style={{ background: 'var(--border-2)' }} />

      <Diamond size={13} weight="fill" color="rgba(255,255,255,0.55)" />
      <span className="font-mono text-xs font-medium leading-none" style={{ color: 'rgba(255,255,255,0.92)' }}>
        {userData ? userData.balance.toLocaleString('ru') : '—'}
      </span>

      <div
        className="w-5 h-5 rounded-full flex items-center justify-center ml-0.5"
        style={{
          background: 'var(--rose)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        <Plus size={10} weight="bold" color="white" />
      </div>
    </Link>
  )
}

export default memo(CurrencyPillBase)
