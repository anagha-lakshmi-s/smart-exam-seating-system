import { useState } from 'react'
import { AuthContext } from './authContext'
import { authApi } from '../services/api'

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

  // Both login functions ask the backend. They throw an error if the login is refused.
  async function loginAdmin(username, password) {
    const res = await authApi.admin({ username, password })
    saveUser({ role: res.role, name: res.name })
  }

  async function loginStudent(rollNo) {
    const res = await authApi.student({ rollNo })
    saveUser({ role: res.role, name: res.name })
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