'use client'

import Image from 'next/image'

interface Props {
  beforeUrl: string
  afterUrl: string
  label: string
}

export default function BeforeAfterPreview({ beforeUrl, afterUrl, label }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <p
          className="font-sans"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '-0.005em',
          }}
        >
          Превью образа
        </p>
        <p
          className="font-sans"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--rose)',
            letterSpacing: '-0.01em',
            transition: 'color 0.15s ease',
          }}
        >
          {label}
        </p>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '1.272 / 1',
          border: '1px solid var(--border-1)',
        }}
      >
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          <Image
            src={beforeUrl}
            alt="до"
            fill
            sizes="(max-width: 430px) 50vw, 215px"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, transparent 60%, rgba(13,13,15,0.55) 100%)',
            }}
          />
          <div
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md font-sans"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              background: 'rgba(13,11,16,0.7)',
              color: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            до
          </div>
        </div>

        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <Image
            src={afterUrl}
            alt="после"
            fill
            sizes="(max-width: 430px) 50vw, 215px"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to left, transparent 60%, rgba(13,13,15,0.45) 100%)',
            }}
          />
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md font-sans"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              background: 'var(--rose)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(224,63,106,0.45)',
            }}
          >
            после
          </div>
        </div>

        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
          style={{ background: 'rgba(255,255,255,0.16)' }}
        />
      </div>
    </div>
  )
}
