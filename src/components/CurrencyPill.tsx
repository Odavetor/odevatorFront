'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lightning, Diamond, Plus } from '@phosphor-icons/react'
import { getUser } from '@/lib/telegram'
import type { UserData } from '@/types'

export default function CurrencyPill() {
  const [data, setData] = useState<UserData | null>(null)

  useEffect(() => {
    const user = getUser()
    const uid = user?.id ?? 0
    fetch(`/api/balance?userId=${uid}`)
      .then((r) => r.json())
      .then((d) => setData(d?.data ?? null))
      .catch(() => null)
  }, [])

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
      <Lightning size={13} weight="fill" color="#FFB800" />
      <span className="font-mono text-xs font-medium leading-none" style={{ color: 'rgba(255,255,255,0.9)', minWidth: 14 }}>
        {data?.active_processes ?? '—'}
      </span>

      <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />

      <Diamond size={13} weight="fill" color="#8B5CF6" />
      <span className="font-mono text-xs font-medium leading-none" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {data ? data.balance.toLocaleString('ru') : '—'}
      </span>

      <div
        className="w-5 h-5 rounded-full flex items-center justify-center ml-0.5"
        style={{ background: '#7C3AED' }}
      >
        <Plus size={10} weight="bold" color="white" />
      </div>
    </Link>
  )
}
