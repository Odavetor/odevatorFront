'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Camera,
  UploadSimple,
  Check,
  MagicWand,
  Lightning,
} from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import type { VideoScenario, VideoDuration } from '@/data/generate-options'
import { VIDEO_DURATIONS, VIDEO_SLOT_COST } from '@/data/generate-options'

const CONSENT_ITEMS = [
  'Мне исполнилось 18 лет',
  'Я принимаю условия использования сервиса',
  'Я являюсь правообладателем загружаемых материалов и получил согласие изображённых лиц',
]

interface Props {
  scenario: VideoScenario
  onClose: () => void
  onStart: (file: File, duration: VideoDuration) => void
}

export default function VideoGenerateModal({ scenario, onClose, onStart }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [consent, setConsent] = useState([false, false, false])
  const [duration, setDuration] = useState<VideoDuration>(scenario.durationSec as VideoDuration)

  const allConsented = consent.every(Boolean)
  const cost = VIDEO_SLOT_COST[duration]
  const canStart = !!file && allConsented

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    haptic('medium')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleStart() {
    if (!file || !allConsented) return
    haptic('medium')
    onStart(file, duration)
  }

  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptic()
          onClose()
        }
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full max-w-[430px] rounded-t-[2rem] overflow-hidden flex flex-col"
        style={{
          background: '#111116',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: '92dvh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="px-5 pb-8 flex flex-col gap-5" style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 1.5rem))' }}>

            {/* Header */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                >
                  Сценарий
                </p>
                <h2 className="text-white font-semibold text-lg leading-tight mt-0.5">
                  {scenario.label}
                </h2>
              </div>
              <button
                onClick={() => {
                  haptic()
                  onClose()
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <X size={15} color="rgba(255,255,255,0.5)" weight="bold" />
              </button>
            </div>

            {/* Upload zone */}
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full rounded-2xl overflow-hidden"
                    style={{ aspectRatio: '4/3' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        haptic()
                        setFile(null)
                        setPreview(null)
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(13,13,15,0.72)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <X size={14} color="rgba(255,255,255,0.8)" weight="bold" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="dropzone"
                    animate={{ scale: dragging ? 1.015 : 1 }}
                    onClick={() => {
                      haptic()
                      inputRef.current?.click()
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className="relative w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-11 cursor-pointer"
                    style={{
                      border: `1px dashed ${dragging ? 'rgba(224,63,106,0.65)' : 'rgba(224,63,106,0.25)'}`,
                      background: dragging ? 'rgba(224,63,106,0.07)' : 'rgba(255,255,255,0.025)',
                      transition: 'border-color 0.22s ease, background 0.22s ease',
                    }}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(224,63,106,0.1)',
                        border: '1px solid rgba(224,63,106,0.18)',
                      }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Camera size={24} color="#e03f6a" weight="duotone" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">Загрузить фото</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        Нажмите или перетащите
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{
                        background: 'rgba(224,63,106,0.08)',
                        border: '1px solid rgba(224,63,106,0.14)',
                      }}
                    >
                      <UploadSimple size={12} color="#e03f6a" />
                      <span className="text-xs font-medium" style={{ color: '#e03f6a' }}>
                        JPG · PNG · WEBP
                      </span>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Duration selector */}
            <div className="flex flex-col gap-2.5">
              <p
                className="text-xs font-medium uppercase tracking-[0.1em]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Длительность
              </p>
              <div className="flex gap-2">
                {VIDEO_DURATIONS.map((d) => {
                  const active = duration === d
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        haptic('light')
                        setDuration(d)
                      }}
                      className="flex-1 py-2 rounded-xl text-sm font-medium"
                      style={{
                        background: active ? 'rgba(224,63,106,0.1)' : 'rgba(255,255,255,0.04)',
                        boxShadow: active
                          ? '0 0 0 1.5px #E03F6A'
                          : '0 0 0 1px rgba(255,255,255,0.08)',
                        color: active ? '#E03F6A' : 'rgba(255,255,255,0.42)',
                        transition: 'all 0.18s ease',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {d}с
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

            {/* Consent checkboxes */}
            <div className="flex flex-col gap-3.5">
              {CONSENT_ITEMS.map((text, i) => (
                <button
                  key={i}
                  onClick={() => {
                    haptic('light')
                    setConsent((prev) => prev.map((c, idx) => (idx === i ? !c : c)))
                  }}
                  className="flex items-start gap-3 text-left w-full"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
                    style={{
                      background: consent[i] ? 'rgba(224,63,106,0.9)' : 'transparent',
                      border: consent[i]
                        ? 'none'
                        : '1.5px solid rgba(255,255,255,0.22)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <AnimatePresence>
                      {consent[i] && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                        >
                          <Check size={11} weight="bold" color="white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span
                    className="text-sm leading-relaxed"
                    style={{
                      color: consent[i] ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {text}
                  </span>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 pt-1">
              <motion.button
                onClick={handleStart}
                disabled={!canStart}
                whileTap={canStart ? { scale: 0.97 } : {}}
                className="relative w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-base overflow-hidden"
                style={{
                  background: canStart
                    ? 'linear-gradient(135deg, #C85D0A 0%, #E07820 55%, #F0952E 100%)'
                    : 'rgba(255,255,255,0.04)',
                  boxShadow: canStart ? '0 4px 24px rgba(200,93,10,0.42)' : 'none',
                  border: canStart ? 'none' : '1px solid rgba(255,255,255,0.07)',
                  color: canStart ? '#FFFFFF' : 'rgba(255,255,255,0.22)',
                  transition: 'all 0.25s ease',
                }}
              >
                {canStart && (
                  <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)',
                    }}
                  />
                )}
                <MagicWand size={18} weight="fill" />
                <span>Запустить</span>
                {canStart && (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.18)' }}
                  >
                    <Lightning size={11} weight="fill" color="#FFE066" />
                    <span className="font-mono text-xs">{cost}</span>
                  </div>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-1">
                <Lightning
                  size={10}
                  weight="fill"
                  color="rgba(255,255,255,0.25)"
                />
                <p
                  className="text-center text-xs font-mono"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Стоимость: {cost} слот · {duration} сек
                </p>
              </div>

              {!file && (
                <p
                  className="text-center text-xs"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Загрузите фото чтобы начать
                </p>
              )}
              {file && !allConsented && (
                <p
                  className="text-center text-xs"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  Подтвердите все пункты выше
                </p>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
