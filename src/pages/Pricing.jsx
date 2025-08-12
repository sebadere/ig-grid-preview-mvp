import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Demo grid preview',
        'Basic customization',
        'Export embed code',
        'Community support'
      ],
      limitations: [
        'Demo data only',
        'Limited styling options',
        'Instagram Grid Preview branding'
      ]
    },
    pro: {
      name: 'Pro',
      price: isAnnual ? '$8.33' : '$9.99',
      period: isAnnual ? 'per month (billed annually)' : 'per month',
      originalPrice: isAnnual ? '$99.99/year' : null,
      features: [
        'Connect unlimited Notion databases',
        'Real-time sync with Notion',
        'Custom grid layouts',
        'Advanced styling options',
        'Remove branding',
        'Priority support',
        'Collaboration features',
        'Export high-res images'
      ],
      popular: true
    }
  }

  const handleSubscribe = (plan) => {
    if (plan === 'free') {
      // Redirect to signup/studio
      window.location.href = '/#/studio'
    } else {
      // Initialize 2Checkout payment
      handle2CheckoutPayment(plan, isAnnual)
    }
  }

  const handle2CheckoutPayment = (plan, annual) => {
    // 2Checkout integration will go here
    console.log('Initializing 2Checkout payment for:', plan, annual ? 'annual' : 'monthly')
    
    // For now, show alert - we'll implement 2Checkout next
    alert(`🚀 2Checkout integration coming next!\n\nSelected: ${plan} (${annual ? 'Annual' : 'Monthly'})`)
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
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-[var(--muted)] mb-8">
              Start free, upgrade when you need Notion integration
            </p>
            
            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${!isAnnual ? 'font-semibold' : 'text-[var(--muted)]'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${isAnnual ? 'font-semibold' : 'text-[var(--muted)]'}`}>
                Annual 
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 16%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plans.free.name}</h3>
                <div className="text-3xl font-bold mb-1">{plans.free.price}</div>
                <div className="text-sm text-[var(--muted)]">{plans.free.period}</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plans.free.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {plans.free.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {limitation}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe('free')}
                className="w-full py-3 px-4 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] hover:bg-gray-50 font-medium"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-blue-500 bg-[var(--notion-card)] p-8 relative">
              {plans.pro.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plans.pro.name}</h3>
                <div className="text-3xl font-bold mb-1">
                  {plans.pro.price}
                  {plans.pro.originalPrice && (
                    <span className="text-lg text-[var(--muted)] line-through ml-2">$9.99</span>
                  )}
                </div>
                <div className="text-sm text-[var(--muted)]">{plans.pro.period}</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plans.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe('pro')}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
              >
                Start 7-Day Free Trial
              </button>
              <p className="text-xs text-center text-[var(--muted)] mt-2">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-[var(--muted)]">Yes! Upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens to my data if I cancel?</h3>
                <p className="text-[var(--muted)]">Your data remains accessible for 30 days after cancellation. You can export your grid configurations anytime.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-[var(--muted)]">Yes! We offer prorated refunds within 30 days of payment for any unused service time.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is my Notion data secure?</h3>
                <p className="text-[var(--muted)]">Absolutely. We only access the specific database you choose and use industry-standard encryption for all data.</p>
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
    </div>
  )
}
