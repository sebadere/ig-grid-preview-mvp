const fetch = global.fetch

function parseCookie(header=''){
  return Object.fromEntries(header.split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(a=>a[0]))
}

module.exports = async (req, res) => {
  const cookies = parseCookie(req.headers.cookie || '')
  const token = cookies.notion_token
  if (!token) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ connected:false }))
    return
  }
  const r = await fetch('https://api.notion.com/v1/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28'
    }
  })
  const j = await r.json()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ connected:r.ok, workspace: j?.bot?.workspace_name || null }))
}
