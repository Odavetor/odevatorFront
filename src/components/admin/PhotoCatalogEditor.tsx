'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PencilSimple,
  X,
  FloppyDisk,
  ArrowUp,
  ArrowDown,
  Star,
  Plus,
  Trash,
} from '@phosphor-icons/react'
import {
  fetchPhotoCatalog,
  updatePhotoOption,
  createPhotoOption,
  deletePhotoOption,
  createPhotoCategory,
  updatePhotoCategory,
  deletePhotoCategory,
} from '@/lib/catalog'
import type { FilterCategory, FilterOption } from '@/data/generate-options'
import { haptic, hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

interface OptionDraft {
  label: string
  label_en: string
  label_de: string
  before_image_url: string | null
  after_image_url: string | null
  prompt_text: string
  ai_model_type: 2 | 3
  width: number
  height: number
  sort_order: number
  description: string
  price_minor: string // строка для удобного ввода; '' = глобальная цена
  // только для create:
  slug?: string
}

interface CategoryDraft {
  label: string
  label_en: string
  label_de: string
  slug: string
  sort_order: number
  description: string
  // numericId: undefined → новая категория
  numericId?: number
}

const emptyOptionDraft = (sortOrder: number): OptionDraft => ({
  label: '',
  label_en: '',
  label_de: '',
  before_image_url: null,
  after_image_url: null,
  prompt_text: '',
  ai_model_type: 3,
  width: 768,
  height: 1024,
  sort_order: sortOrder,
  description: '',
  price_minor: '',
  slug: '',
})

function draftFrom(opt: FilterOption): OptionDraft {
  return {
    label: opt.label,
    label_en: opt.label_en ?? '',
    label_de: opt.label_de ?? '',
    before_image_url: opt.beforeExample,
    after_image_url: opt.afterExample,
    prompt_text: opt.prompt_text ?? '',
    ai_model_type: opt.ai_model_type ?? 3,
    width: opt.width ?? 768,
    height: opt.height ?? 1024,
    sort_order: opt.sort_order ?? 0,
    description: opt.description ?? '',
    price_minor: opt.price_minor != null ? String(opt.price_minor) : '',
  }
}

export default function PhotoCatalogEditor() {
  const [categories, setCategories] = useState<FilterCategory[]>([])
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Option modal: либо редактируем существующую (editingOption set), либо создаём новую (creatingOption=true)
  const [editingOption, setEditingOption] = useState<FilterOption | null>(null)
  const [creatingOption, setCreatingOption] = useState(false)
  const [optionDraft, setOptionDraft] = useState<OptionDraft | null>(null)

  // Category modal: либо редактируем (numericId set), либо создаём новую
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPhotoCatalog()
      setCategories(data.categories)
      if (
        (!activeCatId || !data.categories.find((c) => c.id === activeCatId)) &&
        data.categories.length > 0
      ) {
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

  // ===== Option modal =====

  function startEditOption(opt: FilterOption) {
    setEditingOption(opt)
    setCreatingOption(false)
    setOptionDraft(draftFrom(opt))
  }

  function startCreateOption() {
    if (!activeCat || typeof activeCat.numericId !== 'number') {
      hapticNotify('error')
      setError('Категория без numericId — сначала сохраните её')
      return
    }
    const nextSort = (activeCat.options[activeCat.options.length - 1]?.sort_order ?? 0) + 10
    setEditingOption(null)
    setCreatingOption(true)
    setOptionDraft(emptyOptionDraft(nextSort))
  }

  function closeOptionForm() {
    setEditingOption(null)
    setCreatingOption(false)
    setOptionDraft(null)
  }

  function validateOption(d: OptionDraft, isCreate: boolean): string | null {
    if (!d.label.trim() || !d.before_image_url || !d.after_image_url)
      return 'Заполните название и обе превью'
    if (!d.prompt_text.trim()) return 'Заполните промпт для AI'
    if (d.width < 1 || d.width > 1024 || d.height < 1 || d.height > 1024)
      return 'Width и height должны быть в 1–1024'
    if (isCreate && !d.slug?.trim()) return 'Заполните slug'
    if (
      d.price_minor.trim() !== '' &&
      (Number.isNaN(Number(d.price_minor)) || Number(d.price_minor) < 0)
    ) {
      return 'Цена должна быть числом ≥ 0 или пустой (= глобальная)'
    }
    return null
  }

  async function handleSaveOption() {
    if (!optionDraft) return
    const err = validateOption(optionDraft, creatingOption)
    if (err) {
      hapticNotify('warning')
      setError(err)
      return
    }

    const d = optionDraft
    const basePayload = {
      label: d.label.trim(),
      label_en: d.label_en.trim(),
      label_de: d.label_de.trim(),
      before_image_url: d.before_image_url!,
      after_image_url: d.after_image_url!,
      prompt_text: d.prompt_text.trim(),
      ai_model_type: d.ai_model_type,
      width: d.width,
      height: d.height,
      sort_order: d.sort_order,
      description: d.description.trim(),
      price_minor: d.price_minor.trim() === '' ? null : Number(d.price_minor),
    }

    try {
      if (creatingOption) {
        if (!activeCat?.numericId) throw new Error('Нет numericId категории')
        await createPhotoOption({
          ...basePayload,
          category_id: activeCat.numericId,
          slug: d.slug!.trim(),
        })
      } else {
        if (!editingOption || typeof editingOption.numericId !== 'number') {
          throw new Error('Опция без numericId')
        }
        await updatePhotoOption(editingOption.numericId, basePayload)
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
    if (typeof opt.numericId !== 'number') return
    if (!confirm(`Удалить «${opt.label}»? Это действие можно откатить только в БД.`)) return
    try {
      await deletePhotoOption(opt.numericId)
      hapticNotify('success')
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  // ===== Category CRUD =====

  function startCreateCategory() {
    const nextSort = (categories[categories.length - 1]?.sort_order ?? 0) + 10
    setCategoryDraft({
      slug: '',
      label: '',
      label_en: '',
      label_de: '',
      sort_order: nextSort,
      description: '',
    })
  }

  function startEditCategory(cat: FilterCategory) {
    if (typeof cat.numericId !== 'number') {
      hapticNotify('error')
      setError('Категория без numericId — нельзя редактировать')
      return
    }
    setCategoryDraft({
      numericId: cat.numericId,
      slug: cat.id,
      label: cat.label,
      label_en: cat.label_en ?? '',
      label_de: cat.label_de ?? '',
      sort_order: cat.sort_order ?? 0,
      description: cat.description ?? '',
    })
  }

  async function handleSaveCategory() {
    if (!categoryDraft) return
    const d = categoryDraft
    if (!d.label.trim()) {
      hapticNotify('warning')
      setError('Заполните название категории')
      return
    }
    if (!d.numericId && !d.slug.trim()) {
      hapticNotify('warning')
      setError('Заполните slug')
      return
    }
    try {
      if (d.numericId) {
        await updatePhotoCategory(d.numericId, {
          label: d.label.trim(),
          label_en: d.label_en.trim(),
          label_de: d.label_de.trim(),
          sort_order: d.sort_order,
          description: d.description.trim(),
        })
      } else {
        await createPhotoCategory({
          slug: d.slug.trim(),
          label: d.label.trim(),
          label_en: d.label_en.trim(),
          label_de: d.label_de.trim(),
          sort_order: d.sort_order,
          description: d.description.trim(),
        })
      }
      hapticNotify('success')
      setCategoryDraft(null)
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить категорию')
    }
  }

  async function handleDeleteCategory(cat: FilterCategory) {
    if (typeof cat.numericId !== 'number') return
    if (
      !confirm(
        `Удалить категорию «${cat.label}» и все её варианты? Soft-delete, можно восстановить в БД.`,
      )
    )
      return
    try {
      await deletePhotoCategory(cat.numericId)
      hapticNotify('success')
      if (activeCatId === cat.id) setActiveCatId(null)
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось удалить категорию')
    }
  }

  // Reorder опций — отправляем PATCH с полным объектом и новым sort_order.
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
      description: o.description ?? '',
      price_minor: o.price_minor ?? null,
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
        updatePhotoOption(
          opt.numericId,
          payloadFrom(opt, swap.sort_order ?? (idx + direction) * 10),
        ),
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
        <div
          className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs"
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

      {/* Categories tabs + add button */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const active = cat.id === activeCatId
            return (
              <button
                key={cat.id}
                onClick={() => {
                  haptic('light')
                  setActiveCatId(cat.id)
                }}
                className="flex-shrink-0 rounded-full text-sm font-medium"
                style={{
                  padding: '7px 14px',
                  background: active ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
                  boxShadow: active
                    ? 'inset 0 0 0 1.5px var(--rose)'
                    : 'inset 0 0 0 1px var(--border-2)',
                  color: active ? 'var(--rose)' : 'rgba(255,255,255,0.55)',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => {
            haptic('light')
            startCreateCategory()
          }}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full"
          title="Создать категорию"
          style={{
            padding: '7px 12px',
            background: 'rgba(95,210,150,0.10)',
            border: '1px solid rgba(95,210,150,0.28)',
            color: '#5fd296',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Plus size={12} weight="bold" /> Категория
        </button>
      </div>

      {loading && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Загрузка…
        </p>
      )}

      {activeCat && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Варианты в «{activeCat.label}»
              </h3>
              <p
                className="mt-0.5 flex items-center gap-1 text-[11px] leading-snug"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                <Star size={10} weight="fill" color="var(--gold)" />
                Первый вариант показывается на главной как пример
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <button
                onClick={() => startEditCategory(activeCat)}
                title="Редактировать категорию"
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <PencilSimple size={11} color="rgba(255,255,255,0.6)" />
              </button>
              <button
                onClick={() => handleDeleteCategory(activeCat)}
                title="Удалить категорию"
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: 'rgba(180,30,60,0.12)' }}
              >
                <Trash size={11} color="#ff9aae" />
              </button>
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
                  className="relative flex flex-col overflow-hidden rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: isHero
                      ? '1px solid rgba(201,150,106,0.32)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isHero ? '0 0 0 2px rgba(201,150,106,0.08)' : 'none',
                  }}
                >
                  {isHero && (
                    <div
                      className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded px-1.5 py-0.5 font-mono uppercase"
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

                  <div className="grid aspect-[1.6/1] grid-cols-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={opt.beforeExample}
                      alt="before"
                      className="h-full w-full object-cover"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={opt.afterExample}
                      alt="after"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                    <span
                      className="truncate text-xs font-medium"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                      {opt.label}
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => reorderOption(opt, -1)}
                        disabled={isFirst}
                        title="Поднять выше"
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isFirst ? 0.3 : 1 }}
                      >
                        <ArrowUp size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button
                        onClick={() => reorderOption(opt, 1)}
                        disabled={isLast}
                        title="Опустить ниже"
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: 'rgba(255,255,255,0.06)', opacity: isLast ? 0.3 : 1 }}
                      >
                        <ArrowDown size={10} color="rgba(255,255,255,0.6)" weight="bold" />
                      </button>
                      <button
                        onClick={() => startEditOption(opt)}
                        title="Редактировать"
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <PencilSimple size={10} color="rgba(255,255,255,0.6)" />
                      </button>
                      <button
                        onClick={() => handleDeleteOption(opt)}
                        title="Удалить"
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{ background: 'rgba(180,30,60,0.12)' }}
                      >
                        <Trash size={10} color="#ff9aae" />
                      </button>
                    </div>
                  </div>
                  {opt.price_minor != null && (
                    <div className="-mt-1 px-2.5 pb-2">
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                        style={{
                          background: 'rgba(201,150,106,0.12)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(201,150,106,0.28)',
                        }}
                      >
                        {(opt.price_minor / 100).toFixed(2)} ₽
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* Add option tile */}
            <button
              onClick={() => {
                haptic('light')
                startCreateOption()
              }}
              className="col-span-2 flex aspect-[1.6/1] flex-col items-center justify-center gap-1 rounded-xl"
              style={{
                background: 'rgba(95,210,150,0.06)',
                border: '1px dashed rgba(95,210,150,0.32)',
                color: '#5fd296',
              }}
            >
              <Plus size={18} weight="bold" />
              <span className="text-xs font-medium">Добавить вариант</span>
            </button>
          </div>

          {activeCat.options.length === 0 && (
            <p className="py-3 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Пока нет вариантов
            </p>
          )}
        </div>
      )}

      {!activeCat && !loading && categories.length === 0 && (
        <p className="py-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Нет категорий — создайте первую через кнопку выше
        </p>
      )}

      {/* Option modal (create/edit) */}
      <AnimatePresence>
        {optionDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={closeOptionForm}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl p-5"
              style={{
                background: '#15141a',
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: '90dvh',
                overflowY: 'auto',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'white' }}>
                  {creatingOption
                    ? 'Новый вариант'
                    : `Редактировать «${editingOption?.label ?? ''}»`}
                </h3>
                <button
                  onClick={closeOptionForm}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X size={14} color="white" />
                </button>
              </div>

              {creatingOption && (
                <input
                  value={optionDraft.slug ?? ''}
                  onChange={(e) => setOptionDraft((d) => d && { ...d, slug: e.target.value })}
                  placeholder="slug (латиница, без пробелов)"
                  className="rounded-lg px-3 py-2 font-mono text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
              )}

              <input
                value={optionDraft.label}
                onChange={(e) => setOptionDraft((d) => d && { ...d, label: e.target.value })}
                placeholder="Название (RU)"
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={optionDraft.label_en}
                  onChange={(e) => setOptionDraft((d) => d && { ...d, label_en: e.target.value })}
                  placeholder="Label (EN)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <input
                  value={optionDraft.label_de}
                  onChange={(e) => setOptionDraft((d) => d && { ...d, label_de: e.target.value })}
                  placeholder="Label (DE)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
              </div>

              <textarea
                value={optionDraft.description}
                onChange={(e) => setOptionDraft((d) => d && { ...d, description: e.target.value })}
                placeholder="Описание (опционально)"
                rows={2}
                className="resize-none rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <ImageUploader
                  label="ДО"
                  value={optionDraft.before_image_url}
                  onChange={(url) => setOptionDraft((d) => d && { ...d, before_image_url: url })}
                />
                <ImageUploader
                  label="ПОСЛЕ"
                  value={optionDraft.after_image_url}
                  onChange={(url) => setOptionDraft((d) => d && { ...d, after_image_url: url })}
                />
              </div>

              <div
                className="mt-1 flex flex-col gap-2 pt-3"
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
                      setOptionDraft((d) => d && { ...d, prompt_text: e.target.value })
                    }
                    rows={3}
                    className="resize-none rounded-lg px-3 py-2 text-sm"
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
                      className="flex rounded-lg p-0.5"
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
                            onClick={() => setOptionDraft((d) => d && { ...d, ai_model_type: m })}
                            className="flex-1 rounded-md py-1.5 text-xs font-medium"
                            style={{
                              background: active ? 'var(--rose-dim)' : 'transparent',
                              border: active
                                ? '1px solid var(--border-rose)'
                                : '1px solid transparent',
                              color: active ? 'var(--rose)' : 'rgba(255,255,255,0.5)',
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
                        setOptionDraft((d) => d && { ...d, width: Number(e.target.value) || 0 })
                      }
                      className="rounded-lg px-2.5 py-1.5 font-mono text-sm"
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
                        setOptionDraft((d) => d && { ...d, height: Number(e.target.value) || 0 })
                      }
                      className="rounded-lg px-2.5 py-1.5 font-mono text-sm"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white',
                      }}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Цена в копейках (пусто = глобальная)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={optionDraft.price_minor}
                    onChange={(e) =>
                      setOptionDraft((d) => d && { ...d, price_minor: e.target.value })
                    }
                    placeholder="напр. 4900 = 49 ₽"
                    className="rounded-lg px-3 py-1.5 font-mono text-sm"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'white',
                    }}
                  />
                </label>
              </div>

              <button
                onClick={handleSaveOption}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
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

      {/* Category modal */}
      <AnimatePresence>
        {categoryDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setCategoryDraft(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-[430px] flex-col gap-3 rounded-t-3xl p-5"
              style={{
                background: '#15141a',
                border: '1px solid rgba(255,255,255,0.08)',
                maxHeight: '90dvh',
                overflowY: 'auto',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'white' }}>
                  {categoryDraft.numericId ? 'Редактировать категорию' : 'Новая категория'}
                </h3>
                <button
                  onClick={() => setCategoryDraft(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X size={14} color="white" />
                </button>
              </div>

              {!categoryDraft.numericId && (
                <input
                  value={categoryDraft.slug}
                  onChange={(e) => setCategoryDraft((d) => d && { ...d, slug: e.target.value })}
                  placeholder="slug (латиница, без пробелов)"
                  className="rounded-lg px-3 py-2 font-mono text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
              )}

              <input
                value={categoryDraft.label}
                onChange={(e) => setCategoryDraft((d) => d && { ...d, label: e.target.value })}
                placeholder="Название RU (видно пользователю)"
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={categoryDraft.label_en}
                  onChange={(e) => setCategoryDraft((d) => d && { ...d, label_en: e.target.value })}
                  placeholder="Label (EN)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
                <input
                  value={categoryDraft.label_de}
                  onChange={(e) => setCategoryDraft((d) => d && { ...d, label_de: e.target.value })}
                  placeholder="Label (DE)"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
              </div>

              <textarea
                value={categoryDraft.description}
                onChange={(e) =>
                  setCategoryDraft((d) => d && { ...d, description: e.target.value })
                }
                placeholder="Описание (опционально)"
                rows={2}
                className="resize-none rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
              />

              <label className="flex flex-col gap-1">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Sort order
                </span>
                <input
                  type="number"
                  value={categoryDraft.sort_order}
                  onChange={(e) =>
                    setCategoryDraft((d) => d && { ...d, sort_order: Number(e.target.value) || 0 })
                  }
                  className="rounded-lg px-3 py-1.5 font-mono text-sm"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                  }}
                />
              </label>

              <button
                onClick={handleSaveCategory}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
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
