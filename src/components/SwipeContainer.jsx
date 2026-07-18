import { useState, useEffect, useRef, useCallback } from 'react'
import HouseCard from './HouseCard'
import CardErrorBoundary from './CardErrorBoundary'
import { fetchHouseListings, fetchFilteredHouseListings, saveSwipeAction, subscribeToHouseListings } from '../services/houseService'
import { houseListings } from '../data/houseListings' // Fallback data
import './SwipeContainer.css'

// Fisher-Yates -- Array.sort(() => Math.random() - 0.5) is a well-known
// biased shuffle that favors certain orderings over others.
function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function SwipeContainer({ onSwipe, filters = {}, userId = null, onCardClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useSupabase, setUseSupabase] = useState(false)
  const [swipeHistory, setSwipeHistory] = useState([]) // For undo functionality
  const activeCardRef = useRef(null)

  useEffect(() => {
    loadHouseListings()
  }, [filters])

  // Real-time subscription for new listings
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
      const unsubscribe = subscribeToHouseListings((newListing) => {
        console.log('New listing added:', newListing)
        setCards(prev => [newListing, ...prev])
      })

      return () => {
        unsubscribe()
      }
    }
  }, [])

  // Keyboard support: Left/Right arrows mirror the swipe gesture, so the
  // app is fully usable without touch or a mouse drag. Ignored while a
  // text input (e.g. the filter search box) has focus.
  useEffect(() => {
    if (loading) return

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        activeCardRef.current?.swipeLeft()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        activeCardRef.current?.swipeRight()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading])

  const loadHouseListings = async () => {
    try {
      setLoading(true)
      setError(null)
      setCurrentIndex(0) // Reset index when filters change

      const hasFilters = filters.maxPrice || filters.minBedrooms || filters.minBathrooms || filters.searchQuery || (filters.selectedTags && filters.selectedTags.length > 0)

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

  const handleCardSwipe = useCallback(async (direction) => {
    setCurrentIndex((idx) => {
      if (idx >= cards.length || cards.length === 0) return idx

      const houseId = cards[idx].id
      const action = direction === 'right' ? 'like' : 'pass'
      const swipedCard = cards[idx]

      setSwipeHistory(prev => [...prev, { card: swipedCard, index: idx, action }])

      if (useSupabase && userId) {
        saveSwipeAction(houseId, action, userId).catch((err) => {
          console.error('Failed to save swipe action:', err)
        })
      }

      onSwipe(houseId, direction)
      return idx + 1
    })
  }, [cards, useSupabase, userId, onSwipe])

  const handleButtonSwipe = useCallback((direction) => {
    if (direction === 'right') {
      activeCardRef.current?.swipeRight()
    } else {
      activeCardRef.current?.swipeLeft()
    }
  }, [])

  const handleUndo = () => {
    if (swipeHistory.length === 0 || currentIndex === 0) return

    const lastSwipe = swipeHistory[swipeHistory.length - 1]
    setSwipeHistory(prev => prev.slice(0, -1))
    setCurrentIndex(lastSwipe.index)

    onSwipe(lastSwipe.card.id, lastSwipe.action === 'like' ? 'left' : 'right', true) // true = undo
  }

  const currentCard = cards[currentIndex]
  const nextCard = cards[currentIndex + 1]
  const thirdCard = cards[currentIndex + 2]

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
    <div className="swipe-stack">
      <div className="swipe-container">
        {thirdCard && (
          <div className="card-wrapper card-wrapper-peek" style={{ zIndex: 1 }}>
            <CardErrorBoundary resetKey={thirdCard.id}>
              <HouseCard house={thirdCard} />
            </CardErrorBoundary>
          </div>
        )}
        {nextCard && (
          <div className="card-wrapper" style={{ zIndex: 2 }}>
            <CardErrorBoundary resetKey={nextCard.id}>
              <HouseCard house={nextCard} onCardClick={onCardClick} />
            </CardErrorBoundary>
          </div>
        )}
        {currentCard && (
          <div className="card-wrapper" style={{ zIndex: 3 }}>
            <CardErrorBoundary resetKey={currentCard.id} onSkip={() => setCurrentIndex((i) => i + 1)}>
              <HouseCard
                ref={activeCardRef}
                house={currentCard}
                onSwipe={handleCardSwipe}
                isActive={true}
                onCardClick={onCardClick}
              />
            </CardErrorBoundary>
          </div>
        )}
      </div>

      <div className="swipe-actions">
        <button
          className="swipe-action-btn pass-btn"
          onClick={() => handleButtonSwipe('left')}
          aria-label="Pass on this listing"
          title="Pass (Left arrow)"
        >
          ✕
        </button>
        <button
          className="swipe-action-btn undo-btn"
          onClick={handleUndo}
          disabled={swipeHistory.length === 0 || currentIndex === 0}
          aria-label="Undo last swipe"
          title="Undo"
        >
          ↶
        </button>
        <button
          className="swipe-action-btn like-btn"
          onClick={() => handleButtonSwipe('right')}
          aria-label="Like this listing"
          title="Like (Right arrow)"
        >
          ♥
        </button>
      </div>
    </div>
  )
}

export default SwipeContainer
