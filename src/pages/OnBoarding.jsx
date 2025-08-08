import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'


// add at top (near other imports)
const API_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000')
  : ''; // on prod, same origin

async function getJSON(path, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function Onboarding(){
  const [params] = useSearchParams()
  const [status, setStatus] = useState({ connected:false, workspace:null })
  const [dbs, setDbs] = useState([])
  const [loading, setLoading] = useState(false)
  const connected = params.get('connected') === '1'

  useEffect(()=>{
    (async ()=>{
      try {
        const s = await getJSON('/api/notion/status')
        setStatus(s)
        if (s.connected) {
          const list = await getJSON('/api/notion/databases')
          setDbs(list.results || [])
        }
      } catch(e) {
        // not connected yet
      }
    })()
  }, [connected])

  function connectNotion(){
    window.location.href = `${API_BASE}/api/notion/start`
  }

  async function logout(){
    await fetch('/api/notion/logout', { method:'POST', credentials:'include' })
    setStatus({ connected:false, workspace:null })
    setDbs([])
  }

  function pickDb(db){
    localStorage.setItem('notionDbId', db.id)
    localStorage.setItem('notionDbTitle', db.title || '')
    alert('Database saved! You can now use it in Studio later.')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Onboarding</div>
          <div className="ml-auto">
            {status.connected ? (
              <button onClick={logout} className="px-3 py-1.5 rounded-lg border">Disconnect</button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6 items-start">
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
              <ul className="space-y-2">
                {dbs.map(db => (
                  <li key={db.id} className="flex items-center gap-2">
                    <button onClick={()=>pickDb(db)} className="px-3 py-1.5 rounded-lg border">
                      Use “{db.title || db.id.slice(0,6)}”
                    </button>
                    <span className="text-xs text-[var(--muted)]">({db.id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-6 lg:col-span-2">
            <div className="text-lg font-semibold mb-2">Step 3: Done</div>
            <p className="text-sm text-[var(--muted)]">
              Your selection is saved locally for the MVP. Later we’ll fetch from that database in the Studio.
              You can head back to the <Link to="/studio" className="underline">Studio</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
