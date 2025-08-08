import React, { useEffect, useMemo, useState } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { DEMO_ROWS, loadRows, saveRows } from '../lib/data'
import { Link } from 'react-router-dom'

export default function Studio(){
  const [rows, setRows] = useState(loadRows())
  const [gap, setGap] = useState(2)
  const [radius, setRadius] = useState(6)

  useEffect(()=>{ saveRows(rows) }, [rows])

  const embedUrl = useMemo(()=>{
    const params = new URLSearchParams({ embed:'1', cols:'3', gap:String(gap), radius:String(radius) })
    return `${window.location.origin}${window.location.pathname}#/widget?${params.toString()}`
  }, [gap, radius])

  function onDragStart(e, i){ e.dataTransfer.setData('text/plain', String(i)) }
  function onDrop(e, to){
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if(Number.isNaN(from) || from===to) return
    const next = rows.slice()
    const [moved] = next.splice(from,1)
    next.splice(to,0,moved)
    setRows(next)
  }

  function copyUrl(){ navigator.clipboard.writeText(embedUrl) }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Studio</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/widget?embed=1" className="px-3 py-1.5 rounded-lg bg-black text-white">Open Embed</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
          {/* Left: pseudo Notion DB */}
          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)]">
            <div className="p-4 border-b border-[var(--notion-border)]">
              <div className="text-lg font-semibold">Content database</div>
              <p className="text-sm text-[var(--muted)]">Hardcoded rows. Drag to reorder. Edit URLs to test.</p>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--notion-border)]">
                    <th className="py-2 px-3 w-10"></th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Image URL</th>
                    <th className="py-2 px-3 w-16"> </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {rows.map((row, i)=> (
                    <tr key={i}
                        draggable
                        onDragStart={(e)=>onDragStart(e,i)}
                        onDragOver={(e)=>e.preventDefault()}
                        onDrop={(e)=>onDrop(e,i)}
                        className="group border-b border-[var(--notion-border)] hover:bg-gray-50/70">
                      <td className="py-2 px-3 text-[var(--muted)] grab">≡</td>
                      <td className="py-2 px-3"><input value={row.title} onChange={(e)=>{
                        const next=[...rows]; next[i].title=e.target.value; setRows(next)
                      }} className="w-full bg-transparent outline-none" /></td>
                      <td className="py-2 px-3"><input value={row.url} onChange={(e)=>{
                        const next=[...rows]; next[i].url=e.target.value; setRows(next)
                      }} className="w-full bg-transparent outline-none" /></td>
                      <td className="py-2 px-3 text-right">
                        <button className="opacity-70 group-hover:opacity-100" onClick={()=>{
                          const next=[...rows]; next.splice(i,1); setRows(next)
                        }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3">
                <button onClick={()=> setRows([...rows, { title:'New', url:'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' }])}
                        className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">Add row</button>
                <button onClick={()=> setRows(DEMO_ROWS.slice(0,9))}
                        className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] ml-2">Reset demo data</button>
              </div>
            </div>
          </div>

          {/* Right: Controls + Preview + Link */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-4">
              <div className="flex items-center gap-2">
                <button onClick={()=> setRows(loadRows())} className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">Refresh</button>
                <div className="ml-auto flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2">Gap <input type="range" min="0" max="8" step="1" value={gap} onChange={e=>setGap(Number(e.target.value))} /></label>
                  <label className="flex items-center gap-2">Radius <input type="range" min="0" max="20" step="2" value={radius} onChange={e=>setRadius(Number(e.target.value))} /></label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-4">
              <div className="text-sm text-[var(--muted)] mb-2">Embed preview (9:16)</div>
              <PhoneFrame>
                <Grid rows={rows} gap={gap} radius={radius} cols={3} />
              </PhoneFrame>
            </div>

            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-4 text-sm">
              <div className="font-semibold mb-2">Add to Notion</div>
              <ol className="list-decimal ml-5 space-y-1 text-[var(--muted)]">
                <li>Click <span className="font-medium">Copy embed link</span>.</li>
                <li>In Notion, type <kbd className="px-1 py-0.5 border rounded">/embed</kbd> and paste the link.</li>
              </ol>
              <div className="mt-3 flex gap-2">
                <button onClick={copyUrl} className="px-3 py-1.5 rounded-lg bg-black text-white">Copy embed link</button>
                <input value={embedUrl} readOnly className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-6xl mx-auto text-xs text-[var(--muted)]">MVP • Replace with your brand.</div>
      </footer>
    </div>
  )
}
