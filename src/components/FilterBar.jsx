import { useState } from 'react'
import './FilterBar.css'

function FilterBar({ onFilterChange, filters }) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) })
  }

  const handleBedroomsChange = (e) => {
    onFilterChange({ ...filters, minBedrooms: parseInt(e.target.value) || 0 })
  }

  const handleBathroomsChange = (e) => {
    onFilterChange({ ...filters, minBathrooms: parseFloat(e.target.value) || 0 })
  }

  const handleTagToggle = (tag) => {
    const currentTags = filters.selectedTags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    onFilterChange({ ...filters, selectedTags: newTags })
  }

  const clearFilters = () => {
    onFilterChange({
      maxPrice: null,
      minBedrooms: 0,
      minBathrooms: 0,
      searchQuery: '',
      selectedTags: []
    })
  }

  // Common tags from house listings
  const allTags = ['Modern', 'Luxury', 'Family Friendly', 'Pool', 'Spacious', 'Starter Home', 'Charming', 'Estate', 'Views', 'Smart Home', 'Updated', 'Contemporary']

  const hasActiveFilters = filters.maxPrice || filters.minBedrooms || filters.minBathrooms || filters.searchQuery || (filters.selectedTags && filters.selectedTags.length > 0)

  return (
    <div className="filter-bar">
      <button 
        className={`filter-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔍 Filters {hasActiveFilters && <span className="filter-badge">●</span>}
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Max Price: ${filters.maxPrice?.toLocaleString() || 'No limit'}</label>
            <input
              type="range"
              min="100000"
              max="2000000"
              step="50000"
              value={filters.maxPrice || 2000000}
              onChange={handlePriceChange}
              className="slider"
            />
            <div className="slider-labels">
              <span>$100K</span>
              <span>$2M</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Min Bedrooms</label>
            <select 
              value={filters.minBedrooms || 0} 
              onChange={handleBedroomsChange}
            >
              <option value={0}>Any</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={5}>5+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Bathrooms</label>
            <select 
              value={filters.minBathrooms || 0} 
              onChange={handleBathroomsChange}
            >
              <option value={0}>Any</option>
              <option value={1}>1+</option>
              <option value={1.5}>1.5+</option>
              <option value={2}>2+</option>
              <option value={2.5}>2.5+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search Address</label>
            <input
              type="text"
              placeholder="Search by address..."
              value={filters.searchQuery || ''}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Tags</label>
            <div className="tags-filter">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-filter-button ${(filters.selectedTags || []).includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterBar

