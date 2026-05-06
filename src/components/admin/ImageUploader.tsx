'use client'

import { useRef, useState } from 'react'
import { ImageSquare, Spinner, X } from '@phosphor-icons/react'
import { uploadImage } from '@/lib/catalog'
import { haptic } from '@/lib/telegram'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  label: string
  aspectRatio?: string
}

export default function ImageUploader({ value, onChange, label, aspectRatio = '1 / 1' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Только изображения')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      onChange(url)
      haptic('light')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => {
          haptic()
          inputRef.current?.click()
        }}
        className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          aspectRatio,
          background: value ? 'transparent' : 'rgba(31,25,41,0.6)',
          border: `1px dashed ${value ? 'transparent' : 'var(--border-rose)'}`,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <ImageSquare size={24} color="var(--rose)" weight="duotone" />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {uploading ? 'Загрузка…' : 'Выбрать файл'}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <Spinner size={22} color="white" weight="bold" className="animate-spin" />
          </div>
        )}

        {value && !uploading && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation()
              haptic()
              onChange(null)
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X size={13} color="white" weight="bold" />
          </span>
        )}
      </button>

      {error && (
        <p className="text-[11px]" style={{ color: '#ff7a90' }}>
          {error}
        </p>
      )}

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
