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
    console.log('entro loca');
    // Query the database for all current data using the same sort as posts.js
    const baseHeaders = {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };

    // const preferOrderPayload = {
    //   page_size: 50,
    //   sorts: [
    //     { property: 'Order', direction: 'ascending' },
    //     { timestamp: 'created_time', direction: 'ascending' }
    //   ]
    // };

    const fallbackPayload = {
      page_size: 50,
      sorts: [
        { timestamp: 'created_time', direction: 'descending' }
      ]
    };

    let response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: baseHeaders
      //body: JSON.stringify(preferOrderPayload)
    });

    if (!response.ok) {
      response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify(fallbackPayload)
      });
    }

    const data = await response.json();

    console.log('data', data);
    
    if (!response.ok) {
      res.statusCode = response.status;
      return res.end(`Notion API error: ${JSON.stringify(data)}`);
    }

    // Create a hash of the current data structure (ids + content + last_edited times)
    const contentString = (data.results || []).map(page => {
      // Get title content
      let title = 'Untitled';
      for (const [key, property] of Object.entries(page.properties || {})) {
        if (property.type === 'title' && property.title?.[0]?.plain_text) {
          title = property.title[0].plain_text;
          break;
        }
      }
      
      return `${page.id}:${title}:${page.last_edited_time}`;
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
