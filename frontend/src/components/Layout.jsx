import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../utils/config'
import { useAuth } from '../hooks/useAuth'

const adminLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/exams', label: 'Exams' },
  { to: '/halls', label: 'Halls' },
  { to: '/generate', label: 'Generate' },
  { to: '/seating', label: 'Seating' },
  { to: '/find-my-seat', label: 'Find my seat' },
  { to: '/reports', label: 'Reports' },
]

const studentLinks = [{ to: '/find-my-seat', label: 'Find my seat' }]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user.role === 'admin' ? adminLinks : studentLinks

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">{APP_NAME}</h1>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role === 'admin' ? 'Admin' : 'Student'}</p>
          </div>
          <button className="btn btn-light btn-block" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}