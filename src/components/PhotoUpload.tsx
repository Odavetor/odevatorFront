'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, UploadSimple, X } from '@phosphor-icons/react'
import { haptic } from '@/lib/telegram'

interface Props {
  onFile: (file: File) => void
  preview?: string | null
  onClear?: () => void
  compact?: boolean
}

export default function PhotoUpload({ onFile, preview, onClear, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

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
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="w-full h-full object-cover" />
        </div>
        <p className="flex-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Фото загружено
        </p>
        <button
          onClick={() => { haptic(); onClear?.() }}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
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
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 w-full text-left"
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
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
        >
          <Camera size={18} color="var(--rose)" weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Загрузить своё фото
          </p>
          <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            JPG, PNG, WEBP
          </p>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
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
            className="relative w-full rounded-3xl overflow-hidden"
            style={{ aspectRatio: '1 / 1.618' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(13,11,16,0.8) 0%, transparent 50%)',
              }}
            />
            <button
              onClick={() => {
                haptic()
                onClear?.()
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,11,16,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
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
            className="relative w-full rounded-3xl flex flex-col items-center justify-center gap-4 py-16 cursor-pointer"
            style={{
              border: `1px dashed ${dragging ? 'var(--rose)' : 'var(--border-rose)'}`,
              background: dragging ? 'var(--rose-soft)' : 'rgba(31,25,41,0.6)',
              transition: 'all 0.25s ease',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)' }}
            >
              <Camera size={28} color="var(--rose)" weight="duotone" />
            </div>

            <div className="text-center px-6">
              <p className="text-cream-200 font-medium text-base mb-1">Загрузить фото</p>
              <p className="text-cream-700 text-sm">Нажмите или перетащите изображение</p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--rose-soft)', border: '1px solid var(--border-rose)' }}>
              <UploadSimple size={14} color="var(--rose)" />
              <span className="text-xs font-medium" style={{ color: 'var(--rose)' }}>JPG, PNG, WEBP</span>
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
