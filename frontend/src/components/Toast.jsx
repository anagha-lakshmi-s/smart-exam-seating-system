import { useEffect, useRef } from 'react'

export default function Toast({ toast, onClose }) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => closeRef.current(), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null
  return (
    <div className={`toast toast-${toast.type}`} onClick={onClose}>
      {toast.message}
    </div>
  )
}