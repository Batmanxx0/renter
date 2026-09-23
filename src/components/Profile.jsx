import './Profile.css'

function Profile({ stats, user }) {
  const firstInitial = user.email?.charAt(0).toUpperCase() || 'R'
  const likeRate = stats.total ? Math.round((stats.liked / stats.total) * 100) : 0

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 id="profile-title">Search with intention.</h1>
          <p>Your saved decisions stay private to your Renter account.</p>
        </div>
      </header>

      <div className="profile-layout">
        <section className="profile-card account-card">
          <div className="profile-avatar" aria-hidden="true">{firstInitial}</div>
          <div>
            <p className="eyebrow">Signed in as</p>
            <h2>{user.email}</h2>
            <p className="profile-note">Your history syncs securely across your signed-in sessions.</p>
          </div>
        </section>

        <section className="profile-card activity-card" aria-labelledby="activity-title">
          <div className="profile-card-heading">
            <div>
              <p className="eyebrow">Search activity</p>
              <h2 id="activity-title">Your decisions</h2>
            </div>
            <span className="activity-total">{stats.total} total</span>
          </div>

          <dl className="stats-grid">
            <div className="stat-card"><dt>Saved</dt><dd>{stats.liked}</dd></div>
            <div className="stat-card"><dt>Passed</dt><dd>{stats.passed}</dd></div>
            <div className="stat-card"><dt>Save rate</dt><dd>{likeRate}%</dd></div>
          </dl>
        </section>
      </div>
    </section>
  )
}

export default Profile
