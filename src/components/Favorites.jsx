import { useState, useEffect } from 'react'
import { getLikedHousesDetails, removeFromFavorites } from '../services/houseService'
import HouseCard from './HouseCard'
import './Favorites.css'

function Favorites({ userId, onCardClick, onShare, onToast }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadFavorites()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await getLikedHousesDetails(userId)
      setFavorites(data)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (houseId) => {
    try {
      await removeFromFavorites(houseId, userId)
      setFavorites(prev => prev.filter(house => house.id !== houseId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      onToast?.('Failed to remove from favorites. Please try again.')
    }
  }

  const handleShareFavorites = () => {
    if (favorites.length === 0) return
    
    const favoritesList = favorites.map(h => `${h.address} - $${h.price.toLocaleString()}`).join('\n')
    const shareText = `My Favorite Houses from House Swipe:\n\n${favoritesList}\n\nCheck them out!`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Favorite Houses',
        text: shareText
      }).catch(err => console.log('Error sharing:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
      onToast?.('Favorites list copied to clipboard!')
    }
  }

  if (!userId) {
    return (
      <div className="favorites-container">
        <div className="favorites-empty">
          <h2>🔒 Sign in to view your favorites</h2>
          <p>Create an account to save and view your liked houses</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <div className="favorites-empty">
          <h2>❤️ No favorites yet</h2>
          <p>Start swiping to save houses you like!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2 className="favorites-title">Your Favorites ({favorites.length})</h2>
        {favorites.length > 0 && (
          <button className="share-favorites-button" onClick={handleShareFavorites}>
            📤 Share All
          </button>
        )}
      </div>
      <div className="favorites-grid">
        {favorites.map((house) => (
          <div key={house.id} className="favorite-card-wrapper">
            <HouseCard house={house} isActive={false} onCardClick={onCardClick} />
            <button 
              className="remove-favorite-button"
              onClick={() => handleRemoveFavorite(house.id)}
              title="Remove from favorites"
            >
              ❌ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Favorites

