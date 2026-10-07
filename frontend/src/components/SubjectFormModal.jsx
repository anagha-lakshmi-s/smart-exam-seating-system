import { useState } from 'react'

export default function SubjectFormModal({ subject, existingSubjects, onSave, onClose }) {
  const isEdit = Boolean(subject)
  const [form, setForm] = useState({
    code: subject?.code || '',
    name: subject?.name || '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const found = {}
    const code = form.code.trim().toUpperCase()

    if (!code) {
      found.code = 'Subject code is required.'
    } else if (existingSubjects.some((s) => s.code === code && s.id !== subject?.id)) {
      found.code = 'This subject code already exists.'
    }
    if (!form.name.trim()) found.name = 'Subject name is required.'
    return found
  }

  function handleSubmit() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({
      id: subject?.id,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{isEdit ? 'Edit subject' : 'Add subject'}</h3>

        <label className="field">
          <span>Subject code</span>
          <input className="input" name="code" value={form.code} onChange={handleChange} />
          {errors.code && <small className="error">{errors.code}</small>}
        </label>

        <label className="field">
          <span>Subject name</span>
          <input className="input" name="name" value={form.name} onChange={handleChange} />
          {errors.name && <small className="error">{errors.name}</small>}
        </label>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSubmit}>{isEdit ? 'Save changes' : 'Add subject'}</button>
        </div>
      </div>
    </div>
  )
}