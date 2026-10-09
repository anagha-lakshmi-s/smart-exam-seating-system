export default function OccupancyBar({ percent }) {
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${percent}%` }}></div>
    </div>
  )
}