import { useEffect } from 'react'
import './Toast.css'

// Non-blocking replacement for alert(). alert() freezes the whole tab
// until dismissed, which is jarring for something as low-stakes as
// "copied to clipboard."
function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default Toast
