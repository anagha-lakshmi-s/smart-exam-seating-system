import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import OccupancyBar from '../components/OccupancyBar'
import { initialExams, initialHalls } from '../services/mockData'
import { mockSeating, EXAM_SLOT } from '../utils/mockSeating'
import { calcCapacity } from '../utils/hall'

export default function Dashboard() {
  const halls = mockSeating.halls
  const assigned = halls.reduce((sum, h) => sum + h.assigned, 0)
  const unplaced = mockSeating.unplaced.length
  const availableSeats = initialHalls
    .filter((h) => h.available)
    .reduce((sum, h) => sum + calcCapacity(h), 0)
  const hallsUsed = halls.filter((h) => h.assigned > 0).length
  const overall = Math.round((assigned / availableSeats) * 100)

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div className="stat-grid section-gap">
        <StatCard label="Total students" value={assigned + unplaced} />
        <StatCard label="Total exams" value={initialExams.length} />
        <StatCard label="Total halls" value={initialHalls.length} />
        <StatCard label="Available seats" value={availableSeats} />
        <StatCard label="Assigned" value={assigned} tone="good" />
        <StatCard label="Unplaced" value={unplaced} tone="bad" />
        <StatCard label="Halls used" value={hallsUsed} />
        <StatCard label="Occupancy" value={`${overall}%`} />
      </div>

      {unplaced > 0 && (
        <p className="notice notice-warn">
          {unplaced} students could not be placed. <Link to="/seating">See reasons</Link>
        </p>
      )}

      <div className="two-col">
        <div className="panel">
          <h3 className="modal-title">Hall occupancy</h3>
          {halls.map((h) => {
            const cap = calcCapacity(h.hall)
            const pct = Math.round((h.assigned / cap) * 100)
            return (
              <div key={h.hall.id} className="bar-row">
                <span className="bar-name">{h.hall.name}</span>
                <OccupancyBar percent={pct} />
                <span className="bar-pct">{h.assigned}/{cap}</span>
              </div>
            )
          })}
        </div>

        <div className="panel">
          <h3 className="modal-title">Latest arrangement</h3>
          <p className="summary-line"><span>Exam slot</span><strong>{EXAM_SLOT.date}, {EXAM_SLOT.time}</strong></p>
          <p className="summary-line"><span>Assigned</span><strong>{assigned}</strong></p>
          <p className="summary-line"><span>Unplaced</span><strong>{unplaced}</strong></p>
          <p className="summary-line"><span>Empty seats</span><strong>{availableSeats - assigned}</strong></p>
          <p className="summary-line"><span>Constraint violations</span><strong>0</strong></p>
          <Link to="/generate" className="btn link-btn">Generate new arrangement</Link>
        </div>
      </div>
    </div>
  )
}