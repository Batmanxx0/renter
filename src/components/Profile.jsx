import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/authService'
import { supabase } from '../lib/supabase'
import './Profile.css'

function Profile({ userId }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalPasses: 0,
    totalSwipes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadProfileData()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // Get user info
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Get swipe stats
      const { data: swipes, error } = await supabase
        .from('user_swipes')
        .select('action')
        .eq('user_id', userId)

      if (!error && swipes) {
        const likes = swipes.filter(s => s.action === 'like').length
        const passes = swipes.filter(s => s.action === 'pass').length
        setStats({
          totalLikes: likes,
          totalPasses: passes,
          totalSwipes: swipes.length
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <h2>🔒 Sign in to view your profile</h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2>Profile</h2>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID</span>
            <span className="info-value">{userId.substring(0, 8)}...</span>
          </div>
        </div>

        <div className="profile-stats">
          <h3>Your Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-number">{stats.totalLikes}</div>
              <div className="stat-label">Liked</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👋</div>
              <div className="stat-number">{stats.totalPasses}</div>
              <div className="stat-label">Passed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-number">{stats.totalSwipes}</div>
              <div className="stat-label">Total Swipes</div>
            </div>
          </div>
        </div>

        {stats.totalSwipes > 0 && (
          <div className="profile-insights">
            <h3>Insights</h3>
            <div className="insight-item">
              <span>Like Rate:</span>
              <span className="insight-value">
                {((stats.totalLikes / stats.totalSwipes) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="insight-item">
              <span>Most Active:</span>
              <span className="insight-value">
                {stats.totalLikes > stats.totalPasses ? 'Liker' : 'Picker'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

