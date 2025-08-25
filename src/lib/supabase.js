import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL   = import.meta.env.VITE_SUPABASE_URL || 'https://hrsgyzqdsefsjsergafd.supabase.co'
const SUPABASE_ANON  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc2d5enFkc2Vmc2pzZXJnYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5MzksImV4cCI6MjA2OTU2NjkzOX0.fgdmWe_0Qclri57d4uoojHEvH2zJHe8QGETxQMbK2y4'


if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

let _client
export const supabase = (() => {
  if (_client) return _client
  _client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // recommended for browser OAuth
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })
  return _client
})()

// ---- Auth helpers -----------------------------------------------------------

/**
 * Returns the current authenticated user or null.
 * Note: Before login or before the OAuth callback exchanges the code,
 * this will return null (expected).
 */
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

/**
 * Require an authenticated user. Throws if not logged in.
 * Use in actions that must be tied to a user.
 */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('No user session available')
  return user
}

/* ----- OPTIONAL: Anonymous sessions (enable in Supabase first) --------------
   If you want guests to save grids without an account, uncomment this and
   use getOrCreateUser() instead of requireUser()/getCurrentUser().

export async function getOrCreateUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn('Anonymous sign-in failed:', error.message)
    return null
  }
  return data.user
}
------------------------------------------------------------------------------*/

// ---- Data helpers -----------------------------------------------------------

/**
 * Upserts the grid for the current user + Notion DB.
 * Requires an authenticated user (or swap to getOrCreateUser if using guests).
 */
export async function storeUserGrid(notionDbId, gridData) {
  const user = await requireUser()

  const { data, error } = await supabase
    .from('user_grids')
    .upsert(
      {
        user_id: user.id,
        notion_db_id: notionDbId,
        grid_data: gridData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,notion_db_id' }
    )
    .select()

  if (error) throw error
  return data
}

/**
 * Loads the grid for a user + Notion DB.
 * If userId is omitted, it loads for the current logged-in user.
 */
export async function loadUserGrid(notionDbId, userId = null) {
  let targetUserId = userId
  if (!targetUserId) {
    const user = await getCurrentUser()
    targetUserId = user?.id
  }
  if (!targetUserId) return null

  const { data, error } = await supabase
    .from('user_grids')
    .select('grid_data, updated_at')
    .eq('user_id', targetUserId)
    .eq('notion_db_id', notionDbId)
    .single()

  if (error) {
    // PGRST116 = no rows
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.grid_data ?? null
}

/**
 * Public fetch: returns the most recent grid for a given Notion DB,
 * regardless of user. Consider adding a "public" flag in prod.
 */
export async function loadPublicUserGrid(notionDbId) {
  const { data, error } = await supabase
    .from('user_grids')
    .select('grid_data, user_id, updated_at')
    .eq('notion_db_id', notionDbId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data?.grid_data ?? null
}
