import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<PlaceholderPage title="Students" />} />
        <Route path="/subjects" element={<PlaceholderPage title="Subjects" />} />
        <Route path="/exams" element={<PlaceholderPage title="Exams" />} />
        <Route path="/halls" element={<PlaceholderPage title="Halls" />} />
        <Route path="/seating" element={<PlaceholderPage title="Seating" />} />
        <Route path="/find-my-seat" element={<PlaceholderPage title="Find my seat" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
      </Route>
    </Routes>
  )
}