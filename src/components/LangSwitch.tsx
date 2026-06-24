'use client'

import { Translate } from '@phosphor-icons/react'
import { SUPPORTED_LANGS, setLangPersisted, useLang } from '@shared/lib'
import { haptic } from '@/lib/telegram'

export default function LangSwitch() {
  const lang = useLang()
  const idx = SUPPORTED_LANGS.indexOf(lang)
  const next = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length]

  return (
    <button
      type="button"
      aria-label="Language"
      onClick={() => {
        haptic('light')
        setLangPersisted(next)
      }}
      className="no-tap-highlight flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3"
      style={{
        background: 'rgba(18,18,24,0.62)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      }}
    >
      <Translate size={14} weight="bold" color="rgba(255,255,255,0.75)" />
      <span
        className="font-sans"
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.95)',
        }}
      >
        {lang.toUpperCase()}
      </span>
    </button>
  )
}
