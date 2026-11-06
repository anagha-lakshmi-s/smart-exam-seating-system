import { useEffect, useState } from 'react'
import { seatingApi, errorText } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import SeatGrid from '../components/SeatGrid'
import LoadState from '../components/LoadState'

export default function FindMySeat() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isStudent) return

    async function lookup() {
      setLoading(true)
      setError('')

      try {
        const response = await seatingApi.mySeat()
        setResult(response)
      } catch (e) {
        setError(errorText(e))
      } finally {
        setLoading(false)
      }
    }

    lookup()
  }, [isStudent])

  return (
    <div>
      <h2 className="page-title">
        {isStudent ? 'Your exam seat' : 'Find my seat'}
      </h2>

      {!isStudent && (
        <div className="panel">
          <p>
            This page is for student accounts. Admins can view seating
            arrangements and student details through the Seating and Reports
            sections.
          </p>
        </div>
      )}

      {isStudent && (
        <>
          <LoadState loading={loading} />

          {error && <p className="notice notice-error">{error}</p>}

          {result?.status === 'UNPLACED' && (
            <div className="panel">
              <h3 className="modal-title">{result.student.name}</h3>
              <p>
                Student type: <strong>{result.student.type}</strong>
              </p>
              <p className="notice notice-warn">
                No seat has been assigned yet. {result.reason}
              </p>
              <p className="muted">
                Please contact the examination office.
              </p>
            </div>
          )}

          {result?.status === 'ASSIGNED' && (
            <div>
              <div className="panel detail">
                <h3 className="modal-title">{result.student.name}</h3>
                <p>
                  Roll no: <strong>{result.student.rollNo}</strong>
                </p>
                <p>
                  Student type: <strong>{result.student.type}</strong>
                </p>
                <p>
                  Subject: <strong>{result.student.subject}</strong>
                </p>
                <p>
                  Date: <strong>{result.date}</strong>
                </p>
                <p>
                  Time: <strong>{result.startTime} - {result.endTime}</strong>
                </p>
                <p>
                  Hall: <strong>{result.hallName}</strong>
                </p>
                <p>
                  Row <strong>{result.row}</strong>, Bench{' '}
                  <strong>{result.bench}</strong>, Seat{' '}
                  <strong>{result.seat}</strong>
                </p>
              </div>

              <div className="panel">
                <p className="muted">
                  Your seat is highlighted below.
                </p>
                <SeatGrid
                  hall={result.hallArrangement.hall}
                  seats={result.hallArrangement.seats}
                  selectedRoll={result.student.rollNo}
                  onSelect={() => {}}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}