module.exports = async (req, res) => {
  // Determine environment for cookie security
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  const isProd = protocol === 'https';
  const secure = isProd ? ' Secure;' : '';

  res.setHeader('Set-Cookie', [
    `notion_token=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
    `notion_oauth_state=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`
  ]);
  res.end('ok')
}
  