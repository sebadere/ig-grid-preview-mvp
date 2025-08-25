import { API_BASE, DEMO_ROWS, STORAGE_KEYS } from '../config.js';

const STATE_KEY = STORAGE_KEYS.GRID_ROWS
export const STORAGE_KEY = STATE_KEY

async function getJSON(path, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function loadRows(){
  try { const raw = localStorage.getItem(STATE_KEY); if(raw) return JSON.parse(raw) } catch(e){}
  return DEMO_ROWS.slice(0,9)
}

export async function loadRowsAsync(){
  // Check if user has selected a Notion database
  const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID);
  
  if (notionDbId) {
    try {
      // Try to fetch from Notion first
      console.log('📡 Fetching from Notion API:', `/api/notion/posts?databaseId=${notionDbId}`);
      const response = await getJSON(`/api/notion/posts?databaseId=${notionDbId}`);
      console.log('📡 Notion API response:', response);
      
      if (response.results && response.results.length > 0) {
        // Transform Notion API response to our format
        const transformedResults = response.results.map(page => {
          let title = 'Untitled';
          let imageUrl = null;

          // Extract title from Notion properties
          for (const [key, property] of Object.entries(page.properties || {})) {
            if (property.type === 'title' && property.title?.[0]?.plain_text) {
              title = property.title[0].plain_text;
            }
            // Look for Name property as backup
            if (key.toLowerCase() === 'name' && property.rich_text?.[0]?.plain_text) {
              title = property.rich_text[0].plain_text;
            }
            // Look for files/images (highest priority)
            if (property.type === 'files' && property.files?.[0] && !imageUrl) {
              const file = property.files[0];
              if (file.type === 'external') {
                imageUrl = file.external.url;
              } else if (file.type === 'file') {
                imageUrl = file.file.url;
              }
            }
            // Look for URL property that might contain image URLs
            if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('photo')) && property.url && !imageUrl) {
              imageUrl = property.url;
            }
            // Look for rich text that might contain URLs
            if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('photo')) && property.rich_text?.[0]?.plain_text && !imageUrl) {
              const text = property.rich_text[0].plain_text;
              if (text.startsWith('http')) {
                imageUrl = text;
              }
            }
          }

          // Fallback to placeholder if no image found
          if (!imageUrl) {
            const fallbackImages = [
              'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1516822271333-242b3b86aa49?q=80&w=1200&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop'
            ];
            const index = Math.abs(page.id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) % fallbackImages.length;
            imageUrl = fallbackImages[index];
          }

          const transformedItem = {
            id: page.id,
            title,
            url: imageUrl,
            createdTime: page.created_time
          };
          
          console.log('🔄 Transformed item:', transformedItem);
          return transformedItem;
        });
        

        
        console.log('✅ Final transformed results:', transformedResults);
        
        // Save the fetched data to localStorage for offline access
        saveRows(transformedResults);
        // Also cache it for embed access
        cacheUserData(notionDbId, transformedResults);

        return transformedResults;
      }
    } catch (error) {
      console.warn('Failed to fetch from Notion, falling back to local data:', error);
      // Try to load cached data first
      try {
        const cached = localStorage.getItem(`user-data-${notionDbId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (cacheError) {
        console.warn('Failed to load cached data:', cacheError);
      }
    }
  }
  
  // Fallback to local storage or demo data
  return loadRows();
}

export function saveRows(rows){ try { localStorage.setItem(STATE_KEY, JSON.stringify(rows)) } catch(e){} }

export function isNotionConnected() {
  return Boolean(localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID));
}

export async function logoutFromNotion() {
  try {
    // Call the logout API to clear server-side cookies
    await fetch(`${API_BASE}/api/notion/logout`, { 
      method: 'POST', 
      credentials: 'include' 
    });
  } catch (error) {
    console.warn('Failed to call logout API:', error);
  }
  
  // Clear all local Notion data
  localStorage.removeItem(STORAGE_KEYS.NOTION_DB_ID);
  localStorage.removeItem(STORAGE_KEYS.NOTION_DB_TITLE);
  localStorage.removeItem(STATE_KEY); // Clear cached posts
}

// New function to load data for a specific user by database ID
export async function loadRowsForUser(databaseId) {
  if (!databaseId) {
    return DEMO_ROWS.slice(0, 9);
  }
  
  const userCacheKey = `user-data-${databaseId}`;
  
  // First, try to fetch fresh data from Notion (prioritize fresh content)
  try {
    const response = await getJSON(`/api/notion/posts?databaseId=${databaseId}`);
    if (response.results && response.results.length > 0) {
      // Transform to ensure proper format
      const transformedResults = response.results.map(item => ({
        id: item.id || `${item.title}-${Date.now()}`,
        title: item.title || 'Untitled',
        url: item.url || '',
        createdTime: item.createdTime || new Date().toISOString()
      }));
      

      
      // Try to get custom order from Supabase first, then fallback to public store
      let customOrder = null;
      
      try {
        // Try Supabase first (client-side)
        const { loadPublicUserGrid } = await import('../supabase');
        customOrder = await loadPublicUserGrid(databaseId);
        if (customOrder) {
          console.log('Found custom order in Supabase');
        }
      } catch (supabaseError) {
        console.warn('Failed to load from Supabase:', supabaseError);
      }
      
      // Fallback to public API
      if (!customOrder) {
        try {
          const publicResponse = await fetch(`/api/public/user-data?user=${databaseId}`);
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            if (publicData.results && publicData.results.length > 0) {
              customOrder = publicData.results;
              console.log('Found custom order in public API');
            }
          }
        } catch (e) {
          console.warn('Failed to load from public API:', e);
        }
      }
      
      // Apply custom order if found
      if (customOrder) {
        // Apply custom order by matching IDs
        const notionById = transformedResults.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
        
        // Use custom order but with fresh Notion data
        const reordered = customOrder
          .map(studioItem => notionById[studioItem.id] || studioItem)
          .filter(Boolean);
        
        // Add any new Notion items not in custom order at the end
        const customIds = new Set(customOrder.map(item => item.id));
        const newItems = transformedResults.filter(item => !customIds.has(item.id));
        
        const finalResults = [...reordered, ...newItems];
        
        // Cache and return
        try { localStorage.setItem(userCacheKey, JSON.stringify(finalResults)); } catch {}
        return finalResults;
      }
      
      // No custom order, use Notion order
      try { localStorage.setItem(userCacheKey, JSON.stringify(transformedResults)); } catch {}
      return transformedResults;
    }
  } catch (error) {
    console.warn('Failed to fetch fresh data from Notion for database:', databaseId, error);
  }

  // Fallback to public store data
  try {
    const publicResponse = await fetch(`/api/public/user-data?user=${databaseId}`);
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      if (publicData.results && publicData.results.length > 0) {
        console.log('Using public store fallback for:', databaseId);
        try { localStorage.setItem(userCacheKey, JSON.stringify(publicData.results)); } catch {}
        return publicData.results;
      }
    }
  } catch {}

  // Fallback to cached data
  try {
    const cached = localStorage.getItem(userCacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.length > 0) {
        console.log('Using cached fallback for:', databaseId);
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached data for user:', databaseId, error);
  }
  
  // Final fallback to demo data
  return DEMO_ROWS.slice(0, 9);
}

// Function to cache user data when they refresh
export function cacheUserData(databaseId, data) {
  if (!databaseId || !data) return;
  
  const userCacheKey = `user-data-${databaseId}`;
  try {
    localStorage.setItem(userCacheKey, JSON.stringify(data));
    // Store last sync time
    localStorage.setItem(`${userCacheKey}-last-sync`, new Date().toISOString());
  } catch (error) {
    console.warn('Failed to cache user data:', error);
  }
}

// Store content hash for change detection
export function storeContentHash(databaseId, hash) {
  if (!databaseId || !hash) return;
  
  try {
    localStorage.setItem(`user-data-${databaseId}-hash`, hash);
  } catch (error) {
    console.warn('Failed to store content hash:', error);
  }
}

// Check for changes in Notion database
export async function checkForNotionChanges(databaseId) {
  if (!databaseId) return false;
  
  try {
    const lastHash = localStorage.getItem(`user-data-${databaseId}-hash`);
    const url = `/api/notion/sync?database_id=${databaseId}${lastHash ? `&last_hash=${lastHash}` : ''}`;
    
    const response = await getJSON(url);

    console.log('response', response);
    
    // Store the new hash for next comparison
    if (response.currentHash) {
      storeContentHash(databaseId, response.currentHash);
    }
    
    return response.hasChanges;
  } catch (error) {
    console.warn('Failed to check for Notion changes:', error);
    return false;
  }
}

// Update order in Notion database
export async function updateNotionOrder(databaseId, orderedIds) {
  if (!databaseId || !orderedIds) return false;
  
  try {
    const response = await fetch(`${API_BASE}/api/notion/update-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ databaseId, orderedIds })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Updated order in Notion:', result);
      return true;
    } else {
      console.warn('Failed to update order in Notion:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('Failed to update order in Notion:', error);
    return false;
  }
}

// Get or create user session for anonymous users
export async function getUserSession() {
  // Check if we already have a session stored
  let sessionId = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
  if (!sessionId) {
    // Generate a unique session ID for this browser
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, sessionId);
  }
  return sessionId;
}

// Function to store user data in public API for embed access
export async function storeUserDataPublic(databaseId, data) {
  if (!databaseId || !data) return;
  
  try {
    const sessionId = await getUserSession();
    
    const response = await fetch(`${API_BASE}/api/public/user-data?user=${databaseId}&session=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify({ data })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Successfully stored user data in Supabase:', result);
      
      // Store the user ID for future requests
      if (result.userId) {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_USER_ID, result.userId);
      }
    } else {
      console.warn('Failed to store user data in Supabase:', response.status);
    }
  } catch (error) {
    console.warn('Failed to store user data in Supabase:', error);
  }
}