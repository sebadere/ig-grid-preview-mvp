import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import Grid from '../components/Grid'
import { loadRows } from '../lib/data'

export default function Widget(){
  const [params] = useSearchParams()
  const rows = loadRows()
  const gap = Number(params.get('gap') || 2)
  const radius = Number(params.get('radius') || 6)
  const cols = Number(params.get('cols') || 3)
  const embed = params.get('embed') === '1'

  useEffect(()=>{
    if(embed){ document.body.style.background = '#000' }
    return ()=>{ document.body.style.background = 'var(--notion-bg)' }
  }, [embed])

  return (
    <div className="h-[calc(100vh-1px)] w-full flex items-center justify-center p-2 no-scrollbar">
      <PhoneFrame>
        <Grid rows={rows} gap={gap} radius={radius} cols={cols} id="gridEmbed" />
      </PhoneFrame>
    </div>
  )
}
