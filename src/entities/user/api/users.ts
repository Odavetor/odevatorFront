'use client'

import { api } from '@shared/api'
import type { MeResponse } from '@shared/api'

export function getMe(): Promise<MeResponse> {
  return api<MeResponse>('/api/v1/users/me')
}
