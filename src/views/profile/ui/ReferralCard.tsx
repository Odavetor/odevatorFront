'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Copy, ShareNetwork } from '@phosphor-icons/react'
import { SparkleBurst } from '@shared/ui'
import { fmtRub } from '@entities/pack'
import { tt, useLang } from '@shared/lib'
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
  useLang()
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
    const text = encodeURIComponent(
      tt({
        ru: 'попробуй — реально работает',
        en: 'try this — it actually works',
        de: 'probier mal — funktioniert wirklich',
      }),
    )
    const url = encodeURIComponent(link)
    openLink(`https://t.me/share/url?url=${url}&text=${text}`)
  }

  return (
    <section
      className="relative mx-5 mt-4 overflow-hidden"
      style={{
        borderRadius: 24,
        background:
          'linear-gradient(135deg, rgba(224,63,106,0.18) 0%, rgba(31,25,41,0.6) 60%, rgba(13,13,15,0.92) 100%)',
        border: '1px solid var(--border-rose)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px -16px rgba(224,63,106,0.4)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(224,63,106,0.3) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />

      <div className="relative flex flex-col gap-1.5 px-5 pb-4 pt-5">
        <span
          className="font-sans"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            color: 'var(--rose)',
          }}
        >
          {tt({ ru: 'Зови друзей', en: 'Invite friends', de: 'Freunde einladen' })}
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
          {tt({ ru: 'Получай ', en: 'Earn ', de: 'Verdiene ' })}
          <span style={{ color: 'var(--rose)' }}>₽</span>
          {tt({
            ru: ' с покупок друга',
            en: " from your friend's purchases",
            de: ' aus den Käufen deines Freundes',
          })}
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
            ? tt({
                ru: `Уже капнуло ${fmtRub(earnedMinor)} ₽ на счёт`,
                en: `Already ${fmtRub(earnedMinor)} ₽ landed in your balance`,
                de: `Bereits ${fmtRub(earnedMinor)} ₽ auf deinem Guthaben`,
              })
            : tt({
                ru: 'Каждая его покупка — кэшбек тебе',
                en: 'Every purchase they make is cashback for you',
                de: 'Jeder ihrer Käufe ist Cashback für dich',
              })}
        </p>
      </div>

      <div className="relative flex flex-col gap-2 px-3 pb-3">
        <motion.button
          onClick={copy}
          whileTap={{ scale: 0.98 }}
          className="no-tap-highlight relative flex w-full items-center gap-2 overflow-hidden rounded-2xl px-3 py-2.5"
          animate={{
            background: copied ? 'rgba(95,210,150,0.12)' : 'rgba(0,0,0,0.34)',
            boxShadow: copied
              ? '0 0 0 1.5px var(--splash-green), 0 0 24px rgba(95,210,150,0.35), inset 0 1px 0 rgba(255,255,255,0.04)'
              : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          aria-label={tt({
            ru: 'Скопировать реферальную ссылку',
            en: 'Copy referral link',
            de: 'Empfehlungslink kopieren',
          })}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex flex-1 items-center gap-1.5 text-left font-sans"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--splash-green)',
                }}
              >
                <Check size={13} weight="bold" />
                {tt({
                  ru: 'Скопировано — отправь другу',
                  en: 'Copied — send it to a friend',
                  de: 'Kopiert — schick es einem Freund',
                })}
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 truncate text-left font-sans"
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
            className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: copied ? 'rgba(95,210,150,0.18)' : 'var(--rose-dim)',
              border: copied ? '1px solid rgba(95,210,150,0.4)' : '1px solid var(--border-rose)',
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
            {copied && <SparkleBurst count={8} radius={26} color="var(--splash-green)" />}
          </span>
        </motion.button>

        <button
          onClick={shareToTelegram}
          className="no-tap-highlight flex w-full items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.98]"
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
          {tt({ ru: 'Поделиться в Telegram', en: 'Share on Telegram', de: 'Auf Telegram teilen' })}
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  )
}
