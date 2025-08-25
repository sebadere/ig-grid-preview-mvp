import React from 'react'
import Modal, { ModalButton } from './Modal'

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan }) {
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

  const handleSelectPlan = () => {
    onSelectPlan()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect to Notion" size="lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choose Your Plan to Connect Notion</h3>
        <p className="text-gray-600">
          To connect your Notion database, you need an active subscription. Start with a 7-day free trial.
        </p>
      </div>

      {/* Single Plan Card */}
      <div className="rounded-2xl border-2 border-blue-500 bg-white shadow-lg p-6 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-2 rounded-full">
            Professional Plan
          </span>
        </div>
        
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
          <div className="text-4xl font-bold text-blue-600 mb-1">{plan.price}</div>
          <div className="text-gray-600 mb-1">{plan.period}</div>
          <div className="text-lg font-semibold text-green-600 mb-4">{plan.trialText}</div>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h5 className="font-semibold mb-3">What's Included:</h5>
            <ul className="space-y-2 text-left text-sm">
              {plan.features.slice(0, 6).map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
              <li className="text-gray-500 text-xs">+ {plan.features.length - 6} more features</li>
            </ul>
          </div>
        </div>
        
        <ModalButton
          onClick={handleSelectPlan}
          className="w-full py-3 text-lg"
        >
          Start Free Trial & Connect Notion
        </ModalButton>
        <p className="text-xs text-center text-gray-500 mt-3">
          ✓ Credit card required to start trial<br/>
          ✓ Cancel anytime, no questions asked<br/>
          ✓ 30-day money-back guarantee
        </p>
      </div>

      <div className="mt-6 text-center">
        <ModalButton
          onClick={onClose}
          variant="secondary"
          className="mr-3"
        >
          Cancel
        </ModalButton>
        <button
          onClick={() => window.location.href = '/#/studio'}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Try Demo First (No Signup)
        </button>
      </div>
    </Modal>
  )
}
