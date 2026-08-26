import { weekdayIndex, prettyDate } from '../lib/dates'

// Renders a GitHub-style grid. `cells` = [{ day, fraction, future }].
// Column-major, 7 rows (Sun..Sat). We pad the first week so weekdays line up.
export default function Heatmap({ cells }) {
  if (!cells.length) return null

  const firstDow = weekdayIndex(cells[0].day)
  const padded = [...Array(firstDow).fill(null), ...cells]

  return (
    <div>
      <div className="heatmap">
        {padded.map((c, i) => {
          if (c === null) return <div key={`pad-${i}`} className="hm-cell" style={{ background: 'transparent' }} />
          return (
            <div
              key={c.day}
              className={`hm-cell ${c.future ? 'hm-future' : ''}`}
              style={{ background: colorFor(c.fraction) }}
              title={`${prettyDate(c.day)} — ${c.fraction === null ? 'upcoming' : Math.round(c.fraction * 100) + '%'}`}
            />
          )
        })}
      </div>
      <div className="legend">
        <span className="muted">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <span key={f} className="hm-cell" style={{ background: colorFor(f) }} />
        ))}
        <span className="muted">More</span>
      </div>
    </div>
  )
}

function colorFor(fraction) {
  if (fraction === null) return 'var(--bg-soft)'
  if (fraction === 0) return '#1e293b'
  if (fraction <= 0.25) return '#14532d'
  if (fraction <= 0.5) return '#166534'
  if (fraction <= 0.75) return '#22c55e'
  return '#4ade80'
}
