import { supabase } from '../lib/supabase'

/**
 * Fetch all house listings from Supabase
 * @returns {Promise<Array>} Array of house listings
 */
export const fetchHouseListings = async () => {
  try {
    const { data, error } = await supabase
      .from('house_listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching house listings:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch house listings:', error)
    throw error
  }
}

/**
 * Fetch a single house listing by ID
 * @param {number} id - House listing ID
 * @returns {Promise<Object>} House listing object
 */
export const fetchHouseById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('house_listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching house listing:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch house listing:', error)
    throw error
  }
}

/**
 * Save a user's swipe action (like or pass)
 * @param {number} houseId - House listing ID
 * @param {string} action - 'like' or 'pass'
 * @param {string} userId - Optional user ID
 * @returns {Promise<Object>} Saved swipe record
 */
export const saveSwipeAction = async (houseId, action, userId = null) => {
  try {
    const { data, error } = await supabase
      .from('user_swipes')
      .insert({
        house_id: houseId,
        action: action,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving swipe action:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save swipe action:', error)
    throw error
  }
}

/**
 * Get user's liked houses
 * @param {string} userId - Optional user ID
 * @returns {Promise<Array>} Array of liked house IDs
 */
export const getLikedHouses = async (userId = null) => {
  try {
    let query = supabase
      .from('user_swipes')
      .select('house_id')
      .eq('action', 'like')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching liked houses:', error)
      throw error
    }

    return data?.map(item => item.house_id) || []
  } catch (error) {
    console.error('Failed to fetch liked houses:', error)
    throw error
  }
}

/**
 * Get full house details for liked houses
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of house objects
 */
export const getLikedHousesDetails = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_swipes')
      .select(`
        house_id,
        house_listings (*)
      `)
      .eq('action', 'like')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching liked houses details:', error)
      throw error
    }

    return data?.map(item => item.house_listings).filter(Boolean) || []
  } catch (error) {
    console.error('Failed to fetch liked houses details:', error)
    throw error
  }
}

/**
 * Filter house listings
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Filtered house listings
 */
export const fetchFilteredHouseListings = async (filters = {}) => {
  try {
    let query = supabase
      .from('house_listings')
      .select('*')

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters.minBedrooms) {
      query = query.gte('bedrooms', filters.minBedrooms)
    }

    if (filters.minBathrooms) {
      query = query.gte('bathrooms', filters.minBathrooms)
    }

    if (filters.searchQuery) {
      query = query.ilike('address', `%${filters.searchQuery}%`)
    }

    if (filters.selectedTags && filters.selectedTags.length > 0) {
      query = query.overlaps('tags', filters.selectedTags)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching filtered house listings:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch filtered house listings:', error)
    throw error
  }
}

/**
 * Subscribe to real-time updates for house listings
 * @param {Function} callback - Callback function for new listings
 * @returns {Function} Unsubscribe function
 */
export const subscribeToHouseListings = (callback) => {
  const subscription = supabase
    .channel('house_listings_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'house_listings'
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * Remove a house from favorites
 * @param {number} houseId - House listing ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const removeFromFavorites = async (houseId, userId) => {
  try {
    const { error } = await supabase
      .from('user_swipes')
      .delete()
      .eq('house_id', houseId)
      .eq('user_id', userId)
      .eq('action', 'like')

    if (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to remove from favorites:', error)
    throw error
  }
}

