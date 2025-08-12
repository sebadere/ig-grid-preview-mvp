const crypto = require('crypto')

module.exports = async (req, res) => {
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
      console.log('📥 Received 2Checkout webhook:', body)

      // Parse the webhook data
      let eventData
      try {
        eventData = JSON.parse(body)
      } catch (parseError) {
        // 2Checkout might send form-encoded data, try parsing as form data
        const urlParams = new URLSearchParams(body)
        eventData = Object.fromEntries(urlParams.entries())
      }

      console.log('📋 Webhook event data:', eventData)

      // Handle different event types
      const eventType = eventData.message_type || eventData.event_type

      switch (eventType) {
        case 'ORDER_CREATED':
        case 'SUBSCRIPTION_CREATED':
          await handleSubscriptionCreated(eventData)
          break

        case 'FRAUD_STATUS_CHANGED':
          await handleFraudCheck(eventData)
          break

        case 'SUBSCRIPTION_PAYMENT_SUCCEEDED':
        case 'RECURRING_INSTALLMENT_SUCCESS':
          await handlePaymentSuccess(eventData)
          break

        case 'SUBSCRIPTION_PAYMENT_FAILED':
        case 'RECURRING_INSTALLMENT_FAILED':
          await handlePaymentFailed(eventData)
          break

        case 'SUBSCRIPTION_CANCELED':
        case 'SUBSCRIPTION_CANCELLED':
          await handleSubscriptionCanceled(eventData)
          break

        case 'REFUND_ISSUED':
          await handleRefund(eventData)
          break

        default:
          console.log('ℹ️ Unhandled webhook event type:', eventType)
      }

      // Always return 200 to acknowledge receipt
      res.statusCode = 200
      res.end('OK')

    } catch (error) {
      console.error('❌ Webhook processing error:', error)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
}

async function handleSubscriptionCreated(data) {
  console.log('✅ Subscription created:', {
    orderId: data.sale_id || data.order_id,
    email: data.customer_email,
    amount: data.total || data.price
  })

  // TODO: Store subscription in Supabase
  // TODO: Send welcome email
  // TODO: Activate pro features for user
}

async function handleFraudCheck(data) {
  console.log('🔍 Fraud check result:', {
    orderId: data.sale_id || data.order_id,
    status: data.fraud_status,
    email: data.customer_email
  })

  if (data.fraud_status === 'APPROVED') {
    console.log('✅ Fraud check passed - activating subscription')
    // TODO: Activate subscription in database
  } else {
    console.log('❌ Fraud check failed - subscription blocked')
    // TODO: Handle fraud rejection
  }
}

async function handlePaymentSuccess(data) {
  console.log('💰 Payment successful:', {
    orderId: data.sale_id || data.order_id,
    amount: data.total || data.price,
    email: data.customer_email
  })

  // TODO: Extend subscription period
  // TODO: Send payment confirmation
}

async function handlePaymentFailed(data) {
  console.log('❌ Payment failed:', {
    orderId: data.sale_id || data.order_id,
    email: data.customer_email,
    reason: data.reason_code
  })

  // TODO: Handle failed payment
  // TODO: Send dunning email
  // TODO: Potentially suspend account
}

async function handleSubscriptionCanceled(data) {
  console.log('🛑 Subscription canceled:', {
    orderId: data.sale_id || data.order_id,
    email: data.customer_email
  })

  // TODO: Update subscription status in database
  // TODO: Send cancellation confirmation
  // TODO: Schedule account downgrade
}

async function handleRefund(data) {
  console.log('💸 Refund issued:', {
    orderId: data.sale_id || data.order_id,
    amount: data.refund_amount,
    email: data.customer_email
  })

  // TODO: Update subscription status
  // TODO: Send refund confirmation
}
