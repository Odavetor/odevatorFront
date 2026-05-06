'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { expand, getUser, ready } from '@/lib/telegram'
import { isAdminTelegramId } from '@/lib/admin'
import { IS_DEV, getDevViewAs, isMockEnabled, type DevViewAs } from '@/lib/dev'
import { MOCK_ME, MOCK_USER_DATA, MOCK_WALLET } from '@/lib/dev-mock'
import { getMe } from '@/lib/api/users'
import { getWallet } from '@/lib/api/wallet'
import type { MeResponse, WalletResponse } from '@/lib/api/types'
import type { TelegramUser, UserData } from '@/types'

interface UserContextValue {
  tgUser: TelegramUser | null
  userData: UserData | null
  me: MeResponse | null
  wallet: WalletResponse | null
  loading: boolean
  isAdmin: boolean
  devViewAs: DevViewAs
  refreshBalance: () => Promise<void>
  refreshMe: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

const minorToMajor = (minor: number) => Math.floor(minor / 100)

function buildUserData(
  me: MeResponse | null,
  wallet: WalletResponse | null,
  fallbackUser: TelegramUser | null,
): UserData | null {
  if (!me && !wallet && !fallbackUser) return null
  return {
    user_id: me?.telegram_user_id ?? fallbackUser?.id ?? 0,
    username: me?.username || fallbackUser?.username || null,
    balance: wallet ? minorToMajor(wallet.balance_minor) : 0,
    active_processes: wallet?.prepaid_generations_remaining ?? 0,
    generations: 0, // отдельной ручки нет — будет добавлено в /users/me как lifetime_generations (см. TZ §10)
    reg_date: me?.created_at ?? new Date().toISOString(),
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [wallet, setWallet] = useState<WalletResponse | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [devViewAs, setDevViewAs] = useState<DevViewAs>(null)

  const meInFlight = useRef<Promise<void> | null>(null)
  const walletInFlight = useRef<Promise<void> | null>(null)

  const useMock = isMockEnabled()

  const refreshMe = useCallback(async () => {
    if (meInFlight.current) return meInFlight.current
    if (useMock) {
      setMe(MOCK_ME)
      return
    }
    const p = getMe()
      .then((m) => setMe(m))
      .catch(() => setMe(null))
      .finally(() => {
        meInFlight.current = null
      })
    meInFlight.current = p
    return p
  }, [useMock])

  const refreshBalance = useCallback(async () => {
    if (walletInFlight.current) return walletInFlight.current
    if (useMock) {
      setWallet(MOCK_WALLET)
      setUserData(MOCK_USER_DATA)
      setLoading(false)
      return
    }
    const p = getWallet()
      .then((w) => setWallet(w))
      .catch(() => setWallet(null))
      .finally(() => {
        walletInFlight.current = null
        setLoading(false)
      })
    walletInFlight.current = p
    return p
  }, [useMock])

  useEffect(() => {
    ready()
    expand()
    const real = getUser()
    if (real) {
      setTgUser(real)
    } else if (IS_DEV) {
      // Локалхост без Telegram WebApp — синтетический юзер,
      // чтобы гейтинг по `tgUser` не залипал и dev-тумблер реально переключал режимы.
      setTgUser({ id: 0, first_name: 'Dev', username: 'dev' })
    }
    if (IS_DEV) setDevViewAs(getDevViewAs())
    refreshMe()
    refreshBalance()
  }, [refreshMe, refreshBalance])

  useEffect(() => {
    if (useMock) return
    setUserData(buildUserData(me, wallet, tgUser))
  }, [me, wallet, tgUser, useMock])

  useEffect(() => {
    if (!IS_DEV) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DevViewAs>).detail
      setDevViewAs(detail ?? null)
    }
    window.addEventListener('velvet:dev:viewAsChanged', handler)
    return () => window.removeEventListener('velvet:dev:viewAsChanged', handler)
  }, [])

  const realIsAdmin = useMemo(() => {
    if (me?.is_admin) return true
    return isAdminTelegramId(tgUser?.id)
  }, [me?.is_admin, tgUser?.id])

  const isAdmin = useMemo(() => {
    if (IS_DEV && devViewAs === 'admin') return true
    if (IS_DEV && devViewAs === 'user') return false
    return realIsAdmin
  }, [devViewAs, realIsAdmin])

  return (
    <UserContext.Provider
      value={{
        tgUser, userData, me, wallet, loading,
        isAdmin, devViewAs, refreshBalance, refreshMe,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside TelegramProvider')
  return ctx
}
