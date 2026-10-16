export default function LoadState({ loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="panel loading-box">
        <div className="spinner"></div>
        <p className="muted">Loading...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="notice notice-error">
        {error}{' '}
        {onRetry && <button className="btn btn-light" onClick={onRetry}>Try again</button>}
      </div>
    )
  }
  return null
}