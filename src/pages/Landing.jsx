import React from 'react';
import { Link } from 'react-router-dom';

// The landing page introduces the tool and directs users to the studio.
export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-4">Instagram Grid Preview</h1>
      <p className="text-center max-w-md mb-6">
        Quickly preview and organize your Instagram‑style content for Notion. Use the studio to
        add images, adjust layout and generate a shareable embed link.
      </p>
      <Link
        to="/studio"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Studio
      </Link>
    </div>
  );
}
