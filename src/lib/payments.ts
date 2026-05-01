export async function createCryptoBotInvoice(
  amountRub: number,
  userId: number,
): Promise<{ invoiceUrl: string; invoiceId: number } | null> {
  const token = process.env.CRYPTO_BOT_TOKEN
  if (!token) return null

  let usdtAmount: number
  try {
    const rateRes = await fetch('https://pay.crypt.bot/api/getExchangeRates', {
      headers: { 'Crypto-Pay-API-Token': token },
    })
    const rateData = await rateRes.json()
    if (rateData.ok) {
      const rate = rateData.result?.find(
        (r: { source: string; target: string; rate: string }) =>
          r.source === 'USDT' && r.target === 'RUB',
      )
      const rubPerUsdt = rate ? parseFloat(rate.rate) : 95
      usdtAmount = Math.max(0.01, Math.round((amountRub / rubPerUsdt) * 100) / 100)
    } else {
      usdtAmount = Math.max(0.01, Math.round((amountRub / 95) * 100) / 100)
    }
  } catch {
    usdtAmount = Math.max(0.01, Math.round((amountRub / 95) * 100) / 100)
  }

  const res = await fetch('https://pay.crypt.bot/api/createInvoice', {
    method: 'POST',
    headers: {
      'Crypto-Pay-API-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      asset: 'USDT',
      amount: String(usdtAmount),
      description: `Пополнение на ${Math.round(amountRub)} ₽`,
      payload: `${userId}:${amountRub}`,
    }),
  })

  const data = await res.json()
  if (!data.ok) return null
  return {
    invoiceUrl: data.result.pay_url as string,
    invoiceId: data.result.invoice_id as number,
  }
}

export async function checkCryptoBotInvoice(
  invoiceId: number,
): Promise<'paid' | 'pending' | 'error'> {
  const token = process.env.CRYPTO_BOT_TOKEN
  if (!token) return 'error'

  try {
    const res = await fetch(
      `https://pay.crypt.bot/api/getInvoices?invoice_ids=${invoiceId}`,
      { headers: { 'Crypto-Pay-API-Token': token } },
    )
    const data = await res.json()
    if (!data.ok) return 'error'
    const invoice = data.result?.items?.[0]
    if (!invoice) return 'error'
    return invoice.status === 'paid' ? 'paid' : 'pending'
  } catch {
    return 'error'
  }
}

// payment_method: 2 = SBP, 13 = Crypto
export async function createPlategaInvoice(
  amountRub: number,
  paymentMethod: 2 | 13,
  userId: number,
  returnUrl: string,
): Promise<{ invoiceUrl: string; transactionId: string } | null> {
  const apiUrl = process.env.PLATEGA_API_URL ?? 'https://app.platega.io'
  const merchantId = process.env.PLATEGA_MERCHANT_ID ?? ''
  const secret = process.env.PLATEGA_SECRET ?? ''

  try {
    const res = await fetch(`${apiUrl}/transaction/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MerchantId': merchantId,
        'X-Secret': secret,
      },
      body: JSON.stringify({
        paymentMethod,
        paymentDetails: { amount: amountRub, currency: 'RUB' },
        description: `Пополнение на ${Math.round(amountRub)} ₽`,
        return: returnUrl,
        failedUrl: returnUrl,
        payload: `${userId}:${amountRub}`,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.transactionId) return null
    return { invoiceUrl: data.redirect ?? '', transactionId: String(data.transactionId) }
  } catch {
    return null
  }
}

export async function checkPlategaTransaction(
  transactionId: string,
): Promise<'paid' | 'pending' | 'error'> {
  const apiUrl = process.env.PLATEGA_API_URL ?? 'https://app.platega.io'
  const merchantId = process.env.PLATEGA_MERCHANT_ID ?? ''
  const secret = process.env.PLATEGA_SECRET ?? ''

  try {
    const res = await fetch(`${apiUrl}/transaction/${transactionId}`, {
      headers: { 'X-MerchantId': merchantId, 'X-Secret': secret },
    })
    if (!res.ok) return 'error'
    const data = await res.json()
    const s: string = (data.status ?? '').toUpperCase()
    if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID') return 'paid'
    if (s === 'FAILED' || s === 'CANCELLED' || s === 'REJECTED') return 'error'
    return 'pending'
  } catch {
    return 'error'
  }
}

export async function createRollyPayInvoice(
  amountRub: number,
  userId: number,
  returnUrl: string,
): Promise<{ invoiceUrl: string; invoiceId: string } | null> {
  const apiUrl = process.env.ROLLYPAY_API_URL ?? 'https://lk.rollypay.io'
  const apiKey = process.env.ROLLYPAY_API_KEY ?? ''
  const terminalId = process.env.ROLLYPAY_TERMINAL_ID ?? ''

  try {
    const res = await fetch(`${apiUrl}/api/v1/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        terminal_id: terminalId,
        amount: amountRub,
        currency: 'RUB',
        description: `Пополнение на ${Math.round(amountRub)} ₽`,
        external_id: `${userId}_${Date.now()}`,
        success_url: returnUrl,
        fail_url: returnUrl,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.invoice_id) return null
    return { invoiceUrl: data.pay_url ?? '', invoiceId: String(data.invoice_id) }
  } catch {
    return null
  }
}

export async function checkRollyPayInvoice(
  invoiceId: string,
): Promise<'paid' | 'pending' | 'error'> {
  const apiUrl = process.env.ROLLYPAY_API_URL ?? 'https://lk.rollypay.io'
  const apiKey = process.env.ROLLYPAY_API_KEY ?? ''

  try {
    const res = await fetch(`${apiUrl}/api/v1/invoice/${invoiceId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return 'error'
    const data = await res.json()
    const s: string = (data.status ?? '').toUpperCase()
    if (s === 'PAID' || s === 'SUCCESS' || s === 'COMPLETED') return 'paid'
    if (s === 'FAILED' || s === 'CANCELLED') return 'error'
    return 'pending'
  } catch {
    return 'error'
  }
}
