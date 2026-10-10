import { useState } from 'react'
import { mockSeating, BRANCH_SUBJECT, EXAM_SLOT } from '../utils/mockSeating'
import SeatGrid from '../components/SeatGrid'
import { useAuth } from '../hooks/useAuth'

function findSeat(rawRoll) {
  const query = rawRoll.trim().toUpperCase()
  if (!query) return { error: 'Please enter your roll number.' }

  for (const h of mockSeating.halls) {
    const seat = h.seats.find((s) => s.student && s.student.rollNo === query)
    if (seat) return { result: { type: 'found', hallData: h, seat } }
  }

  const unplaced = mockSeating.unplaced.find((u) => u.rollNo === query)
  if (unplaced) return { result: { type: 'unplaced', student: unplaced } }

  return { error: 'No student found with this roll number. Please check and try again.' }
}

export default function FindMySeat() {
  const { user } = useAuth()
  const isStudent = user.role === 'student'
  const first = isStudent ? findSeat(user.name) : {}

  const [roll, setRoll] = useState(isStudent ? user.name : '')
  const [result, setResult] = useState(first.result || null)
  const [error, setError] = useState(first.error || '')

  function handleSearch() {
    const out = findSeat(roll)
    setResult(out.result || null)
    setError(out.error || '')
  }

  return (
    <div>
      <h2 className="page-title">{isStudent ? 'Your exam seat' : 'Find my seat'}</h2>

      {!isStudent && (
        <div className="panel">
          <div className="search-row">
            <input
              className="input"
              placeholder="Enter roll number (e.g. CS201)"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn" onClick={handleSearch}>Find seat</button>
          </div>
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}

      {result?.type === 'unplaced' && (
        <div className="panel">
          <h3 className="modal-title">{result.student.name}</h3>
          <p>Student type: <strong>{result.student.type}</strong></p>
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
            <p>Student type: <strong>{result.seat.student.type}</strong></p>
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