import { useState } from 'react'
import { useArrangement } from '../hooks/useArrangement'
import OccupancyBar from '../components/OccupancyBar'
import SlotPicker from '../components/SlotPicker'
import LoadState from '../components/LoadState'

const TABS = ['Hall-wise', 'Student-wise', 'Occupancy', 'Unplaced']

export default function Reports() {
  const { slots, activeKey, setChosen, slotsState, arrangementState } = useArrangement()
  const [tab, setTab] = useState('Hall-wise')
  const [hallName, setHallName] = useState('')
  const [search, setSearch] = useState('')

  const arrangement = arrangementState.data
  const halls = arrangement?.halls || []

  // One flat list of every assigned student together with their seat
  const allAssigned = halls.flatMap((h) =>
    h.seats
      .filter((s) => s.student)
      .map((s) => ({ ...s.student, hall: h.hall.name, row: s.row, bench: s.bench, seat: s.seat }))
  )

  const selectedHall = hallName || halls[0]?.hall.name
  const hallRows = allAssigned.filter((s) => s.hall === selectedHall)

  const studentRows = allAssigned
    .filter((s) => {
      const text = search.toLowerCase()
      return s.rollNo.toLowerCase().includes(text) || s.name.toLowerCase().includes(text)
    })
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo))

  return (
    <div>
      <h2 className="page-title">Reports</h2>
      <LoadState loading={slotsState.loading && !slotsState.data} error={slotsState.error} onRetry={slotsState.reload} />
      <div className="no-print">
        <SlotPicker slots={slots} activeKey={activeKey} onChange={setChosen} />
      </div>
      <LoadState
        loading={arrangementState.loading && !arrangement}
        error={arrangementState.error}
        onRetry={arrangementState.reload}
      />

      {arrangement && !arrangement.generated && (
        <p className="notice notice-warn">Seating has not been generated for this slot yet.</p>
      )}

      {arrangement && arrangement.generated && (
        <>
          <div className="toolbar no-print">
            <div className="tabs">
              {TABS.map((t) => (
                <button key={t} className={t === tab ? 'tab tab-active' : 'tab'} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <span className="spacer"></span>
            <button className="btn btn-light" onClick={() => window.print()}>Print report</button>
          </div>

          {tab === 'Hall-wise' && (
            <div>
              <div className="toolbar no-print">
                <select className="input" value={selectedHall || ''} onChange={(e) => setHallName(e.target.value)}>
                  {halls.map((h) => (
                    <option key={h.hall.id} value={h.hall.name}>{h.hall.name}</option>
                  ))}
                </select>
                <span className="muted">{hallRows.length} students</span>
              </div>
              <h3 className="sub-title print-only">{selectedHall} seating</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Row</th><th>Bench</th><th>Seat</th><th>Roll no</th><th>Name</th><th>Branch</th></tr>
                  </thead>
                  <tbody>
                    {hallRows.map((s) => (
                      <tr key={s.rollNo}>
                        <td>{s.row}</td>
                        <td>{s.bench}</td>
                        <td>{s.seat}</td>
                        <td>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td><span className="badge">{s.branch}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'Student-wise' && (
            <div>
              <div className="toolbar no-print">
                <input
                  className="input"
                  placeholder="Search by name or roll number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="muted">{studentRows.length} students</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Roll no</th><th>Name</th><th>Branch</th><th>Hall</th><th>Row</th><th>Bench</th><th>Seat</th></tr>
                  </thead>
                  <tbody>
                    {studentRows.map((s) => (
                      <tr key={s.rollNo}>
                        <td>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td><span className="badge">{s.branch}</span></td>
                        <td>{s.hall}</td>
                        <td>{s.row}</td>
                        <td>{s.bench}</td>
                        <td>{s.seat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {studentRows.length === 0 && <p className="empty">No students match your search.</p>}
              </div>
            </div>
          )}

          {tab === 'Occupancy' && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Hall</th><th>Capacity</th><th>Occupied</th><th>Empty</th><th>Occupancy</th></tr>
                </thead>
                <tbody>
                  {halls.map((h) => {
                    const pct = Math.round((h.assigned / h.hall.capacity) * 100)
                    return (
                      <tr key={h.hall.id}>
                        <td>{h.hall.name}</td>
                        <td>{h.hall.capacity}</td>
                        <td>{h.assigned}</td>
                        <td>{h.hall.capacity - h.assigned}</td>
                        <td className="bar-cell">
                          <OccupancyBar percent={pct} />
                          <span>{pct}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Unplaced' && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Roll no</th><th>Name</th><th>Branch</th><th>Reason</th></tr>
                </thead>
                <tbody>
                  {arrangement.unplaced.map((u) => (
                    <tr key={u.rollNo}>
                      <td>{u.rollNo}</td>
                      <td>{u.name}</td>
                      <td><span className="badge">{u.branch}</span></td>
                      <td>{u.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {arrangement.unplaced.length === 0 && <p className="empty">Every student has a seat.</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}