// API Configuration
export const API_BASE = 'https://grid-previewer-api.onrender.com';

// Other configuration constants
export const APP_NAME = 'GridPreviewer';
export const APP_VERSION = '1.0.0';

// Demo data
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
];

// Storage keys
export const STORAGE_KEYS = {
  GRID_ROWS: 'ig-grid-mvp-rows',
  NOTION_DB_ID: 'notionDbId',
  NOTION_DB_TITLE: 'notionDbTitle',
  NOTION_TOKEN: 'notion_token',
  USER_SESSION: 'user-session-id',
  SUPABASE_USER_ID: 'supabase-user-id'
};
