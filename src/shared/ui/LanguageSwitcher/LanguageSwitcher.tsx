'use client'

import { SUPPORTED_LANGS, useLang, setLangPersisted, type Lang } from '@shared/lib'

const LABELS: Record<Lang, string> = { ru: 'RU', en: 'EN', de: 'DE' }

export function LanguageSwitcher() {
  const lang = useLang()
  return (
    <div
      className="inline-flex rounded-full p-1"
      style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 0 1px var(--border-2)' }}
    >
      {SUPPORTED_LANGS.map((l) => {
        const active = l === lang
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLangPersisted(l)}
            className="no-tap-highlight rounded-full font-sans"
            style={{
              padding: '5px 13px',
              fontSize: 12,
              fontWeight: active ? 700 : 600,
              letterSpacing: '0.02em',
              color: active ? 'var(--rose)' : 'rgba(255,255,255,0.6)',
              background: active ? 'var(--rose-dim)' : 'transparent',
              boxShadow: active ? 'inset 0 0 0 1.5px var(--rose)' : 'none',
              transition: 'all 0.18s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {LABELS[l]}
          </button>
        )
      })}
    </div>
  )
}
