interface BlobStyle {
  top?: string
  bottom?: string
  left?: string
  right?: string
  width: string
  height: string
  background: string
  opacity: number
  blur: number
  rotate?: number
}

const BLOBS: BlobStyle[] = [
  {
    top: '-18%',
    left: '-20%',
    width: '70vw',
    height: '60vw',
    background: '#E03F6A',
    opacity: 0.55,
    blur: 80,
  },
  {
    top: '12%',
    right: '-25%',
    width: '60vw',
    height: '55vw',
    background: '#7B5CF6',
    opacity: 0.45,
    blur: 85,
    rotate: -20,
  },
  {
    top: '38%',
    left: '15%',
    width: '80vw',
    height: '45vw',
    background: '#A81E38',
    opacity: 0.6,
    blur: 90,
    rotate: -15,
  },
  {
    top: '58%',
    right: '-15%',
    width: '55vw',
    height: '70vw',
    background: '#E03F6A',
    opacity: 0.48,
    blur: 80,
    rotate: 18,
  },
  {
    bottom: '-12%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    background: '#7B5CF6',
    opacity: 0.4,
    blur: 75,
  },
  {
    bottom: '8%',
    right: '20%',
    width: '45vw',
    height: '45vw',
    background: '#3FD4E0',
    opacity: 0.28,
    blur: 70,
  },
]

export function AuroraBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, contain: 'strict' }}
    >
      {BLOBS.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            width: b.width,
            height: b.height,
            background: b.background,
            opacity: b.opacity,
            borderRadius: '50%',
            filter: `blur(${b.blur}px)`,
            transform: b.rotate ? `rotate(${b.rotate}deg)` : undefined,
          }}
        />
      ))}
    </div>
  )
}
