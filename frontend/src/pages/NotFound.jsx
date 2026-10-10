import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-brand">404</h1>
        <p className="login-sub">This page does not exist.</p>
        <Link to="/" className="btn link-btn">Go to home</Link>
      </div>
    </div>
  )
}