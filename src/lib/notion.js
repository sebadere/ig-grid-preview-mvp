import { API_BASE, STORAGE_KEYS } from './config.js';

/**
 * Notion Integration Class for Token-Based Authentication
 * Handles OAuth flow, token storage, and authenticated API requests
 */
class NotionIntegration {
  constructor(apiBaseUrl = API_BASE) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.NOTION_TOKEN);
  }

  // Check if user is connected
  isConnected() {
    return !!this.getToken();
  }

  // Start OAuth flow
  startConnection() {
    window.location.href = `${this.apiBaseUrl}/api/notion/start`;
  }

  // Handle OAuth callback (call this on your onboarding page)
  handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const notionToken = urlParams.get('notion_token');

    if (notionToken) {
      localStorage.setItem(STORAGE_KEYS.NOTION_TOKEN, notionToken);
      
      // Clean up URL (remove token from URL for security)
      const url = new URL(window.location);
      url.searchParams.delete('notion_token');
      window.history.replaceState({}, document.title, url.toString());
      
      console.log('Notion connected successfully!');
      return true;
    }
    return false;
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No Notion token found. Please connect your account.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token is invalid, remove it
      localStorage.removeItem(STORAGE_KEYS.NOTION_TOKEN);
      throw new Error('Notion token expired. Please reconnect.');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // API methods
  async checkStatus() {
    return await this.makeRequest('/api/notion/status');
  }

  async getDatabases() {
    return await this.makeRequest('/api/notion/databases');
  }

  async getPosts(databaseId) {
    return await this.makeRequest(`/api/notion/posts?databaseId=${databaseId}`);
  }

  // Logout
  logout() {
    localStorage.removeItem(STORAGE_KEYS.NOTION_TOKEN);
    
    // Optional: notify server (don't use credentials: include anymore)
    fetch(`${this.apiBaseUrl}/api/notion/logout`, {
      method: 'POST'
    }).catch(() => {}); // Ignore errors
  }
}

// Export singleton instance
export const notionClient = new NotionIntegration();

// Export class for custom instances
export { NotionIntegration };

// Helper function for safe Notion requests with automatic error handling
export async function safeNotionRequest(requestFunction) {
  try {
    return await requestFunction();
  } catch (error) {
    if (error.message.includes('No Notion token') || error.message.includes('token expired')) {
      // Redirect to connection flow
      notionClient.startConnection();
    } else {
      console.error('Notion API error:', error);
      throw error; // Re-throw for handling by caller
    }
  }
}
