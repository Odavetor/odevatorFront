import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Nunito, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { TelegramProvider } from '@/components/TelegramProvider'

// Playfair Display — editorial serif, отличная кириллица
const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

// Nunito — современный, специально доработан для кириллицы
const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// JetBrains Mono — отличная кириллица для цифр/ID
const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
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
      className={`${playfair.variable} ${nunito.variable} ${jetbrains.variable}`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  )
}
