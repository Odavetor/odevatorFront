'use client'

import { Lightning, Sparkle } from '@phosphor-icons/react'
import { PremiumButton } from '@shared/ui'
import { ConsentGate } from '@features/consent-gate'
import { DisclaimerToggle } from '@widgets/disclaimer-toggle'
import { useContent } from '@entities/content'

interface Props {
  consent: boolean[]
  onConsentChange: (i: number, v: boolean) => void
  disclaimerText: string
  canRun: boolean
  busy: boolean
  cost: number
  onRun: () => void
  hasFile: boolean
}

export function StickyDock({
  consent,
  onConsentChange,
  disclaimerText,
  canRun,
  busy,
  cost,
  onRun,
  hasFile,
}: Props) {
  const allConsented = consent.every(Boolean)
  const buttonRunAi = useContent('button.run_ai')
  const buttonProcessing = useContent('button.processing')
  const hintNoFile = useContent('generate.hint.no_file')
  const hintNoConsent = useContent('generate.hint.no_consent')

  return (
    <div
      className="flex flex-col gap-3 px-5 pb-2 pt-4"
      style={{
        marginBottom: 'calc(max(env(safe-area-inset-bottom), 8px) + 78px)',
      }}
    >
      <DisclaimerToggle text={disclaimerText} />

      <div
        className="rounded-2xl px-3 py-2.5"
        style={{
          background: 'rgba(31,25,41,0.5)',
          border: '1px solid var(--border-1)',
        }}
      >
        <ConsentGate checked={consent} onChange={onConsentChange} />
      </div>

      <PremiumButton
        tone="rose"
        size="lg"
        glow={canRun}
        disabled={!canRun}
        onClick={onRun}
        leading={<Sparkle size={16} weight="fill" />}
        trailing={
          canRun ? (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <Lightning size={11} weight="fill" color="#fff" />
              <span className="font-sans text-xs tabular-nums">{cost}</span>
            </span>
          ) : null
        }
      >
        {busy ? buttonProcessing : buttonRunAi}
      </PremiumButton>

      {!hasFile && (
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {hintNoFile}
        </p>
      )}
      {hasFile && !allConsented && (
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {hintNoConsent}
        </p>
      )}
    </div>
  )
}
