import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'

export default function Pricing() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  const plan = {
    name: 'Instagram Grid Preview Pro',
    price: '$9.99',
    period: 'per month',
    trialText: '7-day free trial',
    features: [
      'Connect unlimited Notion databases',
      'Real-time sync with your content',
      'Professional Instagram grid preview',
      'Custom grid layouts and spacing',
      'Advanced styling and customization',
      'Remove Instagram Grid Preview branding',
      'Priority customer support',
      'Shareable embed widgets',
      'Export high-resolution grid images',
      'Mobile-responsive preview interface'
    ]
  }

  const handleSubscribe = () => {
    setShowPaymentModal(true)
  }

  const handleProcessPayment = async (paymentData) => {
    console.log('Processing payment with data:', paymentData)
    
    try {
      // Initialize 2Checkout inline checkout with the form data
      await initializeCheckout(paymentData.email, paymentData.name, paymentData)
      setShowPaymentModal(false)
    } catch (error) {
      console.error('Payment initialization error:', error)
      throw error // This will be caught by the PaymentModal
    }
  }

  const getPaymentConfig = async () => {
    try {
      const response = await fetch('/api/payments/config')
      const config = await response.json()
      return config
    } catch (error) {
      console.error('Failed to get payment config:', error)
      throw new Error('Payment configuration not available')
    }
  }

  const initializeCheckout = async (email, name, paymentData) => {
    // Load 2Checkout.js if not already loaded
    if (!window.TwoCoGlobal) {
      await loadTwoCheckoutScript()
    }

    // Get configuration from environment/API
    const config = await getPaymentConfig()
    
    // Configure 2Checkout
    window.TwoCoGlobal.setup({
      sellerId: config.accountNumber,
      sandbox: config.environment === 'sandbox',
      cartType: "STANDARD"
    })

    // Create payment form with data from modal
    const paymentTokenData = {
      "sellerId": config.accountNumber,
      "publishableKey": config.publishableKey,
      "ccNo": paymentData.cardNumber.replace(/\s/g, ''), // Remove spaces
      "cvv": paymentData.cvv,
      "expMonth": paymentData.expMonth,
      "expYear": paymentData.expYear
    }

    try {
      // Create payment token
      window.TwoCoGlobal.tokenize(paymentTokenData, (data) => {
        if (data.response.type === 'success') {
          console.log('✅ Payment token created:', data.response.token.token)
          processSubscription(data.response.token.token, email, name)
        } else {
          console.error('❌ Tokenization failed:', data.response)
          alert('Payment validation failed: ' + (data.response.message || 'Unknown error'))
        }
      })
    } catch (error) {
      console.error('Tokenization error:', error)
      alert('Payment processing failed. Please try again.')
    }
  }

  const loadTwoCheckoutScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('twocheckout-script')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.id = 'twocheckout-script'
      script.src = 'https://www.2checkout.com/checkout/api/2co.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const processSubscription = async (paymentToken, email, name) => {
    try {
      console.log('🔄 Processing subscription...')
      
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentToken,
          customerEmail: email,
          customerName: name
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Subscription created successfully!')
        alert(`🎉 Success! Your 7-day free trial has started!\n\nSubscription ID: ${result.subscriptionId}\nTrial ends: ${new Date(result.trialEndsAt).toLocaleDateString()}`)
        
        // Redirect to studio or dashboard
        window.location.href = '/#/studio'
      } else {
        console.error('❌ Subscription creation failed:', result)
        alert('Subscription creation failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Subscription processing error:', error)
      alert('Subscription processing failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Pricing</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">← Back to App</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Professional Instagram Grid Preview Tool</h1>
            <p className="text-lg text-[var(--muted)] mb-8 max-w-3xl mx-auto">
              Get complete control over your Instagram feed planning with our professional grid preview tool. Connect your Notion database and visualize your content strategy before posting.
            </p>
          </div>

          {/* Single Pricing Card */}
          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl border-2 border-blue-500 bg-white shadow-xl p-10 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Professional Plan
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-5xl font-bold text-blue-600 mb-2">{plan.price}</div>
                <div className="text-lg text-[var(--muted)] mb-1">{plan.period}</div>
                <div className="text-lg font-semibold text-green-600 mb-6">{plan.trialText}</div>
                
                <div className="bg-blue-50 rounded-2xl p-6 mb-8">
                  <h4 className="font-semibold text-lg mb-4">What's Included:</h4>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button
                onClick={handleSubscribe}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                Start 7-Day Free Trial - Then $9.99/month
              </button>
              <p className="text-sm text-center text-[var(--muted)] mt-4">
                ✓ Credit card required to start trial<br/>
                ✓ Cancel anytime, no questions asked<br/>
                ✓ 30-day money-back guarantee
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">What exactly does Instagram Grid Preview do?</h3>
                  <p className="text-[var(--muted)]">Instagram Grid Preview is a professional tool that connects to your Notion database and shows you exactly how your Instagram posts will look when arranged in Instagram's 3-column grid format. This helps you plan your feed aesthetics and maintain visual consistency.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">How does the Notion integration work?</h3>
                  <p className="text-[var(--muted)]">Simply connect your Notion account and select a database that contains your content images. Our tool will automatically sync with your database and display your images in a realistic Instagram grid layout, updating in real-time as you modify your content.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">What's included in the 7-day free trial?</h3>
                  <p className="text-[var(--muted)]">The free trial includes full access to all Pro features: unlimited Notion database connections, real-time sync, custom styling, embed generation, and premium support. Credit card required to start trial.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Is my Notion data secure?</h3>
                  <p className="text-[var(--muted)]">Absolutely. We only access the specific database you authorize and use enterprise-grade encryption for all data transmission and storage. We never access other Notion content or store sensitive information permanently.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Who is this tool designed for?</h3>
                  <p className="text-[var(--muted)]">Instagram Grid Preview is perfect for social media managers, content creators, influencers, marketing agencies, and anyone who wants to maintain a professional and cohesive Instagram presence through strategic feed planning.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Can I cancel anytime?</h3>
                  <p className="text-[var(--muted)]">Yes! You can cancel your subscription at any time with no questions asked. Your access continues until the end of your current billing period, and we offer a 30-day money-back guarantee for complete peace of mind.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Do you offer customer support?</h3>
                  <p className="text-[var(--muted)]">Yes! Pro subscribers get priority customer support with response times within 24 hours. We provide help with setup, integration, troubleshooting, and any questions about maximizing your Instagram grid planning.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">What payment methods do you accept?</h3>
                  <p className="text-[var(--muted)]">We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor 2Checkout. All transactions are encrypted and PCI-compliant for maximum security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[var(--muted)]">
          <div>© 2024 Instagram Grid Preview. Built for content creators.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  )
}
