import type { Metadata, Viewport } from 'next'
import { Onest, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { TelegramProvider } from '@entities/user'
import { TelegramOnlyGate } from '@widgets/telegram-only-gate'
import { DevToggle } from '@widgets/dev-toggle'
import { AuroraBg } from '@widgets/aurora-bg'

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['500'],
  preload: false,
})

export const metadata: Metadata = {
  title: 'Velvet AI',
  description: 'Преобразование образа с помощью ИИ',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d0d0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${jetbrains.variable}`}>
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <AuroraBg />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh' }}>
          <TelegramOnlyGate>
            <TelegramProvider>
              {children}
              <DevToggle />
            </TelegramProvider>
          </TelegramOnlyGate>
        </div>
      </body>
    </html>
  )
}
