'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getPhotoCatalogCached,
  PHOTO_FILTER_CATEGORIES,
  type FilterCategory,
  type FilterOption,
} from '@entities/catalog'
import {
  pollGeneration,
  startPhotoGeneration,
  uploadUserPhoto,
  type GenerationState,
} from '@entities/generation'
import { ApiError } from '@shared/api'
import { useUser } from '@entities/user'
import { haptic, hapticNotify, getTelegramUser as getTgUser } from '@shared/lib'

const MODERATION_MESSAGE =
  'Фото не прошло проверку. Похоже, на снимке нет взрослого человека или есть несовершеннолетние. Загрузите чёткое фото взрослого человека.'

const LAST_PHOTO_PREFIX = 'odevator_last_photo:'

function readLastPhoto(tgId?: number): string | null {
  if (!tgId || typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(LAST_PHOTO_PREFIX + tgId)
  } catch {
    return null
  }
}

function writeLastPhoto(tgId: number | undefined, url: string): void {
  if (!tgId || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LAST_PHOTO_PREFIX + tgId, url)
  } catch {}
}

function clearLastPhoto(tgId?: number): void {
  if (!tgId || typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LAST_PHOTO_PREFIX + tgId)
  } catch {}
}

function friendlyGenerateError(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const code =
      e.body && typeof e.body === 'object' && 'error' in e.body
        ? String((e.body as { error: unknown }).error)
        : e.message
    if (e.status === 422 || code === 'moderation_blocked') return MODERATION_MESSAGE
    if (e.status === 503) return 'Сервис временно недоступен. Попробуйте чуть позже.'
    if (e.status === 429) return 'Слишком много запросов. Подождите немного и попробуйте снова.'
    if (e.status === 400) {
      if (code.includes('file_url'))
        return 'Не удалось обработать загруженное фото. Попробуйте другое изображение.'
      return 'Не получилось начать обработку. Проверьте фото и параметры, затем попробуйте снова.'
    }
  }
  return fallback
}

export interface UsePhotoGenerateResult {
  categories: FilterCategory[]
  pickedCategoryId: string | null
  pickedOption: FilterOption | null
  selectInCategory: (categoryId: string, opt: FilterOption) => void

  file: File | null
  preview: string | null
  lastFileUrl: string | null
  setFile: (f: File | null) => void
  clearFile: () => void

  genState: GenerationState
  noCredits: boolean
  resetNoCredits: () => void
  resetGenState: () => void

  busy: boolean
  canGenerate: (allConsented: boolean) => boolean

  generate: (errorTimeout: string, errorFallback: string) => Promise<void>
}

export function usePhotoGenerate(): UsePhotoGenerateResult {
  const { refreshBalance } = useUser()

  const [categories, setCategories] = useState<FilterCategory[]>(PHOTO_FILTER_CATEGORIES)
  const [pickedCategoryId, setPickedCategoryId] = useState<string | null>(null)
  const [pickedOption, setPickedOption] = useState<FilterOption | null>(null)

  const [file, setFileState] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [lastFileUrl, setLastFileUrl] = useState<string | null>(null)
  const [genState, setGenState] = useState<GenerationState>({ phase: 'idle', progress: 0 })
  const [noCredits, setNoCredits] = useState(false)

  useEffect(() => {
    const tg = getTgUser()
    const url = readLastPhoto(tg?.id)
    if (url) {
      setLastFileUrl(url)
      setPreview((prev) => prev ?? url)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getPhotoCatalogCached()
      .then((d) => {
        if (cancelled || !d.categories?.length) return
        setCategories(d.categories)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const setFile = useCallback((f: File | null) => {
    setFileState(f)
    setPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return f ? URL.createObjectURL(f) : null
    })
    setGenState({ phase: 'idle', progress: 0 })
  }, [])

  const clearFile = useCallback(() => {
    setFileState(null)
    setPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setLastFileUrl(null)
    clearLastPhoto(getTgUser()?.id)
    setGenState({ phase: 'idle', progress: 0 })
  }, [])

  const selectInCategory = useCallback((catId: string, opt: FilterOption) => {
    haptic('light')
    setPickedCategoryId(catId)
    setPickedOption(opt)
  }, [])

  const pollUntilDone = useCallback(async (uid: string): Promise<string | null> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await pollGeneration(uid, { wait: true, maxWaitSeconds: 120 })
      if (res.status === 'completed' && res.results?.[0]) return res.results[0]
      if (res.status === 'failed') throw new Error(res.error_message ?? 'Обработка не удалась')
    }
    return null
  }, [])

  const generate = useCallback(
    async (errorTimeout: string, errorFallback: string) => {
      if ((!file && !lastFileUrl) || !pickedOption || !pickedCategoryId) return
      const tg = getTgUser()
      if (!tg) return

      haptic('medium')
      setGenState({ phase: 'uploading', progress: 10 })

      try {
        let fileUrl: string
        if (file) {
          fileUrl = (await uploadUserPhoto(file)).url
          writeLastPhoto(tg.id, fileUrl)
          setLastFileUrl(fileUrl)
        } else {
          fileUrl = lastFileUrl as string
        }
        setGenState({ phase: 'uploading', progress: 35 })

        const { uid } = await startPhotoGeneration({
          file_url: fileUrl,
          category: pickedCategoryId,
          option: pickedOption.id,
          num_images: 1,
        })

        setGenState({ phase: 'processing', progress: 60 })

        const resultUrl = await pollUntilDone(uid)
        if (!resultUrl) {
          setGenState({ phase: 'error', progress: 0, error: errorTimeout })
          return
        }
        setGenState({ phase: 'done', progress: 100, resultUrl })
        void refreshBalance()
      } catch (e) {
        if (e instanceof ApiError && e.status === 402) {
          setNoCredits(true)
          setGenState({ phase: 'idle', progress: 0 })
          hapticNotify('warning')
          return
        }
        hapticNotify('error')
        setGenState({ phase: 'error', progress: 0, error: friendlyGenerateError(e, errorFallback) })
      }
    },
    [file, lastFileUrl, pickedOption, pickedCategoryId, pollUntilDone, refreshBalance],
  )

  const busy = genState.phase === 'uploading' || genState.phase === 'processing'

  const canGenerate = useCallback(
    (allConsented: boolean) =>
      (!!file || !!lastFileUrl) &&
      allConsented &&
      !!pickedOption &&
      !busy &&
      genState.phase !== 'done',
    [file, lastFileUrl, pickedOption, busy, genState.phase],
  )

  return {
    categories,
    pickedCategoryId,
    pickedOption,
    selectInCategory,
    file,
    preview,
    lastFileUrl,
    setFile,
    clearFile,
    genState,
    noCredits,
    resetNoCredits: useCallback(() => setNoCredits(false), []),
    resetGenState: useCallback(() => setGenState({ phase: 'idle', progress: 0 }), []),
    busy,
    canGenerate,
    generate,
  }
}
