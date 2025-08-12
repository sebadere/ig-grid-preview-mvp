// 2Checkout Configuration
const config = {
  // Use environment variables - NO HARDCODED SECRETS
  accountNumber: process.env.TWOCHECKOUT_ACCOUNT_NUMBER,
  secretKey: process.env.TWOCHECKOUT_SECRET_KEY,
  publishableKey: process.env.TWOCHECKOUT_PUBLISHABLE_KEY,
  environment: process.env.TWOCHECKOUT_ENVIRONMENT || 'sandbox',
  
  // Product Configuration
  productId: process.env.TWOCHECKOUT_PRODUCT_ID || '51273098',
  productCode: process.env.TWOCHECKOUT_PRODUCT_CODE || 'IGP-PRO-MONTHLY',
  productPrice: parseFloat(process.env.PRODUCT_PRICE || '9.99'),
  
  // Trial Configuration
  trialDays: 7,
  
  // URLs
  productionDomain: process.env.PRODUCTION_DOMAIN || 'https://www.gridpreviewer.com',
  webhookUrl: process.env.WEBHOOK_URL || 'https://www.gridpreviewer.com/api/payments/webhook',
  
  // API Endpoints
  apiBase: 'https://api.2checkout.com',
  checkoutUrl: process.env.TWOCHECKOUT_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox.2checkout.com/checkout/api/'
    : 'https://www.2checkout.com/checkout/api/'
}

// Validate required config
function validateConfig() {
  const required = ['accountNumber', 'secretKey', 'publishableKey']
  const missing = required.filter(key => !config[key] || config[key].includes('YOUR_'))
  
  if (missing.length > 0) {
    console.warn('Missing 2Checkout configuration:', missing)
    return false
  }
  
  return true
}

// Create authorization header for API calls
function getAuthHeader() {
  const credentials = Buffer.from(`${config.accountNumber}:${config.secretKey}`).toString('base64')
  return `Basic ${credentials}`
}

module.exports = {
  config,
  validateConfig,
  getAuthHeader
}
