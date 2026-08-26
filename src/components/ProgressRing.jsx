// Circular progress ring matching the design (rounded caps, tonal track).
export default function ProgressRing({
  percent = 0,
  size = 80,
  stroke = 4.3,
  trackClass = 'text-surface-container-highest',
  progressClass = 'text-primary',
  children,
  label,
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className={trackClass}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <path
          className={progressClass}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${p}, 100`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <span className="absolute font-semibold text-on-surface dark:text-dark-on-surface">
        {children ?? (label ?? `${p}%`)}
      </span>
    </div>
  )
}
