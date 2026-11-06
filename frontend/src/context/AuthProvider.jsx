
import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { authApi } from '../services/api'

const STORAGE_KEY = 'seatiq_user'

function getExpiry(accessToken) {
  try {
    const payload = JSON.parse(
      atob(
        accessToken.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    )

    return payload.exp * 1000
  } catch {
    return 0
  }
}

function loadUser() {
  try {
    const savedUser = JSON.parse(sessionStorage.getItem(STORAGE_KEY))

    if (!savedUser?.accessToken) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }

    const expiresAt = getExpiry(savedUser.accessToken)

    if (!expiresAt || expiresAt <= Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }

    return { ...savedUser, expiresAt }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  useEffect(() => {
    if (!user) return

    const remainingTime = user.expiresAt - Date.now()

    if (remainingTime <= 0) {
      setUser(null)
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }

    const timer = setTimeout(() => {
      setUser(null)
      sessionStorage.removeItem(STORAGE_KEY)
    }, remainingTime)

    return () => clearTimeout(timer)
  }, [user])

  function saveUser(response) {
    const expiresAt = getExpiry(response.accessToken)

    if (!expiresAt || expiresAt <= Date.now()) {
      throw new Error('The server returned an invalid or expired token.')
    }

    const authenticatedUser = {
      role: response.role,
      name: response.name,
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresIn: response.expiresIn,
      expiresAt
    }

    setUser(authenticatedUser)
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(authenticatedUser)
    )
  }

  async function loginAdmin(username, password) {
    const response = await authApi.admin({ username, password })
    saveUser(response)
  }

  async function loginStudent(rollNo, password) {
    const response = await authApi.student({ rollNo, password })
    saveUser(response)
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{ user, loginAdmin, loginStudent, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
