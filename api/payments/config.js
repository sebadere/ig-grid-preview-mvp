const { config, validateConfig } = require('../lib/2checkout-config')

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    return res.end('Method not allowed')
  }

  try {
    // Validate configuration
    if (!validateConfig()) {
      res.statusCode = 500
      return res.end(JSON.stringify({ 
        error: 'Payment configuration not properly set up' 
      }))
    }

    // Return only public configuration (NO SECRET KEYS)
    const publicConfig = {
      accountNumber: config.accountNumber,
      publishableKey: config.publishableKey,
      environment: config.environment,
      productId: config.productId,
      productCode: config.productCode,
      productPrice: config.productPrice,
      trialDays: config.trialDays
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(publicConfig))

  } catch (error) {
    console.error('Config API error:', error)
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
}
