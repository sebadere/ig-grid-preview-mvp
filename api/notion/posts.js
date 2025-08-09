const fetch = global.fetch

function parseCookie(header=''){
  return (header || '').split(';').map(
    v=>v.trim().split('=').map(decodeURIComponent)
  ).filter(a=>a[0]).reduce((acc, [k,v]) => {acc[k]=v; return acc}, {});
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const databaseId = url.searchParams.get('database_id');
  
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
    // Query the database for pages
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

    // Transform the data to match our grid format
    const posts = (data.results || []).map(page => {
      let title = 'Untitled';
      let imageUrl = null;

      // Try to extract title from various property types
      for (const [key, property] of Object.entries(page.properties || {})) {
        if (property.type === 'title' && property.title?.[0]?.plain_text) {
          title = property.title[0].plain_text;
        }
        // Look for Name property as backup
        if (key.toLowerCase() === 'name' && property.rich_text?.[0]?.plain_text) {
          title = property.rich_text[0].plain_text;
        }
        // Look for files/images
        if (property.type === 'files' && property.files?.[0]) {
          const file = property.files[0];
          if (file.type === 'external') {
            imageUrl = file.external.url;
          } else if (file.type === 'file') {
            imageUrl = file.file.url;
          }
        }
        // Look for URL property that might contain image URLs
        if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('photo')) && property.url) {
          imageUrl = property.url;
        }
        // Look for rich text that might contain URLs
        if ((key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('photo')) && property.rich_text?.[0]?.plain_text) {
          const text = property.rich_text[0].plain_text;
          if (text.startsWith('http')) {
            imageUrl = text;
          }
        }
      }

      // Fallback to a placeholder if no image found
      if (!imageUrl) {
        imageUrl = `https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
      }

      return {
        id: page.id,
        title,
        url: imageUrl,
        createdTime: page.created_time
      };
    }).filter(post => post.url); // Only include posts with images

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ results: posts }));

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.statusCode = 500;
    res.end(`Server error: ${error.message}`);
  }
};
