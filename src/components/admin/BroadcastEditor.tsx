'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ImageSquare,
  PaperPlaneTilt,
  Plus,
  TrashSimple,
  X,
  PaperPlaneRight,
} from '@phosphor-icons/react'
import {
  createBroadcast,
  listBroadcasts,
  sendTestBroadcast,
  type Broadcast,
  type BroadcastButton,
  type BroadcastStatus,
  type CreateBroadcastPayload,
} from '@/lib/broadcast'
import { uploadImage } from '@/lib/catalog'
import { haptic, hapticNotify } from '@/lib/telegram'

const STATUS_META: Record<BroadcastStatus, { label: string; color: string }> = {
  queued: { label: 'в очереди', color: '#C9966A' },
  sending: { label: 'отправка', color: '#3FD4E0' },
  done: { label: 'готово', color: '#5FD296' },
  failed: { label: 'ошибка', color: '#ff9aae' },
  canceled: { label: 'отменена', color: 'rgba(255,255,255,0.4)' },
}

const isActive = (s: BroadcastStatus) => s === 'queued' || s === 'sending'

export default function BroadcastEditor() {
  const [text, setText] = useState('')
  const [html, setHtml] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [buttons, setButtons] = useState<BroadcastButton[]>([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [history, setHistory] = useState<Broadcast[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function reload() {
    try {
      setHistory(await listBroadcasts())
    } catch {
      /* keep previous */
    }
  }

  useEffect(() => {
    reload()
  }, [])

  useEffect(() => {
    if (!history.some((b) => isActive(b.status))) return
    const t = setInterval(reload, 2500)
    return () => clearInterval(t)
  }, [history])

  function buildPayload(): CreateBroadcastPayload {
    return {
      text: text.trim(),
      parse_mode: html ? 'HTML' : '',
      media_type: mediaUrl ? 'photo' : '',
      media_url: mediaUrl,
      buttons: buttons
        .map((b) => ({ text: b.text.trim(), url: b.url.trim() }))
        .filter((b) => b.text && b.url)
        .map((b) => [b]),
    }
  }

  function validate(p: CreateBroadcastPayload): string | null {
    if (!p.text && !p.media_url) return 'Добавьте текст или изображение'
    for (const row of p.buttons) {
      const b = row[0]
      if (!/^(https?:\/\/|tg:\/\/)/i.test(b.url)) return `Кнопка «${b.text}»: ссылка должна начинаться с http(s):// или tg://`
    }
    return null
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      setMediaUrl(url)
      haptic('light')
    } catch (err) {
      hapticNotify('error')
      setError(err instanceof Error ? err.message : 'Не удалось загрузить изображение')
    } finally {
      setUploading(false)
    }
  }

  function addButton() {
    haptic('light')
    setButtons((prev) => [...prev, { text: '', url: '' }])
  }
  function updateButton(i: number, patch: Partial<BroadcastButton>) {
    setButtons((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  }
  function removeButton(i: number) {
    setButtons((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleTest() {
    const payload = buildPayload()
    const err = validate(payload)
    if (err) {
      setError(err)
      hapticNotify('warning')
      return
    }
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      await sendTestBroadcast(payload)
      hapticNotify('success')
      setNotice('Тест отправлен вам в бот')
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось отправить тест')
    } finally {
      setBusy(false)
    }
  }

  async function handleSend() {
    const payload = buildPayload()
    const err = validate(payload)
    if (err) {
      setError(err)
      hapticNotify('warning')
      return
    }
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      await createBroadcast(payload)
      hapticNotify('success')
      setNotice('Рассылка запущена')
      setText('')
      setMediaUrl('')
      setButtons([])
      setConfirmAll(false)
      await reload()
    } catch (e) {
      hapticNotify('error')
      setError(e instanceof Error ? e.message : 'Не удалось запустить рассылку')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Banner tone="error" onClose={() => setError(null)}>
          {error}
        </Banner>
      )}
      {notice && (
        <Banner tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Banner>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Новое сообщение
          </h3>
          <button
            onClick={() => setHtml((v) => !v)}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: html ? 'var(--rose-dim)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${html ? 'var(--border-rose)' : 'var(--border-1)'}`,
              color: html ? 'var(--rose)' : 'rgba(255,255,255,0.5)',
            }}
          >
            HTML-разметка {html ? 'вкл' : 'выкл'}
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Текст рекламного сообщения…"
          className="w-full resize-y rounded-xl px-3 py-2.5 text-sm"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white',
          }}
        />

        {mediaUrl ? (
          <div className="relative w-full overflow-hidden rounded-xl" style={{ maxHeight: 220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt="" className="w-full object-cover" style={{ maxHeight: 220 }} />
            <button
              onClick={() => setMediaUrl('')}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <X size={13} color="#fff" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.16)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <ImageSquare size={15} weight="fill" />
            {uploading ? 'Загрузка…' : 'Прикрепить изображение'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Кнопки
          </h3>
          <button
            onClick={addButton}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium"
            style={{ background: 'var(--rose-dim)', border: '1px solid var(--border-rose)', color: 'var(--rose)' }}
          >
            <Plus size={11} weight="bold" /> Добавить
          </button>
        </div>
        {buttons.length === 0 && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Без кнопок. Каждая кнопка — отдельной строкой под сообщением.
          </p>
        )}
        {buttons.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={b.text}
              onChange={(e) => updateButton(i, { text: e.target.value })}
              placeholder="Текст"
              className="w-1/3 rounded-lg px-2.5 py-1.5 text-sm"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
            />
            <input
              value={b.url}
              onChange={(e) => updateButton(i, { url: e.target.value })}
              placeholder="https://…"
              inputMode="url"
              className="flex-1 rounded-lg px-2.5 py-1.5 text-sm"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
            />
            <button
              onClick={() => removeButton(i)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}
            >
              <TrashSimple size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </div>
        ))}
      </section>

      <Preview text={text} mediaUrl={mediaUrl} buttons={buttons} />

      <section className="flex flex-col gap-2.5">
        <button
          onClick={handleTest}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-2)',
            color: 'rgba(255,255,255,0.85)',
            opacity: busy ? 0.5 : 1,
          }}
        >
          <PaperPlaneRight size={15} weight="fill" /> Отправить тест себе
        </button>

        <label
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px]"
          style={{ background: 'rgba(201,150,106,0.08)', border: '1px solid rgba(201,150,106,0.22)' }}
        >
          <input type="checkbox" checked={confirmAll} onChange={(e) => setConfirmAll(e.target.checked)} />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>
            Понимаю, что сообщение уйдёт всем пользователям бота
          </span>
        </label>

        <button
          onClick={handleSend}
          disabled={busy || !confirmAll}
          className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold no-tap-highlight"
          style={{
            background: confirmAll ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)' : 'rgba(255,255,255,0.04)',
            color: confirmAll ? '#fff' : 'rgba(255,255,255,0.3)',
            boxShadow: confirmAll ? '0 10px 28px -8px rgba(224,63,106,0.5)' : 'none',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <PaperPlaneTilt size={16} weight="fill" />
          {busy ? 'Отправка…' : 'Запустить рассылку'}
        </button>
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
          История рассылок
        </h3>
        {history.length === 0 && (
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Пока пусто.
          </p>
        )}
        {history.map((b) => (
          <HistoryRow key={b.id} b={b} />
        ))}
      </section>
    </div>
  )
}

