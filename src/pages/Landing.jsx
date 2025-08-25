import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows, loadRowsAsync, isNotionConnected, logoutFromNotion } from '../lib/data'
import { supabase } from '../lib/supabase'
import { STORAGE_KEYS } from '../lib/config.js'

export default function Landing(){
  const [rows, setRows] = useState(loadRows())
  const [isConnected, setIsConnected] = useState(isNotionConnected())
  const [user, setUser] = useState(null)

  async function handleLogout() {
    try {
      await logoutFromNotion()
      setRows(loadRows())
      setIsConnected(false)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsConnected(false)
      setRows(loadRows())
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const handleConnectToNotion = () => {
    // Redirect to onboarding page where users will be prompted to login first
    window.location.href = '/#/onboarding'
  }

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, go to onboarding
      window.location.href = '/#/onboarding'
    } else {
      // User is not logged in, go to login
      window.location.href = '/#/login'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const newRows = await loadRowsAsync()
        setRows(newRows)
      } catch (error) {
        console.error('Failed to load data:', error)
        setRows(loadRows())
      }
    }
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    loadData()
    checkAuth()

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.NOTION_DB_ID || e.key === STORAGE_KEYS.GRID_ROWS) {
        loadData()
        setIsConnected(isNotionConnected())
      }
    }
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === 'SIGNED_OUT') {
        setIsConnected(false)
        setRows(loadRows())
      }
    })
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <div className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</div>
          <div className="font-semibold">Instagram Grid Preview</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/studio" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] hover:bg-white">Open Studio</Link>
            <Link to="/widget?embed=1" className="px-3 py-1.5 rounded-lg bg-black text-white">Open Embed</Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                {isConnected ? (
                  <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">
                    Disconnect Notion
                  </button>
                ) : (
                  <button onClick={handleConnectToNotion} className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">
                    Connect Notion
                  </button>
                )}
                <button onClick={handleSignOut} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Plan your Instagram feed <span className="whitespace-nowrap">right inside Notion</span>
            </h1>
            <p className="text-[var(--muted)] mt-4 text-lg">
              Connect a Notion database and instantly preview a pixel-accurate, 3-column Instagram grid.
              Reorder, tweak spacing/radius, and embed your live preview anywhere.
            </p>

            <div className="mt-6 p-6 rounded-xl bg-[var(--notion-card)] border border-[var(--notion-border)]">
              <h3 className="font-semibold text-lg mb-3">Why creators use us</h3>
              <ul className="space-y-3 text-[var(--muted)]">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm flex items-center justify-center font-semibold mt-0.5">✓</span>
                  <div>
                    <strong>One workflow, zero copy-paste.</strong> Plug into your existing Notion content DB—no migrations, no spreadsheets.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm flex items-center justify-center font-semibold mt-0.5">✓</span>
                  <div>
                    <strong>See the feed before you post.</strong> True Instagram layout with proper aspect ratios, spacing and rounding.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm flex items-center justify-center font-semibold mt-0.5">✓</span>
                  <div>
                    <strong>Shareable embeds.</strong> Generate a secure URL and drop it in Notion, client decks or your site.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm flex items-center justify-center font-semibold mt-0.5">✓</span>
                  <div>
                    <strong>Made for teams & freelancers.</strong> Plan sequences, keep brand consistency, and get sign-off faster.
                  </div>
                </li>
              </ul>

                             <p className="text-xs text-[var(--muted)] mt-4">
                 Try the demo first, no signup required. Sign up to connect your own Notion database.
               </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                             {user && isConnected ? (
                 <Link
                   to="/studio"
                   className="px-6 py-3 rounded-xl bg-black text-white font-semibold"
                 >
                   Open Studio
                 </Link>
               ) : (
                 <button
                   onClick={handleGetStarted}
                   className="px-6 py-3 rounded-xl bg-black text-white font-semibold"
                 >
                   Get Started Free
                 </button>
               )}
              <Link to="/studio" className="px-6 py-3 rounded-xl border border-[var(--notion-border)] bg-[var(--notion-card)]">
                Try Demo (no signup)
              </Link>
            </div>

            {/* Social proof placeholder (optional) */}
            <div className="mt-4 text-xs text-[var(--muted)]">
              Trusted by creators, agencies and social teams planning thousands of posts.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6">
            <PhoneFrame>
              <Grid rows={rows.slice(0,9)} gap={1} radius={6} cols={3} />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[var(--notion-bg)]/40 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need to plan a cohesive feed</h2>
            <p className="text-lg text-[var(--muted)] max-w-3xl mx-auto">
              Stop guessing how tiles will align. Preview, iterate and share your grid straight from Notion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Native Notion workflow</h3>
              <p className="text-[var(--muted)]">Use your current database—titles, image URLs or files. No new tools to learn.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 13h10M16 13h4M4 19h8M14 19h6" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant preview</h3>
              <p className="text-[var(--muted)]">See changes immediately. Perfect for content calendars and client approvals.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l4 4 8-8" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Share & embed</h3>
              <p className="text-[var(--muted)]">Create a secure URL and drop it into Notion pages, decks or client portals.</p>
            </div>
          </div>

          {/* Personas */}
          <div className="bg-white rounded-2xl p-8 border border-[var(--notion-border)]">
            <h3 className="text-2xl font-semibold mb-6 text-center">Built for teams and solo creators</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Social media teams</h4>
                <ul className="space-y-2 text-[var(--muted)]">
                  <li>• Plan cohesive feeds for multiple brands</li>
                  <li>• Share live previews for quick approvals</li>
                  <li>• Keep campaigns on-brand and on-schedule</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Creators & freelancers</h4>
                <ul className="space-y-2 text-[var(--muted)]">
                  <li>• Validate color palettes and sequences</li>
                  <li>• Present your plan in media kits</li>
                  <li>• Spend less time tweaking, more time creating</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button onClick={handleGetStarted} className="px-6 py-3 rounded-xl bg-black text-white font-semibold">
                Get started free → 
              </button>
                             <p className="text-xs text-[var(--muted)] mt-2">No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[var(--muted)]">
          <div>© 2025 Instagram Grid Preview. Plan confidently.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>


    </div>
  )
}
