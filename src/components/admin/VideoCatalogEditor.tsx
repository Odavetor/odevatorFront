'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSimple, X, FloppyDisk, Info } from '@phosphor-icons/react'
import { fetchVideoCatalog, updateVideoScenario } from '@/lib/catalog'
import type { VideoScenario } from '@/data/generate-options'
import { hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

// На бэке нет создания/удаления сценариев — только PATCH существующего.

interface ScenarioDraft {
  label: string
  description: string
  prompt_text: string
  thumbnail_url: string | null
  duration_sec: number
  slots: number
  sort_order: number
}

function draftFrom(s: VideoScenario): ScenarioDraft {
  return {
    label: s.label,
    description: s.description,
    prompt_text: s.prompt_text ?? '',
    thumbnail_url: s.thumbnail,
    duration_sec: s.durationSec,
    slots: s.slots,
    sort_order: s.sort_order ?? 0,
  }
}

export default function VideoCatalogEditor() {
  const [scenarios, setScenarios] = useState<VideoScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<VideoScenario | null>(null)
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
    setDraft(draftFrom(s))
  }

  function close() {
    setEditing(null)
    setDraft(null)
  }

  async function handleSave() {
    if (!editing || !draft) return
    if (typeof editing.numericId !== 'number') {
      hapticNotify('error')
      setError('Сценарий без numericId — нельзя сохранить.')
      return
    }
    if (!draft.label.trim() || !draft.thumbnail_url) {
      hapticNotify('warning'); setError('Заполните название и превью'); return
    }
    try {
      await updateVideoScenario(editing.numericId, {
        label: draft.label.trim(),
        description: draft.description.trim(),
        prompt_text: draft.prompt_text.trim(),
        thumbnail_url: draft.thumbnail_url,
        duration_sec: draft.duration_sec,
        slots: draft.slots,
        sort_order: draft.sort_order,
      })
      hapticNotify('success')
      close()
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
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

      <div
        className="rounded-2xl px-3.5 py-3 flex items-start gap-2.5"
        style={{ background: 'rgba(201,150,106,0.08)', border: '1px solid rgba(201,150,106,0.22)' }}
      >
        <Info size={14} weight="fill" color="var(--gold)" className="flex-shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Сценарии засеяны в БД миграцией <code style={{ color: '#fff' }}>008_catalog.sql</code>. На бэке нельзя
          создавать или удалять — только редактировать существующие.
        </div>
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
                <button onClick={() => startEdit(s)}
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <PencilSimple size={11} color="rgba(255,255,255,0.6)" />
                </button>
              </div>
              <p className="text-[10px] line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {scenarios.length === 0 && !loading && (
        <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Пока нет сценариев
        </p>
      )}

      <AnimatePresence>
        {editing && draft && (
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
                  Редактировать «{editing.label}»
                </h3>
                <button onClick={close}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

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
                placeholder="Описание"
                rows={2}
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
