import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlaceholderPage from './pages/PlaceholderPage'
import Students from './pages/Students'
import Halls from './pages/Halls'
import Subjects from './pages/Subjects'
import Exams from './pages/Exams'
import Seating from './pages/Seating'
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/halls" element={<Halls />} />
        <Route path="/seating" element={<Seating />} />
        <Route path="/find-my-seat" element={<PlaceholderPage title="Find my seat" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
      </Route>
    </Routes>
  )
}