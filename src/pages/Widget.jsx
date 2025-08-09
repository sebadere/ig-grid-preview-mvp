import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows, loadRowsAsync } from '../lib/data'

export default function Widget(){
  const [params] = useSearchParams()
  const [rows, setRows] = useState(loadRows())
  const gap = Number(params.get('gap') || 2)
  const radius = Number(params.get('radius') || 6)
  const cols = Number(params.get('cols') || 3)
  const embed = params.get('embed') === '1'

  useEffect(()=>{
    if(embed){ document.body.style.background = '#000' }
    return ()=>{ document.body.style.background = 'var(--notion-bg)' }
  }, [embed])

  useEffect(() => {
    // Load data from Notion if connected
    const loadData = async () => {
      try {
        const newRows = await loadRowsAsync();
        setRows(newRows);
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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [])

  return (
    <div className="h-[calc(100vh-1px)] w-full flex items-center justify-center p-2 no-scrollbar">
      <PhoneFrame>
        <Grid rows={rows} gap={gap} radius={radius} cols={cols} id="gridEmbed" />
      </PhoneFrame>
    </div>
  )
}
