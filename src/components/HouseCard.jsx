import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { getResponsiveImageProps } from '../utils/responsiveImage'
import './HouseCard.css'

const DISTANCE_THRESHOLD = 100 // px of drag distance that counts as a deliberate swipe
const FLICK_VELOCITY_THRESHOLD = 0.5 // px/ms -- a fast short flick counts even if distance is small
const FLICK_MIN_DISTANCE = 24 // ignore tiny accidental taps registering as a "flick"
const EXIT_DURATION_DRAG = 250 // ms -- card already has momentum, finish the throw quickly
const EXIT_DURATION_PROGRAMMATIC = 350 // ms -- button/keyboard triggered, ease it out

const HouseCard = forwardRef(function HouseCard({ house, onSwipe, isActive = false, onCardClick }, ref) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showOverlay, setShowOverlay] = useState(null)
  const [isExiting, setIsExiting] = useState(false)
  const isDraggingRef = useRef(false)
  const hasResolvedRef = useRef(false) // guards against double-triggering a swipe
  const startPosRef = useRef({ x: 0, y: 0 })
  const lastMoveRef = useRef({ x: 0, t: 0 })
  const velocityRef = useRef(0) // px/ms, signed
  const cardRef = useRef(null)
  const animationFrameRef = useRef(null)
  const exitTimeoutRef = useRef(null)

  useEffect(() => {
    if (!isActive) {
      setPosition({ x: 0, y: 0 })
      setShowOverlay(null)
      setIsExiting(false)
      isDraggingRef.current = false
      hasResolvedRef.current = false
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
    }
  }, [isActive])

  useEffect(() => () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
  }, [])

  const updatePosition = useCallback((deltaX, deltaY) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setPosition({ x: deltaX, y: deltaY })

      if (deltaX > 50) {
        setShowOverlay('like')
      } else if (deltaX < -50) {
        setShowOverlay('pass')
      } else {
        setShowOverlay(null)
      }
    })
  }, [])

  // Animates the card fully off-screen, then reports the swipe once the
  // animation is done. Used by both drag-release and the button/keyboard path,
  // so every swipe -- however it's triggered -- looks and feels the same.
  const triggerSwipe = useCallback((direction, { fromDrag = false } = {}) => {
    if (!isActive || hasResolvedRef.current) return
    hasResolvedRef.current = true
    isDraggingRef.current = false

    const travel = (typeof window !== 'undefined' ? window.innerWidth : 400) + 200
    const exitX = direction === 'right' ? travel : -travel

    setIsExiting(true)
    setShowOverlay(direction === 'right' ? 'like' : 'pass')
    setPosition((prev) => ({ x: exitX, y: fromDrag ? prev.y : 0 }))

    const duration = fromDrag ? EXIT_DURATION_DRAG : EXIT_DURATION_PROGRAMMATIC
    exitTimeoutRef.current = setTimeout(() => {
      onSwipe(direction)
    }, duration)
  }, [isActive, onSwipe])

  useImperativeHandle(ref, () => ({
    swipeLeft: () => triggerSwipe('left'),
    swipeRight: () => triggerSwipe('right'),
  }), [triggerSwipe])

  const handlePointerDown = useCallback((e) => {
    if (!isActive || hasResolvedRef.current) return
    // Only primary button for mouse; touch/pen always qualify
    if (e.pointerType === 'mouse' && e.button !== 0) return

    e.currentTarget.setPointerCapture(e.pointerId)
    isDraggingRef.current = true
    startPosRef.current = { x: e.clientX, y: e.clientY }
    lastMoveRef.current = { x: e.clientX, t: performance.now() }
    velocityRef.current = 0
    setShowOverlay(null)
  }, [isActive])

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || !isActive) return

    const deltaX = e.clientX - startPosRef.current.x
    const deltaY = e.clientY - startPosRef.current.y

    const now = performance.now()
    const dt = now - lastMoveRef.current.t
    if (dt > 0) {
      velocityRef.current = (e.clientX - lastMoveRef.current.x) / dt
    }
    lastMoveRef.current = { x: e.clientX, t: now }

    updatePosition(deltaX, deltaY)
  }, [isActive, updatePosition])

  const resolveRelease = useCallback(() => {
    if (!isDraggingRef.current || !isActive) return
    isDraggingRef.current = false

    const absX = Math.abs(position.x)
    const velocity = velocityRef.current
    const isFlick = Math.abs(velocity) > FLICK_VELOCITY_THRESHOLD && absX > FLICK_MIN_DISTANCE
    const isDrag = absX > DISTANCE_THRESHOLD

    if (isFlick || isDrag) {
      const direction = position.x > 0 ? 'right' : 'left'
      triggerSwipe(direction, { fromDrag: true })
    } else {
      setPosition({ x: 0, y: 0 })
      setShowOverlay(null)
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isActive, position.x, triggerSwipe])

  const handlePointerUp = useCallback((e) => {
    resolveRelease()
  }, [resolveRelease])

  const handlePointerCancel = useCallback(() => {
    isDraggingRef.current = false
    if (!hasResolvedRef.current) {
      setPosition({ x: 0, y: 0 })
      setShowOverlay(null)
    }
  }, [])

  const rotation = position.x * 0.1
  const opacity = !isActive ? 0.95 : Math.max(0.3, 1 - Math.abs(position.x) / 300)
  const isDragging = isDraggingRef.current

  const transition = isDragging
    ? 'none'
    : isExiting
      ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
      : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out'

  return (
    <div
      ref={cardRef}
      className={`house-card ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg)`,
        opacity,
        transition,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {showOverlay === 'like' && <div className="overlay like-overlay">LIKE</div>}
      {showOverlay === 'pass' && <div className="overlay pass-overlay">PASS</div>}

      <div className="card-image">
        <img
          {...getResponsiveImageProps(house.image)}
          alt={house.address}
          loading={isActive ? 'eager' : 'lazy'}
          draggable={false}
        />
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
})

export default HouseCard
