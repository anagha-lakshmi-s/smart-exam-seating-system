import { useState } from 'react'
import { initialHalls } from '../services/mockData'
import { calcCapacity } from '../utils/hall'
import HallFormModal from '../components/HallFormModal'
import StatCard from '../components/StatCard'

export default function Halls() {
  const [halls, setHalls] = useState(initialHalls)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const availableSeats = halls
    .filter((h) => h.available)
    .reduce((sum, h) => sum + calcCapacity(h), 0)

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(hall) {
    setEditing(hall)
    setModalOpen(true)
  }

  function handleSave(data) {
    if (data.id) {
      setHalls(halls.map((h) => (h.id === data.id ? data : h)))
    } else {
      const nextId = halls.length ? Math.max(...halls.map((h) => h.id)) + 1 : 1
      setHalls([...halls, { ...data, id: nextId }])
    }
    setModalOpen(false)
  }

  function toggleAvailable(id) {
    setHalls(halls.map((h) => (h.id === id ? { ...h, available: !h.available } : h)))
  }

  function handleDelete(id) {
    if (window.confirm('Delete this hall?')) {
      setHalls(halls.filter((h) => h.id !== id))
    }
  }

  return (
    <div>
      <h2 className="page-title">Halls</h2>

      <div className="stat-grid section-gap">
        <StatCard label="Total halls" value={halls.length} />
        <StatCard label="Available halls" value={halls.filter((h) => h.available).length} />
        <StatCard label="Available seats" value={availableSeats} tone="good" />
      </div>

      <div className="toolbar">
        <span className="spacer"></span>
        <button className="btn" onClick={openAdd}>+ Add hall</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hall</th>
              <th>Layout</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {halls.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.rows} rows × {h.benches} benches × {h.seatsPerBench} seats</td>
                <td>{calcCapacity(h)}</td>
                <td>
                  <span className={h.available ? 'badge' : 'badge badge-off'}>
                    {h.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-light" onClick={() => openEdit(h)}>Edit</button>
                    <button className="btn btn-light" onClick={() => toggleAvailable(h.id)}>
                      {h.available ? 'Mark unavailable' : 'Mark available'}
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(h.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {halls.length === 0 && <p className="empty">No halls yet. Click "Add hall" to create one.</p>}
      </div>

      {modalOpen && (
        <HallFormModal
          hall={editing}
          existingHalls={halls}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}