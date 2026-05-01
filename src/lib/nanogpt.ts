const API_URL = 'https://nano-gpt.com/api/v1/images/generations'

interface NanoGPTResponse {
  data: Array<{ url: string; b64_json?: string }>
}

export async function generateImage(
  imageBase64: string,
  resolution: string,
  showExplicit = false,
): Promise<string> {
  const apiKey = process.env.NANO_GPT_API_KEY
  if (!apiKey) throw new Error('NANO_GPT_API_KEY not set')

  const prompt = process.env.GEN_API_PROMPT ?? ''
  const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      prompt,
      model: 'wan-2.6-image-edit',
      showExplicitContent: showExplicit,
      resolution,
      nImages: 1,
      response_format: 'url',
      imageDataUrls: [imageDataUrl],
    }),
    signal: AbortSignal.timeout(180_000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NanoGPT error ${res.status}: ${text}`)
  }

  const data: NanoGPTResponse = await res.json()
  const url = data.data?.[0]?.url
  if (!url) throw new Error('No URL in NanoGPT response')
  return url
}

export function calcResolution(
  width: number,
  height: number,
): { width: number; height: number; resolution: string } {
  const MIN_PX = 3_686_400
  const MAX_PX = 10_404_496
  const current = width * height

  let scale = 1.0
  if (current < MIN_PX) {
    scale = Math.sqrt((MIN_PX * 1.01) / current)
  } else if (current > MAX_PX) {
    scale = Math.sqrt(MAX_PX / current)
  }

  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  return { width: w, height: h, resolution: `${w}x${h}` }
}
