import { Component } from 'react'

// Isolates a single card's rendering. Without this, a malformed listing
// (missing tags, bad price type, etc.) would crash the whole card stack --
// including cards that are perfectly fine -- since a React error propagates
// up to the nearest boundary. This keeps the blast radius to one card.
class CardErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Card failed to render:', error, info)
  }

  componentDidUpdate(prevProps) {
    // Reset once the underlying listing changes, so the boundary doesn't
    // stay permanently tripped for the next card that swaps into this slot.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card-error-fallback">
          <p>⚠️ This listing couldn't be displayed.</p>
          {this.props.onSkip && (
            <button onClick={this.props.onSkip} className="card-error-skip">
              Skip
            </button>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default CardErrorBoundary
