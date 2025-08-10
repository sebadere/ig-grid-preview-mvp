// Simple file-based storage for user data (persists across restarts)
// In production, you'd use a database like Supabase
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), '.user-data.json');

// Load existing data
let userData = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    userData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (error) {
  console.warn('Failed to load user data:', error);
}

// Save data to file
function saveUserData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
  } catch (error) {
    console.warn('Failed to save user data:', error);
  }
}

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
  const userId = url.searchParams.get('user');

  if (req.method === 'GET') {
    // Serve user data publicly (for embeds)
    if (!userId) {
      res.statusCode = 400;
      return res.end('Missing user parameter');
    }

    const data = userData[userId];
    if (!data) {
      res.statusCode = 404;
      return res.end('User data not found');
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ results: data }));

  } else if (req.method === 'POST') {
    // Store user data (authenticated endpoint)
    if (!userId) {
      res.statusCode = 400;
      return res.end('Missing user parameter');
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { data } = JSON.parse(body);
        userData[userId] = data;
        saveUserData(); // Persist to file
        
        console.log(`Stored ${data.length} items for user ${userId}`);
        console.log('Sample data:', data[0]);
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, stored: data.length }));
      } catch (error) {
        console.error('Error storing data:', error);
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });

  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
};
