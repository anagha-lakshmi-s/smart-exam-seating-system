import { useEffect, useState } from 'react'
import { seatingApi, errorText } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SeatGrid from '../components/SeatGrid'
import LoadState from '../components/LoadState'

export default function FindMySeat() {
  const { user } = useAuth()
  const isStudent = user.role === 'student'
  const [roll, setRoll] = useState(isStudent ? user.name : '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function lookup(value) {
    const query = value.trim()
    setResult(null)
    setError('')
    if (!query) {
      setError('Please enter your roll number.')
      return
    }
    setLoading(true)
    try {
      setResult(await seatingApi.mySeat(query))
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isStudent) lookup(user.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h2 className="page-title">{isStudent ? 'Your exam seat' : 'Find my seat'}</h2>

      {!isStudent && (
        <div className="panel">
          <div className="search-row">
            <input
              className="input"
              placeholder="Enter roll number (e.g. CS001)"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup(roll)}
            />
            <button className="btn" onClick={() => lookup(roll)}>Find seat</button>
          </div>
        </div>
      )}

      <LoadState loading={loading} />
      {error && <p className="notice notice-error">{error}</p>}

      {result?.status === 'UNPLACED' && (
        <div className="panel">
          <h3 className="modal-title">{result.student.name}</h3>
          <p>Student type: <strong>{result.student.type}</strong></p>
          <p className="notice notice-warn">No seat has been assigned yet. {result.reason}</p>
          <p className="muted">Please contact the examination office.</p>
        </div>
      )}

      {result?.status === 'ASSIGNED' && (
        <div>
          <div className="panel detail">
            <h3 className="modal-title">{result.student.name}</h3>
            <p>Roll no: <strong>{result.student.rollNo}</strong></p>
            <p>Student type: <strong>{result.student.type}</strong></p>
            <p>Subject: <strong>{result.student.subject}</strong></p>
            <p>Date: <strong>{result.date}</strong></p>
            <p>Time: <strong>{result.startTime} - {result.endTime}</strong></p>
            <p>Hall: <strong>{result.hallName}</strong></p>
            <p>
              Row <strong>{result.row}</strong>, Bench <strong>{result.bench}</strong>, Seat{' '}
              <strong>{result.seat}</strong>
            </p>
          </div>

          <div className="panel">
            <p className="muted">Your seat is highlighted below.</p>
            <SeatGrid
              hall={result.hallArrangement.hall}
              seats={result.hallArrangement.seats}
              selectedRoll={result.student.rollNo}
              onSelect={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}