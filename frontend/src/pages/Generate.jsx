import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { mockSeating } from '../utils/mockSeating'
import { calcCapacity } from '../utils/hall'

const SLOTS = [
  '20 Oct 2026, 10:00 - 13:00 (3 exams)',
  '22 Oct 2026, 10:00 - 13:00 (1 exam)',
]

const RULES = [
  { key: 'branchBeside', label: 'Different branch beside' },
  { key: 'subjectBeside', label: 'Different subject beside' },
  { key: 'branchFront', label: 'Different branch front / behind' },
  { key: 'subjectFront', label: 'Different subject front / behind' },
]

export default function Generate() {
  const [slot, setSlot] = useState(SLOTS[0])
  const [rules, setRules] = useState({
    branchBeside: true,
    subjectBeside: true,
    branchFront: true,
    subjectFront: false,
  })
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [error, setError] = useState('')

  function toggle(key) {
    setRules({ ...rules, [key]: !rules[key] })
  }

  function handleGenerate() {
    if (!Object.values(rules).some(Boolean)) {
      setError('Enable at least one seating constraint.')
      return
    }
    setError('')
    setStatus('loading')
    setTimeout(() => setStatus('done'), 1500)
  }

  const halls = mockSeating.halls
  const totalSeats = halls.reduce((sum, h) => sum + calcCapacity(h.hall), 0)
  const assigned = halls.reduce((sum, h) => sum + h.assigned, 0)
  const unplaced = mockSeating.unplaced.length

  return (
    <div>
      <h2 className="page-title">Generate seating</h2>

      <div className="panel">
        <label className="field">
          <span>Exam slot</span>
          <select className="input" value={slot} onChange={(e) => setSlot(e.target.value)}>
            {SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>Seating constraints</span>
          <div className="check-list">
            {RULES.map((r) => (
              <label key={r.key} className="check">
                <input type="checkbox" checked={rules[r.key]} onChange={() => toggle(r.key)} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="notice notice-error">{error}</p>}

        <button className="btn" onClick={handleGenerate} disabled={status === 'loading'}>
          {status === 'loading' ? 'Generating...' : 'Generate seating arrangement'}
        </button>
      </div>

      {status === 'loading' && (
        <div className="panel loading-box">
          <div className="spinner"></div>
          <p className="muted">Placing students and checking constraints...</p>
        </div>
      )}

      {status === 'done' && (
        <div>
          <h3 className="sub-title">Arrangement summary</h3>
          <div className="stat-grid section-gap">
            <StatCard label="Total students" value={assigned + unplaced} />
            <StatCard label="Total seats" value={totalSeats} />
            <StatCard label="Halls used" value={halls.length} />
            <StatCard label="Assigned" value={assigned} tone="good" />
            <StatCard label="Unplaced" value={unplaced} tone="bad" />
            <StatCard label="Empty seats" value={totalSeats - assigned} />
            <StatCard label="Constraint violations" value={0} tone="good" />
          </div>
          <p className="notice notice-warn">
            Demo result: this uses sample data until the backend seating algorithm is connected.
          </p>
          <Link to="/seating" className="btn link-btn">View seating grid</Link>
        </div>
      )}
    </div>
  )
}