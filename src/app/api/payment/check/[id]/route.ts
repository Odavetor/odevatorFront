import { NextRequest, NextResponse } from 'next/server'
import {
  checkCryptoBotInvoice,
  checkPlategaTransaction,
  checkRollyPayInvoice,
} from '@/lib/payments'
import * as db from '@/lib/db'
import type { PaymentMethod } from '@/types'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''

const PACKAGES: Record<string, { count: number; price: number }> = {
  '1': { count: 1, price: Number(process.env.PRICE_1 ?? 59) },
  '10': { count: 10, price: Number(process.env.PRICE_10 ?? 349) },
  '25': { count: 25, price: Number(process.env.PRICE_25 ?? 690) },
  '50': { count: 50, price: Number(process.env.PRICE_50 ?? 1190) },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: invoiceId } = await params
  const sp = req.nextUrl.searchParams
  const method = sp.get('method') as PaymentMethod
  const userId = Number(sp.get('userId'))
  const packageId = sp.get('packageId') ?? ''

  if (!invoiceId || !method || !userId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  // Check if already confirmed
  const payment = db.getPaymentByInvoice(invoiceId)
  if (payment?.status === 'CONFIRMED') {
    return NextResponse.json({ status: 'paid' })
  }

  let status: 'paid' | 'pending' | 'error'

  if (method === 'cryptobot') {
    status = await checkCryptoBotInvoice(Number(invoiceId))
  } else if (method === 'platega_sbp' || method === 'platega_crypto') {
    status = await checkPlategaTransaction(invoiceId)
  } else if (method === 'rollypay') {
    status = await checkRollyPayInvoice(invoiceId)
  } else {
    return NextResponse.json({ error: 'Unknown method' }, { status: 400 })
  }

  if (status === 'paid' && payment && payment.status !== 'CONFIRMED') {
    db.confirmPayment(invoiceId)
    db.addBalance(userId, BOT_TOKEN, payment.amount_rub)

    // Add processes from package
    const pkg = PACKAGES[packageId]
    if (pkg) {
      db.addProcesses(userId, BOT_TOKEN, pkg.count)
    }
  }

  return NextResponse.json({ status })
}
