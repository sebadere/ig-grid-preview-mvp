module.exports = (req, res) => {
    const ok = !!(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok,
      APP_URL: 'https://ig-grid-preview-mvp.vercel.app',
      NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID ? 'set' : 'missing',
      NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET ? 'set' : 'missing'
    }));
  };
  