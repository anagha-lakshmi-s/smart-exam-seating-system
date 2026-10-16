import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRANCHES } from '../services/mockData'
import { useArrangement } from '../hooks/useArrangement'
import StatCard from '../components/StatCard'
import SeatGrid from '../components/SeatGrid'
import SlotPicker from '../components/SlotPicker'
import LoadState from '../components/LoadState'

export default function Seating() {
  const { slots, activeKey, setChosen, slotsState, arrangementState } = useArrangement()
  const [hallIndex, setHallIndex] = useState(0)
  const [selectedSeat, setSelectedSeat] = useState(null)

  const arrangement = arrangementState.data
  const halls = arrangement?.halls || []
  const current = halls[hallIndex] || halls[0]

  function changeSlot(key) {
    setChosen(key)
    setHallIndex(0)
    setSelectedSeat(null)
  }

  function changeHall(i) {
    setHallIndex(i)
    setSelectedSeat(null)
  }

  const capacity = current ? current.hall.capacity : 0
  const occupancy = capacity > 0 ? Math.round((current.assigned / capacity) * 100) : 0

  return (
    <div>
      <h2 className="page-title">Seating</h2>
      <LoadState loading={slotsState.loading && !slotsState.data} error={slotsState.error} onRetry={slotsState.reload} />

      {slotsState.data && slots.length === 0 && (
        <p className="notice notice-warn">
          No exams are scheduled yet. <Link to="/exams">Add an exam</Link> first.
        </p>
      )}

      <SlotPicker slots={slots} activeKey={activeKey} onChange={changeSlot} />
      <LoadState
        loading={arrangementState.loading && !arrangement}
        error={arrangementState.error}
        onRetry={arrangementState.reload}
      />

      {arrangement && !arrangement.generated && (
        <p className="notice notice-warn">
          Seating has not been generated for this slot yet. <Link to="/generate">Go to Generate</Link>
        </p>
      )}

      {arrangement && arrangement.generated && (
        <>
          <p className="muted section-gap">
            {arrangement.summary.assigned} assigned, {arrangement.summary.unplaced} unplaced,{' '}
            {arrangement.summary.emptySeats} empty seats, {arrangement.summary.hallsUsed} halls used
          </p>

          {current && (
            <>
              <div className="tabs">
                {halls.map((h, i) => (
                  <button
                    key={h.hall.id}
                    className={h === current ? 'tab tab-active' : 'tab'}
                    onClick={() => changeHall(i)}
                  >
                    {h.hall.name}
                  </button>
                ))}
              </div>

              <div className="stat-grid section-gap">
                <StatCard label="Capacity" value={capacity} />
                <StatCard label="Assigned" value={current.assigned} tone="good" />
                <StatCard label="Empty seats" value={capacity - current.assigned} />
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
                  <p>Student type: <strong>{selectedSeat.student.type}</strong></p>
                  <p>Subject: <strong>{selectedSeat.student.subject}</strong></p>
                  <p>
                    Seat: <strong>
                      {current.hall.name}, Row {selectedSeat.row}, Bench {selectedSeat.bench}, Seat {selectedSeat.seat}
                    </strong>
                  </p>
                </div>
              )}
            </>
          )}

          <h3 className="sub-title">Unplaced students ({arrangement.unplaced.length})</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll no</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Type</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {arrangement.unplaced.map((u) => (
                  <tr key={u.rollNo}>
                    <td>{u.rollNo}</td>
                    <td>{u.name}</td>
                    <td><span className="badge">{u.branch}</span></td>
                    <td>
                      <span className={u.type === 'Repeater' ? 'badge badge-warn' : 'badge'}>{u.type}</span>
                    </td>
                    <td>{u.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {arrangement.unplaced.length === 0 && <p className="empty">Every student has a seat.</p>}
          </div>
        </>
      )}
    </div>
  )
}