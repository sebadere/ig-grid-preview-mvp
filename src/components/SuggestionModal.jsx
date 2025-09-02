import React, { useState, useEffect } from 'react'
import Modal, { ModalInput, ModalButton } from './Modal'
import { getCurrentUser } from '../lib/supabase'
import { API_BASE } from '../lib/config'

// Sanitization functions
function sanitizeEmail(email) {
  if (!email) return ''
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const cleanEmail = email.trim().toLowerCase()
  return emailRegex.test(cleanEmail) ? cleanEmail : ''
}

function sanitizeText(text) {
  if (!text) return ''
  // Remove potential XSS and harmful content
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000) // Limit length
}

export default function SuggestionModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [user, setUser] = useState(null)

  // Load user email if logged in
  useEffect(() => {
    if (isOpen) {
      getCurrentUser().then(currentUser => {
        setUser(currentUser)
        if (currentUser?.email) {
          setEmail(currentUser.email)
        }
      })
    }
  }, [isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setSuggestion('')
      setSubmitMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedSuggestion = sanitizeText(suggestion)
    
    if (!sanitizedSuggestion.trim()) {
      setSubmitMessage('Please enter a suggestion')
      return
    }

    if (!user && !sanitizedEmail) {
      setSubmitMessage('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Submit to backend API
      const response = await fetch(`${API_BASE}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail || user?.email,
          suggestion: sanitizedSuggestion,
          user_id: user?.id || null,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        setSubmitMessage('Thank you for your suggestion! We appreciate your feedback.')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error('Failed to submit suggestion')
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      setSubmitMessage('Sorry, there was an error submitting your suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="💡 Share Your Suggestion"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Help us improve GridPreviewer! We'd love to hear your ideas and feedback.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <ModalInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              required={!user}
            />
          )}

          {user && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-700 text-sm">✓ Logged in as {user.email}</span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Suggestion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What feature would you like to see? How can we improve GridPreviewer?"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {suggestion.length}/1000 characters
            </div>
          </div>

          {submitMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              submitMessage.includes('Thank you') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {submitMessage}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <ModalButton
              type="submit"
              disabled={isSubmitting || !suggestion.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </ModalButton>
            <ModalButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </ModalButton>
          </div>
        </form>
      </div>
    </Modal>
  )
}
