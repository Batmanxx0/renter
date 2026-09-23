import { useId, useState } from 'react'
import './FilterBar.css'

const allTags = [
  'Modern', 'Luxury', 'Family Friendly', 'Pool', 'Spacious', 'Starter Home',
  'Charming', 'Estate', 'Views', 'Smart Home', 'Updated', 'Contemporary',
]

function FilterBar({ onFilterChange, filters }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const hasActiveFilters = Boolean(
    filters.maxPrice ||
    filters.minBedrooms ||
    filters.minBathrooms ||
    filters.searchQuery ||
    filters.selectedTags?.length
  )

  const updateFilters = (changes) => onFilterChange({ ...filters, ...changes })

  const handleTagToggle = (tag) => {
    const currentTags = filters.selectedTags || []
    updateFilters({
      selectedTags: currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    })
  }

  return (
    <section className="filter-bar" aria-label="Listing filters">
      <div className="filter-toolbar">
        <label className="search-field" htmlFor="address-search">
          <span>Search an address</span>
          <input
            id="address-search"
            type="search"
            placeholder="Neighborhood, street, or city"
            value={filters.searchQuery}
            onChange={(event) => updateFilters({ searchQuery: event.target.value })}
          />
        </label>

        <button
          className={isOpen ? 'filter-toggle active' : 'filter-toggle'}
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          Filters{hasActiveFilters ? ' · Active' : ''}
        </button>
      </div>

      {isOpen && (
        <div id={panelId} className="filter-panel">
          <div className="filter-grid">
            <label className="filter-group" htmlFor="max-price">
              <span>Maximum price</span>
              <strong>{filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : 'No limit'}</strong>
              <input
                id="max-price"
                type="range"
                min="100000"
                max="2000000"
                step="50000"
                value={filters.maxPrice || 2000000}
                onChange={(event) => updateFilters({
                  maxPrice: Number(event.target.value) === 2000000 ? null : Number(event.target.value),
                })}
              />
              <small>$100K — $2M+</small>
            </label>

            <label className="filter-group" htmlFor="min-bedrooms">
              <span>Minimum bedrooms</span>
              <select
                id="min-bedrooms"
                value={filters.minBedrooms}
                onChange={(event) => updateFilters({ minBedrooms: Number(event.target.value) })}
              >
                <option value="0">Any</option>
                {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}+</option>)}
              </select>
            </label>

            <label className="filter-group" htmlFor="min-bathrooms">
              <span>Minimum bathrooms</span>
              <select
                id="min-bathrooms"
                value={filters.minBathrooms}
                onChange={(event) => updateFilters({ minBathrooms: Number(event.target.value) })}
              >
                <option value="0">Any</option>
                {[1, 1.5, 2, 2.5, 3, 4].map((value) => <option key={value} value={value}>{value}+</option>)}
              </select>
            </label>
          </div>

          <div className="tag-filter-group">
            <span className="filter-label">What matters to you?</span>
            <div className="tags-filter">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={filters.selectedTags.includes(tag) ? 'tag-filter-button active' : 'tag-filter-button'}
                  type="button"
                  aria-pressed={filters.selectedTags.includes(tag)}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              className="clear-filters"
              type="button"
              onClick={() => onFilterChange({
                maxPrice: null,
                minBedrooms: 0,
                minBathrooms: 0,
                searchQuery: '',
                selectedTags: [],
              })}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default FilterBar
