'use client'

import { useEffect, useState } from 'react'
import { Check, FloppyDisk, Warning } from '@phosphor-icons/react'
import { haptic, hapticNotify } from '@/lib/telegram'
import { getLegalDoc, updateLegalDoc } from '@/lib/content'
import { LEGAL_REGISTRY, type LegalSpec } from '@/lib/content/keys'

export default function LegalEditor() {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div
          className="rounded-xl px-3 py-2 text-xs"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          {error}
        </div>
      )}

      <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Правовые документы. Текст показывается пользователям на страницах /legal. Поддерживается
        простой текст с переносами строк.
      </p>

      {LEGAL_REGISTRY.map((spec) => (
        <LegalRow key={spec.slug} spec={spec} onError={setError} />
      ))}
    </div>
  )
}

function LegalRow({ spec, onError }: { spec: LegalSpec; onError: (m: string | null) => void }) {
  const [title, setTitle] = useState(spec.title)
  const [body, setBody] = useState('')
  const [loaded, setLoaded] = useState<{ title: string; body: string } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLegalDoc(spec.slug)
      .then((doc) => {
        if (cancelled || !doc) return
        const t = doc.title || spec.title
        setTitle(t)
        setBody(doc.body ?? '')
        setLoaded({ title: t, body: doc.body ?? '' })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [spec.slug, spec.title])

  const dirty = !loaded || title !== loaded.title || body !== loaded.body
  const empty = body.trim() === ''

  async function save() {
    if (!dirty || !title.trim()) return
    setSaving(true)
    onError(null)
    try {
      await updateLegalDoc(spec.slug, { title: title.trim(), body })
      setLoaded({ title: title.trim(), body })
      hapticNotify('success')
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      className="flex flex-col gap-2.5 rounded-2xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <code
          className="font-mono text-[10px]"
          style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}
        >
          /legal/{spec.slug}
        </code>
        {empty && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: 'rgba(230,180,60,0.14)', color: '#ffd27a' }}
          >
            <Warning size={10} weight="fill" />
            не заполнено
          </span>
        )}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок документа"
        className="w-full rounded-lg px-3 py-2 text-sm font-medium"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
        }}
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Текст документа…"
        rows={10}
        className="w-full resize-y rounded-lg px-3 py-2 text-[13px] leading-relaxed"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
        }}
      />

      <button
        onClick={() => {
          haptic('light')
          save()
        }}
        disabled={!dirty || saving || !title.trim()}
        className="flex items-center gap-1.5 self-end rounded-lg px-4 py-2 text-sm font-medium"
        style={{
          background: dirty ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
          border: dirty ? '1px solid var(--border-rose)' : '1px solid var(--border-1)',
          color: dirty ? 'var(--rose)' : 'rgba(255,255,255,0.4)',
          opacity: !dirty || saving || !title.trim() ? 0.5 : 1,
        }}
      >
        {dirty ? <FloppyDisk size={14} weight="fill" /> : <Check size={14} weight="bold" />}
        {saving ? 'Сохраняю…' : dirty ? 'Сохранить' : 'Сохранено'}
      </button>
    </section>
  )
}
