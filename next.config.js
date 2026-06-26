/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15.2+ требует явный allowlist кросс-ориджин dev-запросов.
  // Без этого Mini App с телефона в LAN ловит warning'и и в будущем — блокировку HMR.
  // Перечисляем приватные подсети RFC 1918, чтобы охватить любой роутер.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    // Класс A: 10.0.0.0/8
    '10.*.*.*',
    // Класс B: 172.16.0.0 — 172.31.255.255
    '172.16.*.*',
    '172.17.*.*',
    '172.18.*.*',
    '172.19.*.*',
    '172.20.*.*',
    '172.21.*.*',
    '172.22.*.*',
    '172.23.*.*',
    '172.24.*.*',
    '172.25.*.*',
    '172.26.*.*',
    '172.27.*.*',
    '172.28.*.*',
    '172.29.*.*',
    '172.30.*.*',
    '172.31.*.*',
    // Класс C: 192.168.0.0/16
    '192.168.*.*',
    // .local mDNS (если у роутера/системы включён avahi/Bonjour)
    '*.local',
  ],
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Любой бэк-CDN добавь сюда. Picsum используется в hero/моках для dev.
    // Прод-домен нужен для админ-загрузок: бэк отдаёт URL вида
    // https://unfulfilled-dreams.com/{catalog,uploads}/...
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'unfulfilled-dreams.com' },
      { protocol: 'https', hostname: 'www.unfulfilled-dreams.com' },
      // Undress provider result CDN (job results live here, e.g. res.aivio.art)
      { protocol: 'https', hostname: 'res.aivio.art' },
      { protocol: 'https', hostname: '**.aivio.art' },
    ],
  },
}

module.exports = nextConfig
