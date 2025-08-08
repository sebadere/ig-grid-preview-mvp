import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Studio from './pages/Studio.jsx'
import Widget from './pages/Widget.jsx'
import Onboarding from './pages/OnBoarding.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/widget" element={<Widget />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
