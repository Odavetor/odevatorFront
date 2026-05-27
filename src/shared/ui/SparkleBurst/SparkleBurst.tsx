'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
  duration: number
}

interface SparkleBurstProps {
  count?: number
  radius?: number
  active?: boolean
  color?: string
}

export function SparkleBurst({
  count = 10,
  radius = 56,
  active = true,
  color = '#fff',
}: SparkleBurstProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      return {
        id: i,
        angle,
        distance: radius * (0.55 + Math.random() * 0.55),
        size: 2 + Math.random() * 3,
        delay: Math.random() * 0.06,
        duration: 0.55 + Math.random() * 0.3,
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
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
            animate={{
              x: dx,
              y: dy,
              opacity: [0, 1, 0],
              scale: [0.2, 1, 0.3],
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
              borderRadius: 999,
              background: color,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
              transformOrigin: 'center',
            }}
          />
        )
      })}
    </span>
  )
}
