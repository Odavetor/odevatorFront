'use client'

import { api } from '@shared/api'
import type {
  GenerationPackCatalog,
  InitGenerationPackRequest,
  InitPaymentResponse,
} from '@shared/api'

export function getGenerationPackCatalog(): Promise<GenerationPackCatalog> {
  return api<GenerationPackCatalog>('/api/v1/payments/generation-packs/catalog')
}

export function initGenerationPackPayment(
  payload: InitGenerationPackRequest,
): Promise<InitPaymentResponse> {
  return api<InitPaymentResponse>('/api/v1/payments/generation-packs/init', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
