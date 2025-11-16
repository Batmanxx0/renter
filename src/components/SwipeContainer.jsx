import { useState, useEffect } from 'react'
import HouseCard from './HouseCard'
import { fetchHouseListings, fetchFilteredHouseListings, saveSwipeAction, subscribeToHouseListings } from '../services/houseService'
import { houseListings } from '../data/houseListings' // Fallback data
import './SwipeContainer.css'

function SwipeContainer({ onSwipe, filters = {}, userId = null, onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useSupabase, setUseSupabase] = useState(false)
  const [swipeHistory, setSwipeHistory] = useState([]) // For undo functionality

  useEffect(() => {
    loadHouseListings()
  }, [filters])

  // Real-time subscription for new listings
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
      const unsubscribe = subscribeToHouseListings((newListing) => {
        console.log('New listing added:', newListing)
        // Add new listing to the beginning of the array
        setCards(prev => [newListing, ...prev])
      })

      return () => {
        unsubscribe()
      }
    }
  }, [])

  const loadHouseListings = async () => {
    try {
      setLoading(true)
      setError(null)
      setCurrentIndex(0) // Reset index when filters change
      
      // Check if filters are active
      const hasFilters = filters.maxPrice || filters.minBedrooms || filters.minBathrooms || filters.searchQuery || (filters.selectedTags && filters.selectedTags.length > 0)
      
      // Try to fetch from Supabase first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.includes('supabase.co')) {
        try {
          let data
          if (hasFilters) {
            data = await fetchFilteredHouseListings(filters)
          } else {
            data = await fetchHouseListings()
          }
          
          if (data && data.length > 0) {
            setCards(shuffleArray(data))
            setUseSupabase(true)
            setLoading(false)
            return
          }
        } catch (supabaseErr) {
          console.warn('Supabase fetch failed, using local data:', supabaseErr)
        }
      }
      
      // Fallback to local data with filtering
      let localData = houseListings
      if (hasFilters) {
        localData = houseListings.filter(house => {
          if (filters.maxPrice && house.price > filters.maxPrice) return false
          if (filters.minBedrooms && house.bedrooms < filters.minBedrooms) return false
          if (filters.minBathrooms && house.bathrooms < filters.minBathrooms) return false
          if (filters.searchQuery && !house.address.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
          if (filters.selectedTags && filters.selectedTags.length > 0) {
            const houseTags = house.tags || []
            const hasMatchingTag = filters.selectedTags.some(tag => 
              houseTags.some(houseTag => houseTag.toLowerCase() === tag.toLowerCase())
            )
            if (!hasMatchingTag) return false
          }
          return true
        })
      }
      
      setCards(shuffleArray(localData))
    } catch (err) {
      console.error('Error loading house listings:', err)
      setError('Failed to load house listings. Using local data.')
      setCards(shuffleArray(houseListings))
    } finally {
      setLoading(false)
    }
  }

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5)
  }

  const handleCardSwipe = async (direction) => {
    if (currentIndex >= cards.length || cards.length === 0) return
    
    const houseId = cards[currentIndex].id
    const action = direction === 'right' ? 'like' : 'pass'
    const swipedCard = cards[currentIndex]
    
    // Save to history for undo
    setSwipeHistory(prev => [...prev, { card: swipedCard, index: currentIndex, action }])
    
    // Save to Supabase if configured
    if (useSupabase && userId) {
      try {
        await saveSwipeAction(houseId, action, userId)
      } catch (err) {
        console.error('Failed to save swipe action:', err)
      }
    }
    
    onSwipe(houseId, direction)
    setCurrentIndex(prev => prev + 1)
  }

  const handleUndo = () => {
    if (swipeHistory.length === 0 || currentIndex === 0) return
    
    const lastSwipe = swipeHistory[swipeHistory.length - 1]
    setSwipeHistory(prev => prev.slice(0, -1))
    setCurrentIndex(lastSwipe.index)
    
    // Reverse the swipe action
    onSwipe(lastSwipe.card.id, lastSwipe.action === 'like' ? 'left' : 'right', true) // true = undo
  }

  const currentCard = cards[currentIndex]
  const nextCard = cards[currentIndex + 1]

  if (loading) {
    return (
      <div className="swipe-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading house listings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn(error)
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="swipe-container">
        <div className="no-more-cards">
          <h2>🎉 That's all for now!</h2>
          <p>You've seen all available listings</p>
          <button 
            onClick={() => {
              setCurrentIndex(0)
              setCards(shuffleArray(cards))
            }}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="swipe-container">
      {swipeHistory.length > 0 && currentIndex > 0 && (
        <button className="undo-button" onClick={handleUndo} title="Undo last swipe">
          ↶ Undo
        </button>
      )}
      {nextCard && (
        <div className="card-wrapper" style={{ zIndex: 1 }}>
          <HouseCard house={nextCard} onCardClick={onCardClick} />
        </div>
      )}
      {currentCard && (
        <div className="card-wrapper" style={{ zIndex: 2 }}>
          <HouseCard 
            house={currentCard} 
            onSwipe={handleCardSwipe}
            isActive={true}
            onCardClick={onCardClick}
          />
        </div>
      )}
    </div>
  )
}

export default SwipeContainer

