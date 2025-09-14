import { STORAGE_KEYS } from './config.js';
import { storeUserGrid, loadUserGrid } from './supabase.js';
import { notionClient } from './notion.js';

/**
 * Enhanced State Management for GridPreviewer
 * Handles persistence of grid order, UI preferences, and sync state
 */

// Default UI preferences
const DEFAULT_UI_PREFERENCES = {
  gap: 2,
  radius: 6,
  cols: 3,
  numImages: 9, // default 9, max 12, display first 8
  autoSync: true,
  syncInterval: 300000, // 5 minutes
};

/**
 * State Management Class
 */
class StateManager {
  constructor() {
    this.syncTimer = null;
    this.lastSyncTime = null;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // ============================================================================
  // UI Preferences Management
  // ============================================================================

  /**
   * Load UI preferences from localStorage
   */
  loadUIPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
      if (stored) {
        return { ...DEFAULT_UI_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load UI preferences:', error);
    }
    return DEFAULT_UI_PREFERENCES;
  }

  /**
   * Save UI preferences to localStorage
   */
  saveUIPreferences(preferences) {
    try {
      const current = this.loadUIPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.warn('Failed to save UI preferences:', error);
      return preferences;
    }
  }

  // ============================================================================
  // Grid State Management
  // ============================================================================

  /**
   * Save complete grid state (rows + preferences + metadata)
   */
  async saveGridState(notionDbId, rows, uiPreferences = {}) {
    if (!notionDbId || !rows) return;

    const state = {
      rows,
      preferences: { ...this.loadUIPreferences(), ...uiPreferences },
      lastModified: new Date().toISOString(),
      contentHash: this.generateContentHash(rows),
    };

    // Save to localStorage as backup
    this.saveLocalGridState(notionDbId, state);
    
    // Save to Supabase if user is authenticated
    try {
      await storeUserGrid(notionDbId, state);
      console.log('✅ Grid state saved to Supabase');
    } catch (error) {
      console.warn('Failed to save to Supabase, using local backup:', error);
    }

    // Update UI preferences separately
    this.saveUIPreferences(uiPreferences);
  }

  /**
   * Load complete grid state
   */
  async loadGridState(notionDbId) {
    if (!notionDbId) {
      console.log('❌ loadGridState: No notionDbId provided');
      return null;
    }

    console.log('🔍 loadGridState: Starting for notionDbId:', notionDbId);

    try {
      // Try Supabase first (if user is authenticated)
      console.log('🔍 Trying authenticated Supabase access...');
      const supabaseState = await loadUserGrid(notionDbId);
      if (supabaseState) {
        console.log('📱 SUCCESS: Loaded grid state from authenticated Supabase', {
          hasRows: !!supabaseState.rows,
          rowCount: supabaseState.rows?.length
        });
        return this.validateGridState(supabaseState);
      }
      console.log('📱 Authenticated Supabase returned null');
    } catch (error) {
      console.warn('📱 Failed to load from authenticated Supabase (normal for embeds):', error.message);
    }

    // Try to load public user grid from Supabase (for embeds)
    try {
      console.log('🔍 Trying public Supabase access...');
      const { loadPublicUserGrid } = await import('./supabase.js');
      const publicState = await loadPublicUserGrid(notionDbId);
      if (publicState) {
        console.log('🌍 SUCCESS: Loaded public grid state from Supabase', {
          hasRows: !!publicState.rows,
          rowCount: publicState.rows?.length
        });
        return this.validateGridState(publicState);
      }
      console.log('🌍 Public Supabase returned null');
    } catch (error) {
      console.warn('🌍 Failed to load public grid state:', error.message);
    }

    // Fallback to localStorage
    console.log('🔍 Trying localStorage...');
    const localState = this.loadLocalGridState(notionDbId);
    if (localState) {
      console.log('💾 SUCCESS: Loaded grid state from localStorage', {
        hasRows: !!localState.rows,
        rowCount: localState.rows?.length
      });
      return this.validateGridState(localState);
    }
    console.log('💾 localStorage returned null');

    console.log('❌ loadGridState: No data found from any source');
    return null;
  }

  /**
   * Save grid state to localStorage
   */
  saveLocalGridState(notionDbId, state) {
    try {
      const key = `${STORAGE_KEYS.GRID_ROWS}-${notionDbId}`;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save local grid state:', error);
    }
  }

  /**
   * Load grid state from localStorage
   */
  loadLocalGridState(notionDbId) {
    try {
      const key = `${STORAGE_KEYS.GRID_ROWS}-${notionDbId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load local grid state:', error);
    }
    return null;
  }

  /**
   * Validate and migrate grid state structure
   */
  validateGridState(state) {
    if (!state) return null;

    // Handle legacy format (just rows array)
    if (Array.isArray(state)) {
      return {
        rows: state,
        preferences: DEFAULT_UI_PREFERENCES,
        lastModified: new Date().toISOString(),
        contentHash: this.generateContentHash(state),
      };
    }

    // Ensure all required fields exist
    return {
      rows: state.rows || [],
      preferences: { ...DEFAULT_UI_PREFERENCES, ...(state.preferences || {}) },
      lastModified: state.lastModified || new Date().toISOString(),
      contentHash: state.contentHash || this.generateContentHash(state.rows || []),
    };
  }

  // ============================================================================
  // Sync Management
  // ============================================================================

  /**
   * Start automatic sync if enabled
   */
  startAutoSync(notionDbId, onSyncCallback) {
    const preferences = this.loadUIPreferences();
    if (!preferences.autoSync || !notionDbId) return;

    this.stopAutoSync(); // Clear any existing timer

    this.syncTimer = setInterval(async () => {
      if (this.isOnline && notionClient.isConnected()) {
        try {
          await this.checkAndSyncNotionChanges(notionDbId, onSyncCallback);
        } catch (error) {
          console.warn('Auto-sync failed:', error);
        }
      }
    }, preferences.syncInterval);

    console.log(`🔄 Auto-sync started (${preferences.syncInterval / 1000}s interval)`);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  /**
   * Check for Notion changes and sync if needed
   */
  async checkAndSyncNotionChanges(notionDbId, onChangesDetected) {
    if (!notionDbId || !notionClient.isConnected()) return false;

    try {
      // Get current content hash from Notion
      const response = await notionClient.getPosts(notionDbId);
      const notionRows = this.transformNotionResponse(response);
      const newHash = this.generateContentHash(notionRows);

      // Compare with stored hash
      const storedHash = localStorage.getItem(`${STORAGE_KEYS.NOTION_CONTENT_HASH}-${notionDbId}`);
      
      if (storedHash && storedHash !== newHash) {
        console.log('🔄 Notion content changes detected');
        
        // Store new hash
        localStorage.setItem(`${STORAGE_KEYS.NOTION_CONTENT_HASH}-${notionDbId}`, newHash);
        
        // Get current state to preserve user customizations
        const currentState = await this.loadGridState(notionDbId);
        
        // Merge Notion changes with current order
        const mergedRows = this.mergeNotionChanges(currentState?.rows || [], notionRows);
        
        // Call callback with changes
        if (onChangesDetected) {
          onChangesDetected({
            type: 'content_changed',
            newRows: mergedRows,
            notionRows,
            hasChanges: true
          });
        }
        
        return true;
      }

      // Store hash if first time
      if (!storedHash) {
        localStorage.setItem(`${STORAGE_KEYS.NOTION_CONTENT_HASH}-${notionDbId}`, newHash);
      }

    } catch (error) {
      console.warn('Failed to check Notion changes:', error);
    }

    return false;
  }

  /**
   * Merge Notion content changes with user's custom order
   */
  mergeNotionChanges(currentRows, notionRows) {
    const notionById = notionRows.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    // Update existing items with fresh Notion data, preserve order
    const updatedRows = currentRows
      .map(item => notionById[item.id] || item)
      .filter(item => notionById[item.id]); // Remove items no longer in Notion

    // Add new items from Notion at the end
    const currentIds = new Set(currentRows.map(item => item.id));
    const newItems = notionRows.filter(item => !currentIds.has(item.id));

    return [...updatedRows, ...newItems];
  }

  /**
   * Transform Notion API response to our format
   */
  transformNotionResponse(response) {
    if (!response?.results) return [];

    return response.results.map(page => {
      let title = 'Untitled';
      let imageUrl = null;

      // Extract title and image from Notion properties
      for (const [key, property] of Object.entries(page.properties || {})) {
        if (property.type === 'title' && property.title?.[0]?.plain_text) {
          title = property.title[0].plain_text;
        }
        if (key.toLowerCase() === 'name' && property.rich_text?.[0]?.plain_text) {
          title = property.rich_text[0].plain_text;
        }
        if (property.type === 'files' && property.files?.[0] && !imageUrl) {
          const file = property.files[0];
          imageUrl = file.type === 'external' ? file.external.url : file.file.url;
        }
        if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('photo')) && property.url && !imageUrl) {
          imageUrl = property.url;
        }
      }

      // Fallback image if none found
      if (!imageUrl) {
        const fallbackImages = [
          'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1516822271333-242b3b86aa49?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop'
        ];
        const index = Math.abs(page.id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) % fallbackImages.length;
        imageUrl = fallbackImages[index];
      }

      return {
        id: page.id,
        title,
        url: imageUrl,
        createdTime: page.created_time
      };
    });
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Generate content hash for change detection
   */
  generateContentHash(rows) {
    if (!rows || !Array.isArray(rows)) return '';
    
    const content = rows
      .map(row => `${row.id}-${row.title}-${row.url}`)
      .sort()
      .join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Handle online status changes
   */
  handleOnlineStatus() {
    console.log('🌐 Back online, checking for sync...');
    // Could trigger a sync check here if needed
  }

  /**
   * Get sync status information
   */
  getSyncStatus(notionDbId) {
    const lastSync = localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_TIME}-${notionDbId}`);
    return {
      lastSync: lastSync ? new Date(lastSync) : null,
      isOnline: this.isOnline,
      isConnected: notionClient.isConnected(),
      autoSyncEnabled: this.loadUIPreferences().autoSync
    };
  }

  /**
   * Update last sync time
   */
  updateLastSyncTime(notionDbId) {
    const now = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEYS.LAST_SYNC_TIME}-${notionDbId}`, now);
    this.lastSyncTime = now;
  }
}

// Export singleton instance
export const stateManager = new StateManager();

// Export class for custom instances if needed
export { StateManager };
