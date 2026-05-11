'use client'

import { useEffect, useState } from 'react'
import { TelegramLogo } from '@phosphor-icons/react'
import { IS_DEV } from '@/lib/dev'
import { getInitData } from '@/lib/telegram'

const BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? ''

// Открытие сайта вне Telegram WebApp бессмысленно: бэк требует подписи initData,
// и мы не хотим, чтобы лендинг попадал в браузер/индекс. Гейт пускает только тех,
// у кого Telegram-скрипт заполнил initData; в IS_DEV пропускаем для локальной разработки.
export function TelegramOnlyGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'allowed' | 'blocked'>('pending')

  useEffect(() => {
    if (IS_DEV) { setStatus('allowed'); return }
    setStatus(getInitData() ? 'allowed' : 'blocked')
  }, [])

  if (status === 'pending') return null
  if (status === 'blocked') return <BrowserStub />
  return <>{children}</>
}

function BrowserStub() {
  const tgUrl = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : null
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(36,162,232,0.12)',
            border: '1px solid rgba(36,162,232,0.28)',
          }}
        >
          <TelegramLogo size={32} weight="fill" color="#24a2e8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display" style={{ fontSize: 26, lineHeight: 1.05, color: 'var(--text)' }}>
            Откройте в Telegram
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Сервис работает только внутри Telegram. Запустите бота — приложение откроется в окне мессенджера.
          </p>
        </div>
        {tgUrl && (
          <a
            href={tgUrl}
            className="rounded-2xl py-3 px-6 font-semibold text-sm flex items-center gap-2 mt-1"
            style={{
              background: '#24a2e8',
              color: '#fff',
              boxShadow: '0 6px 24px rgba(36,162,232,0.35)',
            }}
          >
            <TelegramLogo size={16} weight="fill" />
            Открыть бота
          </a>
        )}
      </div>
    </div>
  )
}
