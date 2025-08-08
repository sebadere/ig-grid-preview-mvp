import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { defaultImages, STORAGE_KEY } from '../data/config.js';
import PhoneFrame from '../components/PhoneFrame.jsx';
import Grid from '../components/Grid.jsx';

// The widget page renders the Instagram grid inside a phone frame. It
// supports query parameters for embedding in Notion: gap, radius, cols and
// embed (when set to "1", trims the surrounding padding and header).
export default function Widget() {
  const [searchParams] = useSearchParams();
  const embed = searchParams.get('embed') === '1';
  const gap = parseInt(searchParams.get('gap'), 10) || 2;
  const radius = parseInt(searchParams.get('radius'), 10) || 0;
  const cols = parseInt(searchParams.get('cols'), 10) || 3;
  const [images, setImages] = useState([]);

  // Pull images from localStorage or fall back to the default set.
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored) && stored.length > 0) {
      setImages(stored);
    } else {
      setImages(defaultImages.slice(0, 9));    }
  }, []);

  return (
    <div className={`${embed ? '' : 'p-4'} flex justify-center`}>
      {!embed && (
        <div className="absolute top-4 left-4">
          {/* Provide a link back to the studio for editing when not in embed mode */}
          <a href="#/studio" className="underline text-blue-600">Edit</a>
        </div>
      )}
      <PhoneFrame>
        <Grid images={images} gap={gap} radius={radius} cols={cols} />
      </PhoneFrame>
    </div>
  );
}
