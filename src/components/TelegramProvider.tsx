'use client'

import { useEffect } from 'react'
import { expand, ready } from '@/lib/telegram'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ready()
    expand()
  }, [])

  return <>{children}</>
}
