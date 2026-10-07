import { useState } from 'react'
import { initialExams, initialSubjects } from '../services/mockData'
import ExamFormModal from '../components/ExamFormModal'

export default function Exams() {
  const [exams, setExams] = useState(initialExams)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function subjectLabel(id) {
    const s = initialSubjects.find((x) => x.id === id)
    return s ? `${s.code} - ${s.name}` : 'Unknown subject'
  }

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(exam) {
    setEditing(exam)
    setModalOpen(true)
  }

  function handleSave(data) {
    if (data.id) {
      setExams(exams.map((e) => (e.id === data.id ? data : e)))
    } else {
      const nextId = exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1
      setExams([...exams, { ...data, id: nextId }])
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this exam?')) {
      setExams(exams.filter((e) => e.id !== id))
    }
  }

  const sorted = [...exams].sort((a, b) =>
    (a.date + a.startTime).localeCompare(b.date + b.startTime)
  )

  return (
    <div>
      <h2 className="page-title">Exams</h2>

      <div className="toolbar">
        <span className="muted">{exams.length} exams</span>
        <span className="spacer"></span>
        <button className="btn" onClick={openAdd}>+ Add exam</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Branches</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id}>
                <td>{subjectLabel(e.subjectId)}</td>
                <td>{e.date}</td>
                <td>{e.startTime} - {e.endTime}</td>
                <td>
                  <div className="actions">
                    {e.branches.map((b) => (
                      <span key={b} className="badge">{b}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-light" onClick={() => openEdit(e)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {exams.length === 0 && <p className="empty">No exams yet. Click "Add exam" to create one.</p>}
      </div>

      {modalOpen && (
        <ExamFormModal
          exam={editing}
          existingExams={exams}
          subjects={initialSubjects}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}