import { useEffect, useState } from 'react'
import HouseCard from './HouseCard'
import { getLikedHousesDetails, removeFromFavorites } from '../services/houseService'
import './Favorites.css'

function Favorites({ onBrowse, onCardClick, onFavoriteRemoved, onShareFavorites, userId }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    let active = true
    getLikedHousesDetails(userId)
      .then((listings) => {
        if (active) setFavorites(listings)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'We could not load your saved listings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  const handleRemove = async (houseId) => {
    setRemovingId(houseId)
    setError(null)

    try {
      await removeFromFavorites(houseId, userId)
      setFavorites((current) => current.filter((house) => house.id !== houseId))
      onFavoriteRemoved(houseId)
    } catch (removeError) {
      setError(removeError.message || 'We could not remove this saved listing. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <section className="saved-page loading-saved" aria-live="polite">
        <div className="loading-mark" aria-hidden="true" />
        <p>Loading your saved places</p>
      </section>
    )
  }

  return (
    <section className="saved-page" aria-labelledby="saved-title">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1 id="saved-title">Saved listings</h1>
          <p>Everything you want to return to, in one considered list.</p>
        </div>
        {favorites.length > 0 && (
          <button className="secondary-button" type="button" onClick={() => onShareFavorites(favorites)}>
            Share shortlist
          </button>
        )}
      </header>

      {error && <p className="inline-error" role="alert">{error}</p>}

      {favorites.length === 0 ? (
        <div className="empty-panel">
          <p className="eyebrow">Nothing saved yet</p>
          <h2>Your shortlist starts with one good match.</h2>
          <p>Browse available homes and save the listings you want to revisit.</p>
          <button className="primary-button" type="button" onClick={onBrowse}>Browse listings</button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((house) => (
            <div key={house.id} className="favorite-card-wrapper">
              <HouseCard house={house} onCardClick={onCardClick} />
              <button
                className="remove-favorite-button"
                type="button"
                disabled={removingId === house.id}
                onClick={() => handleRemove(house.id)}
              >
                {removingId === house.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Favorites
