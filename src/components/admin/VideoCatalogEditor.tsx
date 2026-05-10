'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSimple, X, FloppyDisk, Plus, Trash } from '@phosphor-icons/react'
import {
  fetchVideoCatalog,
  updateVideoScenario,
  createVideoScenario,
  deleteVideoScenario,
} from '@/lib/catalog'
import type { VideoScenario } from '@/data/generate-options'
import { hapticNotify, haptic } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

interface ScenarioDraft {
  label: string
  description: string
  prompt_text: string
  thumbnail_url: string | null
  duration_sec: number
  slots: number
  sort_order: number
  description_full: string
  price_minor: string  // строка для удобного ввода; '' = глобальная цена
  // только при создании
  slug?: string
}

const emptyDraft = (sortOrder: number): ScenarioDraft => ({
  label: '',
  description: '',
  prompt_text: '',
  thumbnail_url: null,
  duration_sec: 5,
  slots: 2,
  sort_order: sortOrder,
  description_full: '',
  price_minor: '',
  slug: '',
})

function draftFrom(s: VideoScenario): ScenarioDraft {
  return {
    label: s.label,
    description: s.description,
    prompt_text: s.prompt_text ?? '',
    thumbnail_url: s.thumbnail,
    duration_sec: s.durationSec,
    slots: s.slots,
    sort_order: s.sort_order ?? 0,
    description_full: s.description_full ?? '',
    price_minor: s.price_minor != null ? String(s.price_minor) : '',
  }
}

