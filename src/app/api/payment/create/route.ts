import { NextRequest, NextResponse } from 'next/server'
import {
  createCryptoBotInvoice,
  createPlategaInvoice,
  createRollyPayInvoice,
} from '@/lib/payments'
import * as db from '@/lib/db'
import type { PaymentMethod } from '@/types'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'

const PACKAGES: Record<string, { count: number; price: number }> = {
  '1': { count: 1, price: Number(process.env.PRICE_1 ?? 59) },
  '10': { count: 10, price: Number(process.env.PRICE_10 ?? 349) },
  '25': { count: 25, price: Number(process.env.PRICE_25 ?? 690) },
  '50': { count: 50, price: Number(process.env.PRICE_50 ?? 1190) },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, packageId, method } = body as {
      userId: number
      packageId: string
      method: PaymentMethod
    }

    if (!userId || !packageId || !method) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const pkg = PACKAGES[packageId]
    if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    const returnUrl = APP_URL

    let invoiceUrl = ''
    let invoiceId = ''

    if (method === 'cryptobot') {
      const result = await createCryptoBotInvoice(pkg.price, userId)
      if (!result) return NextResponse.json({ error: 'CryptoBot error' }, { status: 502 })
      invoiceUrl = result.invoiceUrl
      invoiceId = String(result.invoiceId)
    } else if (method === 'platega_sbp') {
      const result = await createPlategaInvoice(pkg.price, 2, userId, returnUrl)
      if (!result) return NextResponse.json({ error: 'Platega error' }, { status: 502 })
      invoiceUrl = result.invoiceUrl
      invoiceId = result.transactionId
    } else if (method === 'platega_crypto') {
      const result = await createPlategaInvoice(pkg.price, 13, userId, returnUrl)
      if (!result) return NextResponse.json({ error: 'Platega error' }, { status: 502 })
      invoiceUrl = result.invoiceUrl
      invoiceId = result.transactionId
    } else if (method === 'rollypay') {
      const result = await createRollyPayInvoice(pkg.price, userId, returnUrl)
      if (!result) return NextResponse.json({ error: 'RollyPay error' }, { status: 502 })
      invoiceUrl = result.invoiceUrl
      invoiceId = result.invoiceId
    } else {
      return NextResponse.json({ error: 'Unknown method' }, { status: 400 })
    }

    db.createPaymentRecord(userId, BOT_TOKEN, pkg.price, method, invoiceId)

    return NextResponse.json({ invoiceUrl, invoiceId, amount: pkg.price })
  } catch (err) {
    console.error('payment/create error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
