import { useState } from 'react'
import { Link } from 'react-router-dom'
import { seatingApi, errorText } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import { slotKeyOf, slotLabel } from '../hooks/useArrangement'
import StatCard from '../components/StatCard'
import LoadState from '../components/LoadState'

const RULES = [
  { key: 'branchBeside', label: 'Different branch beside' },
  { key: 'subjectBeside', label: 'Different subject beside' },
  { key: 'branchFront', label: 'Different branch front / behind' },
  { key: 'subjectFront', label: 'Different subject front / behind' },
]

export default function Generate() {
  const { data, loading, error, reload } = useFetch(seatingApi.slots)
  const slots = data || []
  const [chosen, setChosen] = useState('')
  const [rules, setRules] = useState({
    branchBeside: true,
    subjectBeside: true,
    branchFront: true,
    subjectFront: false,
  })
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState(null)

  const activeSlot = slots.find((s) => slotKeyOf(s) === chosen) || slots[0]

  function toggle(key) {
    setRules({ ...rules, [key]: !rules[key] })
  }

  async function handleGenerate() {
    if (!activeSlot) return
    if (!Object.values(rules).some(Boolean)) {
      setFormError('Enable at least one seating constraint.')
      return
    }
    setFormError('')
    setResult(null)
    setStatus('loading')
    try {
      const res = await seatingApi.generate({
        date: activeSlot.date,
        startTime: activeSlot.startTime,
        ...rules,
      })
      setResult(res)
      setStatus('done')
      reload()
    } catch (e) {
      setFormError(errorText(e))
      setStatus('idle')
    }
  }

  return (
    <div>
      <h2 className="page-title">Generate seating</h2>
      <LoadState loading={loading && !data} error={error} onRetry={reload} />

      {data && slots.length === 0 && (
        <p className="notice notice-warn">
          No exams are scheduled yet. <Link to="/exams">Add an exam</Link> first.
        </p>
      )}

      {slots.length > 0 && (
        <div className="panel">
          <label className="field">
            <span>Exam slot</span>
            <select
              className="input"
              value={activeSlot ? slotKeyOf(activeSlot) : ''}
              onChange={(e) => setChosen(e.target.value)}
            >
              {slots.map((s) => (
                <option key={slotKeyOf(s)} value={slotKeyOf(s)}>{slotLabel(s)}</option>
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

          {formError && <p className="notice notice-error">{formError}</p>}

          <button className="btn" onClick={handleGenerate} disabled={status === 'loading'}>
            {status === 'loading' ? 'Generating...' : 'Generate seating arrangement'}
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="panel loading-box">
          <div className="spinner"></div>
          <p className="muted">Placing students and checking constraints...</p>
        </div>
      )}

      {status === 'done' && result && (
        <div>
          <h3 className="sub-title">Arrangement summary</h3>
          <div className="stat-grid section-gap">
            <StatCard label="Total students" value={result.summary.totalStudents} />
            <StatCard label="Total seats" value={result.summary.totalSeats} />
            <StatCard label="Halls used" value={result.summary.hallsUsed} />
            <StatCard label="Assigned" value={result.summary.assigned} tone="good" />
            <StatCard label="Unplaced" value={result.summary.unplaced} tone={result.summary.unplaced > 0 ? 'bad' : ''} />
            <StatCard label="Empty seats" value={result.summary.emptySeats} />
            <StatCard label="Constraint violations" value={result.summary.violations} tone="good" />
          </div>
          {result.summary.unplaced > 0 && (
            <p className="notice notice-warn">
              {result.summary.unplaced} students could not be placed. The reasons are on the Seating page.
            </p>
          )}
          <Link to={`/seating?slot=${slotKeyOf(activeSlot)}`} className="btn link-btn">
            View seating grid
          </Link>
        </div>
      )}
    </div>
  )
}