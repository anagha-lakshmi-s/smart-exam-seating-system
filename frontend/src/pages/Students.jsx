import { useState } from 'react'
import { BRANCHES, initialStudents } from '../services/mockData'
import StudentFormModal from '../components/StudentFormModal'

export default function Students() {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const visible = students.filter((s) => {
    const text = search.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(text) || s.rollNo.toLowerCase().includes(text)
    const matchesBranch = branch === 'All' || s.branch === branch
    return matchesSearch && matchesBranch
  })

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(student) {
    setEditing(student)
    setModalOpen(true)
  }

  function handleSave(data) {
    if (data.id) {
      setStudents(students.map((s) => (s.id === data.id ? data : s)))
    } else {
      const nextId = students.length ? Math.max(...students.map((s) => s.id)) + 1 : 1
      setStudents([...students, { ...data, id: nextId }])
    }
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this student?')) {
      setStudents(students.filter((s) => s.id !== id))
    }
  }

  return (
    <div>
      <h2 className="page-title">Students</h2>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name or roll number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="All">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <span className="muted">{visible.length} students</span>
        <span className="spacer"></span>
        <button className="btn" onClick={openAdd}>+ Add student</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll no</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Semester</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>{s.rollNo}</td>
                <td>{s.name}</td>
                <td><span className="badge">{s.branch}</span></td>
                <td>{s.semester}</td>
                <td><span className={s.type === 'Repeater' ? 'badge badge-warn' : 'badge'}>{s.type}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn btn-light" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="empty">No students match your search.</p>}
      </div>

      {modalOpen && (
        <StudentFormModal
          student={editing}
          existingStudents={students}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}