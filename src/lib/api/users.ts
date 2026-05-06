'use client'

import { api } from '../api-client'
import type { MeResponse } from './types'

export function getMe(): Promise<MeResponse> {
  return api<MeResponse>('/api/v1/users/me')
}
