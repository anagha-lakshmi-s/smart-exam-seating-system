import { useState } from 'react'
import { subjectsApi, errorText } from '../services/api'
import { useFetch } from '../hooks/useFetch'
import SubjectFormModal from '../components/SubjectFormModal'
import LoadState from '../components/LoadState'
import Toast from '../components/Toast'

export default function Subjects() {
  const { data, loading, error, reload } = useFetch(subjectsApi.list)
  const subjects = data || []
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

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

  async function handleSave(form) {
    try {
      if (form.id) await subjectsApi.update(form.id, form)
      else await subjectsApi.create(form)
      setModalOpen(false)
      setToast({ type: 'success', message: form.id ? 'Subject updated.' : 'Subject added.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this subject?')) return
    try {
      await subjectsApi.remove(id)
      setToast({ type: 'success', message: 'Subject deleted.' })
      reload()
    } catch (e) {
      setToast({ type: 'error', message: errorText(e) })
    }
  }

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <h2 className="page-title">Subjects</h2>
      <LoadState loading={loading && !data} error={error} onRetry={reload} />

      {data && (
        <>
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
        </>
      )}

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