export default function VideoCatalogEditor() {
  const [scenarios, setScenarios] = useState<VideoScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<VideoScenario | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<ScenarioDraft | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVideoCatalog()
      setScenarios(data.scenarios)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сценарии')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  function startEdit(s: VideoScenario) {
    setEditing(s)
    setCreating(false)
    setDraft(draftFrom(s))
  }

  function startCreate() {
    const nextSort = (scenarios[scenarios.length - 1]?.sort_order ?? 0) + 10
    setEditing(null)
    setCreating(true)
    setDraft(emptyDraft(nextSort))
  }

  function close() {
    setEditing(null)
    setCreating(false)
    setDraft(null)
  }

  async function handleSave() {
    if (!draft) return
    if (!draft.label.trim() || !draft.thumbnail_url) {
      hapticNotify('warning'); setError('Заполните название и превью'); return
    }
    if (creating && !draft.slug?.trim()) {
      hapticNotify('warning'); setError('Заполните slug'); return
    }
    if (draft.price_minor.trim() !== '' && (Number.isNaN(Number(draft.price_minor)) || Number(draft.price_minor) < 0)) {
      hapticNotify('warning'); setError('Цена должна быть числом ≥ 0 или пустой (= глобальная)'); return
    }

    const basePayload = {
      label: draft.label.trim(),
      description: draft.description.trim(),
      prompt_text: draft.prompt_text.trim(),
      thumbnail_url: draft.thumbnail_url,
      duration_sec: draft.duration_sec,
      slots: draft.slots,
      sort_order: draft.sort_order,
      description_full: draft.description_full.trim(),
      price_minor: draft.price_minor.trim() === '' ? null : Number(draft.price_minor),
    }

    try {
      if (creating) {
        await createVideoScenario({ ...basePayload, slug: draft.slug!.trim() })
      } else {
        if (!editing || typeof editing.numericId !== 'number') throw new Error('Сценарий без numericId')
        await updateVideoScenario(editing.numericId, basePayload)
      }
      hapticNotify('success')
      close()
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  async function handleDelete(s: VideoScenario) {
    if (typeof s.numericId !== 'number') return
    if (!confirm(`Удалить сценарий «${s.label}»? Soft-delete, можно восстановить в БД.`)) return
    try {
      await deleteVideoScenario(s.numericId)
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2"
             style={{ background: 'rgba(180,30,60,0.12)', border: '1px solid rgba(180,30,60,0.22)', color: '#ff9aae' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={12} /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Видео-сценарии
        </h3>
        <button
          onClick={() => { haptic('light'); startCreate() }}
          className="rounded-full flex items-center gap-1.5 flex-shrink-0"
          style={{
            padding: '7px 12px',
            background: 'rgba(95,210,150,0.10)',
            border: '1px solid rgba(95,210,150,0.28)',
            color: '#5fd296',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Plus size={12} weight="bold" /> Создать
        </button>
      </div>

      {loading && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Загрузка…</p>}

      <div className="grid grid-cols-2 gap-2.5">
        {scenarios.map((s) => (
          <div key={s.id}
            className="rounded-xl overflow-hidden flex flex-col"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="aspect-[1.45/1] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.thumbnail} alt={s.label} className="object-cover w-full h-full" />
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{ background: 'rgba(0,0,0,0.65)', color: 'white' }}>
                {s.durationSec}с · {s.slots}⚡
              </div>
            </div>
            <div className="px-2.5 py-2 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(s)}
                    title="Редактировать"
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <PencilSimple size={11} color="rgba(255,255,255,0.6)" />
                  </button>
                  <button onClick={() => handleDelete(s)}
                    title="Удалить"
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(180,30,60,0.12)' }}>
                    <Trash size={10} color="#ff9aae" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {s.description}
              </p>
              {s.price_minor != null && (
                <span
                  className="self-start font-mono text-[10px] px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    background: 'rgba(201,150,106,0.12)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(201,150,106,0.28)',
                  }}>
                  {(s.price_minor / 100).toFixed(2)} ₽
                </span>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => { haptic('light'); startCreate() }}
          className="rounded-xl aspect-[1.45/1] flex flex-col items-center justify-center gap-1"
          style={{
            background: 'rgba(95,210,150,0.06)',
            border: '1px dashed rgba(95,210,150,0.32)',
            color: '#5fd296',
          }}>
          <Plus size={18} weight="bold" />
          <span className="text-xs font-medium">Сценарий</span>
        </button>
      </div>

      {scenarios.length === 0 && !loading && (
        <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Пока нет сценариев
        </p>
      )}

      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] rounded-t-3xl p-5 flex flex-col gap-3"
              style={{ background: '#15141a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90dvh', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'white' }}>
                  {creating ? 'Новый сценарий' : `Редактировать «${editing?.label ?? ''}»`}
                </h3>
                <button onClick={close}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

              {creating && (
                <input
                  value={draft.slug ?? ''}
                  onChange={(e) => setDraft((d) => d && ({ ...d, slug: e.target.value }))}
                  placeholder="slug (латиница, без пробелов)"
                  className="rounded-lg px-3 py-2 text-sm font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                />
              )}

              <input
                value={draft.label}
                onChange={(e) => setDraft((d) => d && ({ ...d, label: e.target.value }))}
                placeholder="Название"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => d && ({ ...d, description: e.target.value }))}
                placeholder="Краткое описание (на карточке)"
                rows={2}
                className="rounded-lg px-3 py-2 text-sm resize-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />
              <textarea
                value={draft.description_full}
                onChange={(e) => setDraft((d) => d && ({ ...d, description_full: e.target.value }))}
                placeholder="Полное описание (опционально, видно при выборе)"
                rows={3}
                className="rounded-lg px-3 py-2 text-sm resize-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />
              <textarea
                value={draft.prompt_text}
                onChange={(e) => setDraft((d) => d && ({ ...d, prompt_text: e.target.value }))}
                placeholder="Промпт для AI"
                rows={3}
                className="rounded-lg px-3 py-2 text-sm resize-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />

              <ImageUploader
                label="Превью карточки"
                value={draft.thumbnail_url}
                onChange={(url) => setDraft((d) => d && ({ ...d, thumbnail_url: url }))}
                aspectRatio="1.45 / 1"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Длительность (сек)</span>
                  <input type="number" min={1} value={draft.duration_sec}
                    onChange={(e) => setDraft((d) => d && ({ ...d, duration_sec: Number(e.target.value) || 0 }))}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Слотов</span>
                  <input type="number" min={1} value={draft.slots}
                    onChange={(e) => setDraft((d) => d && ({ ...d, slots: Number(e.target.value) || 0 }))}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Цена в копейках (пусто = глобальная)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.price_minor}
                  onChange={(e) => setDraft((d) => d && ({ ...d, price_minor: e.target.value }))}
                  placeholder="напр. 9900 = 99 ₽"
                  className="rounded-lg px-3 py-1.5 text-sm font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
              </label>

              <button onClick={handleSave}
                className="w-full rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)', color: 'white' }}>
                <FloppyDisk size={16} weight="fill" /> Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
