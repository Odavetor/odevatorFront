'use client'

import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { fmtRub } from '@entities/pack'
import type { ReferralPerson } from '@/lib/referral'
import { anonName, shortDate } from '../lib/format'

const COLLAPSED = 5

export function ReferralPeople({ people }: { people: ReferralPerson[] }) {
  const [expanded, setExpanded] = useState(false)
  if (people.length === 0) return null

  const shown = expanded ? people : people.slice(0, COLLAPSED)

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-kicker">мои рефералы</span>
        <span className="text-[11px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {people.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {shown.map((p) => (
          <div
            key={p.user_id}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
              style={{
                background: p.has_paid ? 'rgba(95,210,150,0.16)' : 'rgba(255,255,255,0.06)',
                color: p.has_paid ? '#5FD296' : 'rgba(255,255,255,0.5)',
              }}
            >
              {anonName(p.user_id).charAt(0)}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {anonName(p.user_id)}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                с {shortDate(p.joined_at)}
                {p.has_paid ? '' : ' · ещё не платил'}
              </span>
            </div>
            <span
              className="font-sans text-[14px] font-bold tabular-nums"
              style={{ color: p.earned_minor > 0 ? 'var(--text)' : 'rgba(255,255,255,0.3)' }}
            >
              {p.earned_minor > 0 ? `${fmtRub(p.earned_minor)} ₽` : '—'}
            </span>
          </div>
        ))}
      </div>
      {people.length > COLLAPSED && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="no-tap-highlight flex items-center justify-center gap-1.5 py-1.5 text-[12px]"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {expanded ? 'Свернуть' : `Показать всех (${people.length})`}
          <CaretDown
            size={12}
            weight="bold"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      )}
    </section>
  )
}
