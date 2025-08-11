import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hrsgyzqdsefsjsergafd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc2d5enFkc2Vmc2pzZXJnYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA5MzksImV4cCI6MjA2OTU2NjkzOX0.fgdmWe_0Qclri57d4uoojHEvH2zJHe8QGETxQMbK2y4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get or create anonymous user session
export async function getOrCreateUser() {
  try {
    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      return session.user
    }

    // Create anonymous user if no session exists
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      console.warn('Failed to create anonymous user:', error)
      return null
    }
    
    return data.user
  } catch (error) {
    console.warn('Error getting or creating user:', error)
    return null
  }
}

// Store grid data for a user
export async function storeUserGrid(notionDbId, gridData) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      throw new Error('No user session available')
    }

    const { data, error } = await supabase
      .from('user_grids')
      .upsert({
        user_id: user.id,
        notion_db_id: notionDbId,
        grid_data: gridData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,notion_db_id'
      })
      .select()

    if (error) {
      throw error
    }

    console.log('Stored grid data for user:', user.id, 'db:', notionDbId)
    return data
  } catch (error) {
    console.error('Error storing user grid:', error)
    throw error
  }
}

// Load grid data for a user
export async function loadUserGrid(notionDbId, userId = null) {
  try {
    // If no specific userId provided, try to get current user
    let targetUserId = userId
    if (!targetUserId) {
      const user = await getOrCreateUser()
      targetUserId = user?.id
    }

    if (!targetUserId) {
      return null
    }

    const { data, error } = await supabase
      .from('user_grids')
      .select('grid_data, updated_at')
      .eq('user_id', targetUserId)
      .eq('notion_db_id', notionDbId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null
      }
      throw error
    }

    return data?.grid_data || null
  } catch (error) {
    console.warn('Error loading user grid:', error)
    return null
  }
}

// Public function to load grid data by notion DB ID (for embeds)
export async function loadPublicUserGrid(notionDbId) {
  try {
    // For public access, we need to find any user's grid for this notion DB
    // In a real implementation, you might want to add a "public" flag
    // For now, we'll get the most recently updated grid for this DB
    const { data, error } = await supabase
      .from('user_grids')
      .select('grid_data, user_id, updated_at')
      .eq('notion_db_id', notionDbId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data?.grid_data || null
  } catch (error) {
    console.warn('Error loading public user grid:', error)
    return null
  }
}
