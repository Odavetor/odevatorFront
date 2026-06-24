'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, UploadSimple, X } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'
import { tt, useLang } from '@shared/lib'

interface Props {
  onFile: (file: File) => void
  preview?: string | null
  onClear?: () => void
  compact?: boolean
}

export default function PhotoUpload({ onFile, preview, onClear, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  useLang()

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      haptic('medium')
      onFile(file)
    },
    [onFile],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // Compact mode: small horizontal strip after upload
  if (compact && preview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-full w-full object-cover" />
        </div>
        <p className="flex-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {tt({ ru: 'Фото загружено', en: 'Photo uploaded', de: 'Foto hochgeladen' })}
        </p>
        <button
          onClick={() => {
            haptic()
            onClear?.()
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <X size={13} color="rgba(255,255,255,0.5)" weight="bold" />
        </button>
      </motion.div>
    )
  }

  // Compact mode: small empty state — tap to upload
  if (compact && !preview) {
    return (
      <motion.button
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left"
        style={{
          background: dragging ? 'var(--rose-soft)' : 'rgba(255,255,255,0.04)',
          border: `1px dashed ${dragging ? 'var(--rose)' : 'var(--border-rose)'}`,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'all 0.2s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
        >
          <Camera size={18} color="var(--rose)" weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium leading-tight"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {tt({
              ru: 'Загрузить своё фото',
              en: 'Upload your photo',
              de: 'Eigenes Foto hochladen',
            })}
          </p>
          <p
            className="mt-0.5 text-[11px] leading-tight"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            JPG, PNG, WEBP
          </p>
        </div>
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
        >
          <UploadSimple size={13} color="var(--rose)" weight="bold" />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </motion.button>
    )
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ aspectRatio: '1 / 1.618' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(13,11,16,0.8) 0%, transparent 50%)',
              }}
            />
            <button
              onClick={() => {
                haptic()
                onClear?.()
              }}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: 'rgba(13,11,16,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <X size={16} color="#f2ece6" weight="bold" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: dragging ? 1.01 : 1 }}
            exit={{ opacity: 0 }}
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
            className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl py-16"
            style={{
              border: `1px dashed ${dragging ? 'var(--rose)' : 'var(--border-rose)'}`,
              background: dragging ? 'var(--rose-soft)' : 'rgba(31,25,41,0.6)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
            >
              <Camera size={28} color="var(--rose)" weight="duotone" />
            </div>

            <div className="px-6 text-center">
              <p className="mb-1 text-base font-medium text-cream-200">
                {tt({ ru: 'Загрузить фото', en: 'Upload photo', de: 'Foto hochladen' })}
              </p>
              <p className="text-sm text-cream-700">
                {tt({
                  ru: 'Нажмите или перетащите изображение',
                  en: 'Tap or drag an image',
                  de: 'Tippen oder Bild ziehen',
                })}
              </p>
            </div>

            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: 'var(--rose-soft)', border: '1px solid var(--border-rose)' }}
            >
              <UploadSimple size={14} color="var(--rose)" />
              <span className="text-xs font-medium" style={{ color: 'var(--rose)' }}>
                JPG, PNG, WEBP
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
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
