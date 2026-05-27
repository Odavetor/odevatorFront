import type { Transition } from 'framer-motion'

export const EASE_EDITORIAL: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_TACTILE: [number, number, number, number] = [0.34, 1.56, 0.64, 1]
export const EASE_GLIDE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const editorialEnter: Transition = {
  duration: 0.6,
  ease: EASE_EDITORIAL,
}

export const tactileSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 26,
}

export const glide: Transition = {
  duration: 0.32,
  ease: EASE_GLIDE,
}

export function staggered(delay: number): Transition {
  return { duration: 0.45, ease: EASE_EDITORIAL, delay }
}
