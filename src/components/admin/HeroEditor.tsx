'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  FloppyDisk,
  ImageSquare,
  Info,
  PencilSimple,
  Star,
  X,
} from '@phosphor-icons/react'
import { fetchPhotoCatalog, updatePhotoOption } from '@/lib/catalog'
import type { FilterCategory, FilterOption } from '@/data/generate-options'
import { PHOTO_FILTER_CATEGORIES } from '@/data/generate-options'
import { haptic, hapticNotify } from '@/lib/telegram'
import ImageUploader from './ImageUploader'

interface SlotDraft {
  label: string
  before: string | null
  after: string | null
}

export default function HeroEditor() {
  const [categories, setCategories] = useState<FilterCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [draft, setDraft] = useState<SlotDraft>({ label: '', before: null, after: null })
  const [saving, setSaving] = useState(false)
  // true когда бэк не отдал каталог и мы рисуем дефолты из generate-options.ts
  const [usingFallback, setUsingFallback] = useState(false)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPhotoCatalog()
      if (data.categories?.length) {
        setCategories(data.categories)
        setUsingFallback(false)
      } else {
        // Бэк ответил, но пусто — показываем дефолты, чтобы юзер видел, что сейчас на главной
        setCategories(PHOTO_FILTER_CATEGORIES)
        setUsingFallback(true)
      }
    } catch (e) {
      // Бэк недоступен — фолбэк на хардкод-каталог (то же, что использует главная)
      setCategories(PHOTO_FILTER_CATEGORIES)
      setUsingFallback(true)
      // Не показываем error — это ожидаемо в dev без бэка. Только если save упадёт.
      void e
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  function startEdit(cat: FilterCategory, opt: FilterOption) {
    setEditingCatId(cat.id)
    setDraft({
      label: opt.label,
      before: opt.beforeExample,
      after: opt.afterExample,
    })
  }

  function cancelEdit() {
    setEditingCatId(null)
    setDraft({ label: '', before: null, after: null })
  }

  async function save(opt: FilterOption) {
    if (!draft.label.trim() || !draft.before || !draft.after) {
      hapticNotify('warning')
      setError('Заполни название и обе превью')
      return
    }
    if (typeof opt.numericId !== 'number') {
      hapticNotify('error')
      setError('Эта опция — локальный фолбэк, на бэке её нет. Поднимите бэкенд.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      // Бэк PATCH /admin/catalog/photo/options/{id} перезаписывает все поля,
      // partial-апдейтов нет → передаём весь объект.
      await updatePhotoOption(opt.numericId, {
        label: draft.label.trim(),
        before_image_url: draft.before,
        after_image_url: draft.after,
        prompt_text: opt.prompt_text ?? '',
        ai_model_type: opt.ai_model_type ?? 3,
        width: opt.width ?? 768,
        height: opt.height ?? 1024,
        sort_order: opt.sort_order ?? 0,
      })
      hapticNotify('success')
      cancelEdit()
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Помощь — что вообще тут происходит */}
      <div
        className="rounded-2xl px-3.5 py-3 flex items-start gap-2.5"
        style={{
          background: 'rgba(201,150,106,0.08)',
          border: '1px solid rgba(201,150,106,0.22)',
        }}
      >
        <Info size={14} weight="fill" color="var(--gold)" className="flex-shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          На главной странице показывается слайдер с примерами «до/после» — по одному
          на каждую категорию фильтров. Здесь редактируешь, что именно там видят.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.42)' }}>
            Технически это первый вариант каждой категории. Все остальные варианты —
            в табе{' '}
          </span>
          <Link
            href="#photo"
            onClick={(e) => {
              e.preventDefault()
              haptic('light')
              window.dispatchEvent(new CustomEvent('velvet:admin:goto', { detail: 'Фото' }))
            }}
            style={{ color: 'var(--rose)', borderBottom: '1px solid var(--rose)' }}
          >
            «Фото»
          </Link>
          .
        </div>
      </div>

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

      {usingFallback && !loading && (
        <div
          className="rounded-xl px-3 py-2 text-[11px] leading-snug flex items-start gap-2"
          style={{
            background: 'rgba(255,170,0,0.08)',
            border: '1px solid rgba(255,170,0,0.22)',
            color: '#ffb957',
          }}
        >
          <Info size={12} weight="fill" className="flex-shrink-0 mt-0.5" />
          <span>
            Бэкенд недоступен — это локальные дефолты из{' '}
            <code style={{ color: '#fff' }}>src/data/generate-options.ts</code>. Изменения
            не сохранятся пока не поднят сервер по{' '}
            <code style={{ color: '#fff' }}>NEXT_PUBLIC_API_BASE_URL</code>.
          </span>
        </div>
      )}

      {loading && (
        <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Загрузка…
        </p>
      )}

      {!loading && categories.length === 0 && (
        <div
          className="rounded-2xl p-6 text-center flex flex-col items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--border-rose)',
          }}
        >
          <ImageSquare size={28} color="var(--rose)" weight="duotone" />
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            Категорий пока нет
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Добавь их в табе «Фото», и сюда сразу подтянутся слоты.
          </p>
        </div>
      )}

      {/* Слоты hero — по одному на категорию */}
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const heroOpt = cat.options[0]
          const isEditing = editingCatId === cat.id

          if (!heroOpt) {
            return <EmptySlot key={cat.id} category={cat} />
          }

          return (
            <motion.section
              key={cat.id}
              layout
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: isEditing
                  ? '1px solid var(--border-rose)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isEditing ? '0 0 0 2px rgba(224,63,106,0.12)' : 'none',
              }}
            >
              {/* Заголовок слота */}
              <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-b"
                   style={{ borderColor: 'var(--border-1)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono uppercase flex-shrink-0"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.16em',
                      background: 'rgba(201,150,106,0.16)',
                      border: '1px solid rgba(201,150,106,0.28)',
                      color: 'var(--gold)',
                    }}
                  >
                    <Star size={9} weight="fill" /> {cat.label}
                  </span>
                  <span
                    className="text-[12px] font-medium truncate"
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {heroOpt.label}
                  </span>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => {
                      haptic('light')
                      startEdit(cat, heroOpt)
                    }}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 flex-shrink-0"
                    style={{
                      background: 'var(--rose-dim)',
                      border: '1px solid var(--border-rose)',
                      color: 'var(--rose)',
                    }}
                  >
                    <PencilSimple size={10} weight="bold" /> Заменить
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-2 aspect-[1.6/1]"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroOpt.beforeExample} alt="до" className="object-cover w-full h-full" />
                      <span
                        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-mono uppercase"
                        style={{
                          fontSize: 8,
                          letterSpacing: '0.2em',
                          background: 'rgba(255,255,255,0.92)',
                          color: 'rgba(13,11,16,0.92)',
                        }}
                      >
                        до
                      </span>
                    </div>
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroOpt.afterExample} alt="после" className="object-cover w-full h-full" />
                      <span
                        className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded font-mono uppercase"
                        style={{
                          fontSize: 8,
                          letterSpacing: '0.2em',
                          background: 'var(--rose)',
                          color: '#fff',
                        }}
                      >
                        после
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 flex flex-col gap-3">
                      <input
                        value={draft.label}
                        onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                        placeholder="Название (напр. «Бикини»)"
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'white',
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <ImageUploader
                          label="ДО"
                          value={draft.before}
                          onChange={(url) => setDraft((d) => ({ ...d, before: url }))}
                        />
                        <ImageUploader
                          label="ПОСЛЕ"
                          value={draft.after}
                          onChange={(url) => setDraft((d) => ({ ...d, after: url }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEdit}
                          className="flex-1 rounded-xl py-2.5 text-sm"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.6)',
                          }}
                        >
                          Отмена
                        </button>
                        <button
                          onClick={() => save(heroOpt)}
                          disabled={saving}
                          className="flex-1 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1.5"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)',
                            color: '#fff',
                            boxShadow:
                              'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 18px rgba(224,63,106,0.28)',
                            opacity: saving ? 0.7 : 1,
                          }}
                        >
                          <FloppyDisk size={13} weight="fill" />
                          {saving ? 'Сохраняю…' : 'Сохранить'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}

function EmptySlot({ category }: { category: FilterCategory }) {
  return (
    <section
      className="rounded-2xl p-3 flex items-center justify-between gap-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px dashed var(--border-rose)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="px-1.5 py-0.5 rounded font-mono uppercase flex-shrink-0"
          style={{
            fontSize: 9,
            letterSpacing: '0.16em',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-1)',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          {category.label}
        </span>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Нет ни одного варианта
        </p>
      </div>
      <button
        onClick={() => {
          haptic('light')
          window.dispatchEvent(new CustomEvent('velvet:admin:goto', { detail: 'Фото' }))
        }}
        className="text-[11px] font-medium inline-flex items-center gap-1 flex-shrink-0"
        style={{ color: 'var(--rose)', borderBottom: '1px solid var(--rose)', paddingBottom: 1 }}
      >
        В каталог <ArrowRight size={10} weight="bold" />
      </button>
    </section>
  )
}
