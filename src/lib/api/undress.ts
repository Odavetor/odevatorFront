'use client'

import { api } from '../api-client'
import type { CreateTaskPayload, JobSummary, PagedResponse, StartJobResponse, TaskPollResponse } from './types'

export function listJobHistory(params: { limit?: number; before_id?: number } = {}): Promise<PagedResponse<JobSummary>> {
  const qs = new URLSearchParams()
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.before_id) qs.set('before_id', String(params.before_id))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<PagedResponse<JobSummary>>(`/api/v1/undress/history${tail}`)
}

export function startJob(payload: CreateTaskPayload): Promise<StartJobResponse> {
  return api<StartJobResponse>('/api/v1/undress/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function pollJob(uid: string, opts: { wait?: boolean; maxWaitSeconds?: number } = {}): Promise<TaskPollResponse> {
  const qs = new URLSearchParams()
  if (opts.wait) qs.set('wait', 'true')
  if (opts.maxWaitSeconds) qs.set('max_wait_seconds', String(opts.maxWaitSeconds))
  const tail = qs.toString() ? `?${qs.toString()}` : ''
  return api<TaskPollResponse>(`/api/v1/undress/jobs/${encodeURIComponent(uid)}${tail}`)
}
