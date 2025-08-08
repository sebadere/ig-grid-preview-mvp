const fetch = global.fetch

function parseCookie(header=''){
  return Object.fromEntries(header.split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(a=>a[0]))
}

module.exports = async (req, res) => {
  const cookies = parseCookie(req.headers.cookie || '')
  const token = cookies.notion_token
  if (!token) { res.statusCode=401; return res.end('Not connected') }

  // Notion search for databases
  const r = await fetch('https://api.notion.com/v1/search', {
    method:'POST',
    headers:{
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filter: { property:'object', value:'database' } })
  })
  const j = await r.json()
  const results = (j.results || []).map(db => ({
    id: db.id,
    title: (db.title && db.title[0]?.plain_text) || (db.properties?.Name?.title ? 'Untitled' : ''),
  }))
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ results }))
}
