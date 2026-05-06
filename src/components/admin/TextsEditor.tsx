'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp, Check, FloppyDisk, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import { haptic, hapticNotify } from '@/lib/telegram'
import {
  createFaq,
  deleteFaq,
  refreshContent,
  updateFaq,
  updateString,
  useContent,
  useFaq,
} from '@/lib/content'
import { TEXT_REGISTRY, type TextSpec, type FaqItem } from '@/lib/content/keys'

export default function TextsEditor() {
  const faq = useFaq()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    refreshContent()
  }, [])

  const groups = useMemo(() => {
    const map = new Map<string, TextSpec[]>()
    for (const t of TEXT_REGISTRY) {
      const arr = map.get(t.group) ?? []
      arr.push(t)
      map.set(t.group, arr)
    }
    return Array.from(map.entries())
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div
          className="rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2"
          style={{
            background: 'rgba(180,30,60,0.12)',
            border: '1px solid rgba(180,30,60,0.22)',
            color: '#ff9aae',
          }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* === Строки === */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Строки
          </h3>
          <span
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}
          >
            {TEXT_REGISTRY.length} ключей
          </span>
        </div>

        {groups.map(([group, items]) => (
          <div key={group} className="flex flex-col gap-2">
            <p
              className="font-mono uppercase"
              style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--rose)' }}
            >
              {group}
            </p>
            <div
              className="rounded-2xl divide-y"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {items.map((spec) => (
                <StringRow key={spec.key} spec={spec} onError={setError} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* === FAQ === */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            FAQ
          </h3>
          <span
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}
          >
            {faq.length} {faq.length === 1 ? 'вопрос' : faq.length < 5 ? 'вопроса' : 'вопросов'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {faq.map((it, i) => (
            <FaqRow
              key={it.id}
              item={it}
              isFirst={i === 0}
              isLast={i === faq.length - 1}
              all={faq}
              onError={setError}
            />
          ))}
          <FaqAddButton onError={setError} nextSortOrder={(faq[faq.length - 1]?.sort_order ?? 0) + 1} />
        </div>
      </section>
    </div>
  )
}

// ===== Строки =====

function StringRow({ spec, onError }: { spec: TextSpec; onError: (m: string | null) => void }) {
  const current = useContent(spec.key)
  const [draft, setDraft] = useState(current)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // если значение из бэка пришло позже монтирования — синкаем
  useEffect(() => {
    if (!editing) setDraft(current)
  }, [current, editing])

  const dirty = draft !== current

  async function save() {
    if (!dirty) {
      setEditing(false)
      return
    }
    setSaving(true)
    onError(null)
    try {
      await updateString(spec.key, draft)
      hapticNotify('success')
      setEditing(false)
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(current)
    setEditing(false)
  }

  return (
    <div className="px-3 py-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <code
          className="font-mono text-[10px]"
          style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}
        >
          {spec.key}
        </code>
        {!editing ? (
          <button
            onClick={() => {
              haptic('light')
              setEditing(true)
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <PencilSimple size={12} color="rgba(255,255,255,0.6)" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={cancel}
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={12} color="rgba(255,255,255,0.55)" weight="bold" />
            </button>
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background: dirty ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                border: dirty ? '1px solid var(--border-rose)' : '1px solid transparent',
                opacity: !dirty || saving ? 0.45 : 1,
              }}
            >
              <Check size={12} color={dirty ? 'var(--rose)' : 'rgba(255,255,255,0.4)'} weight="bold" />
            </button>
          </div>
        )}
      </div>
      {editing ? (
        spec.multiline ? (
          <textarea
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
        ) : (
          <input
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
        )
      ) : (
        <p
          className="text-[13px] leading-snug whitespace-pre-wrap"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {current || <span style={{ color: 'rgba(255,255,255,0.3)' }}>{spec.defaultValue}</span>}
        </p>
      )}
    </div>
  )
}

// ===== FAQ =====

function FaqRow({
  item,
  isFirst,
  isLast,
  all,
  onError,
}: {
  item: FaqItem
  isFirst: boolean
  isLast: boolean
  all: FaqItem[]
  onError: (m: string | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(item.question)
  const [a, setA] = useState(item.answer)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) {
      setQ(item.question)
      setA(item.answer)
    }
  }, [item.question, item.answer, editing])

  const dirty = q !== item.question || a !== item.answer

  async function save() {
    if (!dirty) {
      setEditing(false)
      return
    }
    setSaving(true)
    onError(null)
    try {
      await updateFaq(item.id, { question: q, answer: a })
      hapticNotify('success')
      setEditing(false)
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm(`Удалить вопрос «${item.question}»?`)) return
    try {
      await deleteFaq(item.id)
      hapticNotify('success')
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  async function reorder(direction: -1 | 1) {
    const idx = all.findIndex((x) => x.id === item.id)
    const swap = all[idx + direction]
    if (!swap) return
    try {
      await Promise.all([
        updateFaq(item.id, { sort_order: swap.sort_order }),
        updateFaq(swap.id, { sort_order: item.sort_order }),
      ])
      haptic('light')
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось изменить порядок')
    }
  }

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="rounded-2xl p-3 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}
        >
          #{item.sort_order}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={isFirst}
            onClick={() => reorder(-1)}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', opacity: isFirst ? 0.3 : 1 }}
          >
            <ArrowUp size={11} color="rgba(255,255,255,0.6)" weight="bold" />
          </button>
          <button
            disabled={isLast}
            onClick={() => reorder(1)}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', opacity: isLast ? 0.3 : 1 }}
          >
            <ArrowDown size={11} color="rgba(255,255,255,0.6)" weight="bold" />
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <PencilSimple size={11} color="rgba(255,255,255,0.6)" />
          </button>
          <button
            onClick={remove}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(180,30,60,0.15)' }}
          >
            <Trash size={11} color="#ff8aa0" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Вопрос"
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Ответ"
            rows={3}
            className="rounded-lg px-3 py-2 text-sm resize-none"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
            style={{
              background: dirty ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
              border: dirty ? '1px solid var(--border-rose)' : '1px solid var(--border-1)',
              color: dirty ? 'var(--rose)' : 'rgba(255,255,255,0.4)',
              opacity: !dirty || saving ? 0.6 : 1,
            }}
          >
            <FloppyDisk size={13} weight="fill" />
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {item.question}
          </p>
          <p
            className="text-[12px] leading-relaxed whitespace-pre-wrap"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {item.answer}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function FaqAddButton({
  nextSortOrder,
  onError,
}: {
  nextSortOrder: number
  onError: (m: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!q.trim() || !a.trim()) return
    setSaving(true)
    onError(null)
    try {
      await createFaq({ question: q.trim(), answer: a.trim(), sort_order: nextSortOrder })
      hapticNotify('success')
      setOpen(false)
      setQ('')
      setA('')
    } catch (e) {
      hapticNotify('error')
      onError(e instanceof Error ? e.message : 'Не удалось создать')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="form"
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          className="rounded-2xl p-3 flex flex-col gap-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-rose)' }}
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Вопрос"
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Ответ"
            rows={3}
            className="rounded-lg px-3 py-2 text-sm resize-none"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setOpen(false)
                setQ('')
                setA('')
              }}
              className="flex-1 rounded-lg px-3 py-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}
            >
              Отмена
            </button>
            <button
              onClick={save}
              disabled={saving || !q.trim() || !a.trim()}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
              style={{
                background: 'var(--rose-dim)',
                border: '1px solid var(--border-rose)',
                color: 'var(--rose)',
                opacity: saving || !q.trim() || !a.trim() ? 0.5 : 1,
              }}
            >
              <FloppyDisk size={13} weight="fill" />
              {saving ? 'Сохраняю…' : 'Добавить'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="add"
          layout
          onClick={() => {
            haptic('light')
            setOpen(true)
          }}
          className="rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-1.5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--border-rose)',
            color: 'var(--rose)',
          }}
        >
          <Plus size={14} weight="bold" />
          Добавить вопрос
        </motion.button>
      )}
    </AnimatePresence>
  )
}