function Preview({
  text,
  mediaUrl,
  buttons,
}: {
  text: string
  mediaUrl: string
  buttons: BroadcastButton[]
}) {
  const visibleButtons = buttons.filter((b) => b.text.trim())
  if (!text.trim() && !mediaUrl && visibleButtons.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <span className="text-kicker">предпросмотр</span>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)' }}
      >
        {mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt="" className="w-full object-cover" style={{ maxHeight: 240 }} />
        )}
        {text.trim() && (
          <p
            className="whitespace-pre-wrap px-3.5 py-3 text-[13px]"
            style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.45 }}
          >
            {text}
          </p>
        )}
        {visibleButtons.length > 0 && (
          <div className="flex flex-col gap-1.5 px-3 pb-3">
            {visibleButtons.map((b, i) => (
              <div
                key={i}
                className="rounded-lg py-2 text-center text-[13px] font-medium"
                style={{ background: 'rgba(63,212,224,0.1)', border: '1px solid rgba(63,212,224,0.22)', color: 'var(--splash-cyan)' }}
              >
                {b.text || 'Кнопка'}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HistoryRow({ b }: { b: Broadcast }) {
  const meta = STATUS_META[b.status]
  const processed = b.sent_count + b.failed_count + b.blocked_count
  const pct = b.total_recipients > 0 ? Math.round((processed / b.total_recipients) * 100) : 0
  return (
    <div
      className="flex flex-col gap-2 rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {b.text ? b.text.slice(0, 48) : b.media_type ? '🖼 медиа' : `#${b.id}`}
        </span>
        <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color, transition: 'width 0.3s ease' }} />
      </div>
      <div className="flex items-center gap-3 text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <span style={{ color: '#5fd296' }}>✓ {b.sent_count}</span>
        <span style={{ color: '#ff9aae' }}>✕ {b.failed_count}</span>
        <span>заблок. {b.blocked_count}</span>
        <span className="ml-auto">из {b.total_recipients}</span>
      </div>
      {b.error && (
        <p className="text-[10px]" style={{ color: '#ff9aae' }}>
          {b.error}
        </p>
      )}
    </div>
  )
}

function Banner({
  tone,
  children,
  onClose,
}: {
  tone: 'error' | 'ok'
  children: React.ReactNode
  onClose: () => void
}) {
  const ok = tone === 'ok'
  return (
    <div
      className="flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs"
      style={{
        background: ok ? 'rgba(95,210,150,0.1)' : 'rgba(180,30,60,0.12)',
        border: `1px solid ${ok ? 'rgba(95,210,150,0.28)' : 'rgba(180,30,60,0.22)'}`,
        color: ok ? '#7fe0a8' : '#ff9aae',
      }}
    >
      <span>{children}</span>
      <button onClick={onClose}>
        <X size={12} />
      </button>
    </div>
  )
}
