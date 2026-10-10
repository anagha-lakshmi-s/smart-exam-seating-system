import { useState } from 'react'
import { AuthContext } from './authContext'

// Demo account until the backend login is built
const ADMINS = [{ username: 'admin', password: 'admin123', name: 'Administrator' }]
const STORAGE_KEY = 'seatiq_user'

function loadUser() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  function saveUser(u) {
    setUser(u)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  function loginAdmin(username, password) {
    const match = ADMINS.find((a) => a.username === username && a.password === password)
    if (!match) return false
    saveUser({ role: 'admin', name: match.name })
    return true
  }

  function loginStudent(rollNo) {
    saveUser({ role: 'student', name: rollNo.toUpperCase() })
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loginAdmin, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  )
}