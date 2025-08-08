const fetch = global.fetch;

function parseCookie(header=''){
  return Object.fromEntries(
    header.split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(a=>a[0])
  );
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookie(req.headers.cookie || '');
  if (!code || !state || cookies.notion_oauth_state !== state) {
    res.statusCode = 400;
    return res.end('Invalid state or code');
  }

  const basic = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResp = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.APP_URL}/api/notion/callback`,
    }),
  });

  const tokenJson = await tokenResp.json();
  if (!tokenResp.ok) {
    res.statusCode = 400;
    return res.end(`OAuth error: ${JSON.stringify(tokenJson)}`);
  }

  const token = tokenJson.access_token;
  const isProd = (process.env.APP_URL || '').startsWith('https://');
  const secure = isProd ? ' Secure;' : '';

  res.setHeader('Set-Cookie', [
    `notion_token=${encodeURIComponent(token)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=2592000`,
    `notion_oauth_state=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
  ]);

  // Back to the SPA
  res.writeHead(302, { Location: '/#/onboarding?connected=1' });
  res.end();
};
