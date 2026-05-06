'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, X } from '@phosphor-icons/react'
import { IS_DEV, getDevViewAs, setDevViewAs, type DevViewAs } from '@/lib/dev'

export default function DevToggle() {
  const [open, setOpen] = useState(false)
  const [viewAs, setViewAsState] = useState<DevViewAs>(null)

  useEffect(() => {
    if (!IS_DEV) return
    setViewAsState(getDevViewAs())
  }, [])

  if (!IS_DEV) return null

  const apply = (v: DevViewAs) => {
    setDevViewAs(v)
    setViewAsState(v)
  }

  const dot = viewAs === 'admin' ? '#E03F6A' : viewAs === 'user' ? '#5BC993' : 'rgba(255,255,255,0.55)'

  return (
    <div
      className="fixed z-[120] flex flex-col items-end gap-2"
      style={{ right: 12, top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(15,15,18,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Dev tools"
        >
          <Wrench size={15} color="rgba(255,255,255,0.7)" weight="bold" />
          <span
            className="absolute"
            style={{
              right: 4, top: 4, width: 6, height: 6, borderRadius: 999,
              background: dot, boxShadow: `0 0 0 1.5px rgba(15,15,18,0.95)`,
            }}
          />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="rounded-2xl p-3 flex flex-col gap-2 min-w-[200px]"
          style={{
            background: 'rgba(15,15,18,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              dev · view as
            </span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <X size={11} color="rgba(255,255,255,0.55)" weight="bold" />
            </button>
          </div>

          <div
            className="flex p-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(
              [
                { v: null, label: 'Auto' },
                { v: 'user', label: 'Юзер' },
                { v: 'admin', label: 'Админ' },
              ] as const
            ).map(({ v, label }) => {
              const active = viewAs === v
              return (
                <button
                  key={String(v)}
                  onClick={() => apply(v)}
                  className="flex-1 px-2.5 py-1 text-[11px] font-medium rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.11)' : 'transparent',
                    border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.45)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Auto — определять по telegram_user_id.<br />
            Mock: {process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? 'on' : 'off'} ·
            API: {process.env.NEXT_PUBLIC_API_BASE_URL ? 'set' : '—'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
