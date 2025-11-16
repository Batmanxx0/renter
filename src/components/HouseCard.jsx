import { useState, useRef, useEffect, useCallback } from 'react'
import './HouseCard.css'

function HouseCard({ house, onSwipe, isActive = false, onCardClick }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showOverlay, setShowOverlay] = useState(null)
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const cardRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!isActive) {
      setPosition({ x: 0, y: 0 })
      setShowOverlay(null)
      isDraggingRef.current = false
    }
  }, [isActive])

  const updatePosition = useCallback((deltaX, deltaY) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setPosition({ x: deltaX, y: deltaY })
      
      // Update overlay
      if (deltaX > 50) {
        setShowOverlay('like')
      } else if (deltaX < -50) {
        setShowOverlay('pass')
      } else {
        setShowOverlay(null)
      }
    })
  }, [])

  const handleStart = useCallback((clientX, clientY) => {
    if (!isActive) return
    isDraggingRef.current = true
    startPosRef.current = { x: clientX, y: clientY }
    setShowOverlay(null)
  }, [isActive])

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDraggingRef.current || !isActive) return

    const deltaX = clientX - startPosRef.current.x
    const deltaY = clientY - startPosRef.current.y

    updatePosition(deltaX, deltaY)
  }, [isActive, updatePosition])

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current || !isActive) return

    const threshold = 100
    const absX = Math.abs(position.x)

    if (absX > threshold) {
      const direction = position.x > 0 ? 'right' : 'left'
      onSwipe(direction)
    } else {
      // Snap back
      setPosition({ x: 0, y: 0 })
      setShowOverlay(null)
    }

    isDraggingRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isActive, position.x, onSwipe])

  // Touch events
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }, [handleStart])

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }, [handleMove])

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Mouse events
  const handleMouseDown = useCallback((e) => {
    handleStart(e.clientX, e.clientY)
  }, [handleStart])

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY)
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Set up global event listeners when dragging
  useEffect(() => {
    if (!isActive) return

    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) {
        handleMove(e.clientX, e.clientY)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleEnd()
      }
    }

    const handleGlobalTouchMove = (e) => {
      if (isDraggingRef.current) {
        e.preventDefault()
        const touch = e.touches[0]
        handleMove(touch.clientX, touch.clientY)
      }
    }

    const handleGlobalTouchEnd = () => {
      if (isDraggingRef.current) {
        handleEnd()
      }
    }

    // Always add listeners when component is active
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false })
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    document.addEventListener('touchend', handleGlobalTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, handleMove, handleEnd])

  const rotation = position.x * 0.1
  const opacity = !isActive ? 0.95 : Math.max(0.3, 1 - Math.abs(position.x) / 300)
  const isDragging = isDraggingRef.current

  return (
    <div
      ref={cardRef}
      className={`house-card ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {showOverlay === 'like' && <div className="overlay like-overlay">LIKE</div>}
      {showOverlay === 'pass' && <div className="overlay pass-overlay">PASS</div>}
      
      <div className="card-image">
        <img src={house.image} alt={house.address} loading="lazy" />
        <div className="price-badge">${house.price.toLocaleString()}</div>
      </div>
      
      <div className="card-content">
        <h2 className="card-address">{house.address}</h2>
        <div className="card-details">
          <div className="detail-item">
            <span className="detail-icon">🛏️</span>
            <span>{house.bedrooms} bed</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🛁</span>
            <span>{house.bathrooms} bath</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📐</span>
            <span>{house.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
        <p className="card-description">{house.description}</p>
        <div className="card-tags">
          {house.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        {onCardClick && (
          <button 
            className="view-details-button"
            onClick={(e) => {
              e.stopPropagation()
              onCardClick(house)
            }}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

export default HouseCard

