'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from '@phosphor-icons/react'
import { haptic, hapticNotify, hapticSelect, tt, useLang } from '@shared/lib'
import { submitReview, type ReviewKind } from '@/lib/reviews'

const MAX_BODY = 1000

interface ReviewFormProps {
  kind: ReviewKind
  title: string
  subtitle: string
  placeholder: string
}

export function ReviewForm({ kind, title, subtitle, placeholder }: ReviewFormProps) {
  useLang()
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const canSubmit = !busy && rating >= 1 && rating <= 5

  async function submit() {
    if (!canSubmit) return
    setError(null)
    setBusy(true)
    try {
      await submitReview(kind, rating, body.trim())
      hapticNotify('success')
      setDone(true)
    } catch (e) {
      hapticNotify('error')
      setError(
        e instanceof Error
          ? e.message
          : tt({
              ru: 'Не удалось отправить отзыв',
              en: 'Failed to submit review',
              de: 'Bewertung konnte nicht gesendet werden',
            }),
      )
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 rounded-2xl px-5 py-7 text-center"
        style={{
          background: 'rgba(95,210,150,0.08)',
          border: '1px solid rgba(95,210,150,0.24)',
        }}
      >
        <CheckCircle size={32} weight="fill" color="#5fd296" />
        <p className="text-sm font-semibold" style={{ color: '#7fe0a8' }}>
          {tt({
            ru: 'Спасибо за отзыв!',
            en: 'Thanks for your review!',
            de: 'Danke für Ihre Bewertung!',
          })}
        </p>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {tt({
            ru: 'Мы прочитаем каждое слово.',
            en: 'We read every word.',
            de: 'Wir lesen jedes Wort.',
          })}
        </p>
      </motion.div>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {title}
        </h3>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= rating
          return (
            <button
              key={n}
              type="button"
              aria-label={tt({ ru: `${n} из 5`, en: `${n} of 5`, de: `${n} von 5` })}
              onClick={() => {
                hapticSelect()
                setRating(n)
              }}
              className="no-tap-highlight flex h-10 w-10 items-center justify-center"
            >
              <Star
                size={30}
                weight={active ? 'fill' : 'regular'}
                color={active ? '#F5C451' : 'rgba(255,255,255,0.25)'}
              />
            </button>
          )
        })}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl px-3 py-2.5 text-sm"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
        }}
      />

      {error && (
        <p
          className="rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className="no-tap-highlight rounded-xl py-3.5 text-sm font-semibold"
        style={{
          background: canSubmit
            ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)'
            : 'rgba(255,255,255,0.04)',
          color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
        }}
        onPointerDown={() => canSubmit && haptic('light')}
      >
        {busy
          ? tt({ ru: 'Отправляем…', en: 'Sending…', de: 'Senden…' })
          : tt({ ru: 'Отправить отзыв', en: 'Submit review', de: 'Bewertung senden' })}
      </button>
    </section>
  )
}
