import React from 'react';

// A simple container styled to approximate a modern phone. The children
// element is expected to maintain its own aspect ratio via CSS. The phone
// frame has rounded corners and a dark border to separate it visually from
// the page background. This wrapper helps the preview feel more tangible.
export default function PhoneFrame({ children }) {
  return (
    <div className="bg-black rounded-3xl p-4 w-64 sm:w-80 overflow-hidden shadow-lg">
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ aspectRatio: '9/16' }}
      >
        {children}
      </div>
    </div>
  );
}
