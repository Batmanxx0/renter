import { getSupabaseClient } from '../lib/supabase'

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
export const signUp = async (email, password) => {
  try {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    const { error } = await getSupabaseClient().auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get the current user session
 * @returns {Promise<Object|null>} Current user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function for auth changes
 * @returns {Object} Object with data.subscription for unsubscribe
 */
export const onAuthStateChange = (callback) => {
  return getSupabaseClient().auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
