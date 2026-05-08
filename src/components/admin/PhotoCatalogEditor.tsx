'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilSimple, X, FloppyDisk, ArrowUp, ArrowDown, Star, Info } from '@phosphor-icons/react'
import { fetchPhotoCatalog, updatePhotoOption } from '@/lib/catalog'
import type { FilterCategory, FilterOption } from '@/data/generate-options'
import { haptic, hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

// На бэке нет CRUD категорий и нет создания/удаления опций — есть только PATCH существующей.
// Этот редактор работает только с тем, что засеяно миграцией 008_catalog.sql.

interface OptionDraft {
  label: string
  before_image_url: string | null
  after_image_url: string | null
  prompt_text: string
  ai_model_type: 2 | 3
  width: number
  height: number
  sort_order: number
}

function draftFrom(opt: FilterOption): OptionDraft {
  return {
    label: opt.label,
    before_image_url: opt.beforeExample,
    after_image_url: opt.afterExample,
    prompt_text: opt.prompt_text ?? '',
    ai_model_type: opt.ai_model_type ?? 3,
    width: opt.width ?? 768,
    height: opt.height ?? 1024,
    sort_order: opt.sort_order ?? 0,
  }
}

export default function PhotoCatalogEditor() {
  const [categories, setCategories] = useState<FilterCategory[]>([])
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingOption, setEditingOption] = useState<FilterOption | null>(null)
  const [optionDraft, setOptionDraft] = useState<OptionDraft | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPhotoCatalog()
      setCategories(data.categories)
      if (!activeCatId && data.categories.length > 0) {
        setActiveCatId(data.categories[0].id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить каталог')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeCat = categories.find((c) => c.id === activeCatId) ?? null

  function startEditOption(opt: FilterOption) {
    setEditingOption(opt)
    setOptionDraft(draftFrom(opt))
  }

  function closeOptionForm() {
    setEditingOption(null)
    setOptionDraft(null)
  }

  async function handleSaveOption() {
    if (!editingOption || !optionDraft) return
    if (typeof editingOption.numericId !== 'number') {
      hapticNotify('error')
      setError('Опция без numericId — нельзя сохранить (локальный фолбэк?).')
      return
    }
    const d = optionDraft
    if (!d.label.trim() || !d.before_image_url || !d.after_image_url) {
      hapticNotify('warning'); setError('Заполните название и обе превью'); return
    }
    if (!d.prompt_text.trim()) {
      hapticNotify('warning'); setError('Заполните промпт для AI'); return
    }
    if (d.width < 1 || d.width > 1024 || d.height < 1 || d.height > 1024) {
      hapticNotify('warning'); setError('Width и height должны быть в 1–1024'); return
    }
    try {
      await updatePhotoOption(editingOption.numericId, {
        label: d.label.trim(),
        before_image_url: d.before_image_url,
        after_image_url: d.after_image_url,
        prompt_text: d.prompt_text.trim(),
        ai_model_type: d.ai_model_type,
        width: d.width,
        height: d.height,
        sort_order: d.sort_order,
      })
      hapticNotify('success')
      closeOptionForm()
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  // Reorder: PATCH перезаписывает всё → шлём полный объект с новым sort_order.
  // FilterOption гарантирует non-null URL'ы (мапер catalog.ts заполняет их из БД, NOT NULL).
  function payloadFrom(o: FilterOption, sortOrder: number) {
    return {
      label: o.label,
      before_image_url: o.beforeExample,
      after_image_url: o.afterExample,
      prompt_text: o.prompt_text ?? '',
      ai_model_type: o.ai_model_type ?? 3,
      width: o.width ?? 768,
      height: o.height ?? 1024,
      sort_order: sortOrder,
    } as const
  }

  async function reorderOption(opt: FilterOption, direction: -1 | 1) {
    if (!activeCat) return
    if (typeof opt.numericId !== 'number') return
    const idx = activeCat.options.findIndex((o) => o.id === opt.id)
    const swap = activeCat.options[idx + direction]
    if (!swap || typeof swap.numericId !== 'number') return
    try {
      await Promise.all([
        updatePhotoOption(opt.numericId, payloadFrom(opt, swap.sort_order ?? (idx + direction) * 10)),
        updatePhotoOption(swap.numericId, payloadFrom(swap, opt.sort_order ?? idx * 10)),
      ])
      haptic('light')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось изменить порядок')
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
          Категории и список вариантов фиксируются в БД (миграция <code style={{ color: '#fff' }}>008_catalog.sql</code>).
          Здесь можно только редактировать существующие.
        </div>
      </div>

      {/* Categories tabs */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const active = cat.id === activeCatId
          return (
            <button
              key={cat.id}
              onClick={() => { haptic('light'); setActiveCatId(cat.id) }}
              className="rounded-full text-sm font-medium flex-shrink-0"
              style={{
                padding: '7px 14px',
                background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                boxShadow: active ? 'inset 0 0 0 1.5px var(--rose)' : 'inset 0 0 0 1px var(--border-2)',
                color: active ? 'var(--rose)' : 'rgba(255,255,255,0.55)',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {loading && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Загрузка…</p>}

      {activeCat && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Варианты в «{activeCat.label}»
              </h3>
              <p className="text-[11px] leading-snug mt-0.5 flex items-center gap-1"
                 style={{ color: 'rgba(255,255,255,0.45)' }}>
                <Star size={10} weight="fill" color="var(--gold)" />
                Первый вариант показывается на главной как пример
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {activeCat.options.map((opt, idx) => {
              const isFirst = idx === 0
              const isLast = idx === activeCat.options.length - 1
              const isHero = isFirst
              return (
                <motion.div
                  key={opt.id}
                  layout
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="relative rounded-xl overflow-hidden flex flex-col"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: isHero ? '1px solid rgba(201,150,106,0.32)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isHero ? '0 0 0 2px rgba(201,150,106,0.08)' : 'none',
                  }}
                >
                  {isHero && (
                    <div
                      className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded font-mono uppercase"
                      style={{
                        background: 'rgba(13,11,16,0.78)',
                        border: '1px solid rgba(201,150,106,0.35)',
                        color: 'var(--gold)',
                        fontSize: 9, letterSpacing: '0.16em', backdropFilter: 'blur(6px)',
                      }}
                    >
                      <Star size={9} weight="fill" /> на главной
                    </div>
                  )}

                  <div className="grid grid-cols-2 aspect-[1.6/1]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.beforeExample} alt="before" className="object-cover w-full h-full" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.afterExample} alt="after" className="object-cover w-full h-full" />
                  </div>

                  <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                    <span className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{opt.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => reorderOption(opt, -1)} disabled={isFirst}
                        title="Поднять выше"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isFirst ? 0.3 : 1 }}>
                        <ArrowUp size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button onClick={() => reorderOption(opt, 1)} disabled={isLast}
                        title="Опустить ниже"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isLast ? 0.3 : 1 }}>
                        <ArrowDown size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button onClick={() => startEditOption(opt)} title="Редактировать"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <PencilSimple size={10} color="rgba(255,255,255,0.6)" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {activeCat.options.length === 0 && (
            <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Пока нет вариантов
            </p>
          )}
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingOption && optionDraft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={closeOptionForm}
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
                  Редактировать «{editingOption.label}»
                </h3>
                <button onClick={closeOptionForm}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

              <input
                value={optionDraft.label}
                onChange={(e) => setOptionDraft((d) => d && ({ ...d, label: e.target.value }))}
                placeholder="Название"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <ImageUploader
                  label="ДО"
                  value={optionDraft.before_image_url}
                  onChange={(url) => setOptionDraft((d) => d && ({ ...d, before_image_url: url }))}
                />
                <ImageUploader
                  label="ПОСЛЕ"
                  value={optionDraft.after_image_url}
                  onChange={(url) => setOptionDraft((d) => d && ({ ...d, after_image_url: url }))}
                />
              </div>

              <div className="flex flex-col gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--border-1)' }}>
                <p className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--rose)' }}>
                  Параметры генерации
                </p>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Промпт для AI</span>
                  <textarea
                    value={optionDraft.prompt_text}
                    onChange={(e) => setOptionDraft((d) => d && ({ ...d, prompt_text: e.target.value }))}
                    rows={3}
                    className="rounded-lg px-3 py-2 text-sm resize-none"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  />
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Модель</span>
                    <div className="flex p-0.5 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {([2, 3] as const).map((m) => {
                        const active = optionDraft.ai_model_type === m
                        return (
                          <button key={m} type="button"
                            onClick={() => setOptionDraft((d) => d && ({ ...d, ai_model_type: m }))}
                            className="flex-1 py-1.5 text-xs font-medium rounded-md"
                            style={{
                              background: active ? 'var(--rose-dim)' : 'transparent',
                              border: active ? '1px solid var(--border-rose)' : '1px solid transparent',
                              color: active ? 'var(--rose)' : 'rgba(255,255,255,0.5)',
                            }}>
                            v{m}
                          </button>
                        )
                      })}
                    </div>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Width</span>
                    <input type="number" min={1} max={1024} value={optionDraft.width}
                      onChange={(e) => setOptionDraft((d) => d && ({ ...d, width: Number(e.target.value) || 0 }))}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-mono"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Height</span>
                    <input type="number" min={1} max={1024} value={optionDraft.height}
                      onChange={(e) => setOptionDraft((d) => d && ({ ...d, height: Number(e.target.value) || 0 }))}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-mono"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  </label>
                </div>
              </div>

              <button onClick={handleSaveOption}
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
