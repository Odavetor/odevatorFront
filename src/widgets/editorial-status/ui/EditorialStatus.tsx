'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, DownloadSimple, WarningCircle } from '@phosphor-icons/react'
import { hapticNotify } from '@/lib/telegram'
import { SparkleBurst } from '@shared/ui'
import { EASE_EDITORIAL, tt, useLang } from '@shared/lib'
import type { GenerationState } from '@/types'

function phaseLabels(): Record<string, { title: string; sub: string }> {
  return {
    uploading: {
      title: tt({ ru: 'Загружаем', en: 'Uploading', de: 'Hochladen' }),
      sub: tt({
        ru: 'отправляем фото на сервер',
        en: 'sending your photo to the server',
        de: 'Foto wird an den Server gesendet',
      }),
    },
    processing: {
      title: tt({ ru: 'Обрабатываем', en: 'Processing', de: 'Verarbeitung' }),
      sub: tt({
        ru: 'нейросеть работает над кадром',
        en: 'the neural network is working on your shot',
        de: 'das neuronale Netz bearbeitet die Aufnahme',
      }),
    },
    done: {
      title: tt({ ru: 'Готово', en: 'Done', de: 'Fertig' }),
      sub: tt({ ru: 'забирай результат', en: 'grab your result', de: 'Ergebnis abholen' }),
    },
  }
}

interface Props {
  state: GenerationState
  onDownload?: () => void
  onRetry?: () => void
}

export function EditorialStatus({ state, onDownload, onRetry }: Props) {
  useEffect(() => {
    if (state.phase === 'done') hapticNotify('success')
    if (state.phase === 'error') hapticNotify('error')
  }, [state.phase])

  if (state.phase === 'idle') return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.phase}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
        className="w-full"
      >
        {state.phase === 'error' ? <ErrorState message={state.error} onRetry={onRetry} /> : null}
        {state.phase === 'done' && state.resultUrl ? (
          <DoneState resultUrl={state.resultUrl} onDownload={onDownload} />
        ) : null}
        {(state.phase === 'uploading' || state.phase === 'processing') && (
          <BusyState phase={state.phase} progress={state.progress} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

function BusyState({ phase, progress }: { phase: 'uploading' | 'processing'; progress: number }) {
  useLang()
  const meta = phaseLabels()[phase]
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(8, Math.min(100, progress)) / 100) * circumference

  return (
    <div
      className="relative flex flex-col items-center gap-4 rounded-3xl px-5 py-8"
      style={{
        background: 'linear-gradient(180deg, rgba(31,25,41,0.85) 0%, rgba(13,11,16,0.92) 100%)',
        border: '1px solid var(--border-1)',
        boxShadow: 'var(--shadow-premium)',
      }}
    >
      <div className="relative" style={{ width: radius * 2 + 16, height: radius * 2 + 16 }}>
        <svg
          width={radius * 2 + 16}
          height={radius * 2 + 16}
          viewBox={`0 0 ${radius * 2 + 16} ${radius * 2 + 16}`}
          className="block"
        >
          <circle
            cx={radius + 8}
            cy={radius + 8}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={3}
            fill="none"
          />
          <motion.circle
            cx={radius + 8}
            cy={radius + 8}
            r={radius}
            stroke="var(--rose)"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              strokeDasharray: circumference,
              transform: `rotate(-90deg)`,
              transformOrigin: `${radius + 8}px ${radius + 8}px`,
              filter: 'drop-shadow(0 0 6px rgba(224,63,106,0.55))',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-sans tabular-nums"
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.028em',
              color: 'var(--text)',
              lineHeight: 1,
            }}
          >
            {progress}
            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
              %
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-center">
        <p
          className="font-sans"
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.018em',
            color: 'var(--text)',
          }}
        >
          {meta.title}
        </p>
        <p
          className="font-sans"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          {meta.sub}
        </p>
      </div>

      <p
        className="font-sans"
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        {tt({
          ru: 'обычно 20–40 секунд',
          en: 'usually 20–40 seconds',
          de: 'meist 20–40 Sekunden',
        })}
      </p>
    </div>
  )
}

function DoneState({ resultUrl, onDownload }: { resultUrl: string; onDownload?: () => void }) {
  useLang()
  const [showSparkles, setShowSparkles] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShowSparkles(true), 1050)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      className="flex flex-col gap-4"
    >
      <div
        className="relative w-full overflow-hidden rounded-3xl"
        style={{
          aspectRatio: '1 / 1.272',
          border: '1px solid var(--border-2)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 60px -12px rgba(224,63,106,0.32)',
        }}
      >
        <motion.div
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="absolute inset-0"
        >
          <Image
            src={resultUrl}
            alt=""
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(13,11,16,0.78) 0%, transparent 55%)',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ top: '-12%', opacity: 0 }}
          animate={{ top: ['-12%', '105%'], opacity: [0, 1, 1, 0] }}
          transition={{
            top: { duration: 0.95, ease: 'linear', delay: 0.18 },
            opacity: {
              duration: 0.95,
              times: [0, 0.15, 0.82, 1],
              delay: 0.18,
            },
          }}
          className="pointer-events-none absolute left-0 right-0"
          style={{
            height: 44,
            background:
              'linear-gradient(180deg, transparent 0%, rgba(224,63,106,0.55) 50%, transparent 100%)',
            filter: 'blur(4px)',
            zIndex: 5,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: EASE_EDITORIAL, delay: 1.0 }}
          className="absolute bottom-4 left-4 right-4 flex items-center gap-2"
          style={{ zIndex: 10 }}
        >
          <CheckCircle size={18} color="var(--rose)" weight="fill" />
          <span
            className="font-sans"
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}
          >
            {tt({ ru: 'готово', en: 'done', de: 'fertig' })}
          </span>
        </motion.div>

        {showSparkles && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ width: 0, height: 0, zIndex: 8 }}
          >
            <SparkleBurst count={14} radius={120} color="#fff" />
          </span>
        )}
      </div>

      <button
        onClick={onDownload}
        className="no-tap-highlight flex w-full items-center justify-center gap-2 rounded-2xl py-4 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
          boxShadow: 'var(--shadow-neon-cta)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          transition: 'transform 0.15s var(--ease-glide)',
        }}
      >
        <DownloadSimple size={18} weight="bold" />
        {tt({ ru: 'Сохранить', en: 'Save', de: 'Speichern' })}
      </button>
    </motion.div>
  )
}

function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  useLang()
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl p-5"
      style={{
        background: 'rgba(180,40,40,0.12)',
        border: '1px solid rgba(220,80,80,0.2)',
      }}
    >
      <div className="flex items-center gap-3">
        <WarningCircle size={22} color="#e07070" weight="fill" />
        <p className="font-sans" style={{ fontSize: 14, fontWeight: 600, color: '#e07070' }}>
          {message ??
            tt({
              ru: 'Ошибка обработки. Слот возвращён.',
              en: 'Processing error. Slot refunded.',
              de: 'Verarbeitungsfehler. Slot zurückerstattet.',
            })}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="no-tap-highlight w-full rounded-xl py-2.5"
          style={{
            background: 'rgba(220,80,80,0.15)',
            color: '#e07070',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {tt({ ru: 'Попробовать снова', en: 'Try again', de: 'Erneut versuchen' })}
        </button>
      )}
    </div>
  )
}
