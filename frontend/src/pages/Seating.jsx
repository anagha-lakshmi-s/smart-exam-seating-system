import { useState, useMemo } from 'react'
import { BRANCHES } from '../services/mockData'
import { buildMockSeating, BRANCH_SUBJECT } from '../utils/mockSeating'
import { calcCapacity } from '../utils/hall'
import StatCard from '../components/StatCard'
import SeatGrid from '../components/SeatGrid'

export default function Seating() {
  const data = useMemo(() => buildMockSeating(), [])
  const [hallIndex, setHallIndex] = useState(0)
  const [selectedSeat, setSelectedSeat] = useState(null)

  const current = data.halls[hallIndex]
  const capacity = calcCapacity(current.hall)
  const empty = capacity - current.assigned
  const occupancy = Math.round((current.assigned / capacity) * 100)

  const totalAssigned = data.halls.reduce((sum, h) => sum + h.assigned, 0)

  function changeHall(i) {
    setHallIndex(i)
    setSelectedSeat(null)
  }

  return (
    <div>
      <h2 className="page-title">Seating</h2>
      <p className="muted section-gap">
        Exam slot: 20 Oct 2026, 10:00 - 13:00 &nbsp;|&nbsp; {totalAssigned} assigned,{' '}
        {data.unplaced.length} unplaced
      </p>

      <div className="tabs">
        {data.halls.map((h, i) => (
          <button
            key={h.hall.id}
            className={i === hallIndex ? 'tab tab-active' : 'tab'}
            onClick={() => changeHall(i)}
          >
            {h.hall.name}
          </button>
        ))}
      </div>

      <div className="stat-grid section-gap">
        <StatCard label="Capacity" value={capacity} />
        <StatCard label="Assigned" value={current.assigned} tone="good" />
        <StatCard label="Empty seats" value={empty} />
        <StatCard label="Occupancy" value={`${occupancy}%`} />
      </div>

      <div className="panel">
        <SeatGrid
          hall={current.hall}
          seats={current.seats}
          selectedRoll={selectedSeat?.student.rollNo}
          onSelect={setSelectedSeat}
        />
        <div className="legend">
          {BRANCHES.map((b) => (
            <span key={b} className="legend-item">
              <span className={`swatch branch-${b}`}></span>
              {b}
            </span>
          ))}
          <span className="legend-item">
            <span className="swatch seat-empty"></span>Empty
          </span>
        </div>
      </div>

      {selectedSeat && (
        <div className="panel detail">
          <h3 className="modal-title">{selectedSeat.student.name}</h3>
          <p>Roll no: <strong>{selectedSeat.student.rollNo}</strong></p>
          <p>Branch: <strong>{selectedSeat.student.branch}</strong></p>
          <p>Subject: <strong>{BRANCH_SUBJECT[selectedSeat.student.branch]}</strong></p>
          <p>
            Seat: <strong>
              {current.hall.name}, Row {selectedSeat.row}, Bench {selectedSeat.bench}, Seat {selectedSeat.seat}
            </strong>
          </p>
        </div>
      )}

      <h3 className="sub-title">Unplaced students ({data.unplaced.length})</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll no</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.unplaced.map((u) => (
              <tr key={u.rollNo}>
                <td>{u.rollNo}</td>
                <td>{u.name}</td>
                <td><span className="badge">{u.branch}</span></td>
                <td>{u.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}