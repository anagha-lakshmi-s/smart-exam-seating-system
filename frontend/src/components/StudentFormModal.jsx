import { useState } from 'react'
import { BRANCHES } from '../services/mockData'

export default function StudentFormModal({ student, existingStudents, onSave, onClose }) {
  const isEdit = Boolean(student)
  const [form, setForm] = useState({
    rollNo: student?.rollNo || '',
    name: student?.name || '',
    branch: student?.branch || '',
    semester: student?.semester || '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const found = {}
    const roll = form.rollNo.trim().toUpperCase()

    if (!roll) {
      found.rollNo = 'Roll number is required.'
    } else if (
      existingStudents.some((s) => s.rollNo.toUpperCase() === roll && s.id !== student?.id)
    ) {
      found.rollNo = 'This roll number already exists.'
    }

    if (!form.name.trim()) found.name = 'Name is required.'
    if (!form.branch) found.branch = 'Please select a branch.'

    const sem = Number(form.semester)
    if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
      found.semester = 'Semester must be a number from 1 to 8.'
    }
    return found
  }

  function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSave({
      id: student?.id,
      rollNo: form.rollNo.trim().toUpperCase(),
      name: form.name.trim(),
      branch: form.branch,
      semester: Number(form.semester),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit student' : 'Add student'}</h3>

        <label className="field">
          <span>Roll number</span>
          <input className="input" name="rollNo" value={form.rollNo} onChange={handleChange} />
          {errors.rollNo && <small className="error">{errors.rollNo}</small>}
        </label>

        <label className="field">
          <span>Name</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} />
          {errors.name && <small className="error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Branch</span>
          <select className="input" name="branch" value={form.branch} onChange={handleChange}>
            <option value="">Select branch</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {errors.branch && <small className="error">{errors.branch}</small>}
        </label>

        <label className="field">
          <span>Semester</span>
          <input
            className="input"
            type="number"
            name="semester"
            value={form.semester}
            onChange={handleChange}
          />
          {errors.semester && <small className="error">{errors.semester}</small>}
        </label>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Add student'}
          </button>
        </div>
      </div>
    </div>
  )
}