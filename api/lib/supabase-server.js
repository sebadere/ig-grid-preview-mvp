const { createClient } = require('@supabase/supabase-js')

// Server-side Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://hrsgyzqdsefsjsergafd.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyc2d5enFkc2Vmc2pzZXJnYWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk5MDkzOSwiZXhwIjoyMDY5NTY2OTM5fQ.1QYjIkZxepZuCdXdpz3K5qQESxfz_0gpMBLoyURILiI'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Store grid data for a user
async function storeUserGrid(userId, notionDbId, gridData) {
  try {
    const { data, error } = await supabase
      .from('user_grids')
      .upsert({
        user_id: userId,
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

    console.log('Stored grid data for user:', userId, 'db:', notionDbId)
    return data
  } catch (error) {
    console.error('Error storing user grid:', error)
    throw error
  }
}

// Load grid data for a specific user and notion DB
async function loadUserGrid(userId, notionDbId) {
  try {
    const { data, error } = await supabase
      .from('user_grids')
      .select('grid_data, updated_at')
      .eq('user_id', userId)
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

// Load grid data by notion DB ID (for public embeds)
// Returns the most recently updated grid for this notion DB
async function loadPublicUserGrid(notionDbId) {
  try {
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

// Get or create anonymous user (for cases where we need a user ID)
async function getOrCreateAnonymousUser(sessionKey) {
  try {
    // For anonymous users, we can use a string ID with prefix
    const userId = `session_${sessionKey}`
    return userId
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    return null
  }
}

module.exports = {
  storeUserGrid,
  loadUserGrid,
  loadPublicUserGrid,
  getOrCreateAnonymousUser,
  supabase
}
