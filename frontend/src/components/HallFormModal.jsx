import { useState } from 'react'
import { calcCapacity } from '../utils/hall'

export default function HallFormModal({ hall, existingHalls, onSave, onClose }) {
  const isEdit = Boolean(hall)
  const [form, setForm] = useState({
    name: hall?.name || '',
    rows: hall?.rows || '',
    benches: hall?.benches || '',
    seatsPerBench: hall?.seatsPerBench || '',
    available: hall ? hall.available : true,
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  function isWholeNumber(value, min, max) {
    const n = Number(value)
    return Number.isInteger(n) && n >= min && n <= max
  }

  function validate() {
    const found = {}
    const name = form.name.trim()

    if (!name) {
      found.name = 'Hall name is required.'
    } else if (
      existingHalls.some((h) => h.name.toLowerCase() === name.toLowerCase() && h.id !== hall?.id)
    ) {
      found.name = 'A hall with this name already exists.'
    }

    if (!isWholeNumber(form.rows, 1, 30)) found.rows = 'Rows must be a whole number from 1 to 30.'
    if (!isWholeNumber(form.benches, 1, 20)) found.benches = 'Benches must be a whole number from 1 to 20.'
    if (!isWholeNumber(form.seatsPerBench, 1, 4)) found.seatsPerBench = 'Seats per bench must be from 1 to 4.'
    return found
  }

  function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSave({
      id: hall?.id,
      name: form.name.trim(),
      rows: Number(form.rows),
      benches: Number(form.benches),
      seatsPerBench: Number(form.seatsPerBench),
      available: form.available,
    })
  }

  const capacity = calcCapacity({
    rows: Number(form.rows) || 0,
    benches: Number(form.benches) || 0,
    seatsPerBench: Number(form.seatsPerBench) || 0,
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit hall' : 'Add hall'}</h3>

        <label className="field">
          <span>Hall name</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} />
          {errors.name && <small className="error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Rows</span>
          <input className="input" type="number" name="rows" value={form.rows} onChange={handleChange} />
          {errors.rows && <small className="error">{errors.rows}</small>}
        </label>

        <label className="field">
          <span>Benches per row</span>
          <input className="input" type="number" name="benches" value={form.benches} onChange={handleChange} />
          {errors.benches && <small className="error">{errors.benches}</small>}
        </label>

        <label className="field">
          <span>Seats per bench</span>
          <input className="input" type="number" name="seatsPerBench" value={form.seatsPerBench} onChange={handleChange} />
          {errors.seatsPerBench && <small className="error">{errors.seatsPerBench}</small>}
        </label>

        <label className="check">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          <span>Hall is available</span>
        </label>

        <p className="capacity-box">
          Capacity: <strong>{capacity}</strong> seats
        </p>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Add hall'}</button>
        </div>
      </div>
    </div>
  )
}