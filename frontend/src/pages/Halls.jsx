import { useState } from 'react'
import { hallsApi, errorText } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import HallFormModal from '../components/HallFormModal'
import StatCard from '../components/StatCard'
import LoadState from '../components/LoadState'
import Toast from '../components/Toast'

export default function Halls() {
  const { data, loading, error, reload } = useFetch(hallsApi.list)
  const halls = data || []
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  const availableSeats = halls.filter((h) => h.available).reduce((sum, h) => sum + h.capacity, 0)

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(hall) {
    setEditing(hall)
    setModalOpen(true)
  }

  async function handleSave(form) {
    try {
      if (form.id) await hallsApi.update(form.id, form)
      else await hallsApi.create(form)
      setModalOpen(false)
      setToast({ type: 'success', message: form.id ? 'Hall updated.' : 'Hall added.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  async function toggleAvailable(h) {
    try {
      await hallsApi.update(h.id, {
        name: h.name,
        rows: h.rows,
        benches: h.benches,
        seatsPerBench: h.seatsPerBench,
        available: !h.available,
      })
      setToast({
        type: 'success',
        message: `${h.name} is now ${h.available ? 'unavailable' : 'available'}. Regenerate the seating to apply this.`,
      })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this hall and its seats?')) return
    try {
      await hallsApi.remove(id)
      setToast({ type: 'success', message: 'Hall deleted.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <h2 className="page-title">Halls</h2>
      <LoadState loading={loading && !data} error={error} onRetry={reload} />

      {data && (
        <>
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
                    <td>{h.capacity}</td>
                    <td>
                      <span className={h.available ? 'badge' : 'badge badge-off'}>
                        {h.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-light" onClick={() => openEdit(h)}>Edit</button>
                        <button className="btn btn-light" onClick={() => toggleAvailable(h)}>
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
        </>
      )}

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