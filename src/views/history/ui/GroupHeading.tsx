interface Props {
  label: string
  count: number
}

export function GroupHeading({ label, count }: Props) {
  return (
    <div className="flex items-baseline justify-between">
      <h2
        className="font-sans"
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--text)',
          textTransform: 'lowercase',
        }}
      >
        {label}
      </h2>
      <span
        className="font-sans tabular-nums"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        {count} {count === 1 ? 'фото' : count < 5 ? 'фото' : 'фото'}
      </span>
    </div>
  )
}
