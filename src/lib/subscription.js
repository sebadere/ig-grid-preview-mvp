// Subscription management utilities
// This will integrate with 2Checkout API

export const SUBSCRIPTION_STATUS = {
  FREE: 'free',
  TRIAL: 'trial', 
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
}

export const PLANS = {
  FREE: 'free',
  PRO_MONTHLY: 'pro_monthly',
  PRO_ANNUAL: 'pro_annual'
}

// Local storage keys
const SUBSCRIPTION_KEY = 'subscription_status'
const TRIAL_START_KEY = 'trial_start_date'

// Check current subscription status
export function getSubscriptionStatus() {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY)
    if (!stored) return SUBSCRIPTION_STATUS.FREE
    
    const subscription = JSON.parse(stored)
    
    // Check if trial has expired
    if (subscription.status === SUBSCRIPTION_STATUS.TRIAL) {
      const trialStart = localStorage.getItem(TRIAL_START_KEY)
      if (trialStart) {
        const startDate = new Date(trialStart)
        const now = new Date()
        const daysDiff = (now - startDate) / (1000 * 60 * 60 * 24)
        
        if (daysDiff > 7) {
          setSubscriptionStatus(SUBSCRIPTION_STATUS.EXPIRED)
          return SUBSCRIPTION_STATUS.EXPIRED
        }
      }
    }
    
    return subscription.status
  } catch (error) {
    console.warn('Failed to get subscription status:', error)
    return SUBSCRIPTION_STATUS.FREE
  }
}

// Set subscription status
export function setSubscriptionStatus(status, plan = null, expiryDate = null) {
  try {
    const subscription = {
      status,
      plan,
      expiryDate,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription))
    
    // Start trial tracking if needed
    if (status === SUBSCRIPTION_STATUS.TRIAL && !localStorage.getItem(TRIAL_START_KEY)) {
      localStorage.setItem(TRIAL_START_KEY, new Date().toISOString())
    }
    
    return true
  } catch (error) {
    console.warn('Failed to set subscription status:', error)
    return false
  }
}

// Check if user has access to pro features
export function hasProAccess() {
  const status = getSubscriptionStatus()
  return status === SUBSCRIPTION_STATUS.TRIAL || status === SUBSCRIPTION_STATUS.ACTIVE
}

// Get remaining trial days
export function getTrialDaysRemaining() {
  const status = getSubscriptionStatus()
  if (status !== SUBSCRIPTION_STATUS.TRIAL) return 0
  
  try {
    const trialStart = localStorage.getItem(TRIAL_START_KEY)
    if (!trialStart) return 0
    
    const startDate = new Date(trialStart)
    const now = new Date()
    const daysDiff = (now - startDate) / (1000 * 60 * 60 * 24)
    
    return Math.max(0, Math.ceil(7 - daysDiff))
  } catch (error) {
    return 0
  }
}

// Start free trial
export function startFreeTrial() {
  setSubscriptionStatus(SUBSCRIPTION_STATUS.TRIAL, PLANS.PRO_MONTHLY)
  localStorage.setItem(TRIAL_START_KEY, new Date().toISOString())
}

// Clear subscription data (for logout)
export function clearSubscriptionData() {
  localStorage.removeItem(SUBSCRIPTION_KEY)
  localStorage.removeItem(TRIAL_START_KEY)
}

// 2Checkout integration helpers (to be implemented)
export function initialize2Checkout() {
  // This will load the 2Checkout.js library
  console.log('2Checkout initialization - to be implemented')
}

export function createPaymentToken(cardData) {
  // This will use 2Checkout.js to create a payment token
  console.log('Creating payment token - to be implemented', cardData)
  return Promise.resolve('mock_token_123')
}

export function processSubscription(paymentToken, plan) {
  // This will call our backend to process the subscription with 2Checkout
  console.log('Processing subscription - to be implemented', paymentToken, plan)
  return Promise.resolve({ success: true, subscriptionId: 'sub_123' })
}

// Mock function for development
export function simulateProSubscription() {
  setSubscriptionStatus(SUBSCRIPTION_STATUS.ACTIVE, PLANS.PRO_MONTHLY, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
  console.log('✅ Pro subscription activated (simulated)')
}
