import { useState, useEffect } from 'react'
import SwipeContainer from './components/SwipeContainer'
import Auth from './components/Auth'
import FilterBar from './components/FilterBar'
import Favorites from './components/Favorites'
import HouseDetailsModal from './components/HouseDetailsModal'
import Profile from './components/Profile'
import { getCurrentUser, onAuthStateChange, signOut } from './services/authService'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('swipe') // 'swipe', 'favorites', or 'profile'
  const [likedHouses, setLikedHouses] = useState([])
  const [passedHouses, setPassedHouses] = useState([])
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    maxPrice: null,
    minBedrooms: 0,
    minBathrooms: 0,
    searchQuery: '',
    selectedTags: []
  })

  useEffect(() => {
    // Check for existing session
    getCurrentUser().then(setUser).finally(() => setLoading(false))

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleAuthSuccess = () => {
    getCurrentUser().then(setUser)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setActiveTab('swipe')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSwipe = (houseId, direction, isUndo = false) => {
    if (isUndo) {
      // Handle undo - remove from the appropriate list
      if (direction === 'left') {
        setLikedHouses(prev => prev.filter(id => id !== houseId))
      } else {
        setPassedHouses(prev => prev.filter(id => id !== houseId))
      }
    } else {
      if (direction === 'right') {
        setLikedHouses(prev => [...prev, houseId])
      } else {
        setPassedHouses(prev => [...prev, houseId])
      }
    }
  }

  const handleCardClick = (house) => {
    setSelectedHouse(house)
    setIsModalOpen(true)
  }

  const handleShareHouse = (house) => {
    const shareText = `Check out this house: ${house.address} - $${house.price.toLocaleString()}\n${house.description}\n\nView on House Swipe!`
    const shareUrl = window.location.origin

    if (navigator.share) {
      navigator.share({
        title: `${house.address} - House Swipe`,
        text: shareText,
        url: shareUrl
      }).catch(err => console.log('Error sharing:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('House details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🏠 House Swipe</h1>
            <p>Swipe to find your dream home</p>
          </div>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'swipe' ? 'active' : ''}`}
          onClick={() => setActiveTab('swipe')}
        >
          🔄 Swipe
        </button>
        <button 
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favorites ({likedHouses.length})
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      {activeTab === 'swipe' && (
        <>
          <FilterBar filters={filters} onFilterChange={setFilters} />
          <SwipeContainer 
            onSwipe={handleSwipe} 
            filters={filters}
            userId={user.id}
            onCardClick={handleCardClick}
          />
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Liked:</span>
              <span className="stat-value">{likedHouses.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Passed:</span>
              <span className="stat-value">{passedHouses.length}</span>
            </div>
          </div>
        </>
      )}

      {activeTab === 'favorites' && (
        <Favorites 
          userId={user.id} 
          onCardClick={handleCardClick}
          onShare={handleShareHouse}
        />
      )}

      {activeTab === 'profile' && (
        <Profile userId={user.id} />
      )}

      <HouseDetailsModal
        house={selectedHouse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShare={handleShareHouse}
      />
    </div>
  )
}

export default App

