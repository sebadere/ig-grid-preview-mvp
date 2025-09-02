import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Studio from './pages/Studio.jsx'
import Widget from './pages/Widget.jsx'
import Onboarding from './pages/OnBoarding.jsx'
import Login from './pages/Login.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Pricing from './pages/Pricing.jsx'
import SuggestionModal from './components/SuggestionModal.jsx'

export default function App() {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/widget" element={<Widget />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* <Route path="/pricing" element={<Pricing />} /> */}
      </Routes>

      {/* Global Floating Suggestion Button */}
      <button
        onClick={() => setShowSuggestionModal(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Share your suggestion"
      >
        <svg 
          className="w-6 h-6 transform group-hover:scale-110 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
      </button>

      {/* Global Suggestion Modal */}
      <SuggestionModal 
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
      />
    </>
  )
}
