import { Lightning } from '@phosphor-icons/react'
import { tt, useLang } from '@shared/lib'

export function EmptyState() {
  useLang()
  return (
    <div
      className="flex flex-col items-center rounded-3xl px-6 py-10 text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-1)',
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'var(--rose-dim)',
          border: '1px solid var(--border-rose)',
        }}
      >
        <Lightning size={24} weight="duotone" color="var(--rose)" />
      </div>
      <h3
        className="mb-2 font-sans"
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
        }}
      >
        {tt({ ru: 'Пока тихо', en: 'All quiet for now', de: 'Noch ist alles ruhig' })}
      </h3>
      <p
        className="max-w-[26ch] font-sans"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.4,
        }}
      >
        {tt({
          ru: 'Здесь появятся все движения слотов и денег',
          en: 'All slot and money movements will show up here',
          de: 'Hier erscheinen alle Slot- und Geldbewegungen',
        })}
      </p>
    </div>
  )
}
