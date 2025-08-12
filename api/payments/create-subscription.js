const fetch = global.fetch
const { config, getAuthHeader } = require('../lib/2checkout-config')

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end('Method not allowed')
  }

  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })

  req.on('end', async () => {
    try {
      const { customerEmail, customerName, paymentToken } = JSON.parse(body)

      if (!customerEmail || !paymentToken) {
        res.statusCode = 400
        return res.end(JSON.stringify({ error: 'Missing required fields' }))
      }

      // Create subscription with 7-day trial
      const subscriptionData = {
        AccountNumber: config.accountNumber,
        Country: 'US', // Default to US, can be dynamic
        Currency: 'USD',
        CustomerIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        ExternalReference: `subscription_${Date.now()}`,
        Source: 'API',
        BillingAddr: {
          Name: customerName || customerEmail,
          Email: customerEmail,
          Country: 'US'
        },
        Items: [{
          Code: config.productCode,
          Quantity: 1,
          Price: config.productPrice,
          // 7-day trial configuration
          TrialPrice: 0.00,
          TrialDuration: config.trialDays,
          TrialCycle: 'Day'
        }],
        PaymentDetails: {
          Type: 'CC',
          PaymentMethod: {
            PaymentToken: paymentToken,
            Vendor3DSReturnURL: `${config.productionDomain}/#/subscription/success`,
            Vendor3DSCancelURL: `${config.productionDomain}/#/subscription/cancel`
          }
        }
      }

      console.log('Creating subscription with 2Checkout:', {
        email: customerEmail,
        product: config.productCode,
        trial: `${config.trialDays} days`,
        environment: config.environment
      })

      // Call 2Checkout API
      const response = await fetch(`${config.apiBase}/rest/6.0/orders/`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('2Checkout API error:', result)
        res.statusCode = response.status
        return res.end(JSON.stringify({ 
          error: 'Payment processing failed',
          details: result 
        }))
      }

      console.log('✅ Subscription created successfully:', result.RefNo)

      // Return success response
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        success: true,
        subscriptionId: result.RefNo,
        orderId: result.OrderNo,
        status: result.Status,
        trialEndsAt: new Date(Date.now() + config.trialDays * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + config.trialDays * 24 * 60 * 60 * 1000).toISOString()
      }))

    } catch (error) {
      console.error('Subscription creation error:', error)
      res.statusCode = 500
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }))
    }
  })
}
