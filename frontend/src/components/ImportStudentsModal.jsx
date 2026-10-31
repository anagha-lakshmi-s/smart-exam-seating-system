import { useState } from 'react'
import { studentsApi, errorText } from '../services/api'

const REQUIRED = ['rollno', 'name', 'branch', 'semester']
const MAX_ROWS = 2000

function normalizeHeader(h) {
  return h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]/g, '')
}

// Simple CSV line splitter: commas, with optional "double quotes" around a value
function splitLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/)
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }
  if (lines.length === 0 || lines.every((l) => l.trim() === '')) {
    return { error: 'The file is empty.' }
  }

  const headers = splitLine(lines[0]).map(normalizeHeader)
  const missing = REQUIRED.filter((c) => !headers.includes(c))
  if (missing.length > 0) {
    return {
      error: `Invalid CSV columns. Missing: ${missing.join(', ')}. Expected header: rollNo,name,branch,semester,type`,
    }
  }
  if (lines.length === 1) {
    return { error: 'The file has a header but no student rows.' }
  }
  if (lines.length - 1 > MAX_ROWS) {
    return { error: `Too many rows. Import at most ${MAX_ROWS} students at a time.` }
  }

  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line)
    const get = (column) => {
      const i = headers.indexOf(column)
      return i >= 0 ? cells[i] || '' : ''
    }
    return {
      rollNo: get('rollno'),
      name: get('name'),
      branch: get('branch'),
      semester: get('semester'),
      type: get('type'),
    }
  })
  return { rows }
}

export default function ImportStudentsModal({ onImported, onClose }) {
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState([])
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    setResult(null)
    setProblem('')
    setRows([])
    if (!file) return
    setFileName(file.name)
    const parsed = parseCsv(await file.text())
    if (parsed.error) {
      setProblem(parsed.error)
      return
    }
    setRows(parsed.rows)
  }

  async function handleImport() {
    setBusy(true)
    setProblem('')
    try {
      const res = await studentsApi.importRows(rows)
      setResult(res)
      onImported()
    } catch (e) {
      setProblem(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Import students from CSV</h3>
        <p className="muted">
          The first row must be the header: <strong>rollNo,name,branch,semester,type</strong> (type is optional).
        </p>

        <div className="file-row">
          <input type="file" accept=".csv,text/csv" onChange={handleFile} />
        </div>

        {problem && <p className="notice notice-error">{problem}</p>}

        {rows.length > 0 && !result && (
          <p>
            {fileName}: <strong>{rows.length}</strong> rows ready to import.
          </p>
        )}

        {result && (
          <div>
            <p className={result.created > 0 ? 'notice notice-success' : 'notice notice-warn'}>
              Imported {result.created} students. Skipped {result.skipped}.
            </p>
            {result.errors.length > 0 && (
              <div className="table-wrap import-errors">
                <table>
                  <thead>
                    <tr><th>File row</th><th>Roll no</th><th>Problem</th></tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err) => (
                      <tr key={err.row}>
                        <td>{err.row}</td>
                        <td>{err.rollNo}</td>
                        <td>{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>{result ? 'Close' : 'Cancel'}</button>
          {!result && (
            <button className="btn" onClick={handleImport} disabled={busy || rows.length === 0}>
              {busy ? 'Importing...' : 'Import students'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}