import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { API_BASE, STORAGE_KEYS } from '../lib/config.js'

async function getJSON(path, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function Onboarding() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState({ connected: false, workspace: null })
  const [dbs, setDbs] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const connected = params.get('connected') === '1'

  useEffect(() => {
    // Check user authentication first
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
      
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/#/login'
        return
      }

      // If user is authenticated, check Notion status
      try {
        setStatus(s)
        const s = await getJSON(`${API_BASE}/api/notion/status'`)
        if (s.connected) {
          const list = await getJSON(`${API_BASE}/api/notion/databases`)
          setDbs(list.results || [])
        }
      } catch (e) {
        // not connected yet
      }
    }
    
    checkAuth()
  }, [connected])

  function connectNotion() {
    window.location.href = `${API_BASE}/api/notion/start`
  }

  async function logout() {
    await fetch('/api/notion/logout', { method: 'POST', credentials: 'include' })
    setStatus({ connected: false, workspace: null })
    setDbs([])
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/#/'
  }

  function notionRichTextToPlain(rt) {
    if (!rt) return '';
    return rt.map(t => t?.plain_text ?? t?.text?.content ?? '').join('');
  }

  function pickDb(db) {
    console.log("entro")
    localStorage.setItem(STORAGE_KEYS.NOTION_DB_ID, db.id)
    localStorage.setItem(STORAGE_KEYS.NOTION_DB_TITLE, notionRichTextToPlain(db.title) || '');
    alert('Database saved! Redirecting to Studio...')
    // Redirect to studio after a short delay
    setTimeout(() => {
      window.location.href = '/#/studio'
    }, 1000)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show message (shouldn't reach here due to redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link to="/login" className="px-6 py-3 bg-black text-white rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Onboarding</div>
          <div className="ml-auto flex items-center gap-2">
            {user && (
              <span className="text-sm text-gray-600">{user.email}</span>
            )}
            {status.connected ? (
              <button onClick={logout} className="px-3 py-1.5 rounded-lg border">Disconnect Notion</button>
            ) : null}
            <button onClick={signOut} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to GridPreviewer!</h1>
            <p className="text-lg text-[var(--muted)]">Let's connect your Notion database to get started</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Step 1 */}
            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6">
              <div className="text-lg font-semibold mb-2">Step 1: Connect your Notion</div>
            {status.connected ? (
              <div className="text-sm text-green-700">Connected ✓ {status.workspace ? `(${status.workspace})` : ''}</div>
            ) : (
              <>
                <p className="text-sm text-[var(--muted)] mb-4">
                  You’ll be redirected to Notion to authorize the app.
                </p>
                <button onClick={connectNotion} className="px-4 py-2 rounded-xl bg-black text-white">Connect Notion</button>
              </>
            )}
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6">
            <div className="text-lg font-semibold mb-2">Step 2: Pick a database</div>
            {!status.connected ? (
              <div className="text-sm text-[var(--muted)]">Connect first to see your databases.</div>
            ) : dbs.length === 0 ? (
              <div className="text-sm text-[var(--muted)]">No databases returned. Make sure your integration has access to at least one database.</div>
            ) : (
              <>
                <div className="text-sm text-[var(--muted)] mb-3">
                  💡 <strong>Tip:</strong> Works best with databases that have image URLs in properties named "Image", "URL", "Photo", or file uploads.
                </div>
                <ul className="space-y-2">
                  {dbs.map(db => (
                    <li key={db.id} className="flex items-center gap-2">
                      <button onClick={() => pickDb(db)} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                        Use "{notionRichTextToPlain(db.title) || db.id.slice(0, 6)}"
                      </button>
                      <span className="text-xs text-[var(--muted)]">({db.id.slice(0, 8)}...)</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6 lg:col-span-2">
              <div className="text-lg font-semibold mb-2">Step 3: Done</div>
              <p className="text-sm text-[var(--muted)]">
                Your Notion database is now connected! The Studio and Widget will automatically load your Instagram posts from the selected database.
                You can head back to the <Link to="/studio" className="underline">Studio</Link> to see your content.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
