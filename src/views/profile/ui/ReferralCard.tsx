'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Copy, ShareNetwork } from '@phosphor-icons/react'
import { SparkleBurst } from '@shared/ui'
import { fmtRub } from '@entities/pack'
import { haptic, hapticNotify, openLink } from '@/lib/telegram'

interface Props {
  link: string
  code: string
  earnedMinor: number
}

function fallbackCopy(text: string): boolean {
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.padding = '0'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.boxShadow = 'none'
  textarea.style.background = 'transparent'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  let success = false
  try {
    success = document.execCommand('copy')
  } catch {
    success = false
  }
  document.body.removeChild(textarea)
  return success
}

export function ReferralCard({ link, earnedMinor }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    let ok = false
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) ok = fallbackCopy(link)
    if (ok) {
      setCopied(true)
      hapticNotify('success')
      setTimeout(() => setCopied(false), 1800)
    } else {
      hapticNotify('error')
    }
  }

  function shareToTelegram() {
    haptic('medium')
    const text = encodeURIComponent('попробуй — реально работает')
    const url = encodeURIComponent(link)
    openLink(`https://t.me/share/url?url=${url}&text=${text}`)
  }

  return (
    <section
      className="relative overflow-hidden mx-5 mt-4"
      style={{
        borderRadius: 24,
        background:
          'linear-gradient(135deg, rgba(224,63,106,0.18) 0%, rgba(31,25,41,0.6) 60%, rgba(13,13,15,0.92) 100%)',
        border: '1px solid var(--border-rose)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px -16px rgba(224,63,106,0.4)',
      }}
    >
      <span
        aria-hidden
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224,63,106,0.3) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />

      <div className="relative px-5 pt-5 pb-4 flex flex-col gap-1.5">
        <span
          className="font-sans"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            color: 'var(--rose)',
          }}
        >
          Зови друзей
        </span>
        <h3
          className="font-sans"
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            color: 'var(--text)',
          }}
        >
          Получай <span style={{ color: 'var(--rose)' }}>₽</span> с покупок друга
        </h3>
        <p
          className="font-sans"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 4,
          }}
        >
          {earnedMinor > 0
            ? `Уже капнуло ${fmtRub(earnedMinor)} ₽ на счёт`
            : 'Каждая его покупка — кэшбек тебе'}
        </p>
      </div>

      <div className="relative px-3 pb-3 flex flex-col gap-2">
        <motion.button
          onClick={copy}
          whileTap={{ scale: 0.98 }}
          className="relative rounded-2xl px-3 py-2.5 flex items-center gap-2 w-full no-tap-highlight overflow-hidden"
          animate={{
            background: copied ? 'rgba(95,210,150,0.12)' : 'rgba(0,0,0,0.34)',
            boxShadow: copied
              ? '0 0 0 1.5px var(--splash-green), 0 0 24px rgba(95,210,150,0.35), inset 0 1px 0 rgba(255,255,255,0.04)'
              : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Скопировать реферальную ссылку"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="font-sans flex-1 text-left inline-flex items-center gap-1.5"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--splash-green)',
                }}
              >
                <Check size={13} weight="bold" />
                Скопировано — отправь другу
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="font-sans flex-1 truncate text-left"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {link.replace(/^https?:\/\//, '')}
              </motion.span>
            )}
          </AnimatePresence>

          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center relative"
            style={{
              background: copied ? 'rgba(95,210,150,0.18)' : 'var(--rose-dim)',
              border: copied
                ? '1px solid rgba(95,210,150,0.4)'
                : '1px solid var(--border-rose)',
              transition: 'all 0.22s var(--ease-glide)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                >
                  <Check size={14} color="var(--splash-green)" weight="bold" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                >
                  <Copy size={14} color="var(--rose)" weight="bold" />
                </motion.span>
              )}
            </AnimatePresence>
            {copied && (
              <SparkleBurst count={8} radius={26} color="var(--splash-green)" />
            )}
          </span>
        </motion.button>

        <button
          onClick={shareToTelegram}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 no-tap-highlight active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 24px -6px rgba(224,63,106,0.45)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            transition: 'transform 0.15s var(--ease-glide)',
          }}
        >
          <ShareNetwork size={15} weight="bold" />
          Поделиться в Telegram
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  )
}
