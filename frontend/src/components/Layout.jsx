import { NavLink, Outlet } from 'react-router-dom'
import { APP_NAME } from '../utils/config'

const links = [
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

export default function Layout() {
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
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}