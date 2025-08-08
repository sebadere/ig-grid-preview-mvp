import React from 'react';

// Renders a square grid of images using CSS grid. The layout is configurable
// via the number of columns, the gap between items and the border radius.
// Only the first nine images are displayed to mimic a classic Instagram
// profile preview.
export default function Grid({ images, gap = 2, radius = 0, cols = 3 }) {
  // Limit to nine images for a consistent preview. Users can still add more
  // images in the studio; only the first nine will be shown in the widget.
  const displayed = images.slice(0, 9
  return (
    <div
      className="w-full h-full grid"
      style={{
        g>
      {displayed.map((src, idx) => (
        <div
          key={idx}
          style={{ borderRadius: radius + 'px' }}
          className="bg-gray-100 overflow-hidden"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
