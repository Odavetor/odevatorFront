'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePhotoGenerate } from '@features/photo-generate'
import { EditorialStatus } from '@widgets/editorial-status'
import { PremiumButton } from '@shared/ui'
import { useContent } from '@entities/content'
import { haptic } from '@shared/lib'
import { BottomNav } from '@widgets/bottom-nav'
import { GenerateHeader } from './GenerateHeader'
import { NoCreditsAlert } from './NoCreditsAlert'
import { PhotoStage } from './PhotoStage'
import { StickyDock } from './StickyDock'

const PHOTO_COST = 1

export function GenerateView() {
  const photo = usePhotoGenerate()
  const [consent, setConsent] = useState<boolean[]>([false, false, false])

  const titleGenerate = useContent('page.title.generate')
  const subtitleText = useContent('generate.subtitle')
  const disclaimerText = useContent('generate.disclaimer').trim()
  const errorTimeout = useContent('error.timeout')
  const errorGenerationFailed = useContent('error.generation_failed')
  const buttonNewRun = useContent('button.new_run')

  const genState = photo.genState
  const busy = photo.busy
  const isIdleOrError = genState.phase === 'idle' || genState.phase === 'error'

  const allConsented = consent.every(Boolean)
  const canRunPhoto = photo.canGenerate(allConsented)

  function handleConsentChange(i: number, v: boolean) {
    setConsent((prev) => prev.map((c, idx) => (idx === i ? v : c)))
  }

  async function handleRunPhoto() {
    await photo.generate(errorTimeout, errorGenerationFailed)
  }

  function handleDownload() {
    if (!genState.resultUrl) return
    haptic()
    const a = document.createElement('a')
    a.href = genState.resultUrl
    a.download = `velvet-${Date.now()}.jpg`
    a.target = '_blank'
    a.click()
  }

  function resetActive() {
    photo.clearFile()
    photo.resetGenState()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <GenerateHeader title={titleGenerate} subtitle={subtitleText} />

      <div className="flex flex-1 flex-col gap-4 px-5 pb-2">
        <AnimatePresence>
          <NoCreditsAlert open={photo.noCredits} />
        </AnimatePresence>

        {genState.phase !== 'idle' && (
          <EditorialStatus
            state={genState}
            onDownload={handleDownload}
            onRetry={photo.resetGenState}
          />
        )}

        {genState.phase === 'done' && (
          <PremiumButton tone="ghost" size="md" onClick={resetActive}>
            {buttonNewRun}
          </PremiumButton>
        )}

        {isIdleOrError && <PhotoStage photo={photo} />}
      </div>

      {isIdleOrError && (
        <StickyDock
          consent={consent}
          onConsentChange={handleConsentChange}
          disclaimerText={disclaimerText}
          canRun={canRunPhoto}
          busy={busy}
          cost={PHOTO_COST}
          onRun={handleRunPhoto}
          hasFile={!!photo.file}
        />
      )}

      <BottomNav />
    </div>
  )
}
