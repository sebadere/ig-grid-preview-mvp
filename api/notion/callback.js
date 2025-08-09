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

  // Determine the base URL dynamically
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (host && host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/notion/callback`;

  const basic = Buffer.from(
    `249d872b-594c-8074-98b3-00376f240771:secret_IKqVcLpMGh8sAj6qtQOwXnASf43yZO2PB01AG12KzVe`
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
      redirect_uri: redirectUri,
    }),
  });

  const tokenJson = await tokenResp.json();
  if (!tokenResp.ok) {
    res.statusCode = 400;
    return res.end(`OAuth error: ${JSON.stringify(tokenJson)}`);
  }

  const token = tokenJson.access_token;
  const isProd = protocol === 'https';
  const secure = isProd ? ' Secure;' : '';

  res.setHeader('Set-Cookie', [
    `notion_token=${encodeURIComponent(token)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=2592000`,
    `notion_oauth_state=; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=0`,
  ]);

  // Back to the SPA
  res.writeHead(302, { Location: '/#/onboarding?connected=1' });
  res.end();
};
