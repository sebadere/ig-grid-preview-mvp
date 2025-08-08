import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { defaultImages, STORAGE_KEY } from '../data/config.js';

// The studio page allows users to manage their pseudo‑database of images,
// configure layout options and copy a shareable embed link.
export default function Studio() {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState('');
  const [gap, setGap] = useState(2);
  const [radius, setRadius] = useState(0);
  const [cols, setCols] = useState(3);

  // Initialise images from localStorage on mount. If no images exist yet,
  // populate localStorage with the default set and use that.
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored) && stored.length > 0) {
      setImages(stored);
    } else {
      const initial = defaultImages.slce(0, 9);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setImages(initial);
    }
  }, []);

  // Handler to add a new image URL to the list and persist to localStorage.
  const addImage = () => {
    const trimmed = newImage.trim();
    if (trimmed) {
      const updated = [...images, trimmed];
      setImages(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setNewImage('');
    }
  };

  // Handler to remove an image at a given index.
  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Build an embed URL with layout parameters encoded in the query string.
  const buildEmbedURL = () => {
    const params = new URLSearchParams();
    params.set('embed', '1');
    params.set('gap', gap);
    params.set('radius', radius);
    params.set('cols', cols);
    // Use the current origin and path; hash routing ensures correct location.
    return `${window.location.origin}${window.location.pathname}#/widget?${params.toString()}`;
  };

  // Copy the embed URL to the clipboard with a browser API. Provide feedback via alert.
  const copyEmbedLink = () => {
    const url = buildEmbedURL();
    navigator.clipboard.writeText(url).then(() => {
      alert('Embed link copied to clipboard!');
    });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Studio</h1>
      {/* Input for adding new image URLs */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Add image URL</label>
        <div className="flex items-center gap-2">
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://..."
            className="flex-1 border border-gray-300 p-2 rounded"
          />
          <button
            onClick={addImage}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>
      {/* Preview of images with remove buttons */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Images ({images.length})</h2>
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, idx) => (
            <div key={idx} className="relative group">
              <img
                src={src}
                alt=""
                className="object-cover w-full h-32 rounded"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 text-xs bg-red-600 text-white rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Layout controls */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="cols">Columns</label>
          <input
            id="cols"
            type="number"
            min="1"
            max="5"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value, 10) || 1)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="gap">Gap (px)</label>
          <input
            id="gap"
            type="number"
            min="0"
            max="20"
            value={gap}
            onChange={(e) => setGap(parseInt(e.target.value, 10) || 0)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="radius">Border radius (px)</label>
          <input
            id="radius"
            type="number"
            min="0"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10) || 0)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
      </div>
      {/* Buttons for copying the embed link and previewing the widget */}
      <div className="mb-4 flex flex-wrap gap-4">
        <button
          onClick={copyEmbedLink}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Copy embed link
        </button>
        <Link
          to={`/widget?gap=${gap}&radius=${radius}&cols=${cols}`}
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
        >
          Preview
        </Link>
      </div>
      <Link to="/" className="text-blue-600 underline">Back to landing</Link>
    </div>
  );
}
