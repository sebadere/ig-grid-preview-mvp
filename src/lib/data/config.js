export const DEMO_ROWS = [
  { title: 'Red chair', url: 'https://images.unsplash.com/photo-1516822271333-242b3b86aa49?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Portrait', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { title: 'City', url: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Coffee', url: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Desk', url: 'https://images.unsplash.com/photo-1520975682031-6a1bf3371784?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Notebook', url: 'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Smile', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Leaf', url: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Mount', url: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Wall', url: 'https://images.unsplash.com/photo-1520975592071-d2c3e636a7d0?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Studio', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop' },
  { title: 'Poster', url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1200&auto=format&fit=crop' }
]

const STATE_KEY = 'ig-grid-mvp-rows'
export const STORAGE_KEY = STATE_KEY

// API helper
const API_BASE = typeof window !== 'undefined' && import.meta?.env?.DEV
  ? (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000')
  : ''; // on prod, same origin

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
  const notionDbId = localStorage.getItem('notionDbId');
  
  if (notionDbId) {
    try {
      // Try to fetch from Notion first
      const response = await getJSON(`/api/notion/posts?database_id=${notionDbId}`);
      if (response.results && response.results.length > 0) {
        // Transform to ensure proper format
        const transformedResults = response.results.map(item => ({
          id: item.id || `${item.title}-${Date.now()}`,
          title: item.title || 'Untitled',
          url: item.url || '',
          createdTime: item.createdTime || new Date().toISOString()
        }));
        
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
  return Boolean(localStorage.getItem('notionDbId'));
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
  localStorage.removeItem('notionDbId');
  localStorage.removeItem('notionDbTitle');
  localStorage.removeItem(STATE_KEY); // Clear cached posts
}

// New function to load data for a specific user by database ID
export async function loadRowsForUser(databaseId) {
  if (!databaseId) {
    return DEMO_ROWS.slice(0, 9);
  }
  
  // First, try to get cached data for this user
  const userCacheKey = `user-data-${databaseId}`;
  try {
    const cached = localStorage.getItem(userCacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached data for user:', databaseId, error);
  }
  
  // If no cached data, try to fetch from Notion (only works if user is authenticated)
  try {
    const response = await getJSON(`/api/notion/posts?database_id=${databaseId}`);
    if (response.results && response.results.length > 0) {
      // Transform to ensure proper format
      const transformedResults = response.results.map(item => ({
        id: item.id || `${item.title}-${Date.now()}`,
        title: item.title || 'Untitled',
        url: item.url || '',
        createdTime: item.createdTime || new Date().toISOString()
      }));
      
      // Cache the data for future embed requests
      try {
        localStorage.setItem(userCacheKey, JSON.stringify(transformedResults));
      } catch (e) {
        console.warn('Failed to cache user data:', e);
      }
      return transformedResults;
    }
  } catch (error) {
    console.warn('Failed to fetch from Notion for database:', databaseId, error);
  }
  
  // Fallback to demo data if no results or error
  return DEMO_ROWS.slice(0, 9);
}

// Function to cache user data when they refresh
export function cacheUserData(databaseId, data) {
  if (!databaseId || !data) return;
  
  const userCacheKey = `user-data-${databaseId}`;
  try {
    localStorage.setItem(userCacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache user data:', error);
  }
}