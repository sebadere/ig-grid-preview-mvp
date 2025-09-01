import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows, loadRowsAsync, loadRowsForUser } from '../lib/data'
import { stateManager } from '../lib/state'
import { STORAGE_KEYS } from '../lib/config.js'

export default function Widget(){
  const [params] = useSearchParams()
  const [rows, setRows] = useState(loadRows())
  const [loading, setLoading] = useState(false)
  const gap = Number(params.get('gap') || 2)
  const radius = Number(params.get('radius') || 6)
  const cols = Number(params.get('cols') || 3)
  const embed = params.get('embed') === '1'
  const userId = params.get('user') // Get user ID from URL params

  useEffect(()=>{
    if(embed){ document.body.style.background = '#000' }
    return ()=>{ document.body.style.background = 'var(--notion-bg)' }
  }, [embed])

  useEffect(() => {
    // Load data based on user parameter or current user
    const loadData = async () => {
      try {
        if (userId) {
          console.log('🎯 Widget loading data for user (notionDbId):', userId);
          
          // Try enhanced state management first for saved user state
          const savedState = await stateManager.loadGridState(userId);
          if (savedState && savedState.rows && savedState.rows.length > 0) {
            console.log('📱 Widget: SUCCESS - Loaded saved state from enhanced state management', {
              rowCount: savedState.rows.length,
              firstRow: savedState.rows[0],
              preferences: savedState.preferences
            });
            setRows(savedState.rows);
            return;
          }
          
          // Fallback to original loadRowsForUser function
          console.log('📡 Widget: Enhanced state empty, fallback to loadRowsForUser');
          const newRows = await loadRowsForUser(userId);
          console.log('📡 Widget: loadRowsForUser returned:', {
            rowCount: newRows?.length,
            firstRow: newRows?.[0],
            isDemo: newRows?.[0]?.url?.includes('unsplash.com')
          });
          setRows(newRows);
        } else {
          // Load data for current user (if logged in)
          const newRows = await loadRowsAsync();
          setRows(newRows);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setRows(loadRows()); // fallback to local data
      }
    };
    loadData();

    // Listen for storage changes (logout/login in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.NOTION_DB_ID || e.key === STORAGE_KEYS.GRID_ROWS) {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId])

  async function handleRefresh(){
    if (loading) return;
    setLoading(true);
    try {
      if (userId) {
        console.log('🔄 Widget refreshing data for user:', userId);
        
        // Try enhanced state management first for saved user state
        const savedState = await stateManager.loadGridState(userId);
        if (savedState && savedState.rows && savedState.rows.length > 0) {
          console.log('📱 Widget refresh: Loaded saved state from enhanced state management');
          setRows(savedState.rows);
        } else {
          // Fallback to fresh fetch
          console.log('📡 Widget refresh: Fallback to loadRowsForUser');
          const fresh = await loadRowsForUser(userId);
          setRows(fresh);
        }
      } else {
        const fresh = await loadRowsAsync();
        setRows(fresh);
      }
    } catch (e) {
      console.warn('Widget refresh failed', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-1px)] w-full flex flex-col p-2 no-scrollbar">
      <div className="flex items-center justify-between pb-2 text-xs text-white/80" style={{display: embed ? 'flex' : 'none'}}>
        <div>Instagram Grid</div>
        <button onClick={handleRefresh} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <PhoneFrame>
          <Grid rows={rows} gap={gap} radius={radius} cols={cols} id="gridEmbed" />
        </PhoneFrame>
      </div>
    </div>
  )
}