import { useRef, useState } from 'react'
import './HouseCard.css'

const swipeThreshold = 110

function HouseCard({ house, isActive = false, onCardClick, onSwipe }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const startPosition = useRef({ x: 0, y: 0 })
  const offset = useRef({ x: 0, y: 0 })

  const handlePointerDown = (event) => {
    if (!isActive) return

    event.currentTarget.setPointerCapture(event.pointerId)
    startPosition.current = { x: event.clientX, y: event.clientY }
    offset.current = { x: 0, y: 0 }
    setDragging(true)
  }

  const handlePointerMove = (event) => {
    if (!dragging || !isActive) return

    offset.current = {
      x: event.clientX - startPosition.current.x,
      y: event.clientY - startPosition.current.y,
    }
    setPosition(offset.current)
  }

  const finishDrag = () => {
    if (!dragging) return

    setDragging(false)

    if (Math.abs(offset.current.x) >= swipeThreshold) {
      onSwipe(offset.current.x > 0 ? 'right' : 'left')
      return
    }

    offset.current = { x: 0, y: 0 }
    setPosition({ x: 0, y: 0 })
  }

  const overlay = position.x >= 52 ? 'Saved' : position.x <= -52 ? 'Pass' : null
  const rotation = position.x * 0.045
  const tags = house.tags || []

  return (
    <article
      className={`house-card ${isActive ? 'active' : ''} ${dragging ? 'dragging' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y * 0.12}px, 0) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : undefined,
      }}
      onPointerCancel={finishDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
    >
      <div className="card-image">
        <img src={house.image} alt={`Exterior of ${house.address}`} loading="lazy" />
        <div className="listing-price">${Number(house.price).toLocaleString()}</div>
        {overlay && <div className={`swipe-overlay ${overlay === 'Saved' ? 'saved' : 'passed'}`}>{overlay}</div>}
      </div>

      <div className="card-content">
        <div className="listing-title-row">
          <div>
            <p className="listing-kicker">Available now</p>
            <h2 className="card-address">{house.address}</h2>
          </div>
        </div>

        <dl className="card-details" aria-label="Property details">
          <div><dt>Beds</dt><dd>{house.bedrooms}</dd></div>
          <div><dt>Baths</dt><dd>{house.bathrooms}</dd></div>
          <div><dt>Area</dt><dd>{Number(house.sqft).toLocaleString()} sq ft</dd></div>
        </dl>

        <p className="card-description">{house.description}</p>

        {tags.length > 0 && (
          <div className="card-tags" aria-label="Listing highlights">
            {tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}

        <button
          className="details-button"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onCardClick?.(house)}
        >
          View details
        </button>
      </div>
    </article>
  )
}

export default HouseCard
