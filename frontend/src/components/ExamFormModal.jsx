import { useState } from 'react'
import { BRANCHES } from '../services/mockData'

export default function ExamFormModal({ exam, existingExams, subjects, onSave, onClose }) {
  const isEdit = Boolean(exam)
  const [form, setForm] = useState({
    subjectId: exam?.subjectId || '',
    date: exam?.date || '',
    startTime: exam?.startTime || '',
    endTime: exam?.endTime || '',
    branches: exam?.branches || [],
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleBranch(b) {
    const has = form.branches.includes(b)
    setForm({
      ...form,
      branches: has ? form.branches.filter((x) => x !== b) : [...form.branches, b],
    })
  }

  function validate() {
    const found = {}
    const today = new Date().toLocaleDateString('en-CA')

    if (!form.subjectId) found.subjectId = 'Please select a subject.'

    if (!form.date) {
      found.date = 'Exam date is required.'
    } else if (form.date < today && form.date !== exam?.date) {
      found.date = 'Exam date cannot be in the past.'
    }

    if (!form.startTime) found.startTime = 'Start time is required.'
    if (!form.endTime) found.endTime = 'End time is required.'
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      found.endTime = 'End time must be after the start time.'
    }

    if (form.branches.length === 0) found.branches = 'Select at least one branch.'

    const duplicate = existingExams.some(
      (e) =>
        e.subjectId === Number(form.subjectId) &&
        e.date === form.date &&
        e.startTime === form.startTime &&
        e.id !== exam?.id
    )
    if (duplicate && !found.subjectId && !found.date) {
      found.subjectId = 'This exam already exists for the same date and time.'
    }
    return found
  }

  function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({
      id: exam?.id,
      subjectId: Number(form.subjectId),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      branches: form.branches,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit exam' : 'Add exam'}</h3>

        <label className="field">
          <span>Subject</span>
          <select className="input" name="subjectId" value={form.subjectId} onChange={handleChange}>
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
          {errors.subjectId && <small className="error">{errors.subjectId}</small>}
        </label>

        <label className="field">
          <span>Date</span>
          <input className="input" type="date" name="date" value={form.date} onChange={handleChange} />
          {errors.date && <small className="error">{errors.date}</small>}
        </label>

        <label className="field">
          <span>Start time</span>
          <input className="input" type="time" name="startTime" value={form.startTime} onChange={handleChange} />
          {errors.startTime && <small className="error">{errors.startTime}</small>}
        </label>

        <label className="field">
          <span>End time</span>
          <input className="input" type="time" name="endTime" value={form.endTime} onChange={handleChange} />
          {errors.endTime && <small className="error">{errors.endTime}</small>}
        </label>

        <div className="field">
          <span>Branches taking this exam</span>
          <div className="check-group">
            {BRANCHES.map((b) => (
              <label key={b} className="check">
                <input type="checkbox" checked={form.branches.includes(b)} onChange={() => toggleBranch(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
          {errors.branches && <small className="error">{errors.branches}</small>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Add exam'}</button>
        </div>
      </div>
    </div>
  )
}