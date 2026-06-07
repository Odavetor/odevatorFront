'use client'

import { api } from '@shared/api'

export type ReviewKind = 'user' | 'referrer'

export interface Review {
  id: number
  rating: number
  body: string
  created_at: string
  archived_at?: string
  user_id?: number
  username?: string
  telegram_id?: number
}

export interface ReviewStats {
  count: number
  average: number
}

export function submitReview(kind: ReviewKind, rating: number, body: string): Promise<Review> {
  return api<Review>(`/api/v1/reviews/${kind}`, {
    method: 'POST',
    body: JSON.stringify({ rating, body }),
  })
}

interface ReviewListResponse {
  items: Review[]
}

export async function listReviews(kind: ReviewKind, includeArchived: boolean): Promise<Review[]> {
  const r = await api<ReviewListResponse>(
    `/api/v1/admin/reviews/${kind}${includeArchived ? '?archived=1' : ''}`,
  )
  return r.items ?? []
}

export function fetchReviewStats(kind: ReviewKind): Promise<ReviewStats> {
  return api<ReviewStats>(`/api/v1/admin/reviews/${kind}/stats`)
}

export function archiveReview(kind: ReviewKind, id: number): Promise<void> {
  return api(`/api/v1/admin/reviews/${kind}/${id}/archive`, { method: 'POST' })
}

export function restoreReview(kind: ReviewKind, id: number): Promise<void> {
  return api(`/api/v1/admin/reviews/${kind}/${id}/restore`, { method: 'POST' })
}

export function deleteReview(kind: ReviewKind, id: number): Promise<void> {
  return api(`/api/v1/admin/reviews/${kind}/${id}`, { method: 'DELETE' })
}
