import { houseListings } from '../data/houseListings'
import { getSupabaseClient, isDemoMode } from '../lib/supabase'

const demoSwipeActions = new Map()

const filterLocalListings = (filters = {}) => houseListings.filter((house) => {
  if (filters.maxPrice && house.price > filters.maxPrice) return false
  if (filters.minBedrooms && house.bedrooms < filters.minBedrooms) return false
  if (filters.minBathrooms && house.bathrooms < filters.minBathrooms) return false
  if (filters.searchQuery && !house.address.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
  if (filters.selectedTags?.length && !filters.selectedTags.some((tag) => house.tags?.includes(tag))) return false
  return true
})

const requireUserId = (userId) => {
  if (!userId) {
    throw new Error('You need to be signed in to save listings.')
  }
}

export const fetchHouseListings = async () => {
  if (isDemoMode) return houseListings

  const { data, error } = await getSupabaseClient()
    .from('house_listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const fetchFilteredHouseListings = async (filters = {}) => {
  if (isDemoMode) return filterLocalListings(filters)

  let query = getSupabaseClient()
    .from('house_listings')
    .select('*')

  if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters.minBedrooms) query = query.gte('bedrooms', filters.minBedrooms)
  if (filters.minBathrooms) query = query.gte('bathrooms', filters.minBathrooms)
  if (filters.searchQuery?.trim()) query = query.ilike('address', `%${filters.searchQuery.trim()}%`)
  if (filters.selectedTags?.length) query = query.overlaps('tags', filters.selectedTags)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const getUserSwipeActions = async (userId) => {
  requireUserId(userId)

  if (isDemoMode) {
    return Array.from(demoSwipeActions, ([house_id, action]) => ({ house_id, action }))
  }

  const { data, error } = await getSupabaseClient()
    .from('user_swipes')
    .select('house_id, action')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export const saveSwipeAction = async (houseId, action, userId) => {
  requireUserId(userId)

  if (!['like', 'pass'].includes(action)) {
    throw new Error('Swipe action must be either like or pass.')
  }

  if (isDemoMode) {
    demoSwipeActions.set(houseId, action)
    return { house_id: houseId, action }
  }

  const { data, error } = await getSupabaseClient()
    .from('user_swipes')
    .upsert(
      { house_id: houseId, user_id: userId, action },
      { onConflict: 'user_id,house_id' }
    )
    .select('house_id, action')
    .single()

  if (error) throw error
  return data
}

export const removeSwipeAction = async (houseId, userId) => {
  requireUserId(userId)

  if (isDemoMode) {
    demoSwipeActions.delete(houseId)
    return
  }

  const { error } = await getSupabaseClient()
    .from('user_swipes')
    .delete()
    .eq('house_id', houseId)
    .eq('user_id', userId)

  if (error) throw error
}

export const getLikedHousesDetails = async (userId) => {
  requireUserId(userId)

  if (isDemoMode) {
    return houseListings.filter((house) => demoSwipeActions.get(house.id) === 'like')
  }

  const { data, error } = await getSupabaseClient()
    .from('user_swipes')
    .select(`
      house_id,
      house_listings (*)
    `)
    .eq('action', 'like')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data?.map(({ house_listings: listing }) => listing).filter(Boolean) || []
}

export const removeFromFavorites = removeSwipeAction
