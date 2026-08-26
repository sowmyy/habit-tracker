export default function StatBar({ label, value, sub }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="row spread" style={{ marginBottom: 4 }}>
        <span>{label}</span>
        <span className="muted">{sub ?? `${pct}%`}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
