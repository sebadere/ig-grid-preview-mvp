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

      // Fallback to a placeholder if no image found
      if (!imageUrl) {
        // Use a different unsplash image for each post to make the grid more visually interesting
        const fallbackImages = [
          'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1516822271333-242b3b86aa49?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1520975682031-6a1bf3371784?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=1200&auto=format&fit=crop'
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
    }); // Include all posts, even those without images (they'll get placeholders)

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ results: posts }));

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.statusCode = 500;
    res.end(`Server error: ${error.message}`);
  }
};
