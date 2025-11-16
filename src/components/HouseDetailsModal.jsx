import { useState } from 'react'
import './HouseDetailsModal.css'

function HouseDetailsModal({ house, isOpen, onClose, onShare }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || !house) return null

  // Generate multiple images (using the same image for now, but structure supports multiple)
  const images = [house.image, house.image, house.image] // In real app, this would be house.images array

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Generate Google Maps URL for the address
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address)}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* Image Gallery */}
        <div className="modal-image-section">
          <div className="image-container">
            <img src={images[currentImageIndex]} alt={house.address} />
            {images.length > 1 && (
              <>
                <button className="image-nav prev" onClick={handlePreviousImage}>‹</button>
                <button className="image-nav next" onClick={handleNextImage}>›</button>
                <div className="image-indicator">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${house.address} ${index + 1}`}
                  className={currentImageIndex === index ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* House Details */}
        <div className="modal-details">
          <div className="modal-header">
            <h2>{house.address}</h2>
            <div className="modal-price">${house.price.toLocaleString()}</div>
          </div>

          <div className="modal-specs">
            <div className="spec-item">
              <span className="spec-icon">🛏️</span>
              <span>{house.bedrooms} Bedrooms</span>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🛁</span>
              <span>{house.bathrooms} Bathrooms</span>
            </div>
            <div className="spec-item">
              <span className="spec-icon">📐</span>
              <span>{house.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          <div className="modal-description">
            <h3>Description</h3>
            <p>{house.description}</p>
          </div>

          {house.tags && house.tags.length > 0 && (
            <div className="modal-tags">
              {house.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Map Location */}
          <div className="modal-map">
            <h3>Location</h3>
            <div className="map-container">
              <div className="map-placeholder">
                <div className="map-icon">📍</div>
                <p className="map-address">{house.address}</p>
                <a 
                  href={mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link-button"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="modal-contact">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>info@houseswipe.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>(555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🏢</span>
                <span>House Swipe Realty</span>
              </div>
            </div>
            <button className="contact-button">Schedule a Viewing</button>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button className="action-button share-button" onClick={() => onShare(house)}>
              📤 Share Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HouseDetailsModal

