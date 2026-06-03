'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Handshake, Headset } from '@phosphor-icons/react'
import { haptic, openLink } from '@/lib/telegram'

interface Contact {
  label: string
  handle: string
  icon: typeof Handshake
}

const CONTACTS: Contact[] = [
  { label: 'Сотрудничество', handle: 'CEO_Of_Adult', icon: Handshake },
  { label: 'Техподдержка', handle: 'Worker_2_IO', icon: Headset },
]

export function ContactsCard() {
  function open(handle: string) {
    haptic('light')
    openLink(`https://t.me/${handle}`)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-5 mt-6"
    >
      <span
        className="font-sans"
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '-0.005em',
          color: 'var(--rose)',
        }}
      >
        Связь
      </span>

      <div
        className="mt-2 overflow-hidden"
        style={{
          borderRadius: 24,
          background:
            'linear-gradient(135deg, rgba(31,25,41,0.55) 0%, rgba(13,13,15,0.9) 100%)',
          border: '1px solid var(--border-1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {CONTACTS.map((c, i) => {
          const Icon = c.icon
          return (
            <button
              key={c.handle}
              onClick={() => open(c.handle)}
              className="no-tap-highlight flex w-full items-center gap-3 px-4 py-3.5 text-left active:scale-[0.99]"
              style={{
                borderTop: i === 0 ? 'none' : '1px solid var(--border-1)',
                transition: 'transform 0.15s var(--ease-glide)',
              }}
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'var(--rose-dim)',
                  border: '1px solid var(--border-rose)',
                }}
              >
                <Icon size={18} weight="duotone" color="var(--rose)" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className="font-sans"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--text)',
                  }}
                >
                  {c.label}
                </span>
                <span
                  className="font-sans truncate"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 1,
                  }}
                >
                  @{c.handle}
                </span>
              </span>
              <ArrowUpRight size={16} weight="bold" color="rgba(255,255,255,0.4)" />
            </button>
          )
        })}
      </div>
    </motion.section>
  )
}
