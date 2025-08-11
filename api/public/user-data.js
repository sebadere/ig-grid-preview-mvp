// Supabase-based storage for user data (multi-user support)
const { storeUserGrid, loadPublicUserGrid, getOrCreateAnonymousUser } = require('../lib/supabase-server');

module.exports = async (req, res) => {
  // Add CORS headers for cross-origin requests (Notion embeds)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://x');
  const notionDbId = url.searchParams.get('user'); // This is actually the notion DB ID
  const sessionKey = url.searchParams.get('session') || req.headers['x-session-id'] || 'default';

  if (req.method === 'GET') {
    // Serve user data publicly (for embeds)
    if (!notionDbId) {
      res.statusCode = 400;
      return res.end('Missing user parameter');
    }

    try {
      const data = await loadPublicUserGrid(notionDbId);
      if (!data) {
        res.statusCode = 404;
        return res.end('User data not found');
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ results: data }));
    } catch (error) {
      console.error('Error loading public user data:', error);
      res.statusCode = 500;
      res.end('Server error');
    }

  } else if (req.method === 'POST') {
    // Store user data
    if (!notionDbId) {
      res.statusCode = 400;
      return res.end('Missing user parameter');
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { data, userId } = JSON.parse(body);
        
        // Use provided userId or create anonymous user
        const finalUserId = userId || await getOrCreateAnonymousUser(sessionKey);
        
        if (!finalUserId) {
          res.statusCode = 500;
          return res.end('Failed to create user session');
        }

        await storeUserGrid(finalUserId, notionDbId, data);
        
        console.log(`Stored ${data.length} items for user ${finalUserId}, notion DB: ${notionDbId}`);
        console.log('Sample data:', data[0]);
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, stored: data.length, userId: finalUserId }));
      } catch (error) {
        console.error('Error storing data:', error);
        res.statusCode = 500;
        res.end('Server error');
      }
    });

  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
};
