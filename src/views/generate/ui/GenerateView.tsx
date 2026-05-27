'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePhotoGenerate } from '@features/photo-generate'
import { useVideoGenerate } from '@features/video-generate'
import { ModeSwitch, type GenerateMode } from '@widgets/mode-switch'
import { EditorialStatus } from '@widgets/editorial-status'
import { PremiumButton } from '@shared/ui'
import { EASE_GLIDE } from '@shared/lib'
import { useContent } from '@entities/content'
import { haptic } from '@shared/lib'
import { BottomNav } from '@widgets/bottom-nav'
import { VideoScenarioGrid } from '@widgets/video-scenarios'
import { VideoGenerateModal } from '@features/video-generate'
import { VIDEO_SLOT_COST } from '@entities/catalog'
import { GenerateHeader } from './GenerateHeader'
import { NoCreditsAlert } from './NoCreditsAlert'
import { PhotoStage } from './PhotoStage'
import { StickyDock } from './StickyDock'

const PHOTO_COST = 1

export function GenerateView() {
  const photo = usePhotoGenerate()
  const video = useVideoGenerate()
  const [mode, setMode] = useState<GenerateMode>('photo')
  const [consent, setConsent] = useState<boolean[]>([false, false, false])

  const titleGenerate = useContent('page.title.generate')
  const subtitleText = useContent('generate.subtitle')
  const disclaimerText = useContent('generate.disclaimer').trim()
  const errorTimeout = useContent('error.timeout')
  const errorGenerationFailed = useContent('error.generation_failed')
  const buttonNewRun = useContent('button.new_run')

  const activeFeature = mode === 'photo' ? photo : video
  const genState = activeFeature.genState
  const busy = activeFeature.busy
  const isIdleOrError = genState.phase === 'idle' || genState.phase === 'error'

  const allConsented = consent.every(Boolean)
  const cost = mode === 'photo' ? PHOTO_COST : VIDEO_SLOT_COST[video.duration]
  const canRunPhoto = photo.canGenerate(allConsented)

  function handleModeChange(next: GenerateMode) {
    setMode(next)
  }

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
    if (mode === 'photo') {
      photo.clearFile()
      photo.resetGenState()
    } else {
      video.resetGenState()
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <GenerateHeader title={titleGenerate} subtitle={subtitleText} />

      <div className="flex-1 flex flex-col gap-4 px-5 pb-2">
        <ModeSwitch mode={mode} onChange={handleModeChange} />

        <AnimatePresence>
          <NoCreditsAlert open={photo.noCredits || video.noCredits} />
        </AnimatePresence>

        {genState.phase !== 'idle' && (
          <EditorialStatus
            state={genState}
            onDownload={handleDownload}
            onRetry={activeFeature.resetGenState}
          />
        )}

        {genState.phase === 'done' && (
          <PremiumButton tone="ghost" size="md" onClick={resetActive}>
            {buttonNewRun}
          </PremiumButton>
        )}

        {isIdleOrError && (
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'photo' ? (
              <motion.div
                key="photo-mode"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: EASE_GLIDE }}
              >
                <PhotoStage photo={photo} />
              </motion.div>
            ) : (
              <motion.div
                key="video-mode"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: EASE_GLIDE }}
              >
                <VideoScenarioGrid
                  scenarios={video.scenarios}
                  onSelectScenario={(id) => {
                    video.setScenarioId(id)
                    video.setModalScenarioId(id)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {mode === 'photo' && isIdleOrError && (
        <StickyDock
          mode="photo"
          consent={consent}
          onConsentChange={handleConsentChange}
          disclaimerText={disclaimerText}
          canRun={canRunPhoto}
          busy={busy}
          cost={cost}
          onRun={handleRunPhoto}
          hasFile={!!photo.file}
        />
      )}

      <AnimatePresence>
        {video.modalScenario && (
          <VideoGenerateModal
            scenario={video.modalScenario}
            onClose={() => video.setModalScenarioId(null)}
            onStart={(f, dur) => {
              video.setDuration(dur)
              void video.generate(f, dur, errorTimeout, errorGenerationFailed)
            }}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
