import { isKnownRoll } from '../utils/mockSeating'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME } from '../utils/config'

export default function Login() {
  const { user, loginAdmin, loginStudent } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/' : '/find-my-seat'} replace />
  }

  function switchMode(m) {
    setMode(m)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'admin') {
      if (!username.trim() || !password) {
        setError('Enter both username and password.')
        return
      }
      if (!loginAdmin(username.trim(), password)) {
        setError('Incorrect username or password.')
        return
      }
      navigate('/')
    } else {
        if (!isKnownRoll(rollNo)) {
        setError('Please enter a valid register number.')
        return
      }
      loginStudent(rollNo.trim())
      navigate('/find-my-seat')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-brand">{APP_NAME}</h1>
        <p className="login-sub">Smart Exam Seating &amp; Hall Allocation System</p>

        <div className="tabs">
          <button
            type="button"
            className={mode === 'admin' ? 'tab tab-active' : 'tab'}
            onClick={() => switchMode('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={mode === 'student' ? 'tab tab-active' : 'tab'}
            onClick={() => switchMode('student')}
          >
            Student
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'admin' ? (
            <>
              <label className="field">
                <span>Username</span>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </>
          ) : (
            <label className="field">
            <span>Register number</span>
              <input
                className="input"
                placeholder="e.g. CS201"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </label>
          )}

          {error && <p className="notice notice-error">{error}</p>}
          <button className="btn" type="submit">Log in</button>
        </form>

        <p className="hint">Demo admin login: admin / admin123</p>
      </div>
    </div>
  )
}