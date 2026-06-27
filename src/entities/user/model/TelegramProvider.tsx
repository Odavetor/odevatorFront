'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  expand,
  getTelegramUser,
  IS_DEV,
  isMockEnabled,
  MOCK_ME,
  MOCK_USER_DATA,
  MOCK_WALLET,
  ready,
  getDevViewAs,
  type DevViewAs,
  setLang,
  setLangPersisted,
  storedLang,
  useLang,
} from '@shared/lib'
import type { MeResponse, WalletResponse } from '@shared/api'
import { getMe } from '@entities/user/api/users'
import { getWallet } from '@entities/user/api/wallet'
import type { TelegramUser, UserData } from '@entities/user/types'

interface UserContextValue {
  tgUser: TelegramUser | null
  userData: UserData | null
  me: MeResponse | null
  wallet: WalletResponse | null
  loading: boolean
  isAdmin: boolean
  devViewAs: DevViewAs
  refreshBalance: () => Promise<WalletResponse | null>
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
    generations: me?.lifetime_generations ?? 0,
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
  const walletInFlight = useRef<Promise<WalletResponse | null> | null>(null)

  const useMock = isMockEnabled()

  const refreshMe = useCallback(async () => {
    if (meInFlight.current) return meInFlight.current
    if (useMock) {
      setMe(MOCK_ME)
      return
    }
    const p = getMe()
      .then((m) => setMe(m))
      .catch(() => {
        if (IS_DEV) setMe((prev) => prev ?? MOCK_ME)
      })
      .finally(() => {
        meInFlight.current = null
      })
    meInFlight.current = p
    return p
  }, [useMock])

  const refreshBalance = useCallback(async (): Promise<WalletResponse | null> => {
    if (walletInFlight.current) return walletInFlight.current
    if (useMock) {
      setWallet(MOCK_WALLET)
      setUserData(MOCK_USER_DATA as UserData)
      setLoading(false)
      return MOCK_WALLET
    }
    const p = getWallet()
      .then((w) => {
        setWallet(w)
        return w
      })
      .catch((): WalletResponse | null => {
        if (IS_DEV) {
          setWallet((prev) => prev ?? MOCK_WALLET)
          return MOCK_WALLET
        }
        return null
      })
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
    const real = getTelegramUser()
    if (real) {
      setTgUser(real)
    } else if (IS_DEV) {
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

  // Resolve the active UI language: a manual choice (localStorage) always wins,
  // otherwise follow the Telegram-provided language_code (backend, then client).
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlLang = new URLSearchParams(window.location.search).get('lang')
      if (urlLang === 'ru' || urlLang === 'en' || urlLang === 'de') {
        setLangPersisted(urlLang)
        return
      }
    }
    const manual = storedLang()
    if (manual) {
      setLang(manual)
      return
    }
    const code = me?.language_code ?? tgUser?.language_code
    if (code) setLang(code)
  }, [me?.language_code, tgUser])

  // Keep <html lang> in sync with the active language.
  const lang = useLang()
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    if (useMock) return
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      refreshBalance()
      refreshMe()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [useMock, refreshBalance, refreshMe])

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
    // Admin status comes only from the verified backend response (JWT-authenticated
    // /users/me). Never trust window.Telegram.WebApp.initDataUnsafe on the client.
    return !!me?.is_admin
  }, [me?.is_admin])

  const isAdmin = useMemo(() => {
    if (IS_DEV && devViewAs === 'admin') return true
    if (IS_DEV && devViewAs === 'user') return false
    return realIsAdmin
  }, [devViewAs, realIsAdmin])

  const contextValue = useMemo<UserContextValue>(
    () => ({
      tgUser,
      userData,
      me,
      wallet,
      loading,
      isAdmin,
      devViewAs,
      refreshBalance,
      refreshMe,
    }),
    [tgUser, userData, me, wallet, loading, isAdmin, devViewAs, refreshBalance, refreshMe],
  )

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside TelegramProvider')
  return ctx
}
