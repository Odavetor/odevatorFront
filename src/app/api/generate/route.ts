import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { generateImage, calcResolution } from '@/lib/nanogpt'
import * as db from '@/lib/db'
import path from 'path'
import fs from 'fs'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? path.resolve(process.cwd(), '..', 'downloads')

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const imageFile = form.get('image') as File | null
    const userId = Number(form.get('userId'))
    const username = (form.get('username') as string) ?? ''

    if (!imageFile || !userId) {
      return NextResponse.json({ error: 'Missing image or userId' }, { status: 400 })
    }

    db.ensureUser(userId, BOT_TOKEN, username || null)

    if (!db.useGeneration(userId, BOT_TOKEN)) {
      return NextResponse.json({ error: 'No active processes' }, { status: 402 })
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Get dimensions
    const meta = await sharp(inputBuffer).metadata()
    const origW = meta.width ?? 1080
    const origH = meta.height ?? 1920

    const { width, height, resolution } = calcResolution(origW, origH)

    // Resize and convert to JPEG
    const processed = await sharp(inputBuffer)
      .resize(width, height, { fit: 'fill', kernel: 'lanczos3' })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 75 })
      .toBuffer()

    const base64 = processed.toString('base64')

    let resultUrl: string
    try {
      resultUrl = await generateImage(base64, resolution)
    } catch (err) {
      db.refundGeneration(userId, BOT_TOKEN)
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }

    // Save locally (best-effort)
    let localPath: string | null = null
    try {
      fs.mkdirSync(DOWNLOADS_DIR, { recursive: true })
      const filename = `${userId}_${Date.now()}.jpg`
      localPath = path.join(DOWNLOADS_DIR, filename)
      // Download the result image
      const imgRes = await fetch(resultUrl, { signal: AbortSignal.timeout(30_000) })
      if (imgRes.ok) {
        const imgBuf = Buffer.from(await imgRes.arrayBuffer())
        fs.writeFileSync(localPath, imgBuf)
      }
    } catch {
      localPath = null
    }

    db.saveHistory(userId, BOT_TOKEN, resultUrl, localPath)

    return NextResponse.json({ url: resultUrl }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/generate]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
