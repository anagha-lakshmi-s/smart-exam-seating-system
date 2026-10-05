import StatCard from '../components/StatCard'

export default function Dashboard() {
  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="stat-grid">
        <StatCard label="Total students" value="180" />
        <StatCard label="Total exams" value="4" />
        <StatCard label="Total halls" value="3" />
        <StatCard label="Available seats" value="200" />
        <StatCard label="Assigned" value="178" tone="good" />
        <StatCard label="Unplaced" value="2" tone="bad" />
      </div>
    </div>
  )
}