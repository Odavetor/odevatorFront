'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PencilSimple, Trash, X, FloppyDisk } from '@phosphor-icons/react'
import {
  fetchVideoCatalog,
  createVideoScenario,
  updateVideoScenario,
  deleteVideoScenario,
} from '@/lib/catalog'
import type { VideoScenario } from '@/data/generate-options'
import { haptic, hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

interface ScenarioDraft {
  slug: string
  label: string
  description: string
  thumbnail: string | null
  durationSec: number
  slots: number
}

const EMPTY_DRAFT: ScenarioDraft = {
  slug: '',
  label: '',
  description: '',
  thumbnail: null,
  durationSec: 5,
  slots: 2,
}

export default function VideoCatalogEditor() {
  const [scenarios, setScenarios] = useState<VideoScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<VideoScenario | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<ScenarioDraft>(EMPTY_DRAFT)

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

  function startNew() {
    setEditing(null)
    setDraft(EMPTY_DRAFT)
    setShowForm(true)
  }

  function startEdit(s: VideoScenario) {
    setEditing(s)
    setDraft({
      slug: s.id,
      label: s.label,
      description: s.description,
      thumbnail: s.thumbnail,
      durationSec: s.durationSec,
      slots: s.slots,
    })
    setShowForm(true)
  }

  function close() {
    setShowForm(false)
    setEditing(null)
    setDraft(EMPTY_DRAFT)
  }

  async function handleSave() {
    if (!draft.label.trim() || !draft.thumbnail) {
      hapticNotify('warning')
      setError('Заполните название и превью')
      return
    }
    try {
      if (editing) {
        await updateVideoScenario(editing.id, {
          label: draft.label.trim(),
          description: draft.description.trim(),
          thumbnail: draft.thumbnail,
          durationSec: draft.durationSec,
          slots: draft.slots,
        })
      } else {
        if (!draft.slug.trim()) {
          hapticNotify('warning')
          setError('Slug обязателен')
          return
        }
        await createVideoScenario({
          slug: draft.slug.trim(),
          label: draft.label.trim(),
          description: draft.description.trim(),
          thumbnail: draft.thumbnail,
          durationSec: draft.durationSec,
          slots: draft.slots,
        })
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
    if (!confirm(`Удалить сценарий «${s.label}»?`)) return
    try {
      await deleteVideoScenario(s.id)
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

      <button
        onClick={() => { haptic(); startNew() }}
        className="rounded-2xl py-3 px-4 text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)', color: 'var(--rose)' }}
      >
        <Plus size={14} weight="bold" /> Новый сценарий
      </button>

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
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <PencilSimple size={11} color="rgba(255,255,255,0.6)" />
                  </button>
                  <button onClick={() => handleDelete(s)}
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'rgba(180,30,60,0.15)' }}>
                    <Trash size={11} color="#ff8aa0" />
                  </button>
                </div>
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

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
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
                  {editing ? 'Редактировать сценарий' : 'Новый сценарий'}
                </h3>
                <button onClick={close}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

              {!editing && (
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                  placeholder="slug (напр. dance)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                />
              )}
              <input
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="Название (напр. Танец)"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Описание"
                rows={2}
                className="rounded-lg px-3 py-2 text-sm resize-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />

              <ImageUploader
                label="Превью карточки"
                value={draft.thumbnail}
                onChange={(url) => setDraft((d) => ({ ...d, thumbnail: url }))}
                aspectRatio="1.45 / 1"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Длительность (сек)</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.durationSec}
                    onChange={(e) => setDraft((d) => ({ ...d, durationSec: Number(e.target.value) || 0 }))}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>Слотов</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.slots}
                    onChange={(e) => setDraft((d) => ({ ...d, slots: Number(e.target.value) || 0 }))}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  />
                </label>
              </div>

              <button
                onClick={handleSave}
                className="w-full rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                  color: 'white',
                }}
              >
                <FloppyDisk size={16} weight="fill" /> Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
