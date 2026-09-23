import { useEffect, useRef, useState } from 'react'
import HouseCard from './HouseCard'
import {
  fetchFilteredHouseListings,
  fetchHouseListings,
  removeSwipeAction,
  saveSwipeAction,
} from '../services/houseService'
import './SwipeContainer.css'

const shuffle = (listings) => [...listings].sort(() => Math.random() - 0.5)

function SwipeContainer({
  onCardClick,
  onSwipeRemoved,
  onSwipeSaved,
  filters,
  swipedHouseIds,
  userId,
}) {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const hasActiveFilters = Boolean(
    filters.maxPrice ||
    filters.minBedrooms ||
    filters.minBathrooms ||
    filters.searchQuery ||
    filters.selectedTags?.length
  )

  const skippedIdsRef = useRef(new Set())

  useEffect(() => {
    skippedIdsRef.current = new Set(swipedHouseIds.map(String))
  }, [swipedHouseIds])

  useEffect(() => {
    let active = true

    const loadListings = async () => {
      setLoading(true)
      setError(null)
      setCurrentIndex(0)
      setHistory([])

      try {
        const listings = hasActiveFilters
          ? await fetchFilteredHouseListings(filters)
          : await fetchHouseListings()

        if (active) {
          setCards(shuffle(listings.filter((listing) => !skippedIdsRef.current.has(String(listing.id)))))
        }
      } catch (loadError) {
        if (active) {
          setCards([])
          setError(loadError.message || 'We could not load listings right now.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadListings()

    return () => {
      active = false
    }
  }, [filters, hasActiveFilters])

  const handleCardSwipe = async (direction) => {
    if (saving || !cards[currentIndex]) return

    const card = cards[currentIndex]
    const action = direction === 'right' ? 'like' : 'pass'
    setSaving(true)
    setError(null)

    try {
      await saveSwipeAction(card.id, action, userId)
      setHistory((current) => [...current, { card, index: currentIndex }])
      onSwipeSaved(card.id, action)
      setCurrentIndex((index) => index + 1)
    } catch (saveError) {
      setError(saveError.message || 'We could not save your decision. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUndo = async () => {
    const lastAction = history[history.length - 1]
    if (saving || !lastAction) return

    setSaving(true)
    setError(null)

    try {
      await removeSwipeAction(lastAction.card.id, userId)
      setHistory((current) => current.slice(0, -1))
      setCurrentIndex(lastAction.index)
      onSwipeRemoved(lastAction.card.id)
    } catch (undoError) {
      setError(undoError.message || 'We could not undo that decision. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentCard = cards[currentIndex]
  const nextCard = cards[currentIndex + 1]

  if (loading) {
    return (
      <section className="listing-stage loading-stage" aria-live="polite">
        <div className="loading-mark" aria-hidden="true" />
        <p>Finding listings that match your search</p>
      </section>
    )
  }

  if (error && !currentCard) {
    return (
      <section className="listing-stage empty-stage" aria-live="polite">
        <p className="eyebrow">Unable to load listings</p>
        <h2>Try again in a moment.</h2>
        <p>{error}</p>
        <button className="primary-button" type="button" onClick={() => window.location.reload()}>
          Refresh page
        </button>
      </section>
    )
  }

  if (!currentCard) {
    return (
      <section className="listing-stage empty-stage">
        <p className="eyebrow">Your list is clear</p>
        <h2>{hasActiveFilters ? 'No new matches fit these filters.' : 'You are all caught up.'}</h2>
        <p>{hasActiveFilters ? 'Try widening your search to see more listings.' : 'Check back when new listings are added.'}</p>
      </section>
    )
  }

  return (
    <section className="listing-experience" aria-label="Browse listings">
      <div className="listing-stage">
        {nextCard && (
          <div className="card-wrapper card-wrapper-next" aria-hidden="true">
            <HouseCard house={nextCard} onCardClick={onCardClick} />
          </div>
        )}
        <div className="card-wrapper">
          <HouseCard
            house={currentCard}
            isActive={!saving}
            onCardClick={onCardClick}
            onSwipe={handleCardSwipe}
          />
        </div>
      </div>

      <div className="listing-controls">
        <button className="decision-button pass-button" type="button" disabled={saving} onClick={() => handleCardSwipe('left')}>
          Pass
        </button>
        <button className="undo-button" type="button" disabled={saving || history.length === 0} onClick={handleUndo}>
          Undo
        </button>
        <button className="decision-button save-button" type="button" disabled={saving} onClick={() => handleCardSwipe('right')}>
          Save listing
        </button>
      </div>

      <p className="listing-hint">Swipe left to pass, right to save, or use the buttons above.</p>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </section>
  )
}

export default SwipeContainer
