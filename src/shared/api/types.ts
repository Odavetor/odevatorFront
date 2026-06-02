export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: MeResponse
}

export interface MeResponse {
  id: number
  telegram_user_id: number
  username: string
  first_name: string
  last_name: string
  language_code: string
  referral_code?: string
  referral_deep_link?: string
  referred_by_user_id?: number
  traffic_partner_user_id?: number
  lifetime_generations?: number
  created_at: string
  updated_at: string
  is_admin?: boolean
}

export interface WalletResponse {
  balance_minor: number
  referral_balance_minor: number
  prepaid_generations_remaining: number
  currency: string
  updated_at: string
}

export interface GenerationPackOption {
  quantity: number
  price_minor: number
  currency: string
}
export interface GenerationPackTier {
  id: string
  label: string
  description?: string
  options: GenerationPackOption[]
}
export interface GenerationPackCatalog {
  tiers: GenerationPackTier[]
}

export interface InitPaymentRequest {
  amount: number
  currency?: string
  paymentMethod: number
  description?: string
  payload?: string
}
export interface InitPaymentResponse {
  internal_id: number
  payment_method?: string
  transaction_id?: string
  redirect?: string
  return?: string
  payment_details?: string
  status?: string
  expires_in?: string
  merchant_id?: string
  usdt_rate?: number
}
export interface InitGenerationPackRequest {
  tier: string
  quantity: number
  paymentMethod?: number
}

export const PAYMENT_METHOD = {
  SBP: 2,
  CRYPTO: 13,
} as const
export type PaymentMethodId = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export interface LedgerEntry {
  id: number
  delta_minor: number
  balance_after_minor: number
  wallet_bucket: string
  kind: string
  ref_kind?: string
  ref_id?: number
  meta?: unknown
  created_at: string
}
export interface PaymentTx {
  id: number
  external_id?: string
  status: string
  amount_minor: number
  currency: string
  payment_method: number
  description?: string
  credited_wallet: boolean
  created_at: string
  updated_at: string
}
export interface PagedResponse<T> {
  items: T[]
  next_before_id?: number
}

export interface UploadResponse {
  url: string
}
export interface BackUploadResponse {
  public_url: string
  sha256: string
  size_bytes: number
}

export interface StartPhotoGenerationRequest {
  file_url: string
  category: string
  option: string
  num_images?: number
}
export interface StartGenerationResponse {
  uid: string
  estimated_time?: number
}
export interface PollGenerationResponse {
  uid: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'unknown'
  results?: string[]
  error_message?: string
}

export interface CreateTaskPayload {
  file_url: string
  mask_url?: string
  prompt: string
  num_images: number
  ai_model_type: number
  width: number
  height: number
}
export interface StartJobResponse {
  job_id: number
  uid: string
  estimated_time: number
}
export interface TaskPollResponse {
  uid: string
  status: 'processing' | 'completed' | 'unknown'
  status_code: number
  results?: string[]
  api_message?: string
  api_code?: number
}
export interface JobSummary {
  id: number
  status: string
  request: unknown
  remote_uid?: string
  moderation_reason?: string
  results?: unknown
  error_message?: string
  estimated_time_sec?: number
  remote_status?: number
  price_charged_minor?: number
  created_at: string
  updated_at: string
}
