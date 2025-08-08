import React from 'react'
import { Link } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows } from '../lib/data'

export default function Landing(){
  const rows = loadRows()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <div className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</div>
          <div className="font-semibold">Grid Preview for Notion</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/studio" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] hover:bg-white">Open Studio</Link>
            <Link to="/widget?embed=1" className="px-3 py-1.5 rounded-lg bg-black text-white">Open Embed</Link>
            <Link to="/onboarding" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">Connect Notion</Link>

          </div>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Preview your Instagram grid <span className="whitespace-nowrap">inside Notion.</span></h1>
            <p className="text-[var(--muted)] mt-4">Embeddable widget that mirrors a Notion database (MVP uses hardcoded images). Reorder items, tweak spacing/rounding, and drop the URL in a Notion <kbd className="px-1.5 py-0.5 rounded border">/embed</kbd>.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/studio" className="px-4 py-2 rounded-xl bg-black text-white">Try the Studio</Link>
              <Link to="/widget?embed=1" className="px-4 py-2 rounded-xl border border-[var(--notion-border)] bg-[var(--notion-card)]">Open Embed (Notion)</Link>
            </div>
            <ul className="mt-8 space-y-2 text-sm text-[var(--muted)]">
              <li>• Notion-styled UI.</li>
              <li>• 3-column IG grid, adjustable gap & radius.</li>
              <li>• Drag & drop ordering.</li>
              <li>• Shareable config via URL params.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6">
            <PhoneFrame>
              <Grid rows={rows.slice(0,9)} gap={1} radius={6} cols={3} />
            </PhoneFrame>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-6xl mx-auto text-xs text-[var(--muted)]">MVP • Built for Notion creators. Replace with your brand.</div>
      </footer>
    </div>
  )
}
