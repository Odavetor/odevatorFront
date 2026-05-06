'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PencilSimple, Trash, X, FloppyDisk, ArrowUp, ArrowDown, Star } from '@phosphor-icons/react'
import {
  fetchPhotoCatalog,
  createPhotoCategory,
  updatePhotoCategory,
  deletePhotoCategory,
  createPhotoOption,
  updatePhotoOption,
  deletePhotoOption,
} from '@/lib/catalog'
import type { FilterCategory, FilterOption } from '@/data/generate-options'
import { haptic, hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

interface OptionDraft {
  slug: string
  label: string
  before_image_url: string | null
  after_image_url: string | null
  // Промпт + параметры провайдера. Дефолты — sane для most cases.
  prompt_text: string
  ai_model_type: 2 | 3
  width: number
  height: number
}

const EMPTY_OPTION: OptionDraft = {
  slug: '',
  label: '',
  before_image_url: null,
  after_image_url: null,
  prompt_text: '',
  ai_model_type: 3,
  width: 768,
  height: 1024,
}

export default function PhotoCatalogEditor() {
  const [categories, setCategories] = useState<FilterCategory[]>([])
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // forms
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [editingOption, setEditingOption] = useState<FilterOption | null>(null)
  const [showOptionForm, setShowOptionForm] = useState(false)
  const [optionDraft, setOptionDraft] = useState<OptionDraft>(EMPTY_OPTION)

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

  async function handleAddCategory() {
    if (!newCatLabel.trim() || !newCatSlug.trim()) return
    try {
      await createPhotoCategory({ slug: newCatSlug.trim(), label: newCatLabel.trim() })
      setNewCatLabel('')
      setNewCatSlug('')
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось создать категорию')
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Удалить категорию со всеми вариантами?')) return
    try {
      await deletePhotoCategory(id)
      if (activeCatId === id) setActiveCatId(null)
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  async function handleRenameCategory(cat: FilterCategory) {
    const next = prompt('Новое название:', cat.label)
    if (!next || next === cat.label) return
    try {
      await updatePhotoCategory(cat.id, { label: next })
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось обновить')
    }
  }

  function startNewOption() {
    setEditingOption(null)
    setOptionDraft(EMPTY_OPTION)
    setShowOptionForm(true)
  }

  function startEditOption(opt: FilterOption) {
    setEditingOption(opt)
    setOptionDraft({
      slug: opt.id,
      label: opt.label,
      before_image_url: opt.beforeExample,
      after_image_url: opt.afterExample,
      prompt_text: opt.prompt_text ?? '',
      ai_model_type: opt.ai_model_type ?? 3,
      width: opt.width ?? 768,
      height: opt.height ?? 1024,
    })
    setShowOptionForm(true)
  }

  function closeOptionForm() {
    setShowOptionForm(false)
    setEditingOption(null)
    setOptionDraft(EMPTY_OPTION)
  }

  async function handleSaveOption() {
    if (!activeCat) return
    const {
      slug, label, before_image_url, after_image_url,
      prompt_text, ai_model_type, width, height,
    } = optionDraft
    if (!label.trim() || !before_image_url || !after_image_url) {
      hapticNotify('warning')
      setError('Заполните название и обе превью')
      return
    }
    if (!prompt_text.trim()) {
      hapticNotify('warning')
      setError('Заполните промпт для AI')
      return
    }
    if (width < 1 || width > 1024 || height < 1 || height > 1024) {
      hapticNotify('warning')
      setError('Width и height должны быть в диапазоне 1–1024')
      return
    }
    try {
      const params = {
        prompt_text: prompt_text.trim(),
        ai_model_type,
        width,
        height,
      }
      if (editingOption) {
        await updatePhotoOption(editingOption.id, {
          label: label.trim(),
          before_image_url,
          after_image_url,
          ...params,
        })
      } else {
        if (!slug.trim()) {
          hapticNotify('warning')
          setError('Slug обязателен')
          return
        }
        await createPhotoOption(activeCat.id, {
          slug: slug.trim(),
          label: label.trim(),
          before_image_url,
          after_image_url,
          ...params,
        })
      }
      hapticNotify('success')
      closeOptionForm()
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    }
  }

  async function handleDeleteOption(opt: FilterOption) {
    if (!confirm(`Удалить «${opt.label}»?`)) return
    try {
      await deletePhotoOption(opt.id)
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  // Reorder опций: меняем местами sort_order двух соседей.
  // Первый по sort_order вариант каждой категории показывается на главной как hero.
  async function reorderOption(opt: FilterOption, direction: -1 | 1) {
    if (!activeCat) return
    const idx = activeCat.options.findIndex((o) => o.id === opt.id)
    const swap = activeCat.options[idx + direction]
    if (!swap) return
    try {
      await Promise.all([
        updatePhotoOption(opt.id, { sort_order: (idx + direction) * 10 }),
        updatePhotoOption(swap.id, { sort_order: idx * 10 }),
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

      {/* Add category */}
      <div className="rounded-2xl p-3 flex flex-col gap-2"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Новая категория
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            placeholder="slug (напр. background)"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
          />
          <input
            value={newCatLabel}
            onChange={(e) => setNewCatLabel(e.target.value)}
            placeholder="Название"
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
          />
        </div>
        <button
          onClick={handleAddCategory}
          disabled={!newCatLabel.trim() || !newCatSlug.trim()}
          className="rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-1.5"
          style={{
            background: 'var(--rose-dim)', border: '1px solid var(--border-rose)', color: 'var(--rose)',
            opacity: !newCatLabel.trim() || !newCatSlug.trim() ? 0.45 : 1,
          }}
        >
          <Plus size={14} weight="bold" /> Добавить категорию
        </button>
      </div>

      {/* Categories tabs */}
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const active = cat.id === activeCatId
          return (
            <div key={cat.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { haptic('light'); setActiveCatId(cat.id) }}
                className="rounded-full text-sm font-medium"
                style={{
                  padding: '7px 14px',
                  background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                  boxShadow: active ? 'inset 0 0 0 1.5px var(--rose)' : 'inset 0 0 0 1px var(--border-2)',
                  color: active ? 'var(--rose)' : 'rgba(255,255,255,0.55)',
                }}
              >
                {cat.label}
              </button>
              {active && (
                <>
                  <button onClick={() => handleRenameCategory(cat)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <PencilSimple size={12} color="rgba(255,255,255,0.6)" />
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(180,30,60,0.15)', border: '1px solid rgba(180,30,60,0.3)' }}>
                    <Trash size={12} color="#ff8aa0" />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {loading && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Загрузка…</p>}

      {/* Active category options */}
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
            <button
              onClick={startNewOption}
              className="rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 flex-shrink-0"
              style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)', color: 'var(--rose)' }}
            >
              <Plus size={12} weight="bold" /> Добавить
            </button>
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
                  {/* Hero-бейдж */}
                  {isHero && (
                    <div
                      className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded font-mono uppercase"
                      style={{
                        background: 'rgba(13,11,16,0.78)',
                        border: '1px solid rgba(201,150,106,0.35)',
                        color: 'var(--gold)',
                        fontSize: 9,
                        letterSpacing: '0.16em',
                        backdropFilter: 'blur(6px)',
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
                      <button
                        onClick={() => reorderOption(opt, -1)}
                        disabled={isFirst}
                        title="Поднять выше"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isFirst ? 0.3 : 1 }}>
                        <ArrowUp size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button
                        onClick={() => reorderOption(opt, 1)}
                        disabled={isLast}
                        title="Опустить ниже"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isLast ? 0.3 : 1 }}>
                        <ArrowDown size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button onClick={() => startEditOption(opt)}
                        title="Редактировать"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <PencilSimple size={10} color="rgba(255,255,255,0.6)" />
                      </button>
                      <button onClick={() => handleDeleteOption(opt)}
                        title="Удалить"
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: 'rgba(180,30,60,0.15)' }}>
                        <Trash size={10} color="#ff8aa0" />
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

      {/* Option form modal */}
      <AnimatePresence>
        {showOptionForm && (
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
                  {editingOption ? 'Редактировать вариант' : 'Новый вариант'}
                </h3>
                <button onClick={closeOptionForm}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

              {!editingOption && (
                <input
                  value={optionDraft.slug}
                  onChange={(e) => setOptionDraft((d) => ({ ...d, slug: e.target.value }))}
                  placeholder="slug (напр. forest)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                />
              )}
              <input
                value={optionDraft.label}
                onChange={(e) => setOptionDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="Название (напр. Лес)"
                className="rounded-lg px-3 py-2 text-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <ImageUploader
                  label="ДО"
                  value={optionDraft.before_image_url}
                  onChange={(url) => setOptionDraft((d) => ({ ...d, before_image_url: url }))}
                />
                <ImageUploader
                  label="ПОСЛЕ"
                  value={optionDraft.after_image_url}
                  onChange={(url) => setOptionDraft((d) => ({ ...d, after_image_url: url }))}
                />
              </div>

              {/* Параметры для AI-провайдера. Бэк подставит их в CreateTaskPayload. */}
              <div
                className="flex flex-col gap-2 pt-3 mt-1"
                style={{ borderTop: '1px solid var(--border-1)' }}
              >
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--rose)' }}
                >
                  Параметры генерации
                </p>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Промпт для AI
                  </span>
                  <textarea
                    value={optionDraft.prompt_text}
                    onChange={(e) =>
                      setOptionDraft((d) => ({ ...d, prompt_text: e.target.value }))
                    }
                    placeholder="напр. wearing a black bikini, on a beach"
                    rows={3}
                    className="rounded-lg px-3 py-2 text-sm resize-none"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'white',
                    }}
                  />
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Модель
                    </span>
                    <div
                      className="flex p-0.5 rounded-lg"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {([2, 3] as const).map((m) => {
                        const active = optionDraft.ai_model_type === m
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setOptionDraft((d) => ({ ...d, ai_model_type: m }))}
                            className="flex-1 py-1.5 text-xs font-medium rounded-md"
                            style={{
                              background: active ? 'var(--rose-dim)' : 'transparent',
                              border: active ? '1px solid var(--border-rose)' : '1px solid transparent',
                              color: active ? 'var(--rose)' : 'rgba(255,255,255,0.5)',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            v{m}
                          </button>
                        )
                      })}
                    </div>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Width
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={1024}
                      value={optionDraft.width}
                      onChange={(e) =>
                        setOptionDraft((d) => ({ ...d, width: Number(e.target.value) || 0 }))
                      }
                      className="rounded-lg px-2.5 py-1.5 text-sm font-mono"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                      }}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Height
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={1024}
                      value={optionDraft.height}
                      onChange={(e) =>
                        setOptionDraft((d) => ({ ...d, height: Number(e.target.value) || 0 }))
                      }
                      className="rounded-lg px-2.5 py-1.5 text-sm font-mono"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                      }}
                    />
                  </label>
                </div>
                <p
                  className="text-[10px]"
                  style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}
                >
                  Эти параметры бэк подставит в запрос к AI-провайдеру. Размеры — до 1024.
                </p>
              </div>

              <button
                onClick={handleSaveOption}
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
