'use client'

import { motion } from 'framer-motion'
import { ArrowsHorizontal } from '@phosphor-icons/react'

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
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="overflow-hidden"
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', height: 130 }}
      >
        {/* Before image */}
        <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt="до"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent 70%, rgba(13,13,15,0.6) 100%)' }}
          />
          <div
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.6)' }}
          >
            ДО
          </div>
        </div>

        {/* After image */}
        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt="после"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to left, transparent 70%, rgba(13,13,15,0.6) 100%)' }}
          />
          <div
            className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: 'rgba(224,63,106,0.7)', color: '#fff' }}
          >
            ПОСЛЕ
          </div>
        </div>

        {/* Center divider */}
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        />

        {/* Center icon */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#0D0D0F', border: '1px solid rgba(255,255,255,0.14)' }}
        >
          <ArrowsHorizontal size={12} color="rgba(255,255,255,0.5)" />
        </div>

        {/* Filter name pill */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            background: 'rgba(13,13,15,0.82)',
            color: '#E03F6A',
            border: '1px solid rgba(224,63,106,0.22)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  )
}
