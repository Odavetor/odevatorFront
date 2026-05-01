'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lightning, Sparkle, VideoCamera } from '@phosphor-icons/react'
import { getUser, haptic, hapticNotify } from '@/lib/telegram'
import PhotoUpload from '@/components/PhotoUpload'
import GenerationStatus from '@/components/GenerationStatus'
import FilterRow from '@/components/FilterRow'
import BeforeAfterPreview from '@/components/BeforeAfterPreview'
import ConsentGate from '@/components/ConsentGate'
import VideoScenarioGrid from '@/components/VideoScenarioGrid'
import VideoGenerateModal from '@/components/VideoGenerateModal'
import CurrencyPill from '@/components/CurrencyPill'
import BottomNav from '@/components/BottomNav'
import type { GenerationState } from '@/types'
import type { FilterOption, VideoDuration } from '@/data/generate-options'
import { PHOTO_FILTER_CATEGORIES, VIDEO_SCENARIOS, VIDEO_SLOT_COST } from '@/data/generate-options'

type Mode = 'Фото' | 'Видео'

export default function GeneratePage() {
  const router = useRouter()

  // Upload
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [genState, setGenState] = useState<GenerationState>({ phase: 'idle', progress: 0 })
  const [noCredits, setNoCredits] = useState(false)

  // Mode
  const [mode, setMode] = useState<Mode>('Фото')

  // Photo: активная категория + выбранный вариант
  const [activeCategoryId, setActiveCategoryId] = useState<string>(PHOTO_FILTER_CATEGORIES[0].id)
  const [selectedOption, setSelectedOption] = useState<FilterOption | null>(null)

  // Video
  const [scenario, setScenario] = useState<string | null>(null)
  const [duration, setDuration] = useState<VideoDuration>(5)
  const [modalScenarioId, setModalScenarioId] = useState<string | null>(null)
  const modalScenario = VIDEO_SCENARIOS.find((s) => s.id === modalScenarioId) ?? null

  // Consent
  const [consent, setConsent] = useState([false, false, false])
  const allConsented = consent.every(Boolean)

  const photoCost = 1
  const videoCost = VIDEO_SLOT_COST[duration]
  const currentCost = mode === 'Фото' ? photoCost : videoCost

  const activeCategory = PHOTO_FILTER_CATEGORIES.find((c) => c.id === activeCategoryId)!

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setGenState({ phase: 'idle', progress: 0 })
  }, [])

  const handleClear = useCallback(() => {
    setFile(null)
    setPreview(null)
    setGenState({ phase: 'idle', progress: 0 })
  }, [])

  function handleCategoryChange(id: string) {
    haptic('light')
    setActiveCategoryId(id)
    setSelectedOption(null) // сбрасываем выбор при смене категории
  }

  function handleOptionSelect(opt: FilterOption) {
    // toggle: повторный тап снимает выбор
    const toggled = selectedOption?.id === opt.id ? null : opt
    setSelectedOption(toggled)
    haptic('light')
  }

  function handleConsentChange(index: number, val: boolean) {
    setConsent((prev) => prev.map((c, i) => (i === index ? val : c)))
  }

  async function generate() {
    if (!file) return
    const user = getUser()
    if (!user) return

    haptic('medium')
    setGenState({ phase: 'uploading', progress: 15 })

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('userId', String(user.id))
      formData.append('username', user.username ?? user.first_name ?? '')
      formData.append('mode', mode === 'Фото' ? 'photo' : 'video')

      if (mode === 'Фото') {
        formData.append('filter_category', activeCategoryId)
        formData.append('filter_option', selectedOption?.id ?? '')
      } else {
        formData.append('scenario', scenario ?? '')
        formData.append('duration', String(duration))
      }

      setGenState({ phase: 'processing', progress: 50 })

      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.status === 402) {
        setNoCredits(true)
        setGenState({ phase: 'idle', progress: 0 })
        hapticNotify('warning')
        return
      }

      if (!res.ok || !data.url) {
        setGenState({ phase: 'error', progress: 0, error: data.error ?? 'Ошибка обработки' })
        return
      }

      setGenState({ phase: 'done', progress: 100, resultUrl: data.url })
    } catch {
      setGenState({ phase: 'error', progress: 0, error: 'Сетевая ошибка. Попробуйте ещё раз.' })
    }
  }

  async function generateVideo(videoFile: File, dur: VideoDuration) {
    const user = getUser()
    if (!user) return

    setModalScenarioId(null)
    haptic('medium')
    setGenState({ phase: 'uploading', progress: 15 })

    try {
      const formData = new FormData()
      formData.append('image', videoFile)
      formData.append('userId', String(user.id))
      formData.append('username', user.username ?? user.first_name ?? '')
      formData.append('mode', 'video')
      formData.append('scenario', scenario ?? '')
      formData.append('duration', String(dur))

      setGenState({ phase: 'processing', progress: 50 })

      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.status === 402) {
        setNoCredits(true)
        setGenState({ phase: 'idle', progress: 0 })
        hapticNotify('warning')
        return
      }

      if (!res.ok || !data.url) {
        setGenState({ phase: 'error', progress: 0, error: data.error ?? 'Ошибка обработки' })
        return
      }

      setGenState({ phase: 'done', progress: 100, resultUrl: data.url })
    } catch {
      setGenState({ phase: 'error', progress: 0, error: 'Сетевая ошибка. Попробуйте ещё раз.' })
    }
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

  const busy = genState.phase === 'uploading' || genState.phase === 'processing'
  const canGenerate = !!file && allConsented && !busy && genState.phase !== 'done'

  return (
    <div className="flex flex-col min-h-[100dvh]">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => { haptic(); router.back() }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.6)" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Создать</h1>
            <p className="text-gr-2xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              ИИ обрабатывает за 30–60 сек
            </p>
          </div>
        </div>
        <CurrencyPill />
      </motion.header>

      <div className="flex-1 flex flex-col gap-4 px-5 pb-6">

        {/* Режим: Фото / Видео */}
        <div
          className="flex p-1 rounded-full self-start"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {(['Фото', 'Видео'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                haptic('light')
                setMode(m)
                setSelectedOption(null)
              }}
              className="relative px-5 py-1.5 text-sm font-medium rounded-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {mode === m && (
                <motion.div
                  layoutId="mode-tab"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className="relative z-10"
                style={{ color: mode === m ? '#FFFFFF' : 'rgba(255,255,255,0.38)' }}
              >
                {m}
              </span>
            </button>
          ))}
        </div>

        {/* No credits warning */}
        <AnimatePresence>
          {noCredits && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl p-4 flex items-center justify-between gap-3"
              style={{ background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.22)' }}
            >
              <p className="text-red-300 text-sm">Нет доступных слотов</p>
              <button
                onClick={() => router.push('/shop')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'var(--rose-dim)', color: 'var(--rose)' }}
              >
                Купить
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo upload — photo mode only */}
        {mode === 'Фото' && (genState.phase === 'idle' || genState.phase === 'error') && (
          <PhotoUpload
            onFile={handleFile}
            preview={preview}
            onClear={handleClear}
            compact={!!file}
          />
        )}

        {/* Generation status / result */}
        {genState.phase !== 'idle' && (
          <GenerationStatus
            state={genState}
            onDownload={handleDownload}
            onRetry={() => setGenState({ phase: 'idle', progress: 0 })}
          />
        )}

        {/* After done */}
        {genState.phase === 'done' && (
          <button
            onClick={() => {
              haptic()
              setFile(null)
              setPreview(null)
              setGenState({ phase: 'idle', progress: 0 })
            }}
            className="w-full py-3.5 rounded-2xl text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Новая обработка
          </button>
        )}

        {/* Filters — shown when idle */}
        {(genState.phase === 'idle' || genState.phase === 'error') && (
          <AnimatePresence mode="wait">
            {mode === 'Фото' ? (
              <motion.div
                key="photo-mode"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                {/* Category pills — bleed за px-5 чтобы не обрезались */}
                <div
                  className="flex gap-2 overflow-x-auto"
                  style={{
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    marginLeft: -20,
                    marginRight: -20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  {PHOTO_FILTER_CATEGORIES.map((cat) => {
                    const active = cat.id === activeCategoryId
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className="flex-shrink-0 rounded-full text-sm font-medium"
                        style={{
                          padding: '7px 14px',
                          background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                          boxShadow: active
                            ? 'inset 0 0 0 1.5px var(--rose)'
                            : 'inset 0 0 0 1px var(--border-2)',
                          color: active ? 'var(--rose)' : 'rgba(255,255,255,0.55)',
                          transition: 'all 0.18s ease',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>

                {/* Options for active category */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategoryId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FilterRow
                      category={activeCategory}
                      selected={selectedOption?.id ?? null}
                      onSelect={handleOptionSelect}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Before/After preview */}
                <AnimatePresence>
                  {selectedOption && (
                    <BeforeAfterPreview
                      key={selectedOption.id}
                      beforeUrl={selectedOption.beforeExample}
                      afterUrl={selectedOption.afterExample}
                      label={selectedOption.label}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="video-mode"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <VideoScenarioGrid
                  scenarios={VIDEO_SCENARIOS}
                  onSelectScenario={(id) => {
                    setScenario(id)
                    setModalScenarioId(id)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Consent + generate — photo mode only */}
        {mode === 'Фото' && (genState.phase === 'idle' || genState.phase === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <ConsentGate checked={consent} onChange={handleConsentChange} />

            <motion.button
              onClick={generate}
              disabled={!canGenerate}
              whileTap={canGenerate ? { scale: 0.97 } : {}}
              className="relative w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-base overflow-hidden"
              style={{
                background: canGenerate
                  ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
                  : 'rgba(255,255,255,0.04)',
                boxShadow: canGenerate
                  ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 0 rgba(0,0,0,0.4)'
                  : 'none',
                border: canGenerate ? 'none' : '1px solid var(--border-1)',
                color: canGenerate ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.25s ease',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {canGenerate && (
                <div
                  className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                />
              )}

              {mode === 'Фото' ? (
                <Sparkle size={18} weight="fill" />
              ) : (
                <VideoCamera size={18} weight="fill" />
              )}

              <span>{busy ? 'Обработка…' : 'Запустить ИИ'}</span>

              {canGenerate && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <Lightning size={11} weight="fill" color="#FFB800" />
                  <span className="font-mono text-xs">{currentCost}</span>
                </div>
              )}
            </motion.button>

            {!file && (
              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Загрузите фото чтобы начать
              </p>
            )}
            {file && !allConsented && (
              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Подтвердите все пункты выше
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Video generate modal */}
      <AnimatePresence>
        {modalScenario && (
          <VideoGenerateModal
            scenario={modalScenario}
            onClose={() => setModalScenarioId(null)}
            onStart={(f, dur) => {
              setDuration(dur)
              generateVideo(f, dur)
            }}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
