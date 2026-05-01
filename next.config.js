/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nano-gpt.com' },
      { protocol: 'https', hostname: 'cdn.nano-gpt.com' },
      { protocol: 'https', hostname: '*.nano-gpt.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
}

module.exports = nextConfig
