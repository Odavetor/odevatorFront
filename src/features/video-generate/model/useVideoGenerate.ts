'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchVideoCatalog,
  VIDEO_SCENARIOS,
  type VideoDuration,
  type VideoScenario,
} from '@entities/catalog'
import {
  pollGeneration,
  startVideoGeneration,
  uploadUserPhoto,
  type GenerationState,
} from '@entities/generation'
import { ApiError } from '@shared/api'
import { useUser } from '@entities/user'
import { haptic, hapticNotify } from '@shared/lib'

export interface UseVideoGenerateResult {
  scenarios: VideoScenario[]
  scenarioId: string | null
  setScenarioId: (id: string | null) => void
  duration: VideoDuration
  setDuration: (d: VideoDuration) => void
  modalScenarioId: string | null
  setModalScenarioId: (id: string | null) => void
  modalScenario: VideoScenario | null

  genState: GenerationState
  noCredits: boolean
  resetNoCredits: () => void
  resetGenState: () => void

  busy: boolean
  generate: (file: File, dur: VideoDuration, errorTimeout: string, errorFallback: string) => Promise<void>
}

export function useVideoGenerate(): UseVideoGenerateResult {
  const { refreshBalance } = useUser()

  const [scenarios, setScenarios] = useState<VideoScenario[]>(VIDEO_SCENARIOS)
  const [scenarioId, setScenarioId] = useState<string | null>(null)
  const [duration, setDuration] = useState<VideoDuration>(5)
  const [modalScenarioId, setModalScenarioId] = useState<string | null>(null)
  const [genState, setGenState] = useState<GenerationState>({ phase: 'idle', progress: 0 })
  const [noCredits, setNoCredits] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchVideoCatalog()
      .then((d) => {
        if (cancelled || !d.scenarios?.length) return
        setScenarios(d.scenarios)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const modalScenario = scenarios.find((s) => s.id === modalScenarioId) ?? null

  const pollUntilDone = useCallback(async (uid: string): Promise<string | null> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await pollGeneration(uid, { wait: true, maxWaitSeconds: 120 })
      if (res.status === 'completed' && res.results?.[0]) return res.results[0]
      if (res.status === 'failed') throw new Error(res.error_message ?? 'Обработка не удалась')
    }
    return null
  }, [])

  const generate = useCallback(
    async (file: File, _dur: VideoDuration, errorTimeout: string, errorFallback: string) => {
      if (!scenarioId) return
      void _dur

      setModalScenarioId(null)
      haptic('medium')
      setGenState({ phase: 'uploading', progress: 10 })

      try {
        const { url: fileUrl } = await uploadUserPhoto(file)
        setGenState({ phase: 'uploading', progress: 35 })

        const { uid } = await startVideoGeneration({
          file_url: fileUrl,
          scenario: scenarioId,
        })

        setGenState({ phase: 'processing', progress: 60 })

        const resultUrl = await pollUntilDone(uid)
        if (!resultUrl) {
          setGenState({ phase: 'error', progress: 0, error: errorTimeout })
          return
        }
        setGenState({ phase: 'done', progress: 100, resultUrl })
        void refreshBalance()
      } catch (e) {
        if (e instanceof ApiError && e.status === 402) {
          setNoCredits(true)
          setGenState({ phase: 'idle', progress: 0 })
          hapticNotify('warning')
          return
        }
        const msg = e instanceof Error ? e.message : errorFallback
        setGenState({ phase: 'error', progress: 0, error: msg })
      }
    },
    [scenarioId, pollUntilDone, refreshBalance],
  )

  const busy = genState.phase === 'uploading' || genState.phase === 'processing'

  return {
    scenarios,
    scenarioId,
    setScenarioId,
    duration,
    setDuration,
    modalScenarioId,
    setModalScenarioId,
    modalScenario,
    genState,
    noCredits,
    resetNoCredits: useCallback(() => setNoCredits(false), []),
    resetGenState: useCallback(() => setGenState({ phase: 'idle', progress: 0 }), []),
    busy,
    generate,
  }
}
