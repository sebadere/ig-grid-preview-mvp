import React, { useEffect, useMemo, useState, useCallback } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import SuggestionModal from '../components/SuggestionModal'
import { DEMO_ROWS, loadRows, loadRowsAsync, saveRows, isNotionConnected, logoutFromNotion, updateNotionOrder, cacheUserData, storeUserDataPublic } from '../lib/data'
import { storeUserGrid } from '../lib/supabase'
import { stateManager } from '../lib/state'
import { Link } from 'react-router-dom'
import { STORAGE_KEYS } from '../lib/config.js'

export default function Studio(){
  const [rows, setRows] = useState(loadRows())
  const [gap, setGap] = useState(2)
  const [radius, setRadius] = useState(6)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(isNotionConnected())
  const [notionDbTitle, setNotionDbTitle] = useState(localStorage.getItem(STORAGE_KEYS.NOTION_DB_TITLE) || '')
  const [syncStatus, setSyncStatus] = useState(null)
  const [showSyncNotification, setShowSyncNotification] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)

  // Load UI preferences on mount
  useEffect(() => {
    const preferences = stateManager.loadUIPreferences()
    setGap(preferences.gap)
    setRadius(preferences.radius)
  }, [])

  // Save rows to both old system and new state manager
  useEffect(()=>{ 
    saveRows(rows)
    
    // Save to enhanced state management if connected
    const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID)
    if (isConnected && notionDbId) {
      stateManager.saveGridState(notionDbId, rows, { gap, radius })
    }
  }, [rows, gap, radius, isConnected])


  useEffect(() => {
    // Load data on component mount
    refreshData();
  }, [])

  // Set up auto-sync when connected
  useEffect(() => {
    const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID)
    
    if (isConnected && notionDbId) {
      // Start auto-sync
      stateManager.startAutoSync(notionDbId, handleSyncChanges)
      
      // Update sync status
      setSyncStatus(stateManager.getSyncStatus(notionDbId))
      
      return () => {
        stateManager.stopAutoSync()
      }
    } else {
      stateManager.stopAutoSync()
      setSyncStatus(null)
    }
  }, [isConnected])

  // Handle sync changes from auto-sync
  const handleSyncChanges = useCallback((changes) => {
    if (changes.hasChanges) {
      setShowSyncNotification(true)
      console.log('🔔 Notion content has changed, user can refresh to get updates')
    }
  }, [])

  async function refreshData() {
    setLoading(true);
    setShowSyncNotification(false);
    
    try {
      const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID);
      
      // Load from enhanced state management first
      if (isNotionConnected() && notionDbId) {
        const savedState = await stateManager.loadGridState(notionDbId);
        
        if (savedState) {
          console.log('📱 Loaded saved state with preferences');
          setRows(savedState.rows);
          setGap(savedState.preferences.gap || 2);
          setRadius(savedState.preferences.radius || 6);
          
          // Also update UI preferences in localStorage
          stateManager.saveUIPreferences(savedState.preferences);
        }
      }
      
      // Get fresh data from Notion
      const newRows = await loadRowsAsync();
      console.log('- Loaded rows:', newRows?.length, 'items');
      console.log('- Sample row:', newRows?.[0]);
      
      // Update connection status
      const connected = isNotionConnected();
      setIsConnected(connected);
      setNotionDbTitle(localStorage.getItem(STORAGE_KEYS.NOTION_DB_TITLE) || '');
      
      // If we got fresh data, check if it differs from current state
      if (connected && notionDbId && newRows?.length > 0) {
        const currentState = await stateManager.loadGridState(notionDbId);
        
        if (currentState && currentState.rows.length > 0) {
          // Merge fresh Notion data with user's custom order
          const mergedRows = stateManager.mergeNotionChanges(currentState.rows, newRows);
          setRows(mergedRows);
          
          // Save the updated state
          await stateManager.saveGridState(notionDbId, mergedRows, { gap, radius });
        } else {
          // No saved state, use fresh data
          setRows(newRows);
          await stateManager.saveGridState(notionDbId, newRows, { gap, radius });
        }
        
        // Update sync status and last sync time
        stateManager.updateLastSyncTime(notionDbId);
        setSyncStatus(stateManager.getSyncStatus(notionDbId));
      } else {
        // Not connected or no data, use what we got
        setRows(newRows);
      }
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutFromNotion();
      // Reset to demo data
      setRows(loadRows());
      setIsConnected(false);
      setNotionDbTitle('');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setLoading(false);
    }
  }

  const embedUrl = useMemo(()=>{
    const params = new URLSearchParams({ 
      embed:'1', 
      cols:'3', 
      gap:String(gap), 
      radius:String(radius) 
    })
    
    // Add user-specific identifier if connected to Notion
    if (isConnected) {
      const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID);
      if (notionDbId) {
        params.set('user', notionDbId);
      }
    }
    
    return `${window.location.origin}${window.location.pathname}#/widget?${params.toString()}`
  }, [gap, radius, isConnected])

  function onDragStart(e, i){ e.dataTransfer.setData('text/plain', String(i)) }
  async function onDrop(e, to){
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    if(Number.isNaN(from) || from===to) return
    const next = rows.slice()
    const [moved] = next.splice(from,1)
    next.splice(to,0,moved)
    setRows(next)

    // If connected, store the new order using enhanced state management
    if (isConnected) {
      const notionDbId = localStorage.getItem(STORAGE_KEYS.NOTION_DB_ID);
      if (notionDbId && next.length > 0) {
        try {
          // Use enhanced state management
          await stateManager.saveGridState(notionDbId, next, { gap, radius });
          
          // Legacy compatibility: also store using old methods
          await storeUserGrid(notionDbId, next);
          cacheUserData(notionDbId, next);
          await storeUserDataPublic(notionDbId, next);
          
          console.log('✅ Stored reordered grid with enhanced state management');
        } catch (error) {
          console.warn('Failed to store reordered grid:', error);
          
          // Fallback to old method only
          try {
            cacheUserData(notionDbId, next);
            await storeUserDataPublic(notionDbId, next);
            console.log('Fallback: stored grid using old method');
          } catch (fallbackError) {
            console.warn('Fallback also failed:', fallbackError);
          }
        }
      }
    }
  }

  function copyUrl(){ navigator.clipboard.writeText(embedUrl) }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--notion-border)] bg-[var(--notion-bg)]/80 backdrop-blur px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-black/90 text-white grid place-items-center text-sm font-semibold">IG</Link>
          <div className="font-semibold">Studio</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/widget?embed=1" className="px-3 py-1.5 rounded-lg bg-black text-white text-sm">Open Embed</Link>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  ✓ {notionDbTitle || 'Connected'}
                </div>
                <Link to="/onboarding" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] text-sm">Change DB</Link>
              </div>
            ) : (
              <Link to="/onboarding" className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] text-sm">Connect Notion</Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-6">
          {/* Left: Content Database */}
          <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)]">
            <div className="p-4 border-b border-[var(--notion-border)]">
              <div className="text-lg font-semibold">
                {isConnected ? `${notionDbTitle || 'Notion Database'}` : 'Demo Content'}
              </div>
              <p className="text-sm text-[var(--muted)]">
                {isConnected 
                  ? 'Live data from your Notion database. Drag to reorder locally.' 
                  : 'Demo data. Drag to reorder. Edit URLs to test.'}
              </p>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted)] border-b border-[var(--notion-border)]">
                    <th className="py-2 px-3 w-10"></th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Image URL</th>
                    {!isConnected && <th className="py-2 px-3 w-16"> </th>}
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
                      <td className="py-2 px-3">
                        {isConnected ? (
                          <div className="truncate">{row.title}</div>
                        ) : (
                          <input value={row.title} onChange={(e)=>{
                            const next=[...rows]; next[i].title=e.target.value; setRows(next)
                          }} className="w-full bg-transparent outline-none" />
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isConnected ? (
                          <div className="truncate text-xs">{row.url}</div>
                        ) : (
                          <input value={row.url} onChange={(e)=>{
                            const next=[...rows]; next[i].url=e.target.value; setRows(next)
                          }} className="w-full bg-transparent outline-none" />
                        )}
                      </td>
                      {!isConnected && (
                        <td className="py-2 px-3 text-right">
                          <button className="opacity-70 group-hover:opacity-100" onClick={()=>{
                            const next=[...rows]; next.splice(i,1); setRows(next)
                          }}>✕</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!isConnected && (
                <div className="p-3">
                  <button onClick={()=> setRows([...rows, { title:'New', url:'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' }])}
                          className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)]">Add row</button>
                  <button onClick={()=> setRows(DEMO_ROWS.slice(0,9))}
                          className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] ml-2">Reset demo data</button>
                </div>
              )}
              {isConnected && (
                <div className="p-3 text-center">
                  <div className="text-xs text-[var(--muted)] mb-2">
                    Data from Notion database • Click sync to get latest changes
                  </div>
                  <Link 
                    to="/onboarding" 
                    className="px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] text-xs"
                  >
                    Change Database
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls + Preview + Link */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--notion-border)] bg-[var(--notion-card)] p-4 space-y-4">
              {/* Sync Notification */}
              {showSyncNotification && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700">🔄 New changes detected in Notion</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={refreshData}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Sync Now
                    </button>
                    <button 
                      onClick={() => setShowSyncNotification(false)}
                      className="px-3 py-1 text-sm border border-blue-300 rounded hover:bg-blue-100"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Top Row: Sync Button + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <button 
                      onClick={refreshData} 
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 font-medium"
                    >
                      {loading ? 'Syncing...' : '🔄 Sync from Notion'}
                    </button>
                  ) : (
                    <button 
                      onClick={refreshData} 
                      disabled={loading}
                      className="px-4 py-2 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] disabled:opacity-50 hover:bg-gray-50"
                    >
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  )}
                  
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg">
                        📊 Connected: {notionDbTitle || 'Notion DB'}
                        {syncStatus?.lastSync && (
                          <div className="text-xs opacity-75 mt-0.5">
                            Last sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={handleLogout}
                        disabled={loading}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        title="Disconnect from Notion and return to demo data"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg">
                        📄 Demo data
                      </div>
                      <Link 
                        to="/onboarding" 
                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        Connect Notion
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bottom Row: Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--notion-border)]">
                <div className="text-sm text-[var(--muted)]">Grid Controls</div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="min-w-[32px]">Gap</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="8" 
                      step="1" 
                      value={gap} 
                      onChange={e=>{
                        const newGap = Number(e.target.value);
                        setGap(newGap);
                        stateManager.saveUIPreferences({ gap: newGap });
                      }}
                      className="w-20"
                    />
                    <span className="text-xs text-[var(--muted)] min-w-[16px]">{gap}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="min-w-[44px]">Radius</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      step="2" 
                      value={radius} 
                      onChange={e=>{
                        const newRadius = Number(e.target.value);
                        setRadius(newRadius);
                        stateManager.saveUIPreferences({ radius: newRadius });
                      }}
                      className="w-20"
                    />
                    <span className="text-xs text-[var(--muted)] min-w-[16px]">{radius}</span>
                  </label>
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
              <div className="font-semibold mb-2">
                {isConnected ? `Embed Your ${notionDbTitle || 'Database'} Grid` : 'Add to Notion'}
              </div>
              <ol className="list-decimal ml-5 space-y-1 text-[var(--muted)]">
                <li>Click <span className="font-medium">Copy embed link</span>.</li>
                <li>In Notion, type <kbd className="px-1 py-0.5 border rounded">/embed</kbd> and paste the link.</li>
                {isConnected && (
                  <li className="text-green-700">Your embed shows your Notion data. Click refresh in embed to sync changes.</li>
                )}
              </ol>
              <div className="mt-3 flex gap-2">
                <button onClick={copyUrl} className="px-3 py-1.5 rounded-lg bg-black text-white">Copy embed link</button>
                <input value={embedUrl} readOnly className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--notion-border)] bg-[var(--notion-card)] text-xs" />
              </div>
              {isConnected && (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  🔗 This embed is personalized for your database. Use the refresh button in the embed to sync latest changes from Notion.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--notion-border)] bg-[var(--notion-bg)]/60 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[var(--muted)]">
          <div>© 2024 Instagram Grid Preview. Built for content creators.</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Floating Suggestion Button */}
      <button
        onClick={() => setShowSuggestionModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Share your suggestion"
      >
        <svg 
          className="w-6 h-6 transform group-hover:scale-110 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
      </button>

      {/* Suggestion Modal */}
      <SuggestionModal 
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
      />
    </div>
  )
}
