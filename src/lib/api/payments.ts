'use client'

import { api } from '../api-client'
import type {
  GenerationPackCatalog,
  InitGenerationPackRequest,
  InitPaymentRequest,
  InitPaymentResponse,
} from './types'

export function getGenerationPackCatalog(): Promise<GenerationPackCatalog> {
  return api<GenerationPackCatalog>('/api/v1/payments/generation-packs/catalog')
}

export function initPayment(payload: InitPaymentRequest): Promise<InitPaymentResponse> {
  return api<InitPaymentResponse>('/api/v1/payments/init', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function initGenerationPackPayment(payload: InitGenerationPackRequest): Promise<InitPaymentResponse> {
  return api<InitPaymentResponse>('/api/v1/payments/generation-packs/init', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
