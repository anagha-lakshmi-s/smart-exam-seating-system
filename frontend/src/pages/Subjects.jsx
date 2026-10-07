import { useState } from 'react'
import { initialSubjects } from '../services/mockData'
import SubjectFormModal from '../components/SubjectFormModal'

export default function Subjects() {
  const [subjects, setSubjects] = useState(initialSubjects)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const visible = subjects.filter((s) => {
    const text = search.toLowerCase()
    return s.code.toLowerCase().includes(text) || s.name.toLowerCase().includes(text)
  })

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(subject) {
    setEditing(subject)
    setModalOpen(true)
  }

  function handleSave(data) {
    if (data.id) {
      setSubjects(subjects.map((s) => (s.id === data.id ? data : s)))
    } else {
      const nextId = subjects.length ? Math.max(...subjects.map((s) => s.id)) + 1 : 1
      setSubjects([...subjects, { ...data, id: nextId }])
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this subject?')) {
      setSubjects(subjects.filter((s) => s.id !== id))
    }
  }

  return (
    <div>
      <h2 className="page-title">Subjects</h2>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by code or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted">{visible.length} subjects</span>
        <span className="spacer"></span>
        <button className="btn" onClick={openAdd}>+ Add subject</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td><span className="badge">{s.code}</span></td>
                <td>{s.name}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-light" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="empty">No subjects found.</p>}
      </div>

      {modalOpen && (
        <SubjectFormModal
          subject={editing}
          existingSubjects={subjects}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}