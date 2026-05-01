'use client'

import { motion } from 'framer-motion'

interface Props {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function TabSwitcher({ tabs, active, onChange }: Props) {
  return (
    <div
      className="flex p-1 rounded-full self-start"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="relative px-5 py-1.5 text-sm font-medium rounded-full"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {active === tab && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span
            className="relative z-10 transition-colors duration-200"
            style={{ color: active === tab ? '#FFFFFF' : 'rgba(255,255,255,0.38)' }}
          >
            {tab}
          </span>
        </button>
      ))}
    </div>
  )
}
