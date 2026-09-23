import { useEffect, useMemo, useState } from 'react'
import Auth from './components/Auth'
import Favorites from './components/Favorites'
import FilterBar from './components/FilterBar'
import HouseDetailsModal from './components/HouseDetailsModal'
import Profile from './components/Profile'
import SwipeContainer from './components/SwipeContainer'
import { isDemoMode, isSupabaseConfigured } from './lib/supabase'
import {
  countSwipeActions,
  removeSwipeFromState,
  saveSwipeToState,
  toSwipeMap,
} from './lib/swipeState'
import { getCurrentUser, onAuthStateChange, signOut } from './services/authService'
import { getUserSwipeActions } from './services/houseService'
import './App.css'

const initialFilters = {
  maxPrice: null,
  minBedrooms: 0,
  minBathrooms: 0,
  searchQuery: '',
  selectedTags: [],
}

function App() {
  const [user, setUser] = useState(isDemoMode ? { id: 'preview-user', email: 'preview@renter.local' } : null)
  const [loading, setLoading] = useState(isSupabaseConfigured && !isDemoMode)
  const [activeTab, setActiveTab] = useState('discover')
  const [swipeActions, setSwipeActions] = useState({})
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (isDemoMode) return undefined
    if (!isSupabaseConfigured) return undefined

    let active = true

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data: { subscription } } = onAuthStateChange((_, session) => {
      if (active) {
        setUser(session?.user ?? null)
        if (!session?.user) setSwipeActions({})
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined

    let active = true

    getUserSwipeActions(user.id)
      .then((swipes) => {
        if (active) setSwipeActions(toSwipeMap(swipes))
      })
      .catch(() => {
        if (active) setNotice({ tone: 'error', text: 'We could not load your saved decisions. Please refresh and try again.' })
      })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const swipeStats = useMemo(() => countSwipeActions(swipeActions), [swipeActions])
  const swipedHouseIds = useMemo(() => Object.keys(swipeActions), [swipeActions])

  const handleSignOut = async () => {
    if (isDemoMode) {
      setNotice({ tone: 'success', text: 'Demo mode keeps the preview account active.' })
      return
    }

    try {
      await signOut()
      setActiveTab('discover')
      setNotice({ tone: 'success', text: 'You have been signed out.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'We could not sign you out. Please try again.' })
    }
  }

  const handleShareHouse = async (house) => {
    const text = `${house.address} — $${house.price.toLocaleString()}\n${house.description}`

    try {
      if (navigator.share) {
        await navigator.share({ title: house.address, text, url: window.location.origin })
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.origin}`)
        setNotice({ tone: 'success', text: 'Listing details copied to your clipboard.' })
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice({ tone: 'error', text: 'We could not share this listing. Please try again.' })
      }
    }
  }

  const handleShareFavorites = async (favorites) => {
    const text = favorites.map((house) => `${house.address} — $${Number(house.price).toLocaleString()}`).join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Renter shortlist', text })
      } else {
        await navigator.clipboard.writeText(text)
        setNotice({ tone: 'success', text: 'Your shortlist was copied to the clipboard.' })
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setNotice({ tone: 'error', text: 'We could not share your shortlist. Please try again.' })
      }
    }
  }

  if (!isSupabaseConfigured && !isDemoMode) {
    return (
      <main className="configuration-page">
        <section className="configuration-card" aria-labelledby="configuration-title">
          <p className="eyebrow">Renter setup</p>
          <h1 id="configuration-title">Connect your secure data source</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a local
            <code> .env </code> file, then apply the reviewed production schema before running the app.
          </p>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="loading-page" aria-label="Loading Renter">
        <div className="loading-mark" aria-hidden="true" />
        <p>Preparing your home search</p>
      </main>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setNotice({ tone: 'success', text: 'Welcome to Renter.' })} />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={() => setActiveTab('discover')}>
          <span className="brand-mark" aria-hidden="true">R</span>
          <span>Renter</span>
        </button>

        <nav className="primary-nav" aria-label="Main navigation">
          {[
            ['discover', 'Discover'],
            ['favorites', `Saved (${swipeStats.liked})`],
            ['profile', 'Profile'],
          ].map(([tab, label]) => (
            <button
              key={tab}
              className={activeTab === tab ? 'nav-link active' : 'nav-link'}
              type="button"
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="account-menu">
          <span className="account-email" title={user.email}>{user.email}</span>
          <button className="text-button" type="button" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'discover' && (
          <>
            <section className="discover-intro" aria-labelledby="discover-title">
              <div>
                <p className="eyebrow">Curated for your next move</p>
                <h1 id="discover-title">Find a home that feels like yours.</h1>
                <p className="intro-copy">Set your priorities, explore each listing, and save the places worth another look.</p>
              </div>
              <dl className="decision-summary" aria-label="Your search activity">
                <div>
                  <dt>Saved</dt>
                  <dd>{swipeStats.liked}</dd>
                </div>
                <div>
                  <dt>Passed</dt>
                  <dd>{swipeStats.passed}</dd>
                </div>
              </dl>
            </section>

            <FilterBar filters={filters} onFilterChange={setFilters} />
            <SwipeContainer
              filters={filters}
              userId={user.id}
              swipedHouseIds={swipedHouseIds}
              onCardClick={setSelectedHouse}
              onSwipeSaved={(houseId, action) => setSwipeActions((current) => saveSwipeToState(current, houseId, action))}
              onSwipeRemoved={(houseId) => setSwipeActions((current) => removeSwipeFromState(current, houseId))}
            />
          </>
        )}

        {activeTab === 'favorites' && (
          <Favorites
            key={user.id}
            userId={user.id}
            onCardClick={setSelectedHouse}
            onShareFavorites={handleShareFavorites}
            onBrowse={() => setActiveTab('discover')}
            onFavoriteRemoved={(houseId) => setSwipeActions((current) => removeSwipeFromState(current, houseId))}
          />
        )}

        {activeTab === 'profile' && <Profile user={user} stats={swipeStats} />}
      </main>

      <HouseDetailsModal
        house={selectedHouse}
        isOpen={Boolean(selectedHouse)}
        onClose={() => setSelectedHouse(null)}
        onShare={handleShareHouse}
      />

      {notice && (
        <div className={`toast toast-${notice.tone}`} role="status" aria-live="polite">
          {notice.text}
        </div>
      )}
    </div>
  )
}

export default App
