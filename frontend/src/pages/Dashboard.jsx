import { Link } from 'react-router-dom'
import { examsApi, hallsApi, studentsApi } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import { useArrangement } from '../hooks/useArrangement'
import StatCard from '../components/StatCard'
import OccupancyBar from '../components/OccupancyBar'
import SlotPicker from '../components/SlotPicker'
import LoadState from '../components/LoadState'

export default function Dashboard() {
  const counts = useFetch(() =>
    Promise.all([studentsApi.list(), examsApi.list(), hallsApi.list()])
  )
  const { slots, activeKey, setChosen, arrangementState } = useArrangement()

  const [students, exams, halls] = counts.data || [[], [], []]
  const arrangement = arrangementState.data
  const summary = arrangement?.generated ? arrangement.summary : null

  const availableSeats = halls.filter((h) => h.available).reduce((sum, h) => sum + h.capacity, 0)
  const assigned = summary ? summary.assigned : 0
  const unplaced = summary ? summary.unplaced : 0
  const occupancy = availableSeats > 0 ? Math.round((assigned / availableSeats) * 100) : 0

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <LoadState loading={counts.loading && !counts.data} error={counts.error} onRetry={counts.reload} />

      {counts.data && (
        <>
          <SlotPicker slots={slots} activeKey={activeKey} onChange={setChosen} />

          <div className="stat-grid section-gap">
            <StatCard label="Total students" value={students.length} />
            <StatCard label="Total exams" value={exams.length} />
            <StatCard label="Total halls" value={halls.length} />
            <StatCard label="Available seats" value={availableSeats} />
            <StatCard label="Assigned" value={assigned} tone="good" />
            <StatCard label="Unplaced" value={unplaced} tone={unplaced > 0 ? 'bad' : ''} />
            <StatCard label="Halls used" value={summary ? summary.hallsUsed : 0} />
            <StatCard label="Occupancy" value={`${occupancy}%`} />
          </div>

          {!summary && (
            <p className="notice notice-warn">
              No seating has been generated for the selected slot yet. <Link to="/generate">Generate now</Link>
            </p>
          )}

          {unplaced > 0 && (
            <p className="notice notice-warn">
              {unplaced} students could not be placed. <Link to="/seating">See reasons</Link>
            </p>
          )}

          {summary && (
            <div className="two-col">
              <div className="panel">
                <h3 className="modal-title">Hall occupancy</h3>
                {arrangement.halls.map((h) => {
                  const pct = Math.round((h.assigned / h.hall.capacity) * 100)
                  return (
                    <div key={h.hall.id} className="bar-row">
                      <span className="bar-name">{h.hall.name}</span>
                      <OccupancyBar percent={pct} />
                      <span className="bar-pct">{h.assigned}/{h.hall.capacity}</span>
                    </div>
                  )
                })}
              </div>

              <div className="panel">
                <h3 className="modal-title">Latest arrangement</h3>
                <p className="summary-line"><span>Exam slot</span><strong>{arrangement.date}, {arrangement.startTime}</strong></p>
                <p className="summary-line"><span>Students in slot</span><strong>{summary.totalStudents}</strong></p>
                <p className="summary-line"><span>Assigned</span><strong>{summary.assigned}</strong></p>
                <p className="summary-line"><span>Unplaced</span><strong>{summary.unplaced}</strong></p>
                <p className="summary-line"><span>Empty seats</span><strong>{summary.emptySeats}</strong></p>
                <p className="summary-line"><span>Constraint violations</span><strong>{summary.violations}</strong></p>
                <Link to="/generate" className="btn link-btn">Generate new arrangement</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}