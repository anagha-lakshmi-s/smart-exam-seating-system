import { useState } from 'react'
import { mockSeating, BRANCH_SUBJECT, EXAM_SLOT } from '../utils/mockSeating'
import SeatGrid from '../components/SeatGrid'

export default function FindMySeat() {
  const [roll, setRoll] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleSearch() {
    const query = roll.trim().toUpperCase()
    setResult(null)
    setError('')

    if (!query) {
      setError('Please enter your roll number.')
      return
    }

    for (const h of mockSeating.halls) {
      const seat = h.seats.find((s) => s.student && s.student.rollNo === query)
      if (seat) {
        setResult({ type: 'found', hallData: h, seat })
        return
      }
    }

    const unplaced = mockSeating.unplaced.find((u) => u.rollNo === query)
    if (unplaced) {
      setResult({ type: 'unplaced', student: unplaced })
      return
    }

    setError('No student found with this roll number. Please check and try again.')
  }

  return (
    <div>
      <h2 className="page-title">Find my seat</h2>

      <div className="panel">
        <div className="search-row">
          <input
            className="input"
            placeholder="Enter your roll number (e.g. CS201)"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn" onClick={handleSearch}>Find seat</button>
        </div>
        {error && <p className="notice notice-error">{error}</p>}
      </div>

      {result?.type === 'unplaced' && (
        <div className="panel">
          <h3 className="modal-title">{result.student.name}</h3>
          <p className="notice notice-warn">
            No seat has been assigned yet. {result.student.reason}
          </p>
          <p className="muted">Please contact the examination office.</p>
        </div>
      )}

      {result?.type === 'found' && (
        <div>
          <div className="panel detail">
            <h3 className="modal-title">{result.seat.student.name}</h3>
            <p>Roll no: <strong>{result.seat.student.rollNo}</strong></p>
            <p>Subject: <strong>{BRANCH_SUBJECT[result.seat.student.branch]}</strong></p>
            <p>Date: <strong>{EXAM_SLOT.date}</strong></p>
            <p>Time: <strong>{EXAM_SLOT.time}</strong></p>
            <p>Hall: <strong>{result.hallData.hall.name}</strong></p>
            <p>
              Row <strong>{result.seat.row}</strong>, Bench <strong>{result.seat.bench}</strong>, Seat{' '}
              <strong>{result.seat.seat}</strong>
            </p>
          </div>

          <div className="panel">
            <p className="muted">Your seat is highlighted below.</p>
            <SeatGrid
              hall={result.hallData.hall}
              seats={result.hallData.seats}
              selectedRoll={result.seat.student.rollNo}
              onSelect={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}