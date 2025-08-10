const fetch = global.fetch;

function parseCookie(header=''){
  return (header || '').split(';').map(
    v=>v.trim().split('=').map(decodeURIComponent)
  ).filter(a=>a[0]).reduce((acc, [k,v]) => {acc[k]=v; return acc}, {});
}

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://x');
  const databaseId = url.searchParams.get('database_id');
  const lastHash = url.searchParams.get('last_hash');
  
  if (!databaseId) {
    res.statusCode = 400;
    return res.end('Missing database_id parameter');
  }

  const cookies = parseCookie(req.headers.cookie || '');
  const token = cookies.notion_token;
  
  if (!token) { 
    res.statusCode = 401; 
    return res.end('Not connected'); 
  }

  try {
    // Query the database for all current data
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page_size: 50,
        sorts: [
          {
            property: 'Order',
            direction: 'ascending'
          },
          {
            timestamp: 'created_time',
            direction: 'descending'
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      res.statusCode = response.status;
      return res.end(`Notion API error: ${JSON.stringify(data)}`);
    }

    // Create a hash of the current data structure (ids + order + last_edited times)
    const contentString = (data.results || []).map(page => {
      const orderProperty = Object.values(page.properties || {}).find(prop => prop.type === 'number');
      const order = orderProperty?.number || 0;
      return `${page.id}:${order}:${page.last_edited_time}`;
    }).join('|');
    
    // Simple hash function
    const currentHash = contentString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();

    const hasChanges = lastHash && lastHash !== currentHash;
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      hasChanges: hasChanges || false,
      currentHash,
      lastSync: new Date().toISOString(),
      changeCount: data.results?.length || 0
    }));

  } catch (error) {
    console.error('Error checking for sync:', error);
    res.statusCode = 500;
    res.end(`Server error: ${error.message}`);
  }
};
