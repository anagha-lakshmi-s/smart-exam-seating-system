import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Halls from './pages/Halls'
import Subjects from './pages/Subjects'
import Exams from './pages/Exams'
import Seating from './pages/Seating'
import Generate from './pages/Generate'
import FindMySeat from './pages/FindMySeat'
import Reports from './pages/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/find-my-seat" element={<FindMySeat />} />

          <Route element={<RequireAuth role="admin" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/seating" element={<Seating />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}