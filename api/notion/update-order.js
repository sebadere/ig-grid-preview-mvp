const fetch = global.fetch;

function parseCookie(header=''){
  return (header || '').split(';').map(
    v=>v.trim().split('=').map(decodeURIComponent)
  ).filter(a=>a[0]).reduce((acc, [k,v]) => {acc[k]=v; return acc}, {});
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  const cookies = parseCookie(req.headers.cookie || '');
  const token = cookies.notion_token;
  
  if (!token) { 
    res.statusCode = 401; 
    return res.end('Not connected'); 
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { databaseId, orderedIds } = JSON.parse(body);
      
      if (!databaseId || !orderedIds || !Array.isArray(orderedIds)) {
        res.statusCode = 400;
        return res.end('Missing databaseId or orderedIds array');
      }

      // Update each page with an order property
      // Note: This requires your Notion database to have a "Order" number property
      const updatePromises = orderedIds.map(async (pageId, index) => {
        try {
          const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Notion-Version': '2022-06-28',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              properties: {
                'Order': {
                  number: index + 1
                }
              }
            })
          });

          if (!response.ok) {
            console.warn(`Failed to update order for page ${pageId}:`, await response.text());
            return { pageId, success: false, error: response.status };
          }

          return { pageId, success: true, order: index + 1 };
        } catch (error) {
          console.error(`Error updating page ${pageId}:`, error);
          return { pageId, success: false, error: error.message };
        }
      });

      const results = await Promise.all(updatePromises);
      const successful = results.filter(r => r.success).length;
      
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: true,
        updated: successful,
        total: orderedIds.length,
        results
      }));

    } catch (error) {
      console.error('Error updating order:', error);
      res.statusCode = 500;
      res.end(`Server error: ${error.message}`);
    }
  });
};
