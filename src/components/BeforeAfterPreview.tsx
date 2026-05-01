'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface Props {
  beforeUrl: string
  afterUrl: string
  label: string
}

export default function BeforeAfterPreview({ beforeUrl, afterUrl, label }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <p className="text-cream-700 text-gr-2xs uppercase tracking-[0.14em]">Превью образа</p>
          <p className="font-mono text-[11px]" style={{ color: 'var(--rose)' }}>
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
              style={{ background: 'linear-gradient(to right, transparent 60%, rgba(13,13,15,0.55) 100%)' }}
            />
            <div
              className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-wider"
              style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.65)' }}
            >
              ДО
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
              style={{ background: 'linear-gradient(to left, transparent 60%, rgba(13,13,15,0.45) 100%)' }}
            />
            <div
              className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium tracking-wider"
              style={{ background: 'var(--rose)', color: '#fff' }}
            >
              ПОСЛЕ
            </div>
          </div>

          {/* Hairline divider */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
            style={{ background: 'rgba(255,255,255,0.16)' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
