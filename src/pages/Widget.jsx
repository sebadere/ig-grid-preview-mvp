import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows, loadRowsAsync, loadRowsForUser, checkForNotionChanges } from '../lib/data'

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
        console.log('Widget: Loading data for userId:', userId);
        if (userId) {
          // Load data for specific user from URL params
          const newRows = await loadRowsForUser(userId);
          console.log('Widget: Loaded rows:', newRows.length, 'items');
          console.log('Widget: Sample row:', newRows[0]);
          setRows(newRows);
        } else {
          // Load data for current user (if logged in)
          const newRows = await loadRowsAsync();
          console.log('Widget: Loaded async rows:', newRows.length, 'items');
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
      if (e.key === 'notionDbId' || e.key === 'ig-grid-mvp-rows') {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up polling for Notion changes if we have a user ID
    let pollInterval;
    if (userId) {
      pollInterval = setInterval(async () => {
        try {
          console.log('Widget: Checking for changes for user:', userId);
          const hasChanges = await checkForNotionChanges(userId);
          console.log('Widget: Has changes?', hasChanges);
          if (hasChanges) {
            console.log('Notion changes detected in widget, refreshing...');
            loadData();
          }
        } catch (error) {
          console.warn('Failed to check for changes in widget:', error);
        }
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [userId])

  async function handleRefresh(){
    if (loading) return;
    setLoading(true);
    try {
      if (userId) {
        const fresh = await loadRowsForUser(userId);
        setRows(fresh);
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