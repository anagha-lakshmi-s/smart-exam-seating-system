import { useState } from 'react'
import { examsApi, subjectsApi, errorText } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import ExamFormModal from '../components/ExamFormModal'
import LoadState from '../components/LoadState'
import Toast from '../components/Toast'

export default function Exams() {
  const { data, loading, error, reload } = useFetch(() =>
    Promise.all([examsApi.list(), subjectsApi.list()])
  )
  const exams = data ? data[0] : []
  const subjects = data ? data[1] : []
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(exam) {
    setEditing(exam)
    setModalOpen(true)
  }

  async function handleSave(form) {
    try {
      if (form.id) await examsApi.update(form.id, form)
      else await examsApi.create(form)
      setModalOpen(false)
      setToast({ type: 'success', message: form.id ? 'Exam updated.' : 'Exam added.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this exam?')) return
    try {
      await examsApi.remove(id)
      setToast({ type: 'success', message: 'Exam deleted.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <h2 className="page-title">Exams</h2>
      <LoadState loading={loading && !data} error={error} onRetry={reload} />

      {data && (
        <>
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
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td>{e.subjectCode} - {e.subjectName}</td>
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
        </>
      )}

      {modalOpen && (
        <ExamFormModal
          exam={editing}
          existingExams={exams}
          subjects={subjects}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}