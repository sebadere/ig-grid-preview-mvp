const crypto = require('crypto');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const clientId ='249d872b-594c-8074-98b3-00376f240771';
  const redirectUri = `${process.env.APP_URL}/api/notion/callback`;

  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('owner', 'user');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  const isProd = (process.env.APP_URL || '').startsWith('https://');
  const secure = isProd ? ' Secure;' : '';

  res.setHeader(
    'Set-Cookie',
    `notion_oauth_state=${state}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=600`
  );
  res.writeHead(302, { Location: authUrl.toString() });
  res.end();
};
