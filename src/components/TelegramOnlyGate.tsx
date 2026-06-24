'use client'

import { useEffect, useState } from 'react'
import { TelegramLogo } from '@phosphor-icons/react'
import { IS_DEV } from '@/lib/dev'
import { getInitData } from '@/lib/telegram'
import { tt, useLang } from '@shared/lib'

const BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME ?? ''

// Открытие сайта вне Telegram WebApp бессмысленно: бэк требует подписи initData,
// и мы не хотим, чтобы лендинг попадал в браузер/индекс. Гейт пускает только тех,
// у кого Telegram-скрипт заполнил initData; в IS_DEV пропускаем для локальной разработки.
export function TelegramOnlyGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'allowed' | 'blocked'>('pending')

  useEffect(() => {
    if (IS_DEV) {
      setStatus('allowed')
      return
    }
    setStatus(getInitData() ? 'allowed' : 'blocked')
  }, [])

  if (status === 'pending') return null
  if (status === 'blocked') return <BrowserStub />
  return <>{children}</>
}

function BrowserStub() {
  useLang()
  const tgUrl = BOT_USERNAME ? `https://t.me/${BOT_USERNAME}` : null
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex max-w-sm flex-col items-center gap-5 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(36,162,232,0.12)',
            border: '1px solid rgba(36,162,232,0.28)',
          }}
        >
          <TelegramLogo size={32} weight="fill" color="#24a2e8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1
            className="font-display"
            style={{ fontSize: 26, lineHeight: 1.05, color: 'var(--text)' }}
          >
            {tt({ ru: 'Откройте в Telegram', en: 'Open in Telegram', de: 'In Telegram öffnen' })}
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tt({
              ru: 'Сервис работает только внутри Telegram. Запустите бота — приложение откроется в окне мессенджера.',
              en: 'The service works only inside Telegram. Launch the bot — the app opens inside the messenger.',
              de: 'Der Dienst funktioniert nur in Telegram. Starte den Bot — die App öffnet sich im Messenger.',
            })}
          </p>
        </div>
        {tgUrl && (
          <a
            href={tgUrl}
            className="mt-1 flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
            style={{
              background: '#24a2e8',
              color: '#fff',
              boxShadow: '0 6px 24px rgba(36,162,232,0.35)',
            }}
          >
            <TelegramLogo size={16} weight="fill" />
            {tt({ ru: 'Открыть бота', en: 'Open the bot', de: 'Bot öffnen' })}
          </a>
        )}
      </div>
    </div>
  )
}
