module.exports = async (req, res) => {
    res.setHeader('Set-Cookie', 'notion_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')
    res.end('ok')
  }
  