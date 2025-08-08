import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Studio from './pages/Studio.jsx';
import Widget from './pages/Widget.jsx';
import './index.css';

// Render our application using a hash-based router so that it can be embedded
// in external sites (e.g. Notion) without requiring server-side route handling.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/widget" element={<Widget />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
