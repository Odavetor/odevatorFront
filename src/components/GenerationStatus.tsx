'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, WarningCircle, DownloadSimple } from '@phosphor-icons/react'
import type { GenerationState } from '@/types'
import { hapticNotify } from '@/lib/telegram'
import { useEffect } from 'react'

const PHASES = [
  { key: 'uploading', label: 'Загружаю фото…', pct: 20 },
  { key: 'processing', label: 'ИИ обрабатывает…', pct: 65 },
  { key: 'done', label: 'Готово', pct: 100 },
]

interface Props {
  state: GenerationState
  onDownload?: () => void
  onRetry?: () => void
}

export default function GenerationStatus({ state, onDownload, onRetry }: Props) {
  useEffect(() => {
    if (state.phase === 'done') hapticNotify('success')
    if (state.phase === 'error') hapticNotify('error')
  }, [state.phase])

  if (state.phase === 'idle') return null

  return (
    <AnimatePresence>
      <motion.div
        key={state.phase}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {state.phase === 'error' ? (
          <div
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(220,80,80,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <WarningCircle size={22} color="#e07070" weight="fill" />
              <p className="text-red-300 text-sm font-medium">
                {state.error ?? 'Ошибка обработки. Слот возвращён.'}
              </p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(220,80,80,0.15)', color: '#e07070' }}
              >
                Попробовать снова
              </button>
            )}
          </div>
        ) : state.phase === 'done' && state.resultUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="relative w-full rounded-3xl overflow-hidden" style={{ aspectRatio: '1 / 1.618' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.resultUrl} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(13,11,16,0.7) 0%, transparent 55%)' }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                <CheckCircle size={18} color="#e03f6a" weight="fill" />
                <span className="text-cream-200 text-sm font-medium">Готово</span>
              </div>
            </div>

            <button
              onClick={onDownload}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-medium text-base active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(224,63,106,0.18) 0%, rgba(224,63,106,0.08) 100%)',
                border: '1px solid rgba(224,63,106,0.28)',
                color: '#e03f6a',
                transition: 'transform 0.15s ease',
              }}
            >
              <DownloadSimple size={18} weight="bold" />
              Сохранить
            </button>
          </motion.div>
        ) : (
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'rgba(31,25,41,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-cream-200 text-sm font-medium">
                {PHASES.find((p) => p.key === state.phase)?.label ?? 'Обработка…'}
              </p>
              <span className="text-rose-400 font-mono text-xs">{state.progress}%</span>
            </div>

            <div className="relative h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, #e03f6a, #c9294a)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Shimmer on progress bar */}
              <motion.div
                className="absolute inset-y-0 w-16 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                animate={{ left: [`${state.progress - 20}%`, `${state.progress}%`] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Pulsing dots */}
            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#e03f6a' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
