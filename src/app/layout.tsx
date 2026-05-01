import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Onest, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { TelegramProvider } from '@/components/TelegramProvider'

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['500', '600'],
  preload: true,
})

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
    <html
      lang="ru"
      className={`${playfair.variable} ${onest.variable} ${jetbrains.variable}`}
    >
      <body>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  )
}
