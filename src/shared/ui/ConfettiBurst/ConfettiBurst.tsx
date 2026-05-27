'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  angle: number
  distance: number
  size: number
  color: string
  delay: number
  duration: number
}

interface ConfettiBurstProps {
  count?: number
  radius?: number
  active?: boolean
}

const PALETTE = ['var(--rose)', 'var(--splash-violet)', '#fff', 'var(--rose-deep)']

export function ConfettiBurst({ count = 14, radius = 96, active = true }: ConfettiBurstProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
      return {
        id: i,
        angle,
        distance: radius * (0.65 + Math.random() * 0.45),
        size: 4 + Math.random() * 5,
        color: PALETTE[i % PALETTE.length],
        delay: Math.random() * 0.08,
        duration: 0.9 + Math.random() * 0.5,
      }
    })
  }, [count, radius])

  if (!active) return null

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{ width: 0, height: 0 }}
    >
      {particles.map((p) => {
        const dx = Math.cos(p.angle) * p.distance
        const dy = Math.sin(p.angle) * p.distance
        return (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: dx,
              y: dy,
              opacity: [0, 1, 1, 0],
              scale: [0.4, 1, 0.9, 0.6],
              rotate: 360 * (p.id % 2 ? 1 : -1),
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: p.id % 3 === 0 ? 999 : 1,
              background: p.color,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
              transformOrigin: 'center',
            }}
          />
        )
      })}
    </span>
  )
}
