'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { expand, getUser, ready } from '@/lib/telegram'
import type { TelegramUser, UserData } from '@/types'

interface UserContextValue {
  tgUser: TelegramUser | null
  userData: UserData | null
  loading: boolean
  refreshBalance: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const inFlight = useRef<Promise<void> | null>(null)

  const refreshBalance = useCallback(async () => {
    if (inFlight.current) return inFlight.current
    const uid = getUser()?.id ?? 0
    const p = fetch(`/api/balance?userId=${uid}`)
      .then((r) => r.json())
      .then((d) => {
        setUserData(d?.data ?? null)
      })
      .catch(() => {})
      .finally(() => {
        inFlight.current = null
        setLoading(false)
      })
    inFlight.current = p
    return p
  }, [])

  useEffect(() => {
    ready()
    expand()
    setTgUser(getUser())
    refreshBalance()
  }, [refreshBalance])

  return (
    <UserContext.Provider value={{ tgUser, userData, loading, refreshBalance }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside TelegramProvider')
  return ctx
}
