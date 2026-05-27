'use client'

import { useEffect, useRef } from 'react'
import { animate, useMotionValue } from 'framer-motion'

interface Props {
  to: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

const defaultFormat = (n: number) => String(Math.round(n))

export function CountUpNumber({
  to,
  duration = 0.9,
  format = defaultFormat,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const firstRunRef = useRef(true)

  useEffect(() => {
    const from = firstRunRef.current ? 0 : motionValue.get()
    firstRunRef.current = false
    motionValue.set(from)
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v)
      },
    })
    return () => controls.stop()
  }, [to, duration, format, motionValue])

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  )
}
