import React, { useState } from 'react'
import Modal, { ModalInput, ModalButton } from './Modal'

export default function PaymentModal({ isOpen, onClose, onProcessPayment }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email || !formData.name || !formData.cardNumber || !formData.expMonth || !formData.expYear || !formData.cvv) {
      alert('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    
    try {
      await onProcessPayment(formData)
    } catch (error) {
      console.error('Payment processing failed:', error)
      alert('Payment processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setFormData({
        email: '',
        name: '',
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvv: ''
      })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Start Your Free Trial" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">7-Day Free Trial</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              You won't be charged until your trial ends. Cancel anytime.
            </p>
          </div>

          <h4 className="font-semibold mb-4">Contact Information</h4>
          <ModalInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="your@email.com"
            required
          />
          <ModalInput
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="John Doe"
            required
          />

          <h4 className="font-semibold mb-4 mt-6">Payment Information</h4>
          <ModalInput
            label="Card Number"
            value={formData.cardNumber}
            onChange={handleInputChange('cardNumber')}
            placeholder="4000 0000 0000 0002 (test card)"
            required
          />
          
          <div className="grid grid-cols-3 gap-3">
            <ModalInput
              label="Month"
              value={formData.expMonth}
              onChange={handleInputChange('expMonth')}
              placeholder="12"
              required
            />
            <ModalInput
              label="Year"
              value={formData.expYear}
              onChange={handleInputChange('expYear')}
              placeholder="2025"
              required
            />
            <ModalInput
              label="CVV"
              value={formData.cvv}
              onChange={handleInputChange('cvv')}
              placeholder="123"
              required
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h5 className="font-medium mb-2">Order Summary</h5>
            <div className="flex justify-between text-sm">
              <span>Instagram Grid Preview Pro</span>
              <span>$9.99/month</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>7-Day Free Trial</span>
              <span>$0.00</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Due Today</span>
              <span>$0.00</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              After trial: $9.99/month. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <ModalButton
            type="button"
            onClick={handleClose}
            variant="secondary"
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </ModalButton>
          <ModalButton
            type="submit"
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Start Free Trial'
            )}
          </ModalButton>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processing by 2Checkout. Your data is encrypted and protected.
        </p>
      </form>
    </Modal>
  )
}
