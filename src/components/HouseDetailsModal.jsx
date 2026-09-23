import { useEffect, useRef } from 'react'
import './HouseDetailsModal.css'

function HouseDetailsModal({ house, isOpen, onClose, onShare }) {
  const closeButton = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    closeButton.current?.focus()
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !house) return null

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address)}`

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button ref={closeButton} className="modal-close" type="button" aria-label="Close listing details" onClick={onClose}>Close</button>

        <div className="modal-image-section">
          <img src={house.image} alt={`Exterior of ${house.address}`} />
        </div>

        <div className="modal-details">
          <div className="modal-header">
            <div>
              <p className="eyebrow">Property details</p>
              <h2 id="listing-title">{house.address}</h2>
            </div>
            <p className="modal-price">${Number(house.price).toLocaleString()}</p>
          </div>

          <dl className="modal-specs">
            <div><dt>Bedrooms</dt><dd>{house.bedrooms}</dd></div>
            <div><dt>Bathrooms</dt><dd>{house.bathrooms}</dd></div>
            <div><dt>Size</dt><dd>{Number(house.sqft).toLocaleString()} sq ft</dd></div>
          </dl>

          <div className="modal-description">
            <h3>About this home</h3>
            <p>{house.description}</p>
          </div>

          {house.tags?.length > 0 && (
            <div className="modal-tags" aria-label="Listing highlights">
              {house.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          )}

          <div className="modal-actions">
            <a className="secondary-button map-link-button" href={mapUrl} target="_blank" rel="noopener noreferrer">
              Open in maps
            </a>
            <button className="primary-button" type="button" onClick={() => onShare(house)}>Share listing</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HouseDetailsModal
