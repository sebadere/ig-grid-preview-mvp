import React from 'react'

export default function Grid({ rows, gap=1, radius=6, cols=3, numImages=9, id }){
  const style = { gap: `${gap}px`, gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }
  // Show only first 8 images in the display, but respect numImages for data selection
  const displayRows = rows.slice(0, Math.min(8, numImages))
  
  return (
    <div id={id} className="grid h-full" style={style}>
      {displayRows.map((item, idx) => (
        <div key={idx} className="sq" style={{ borderRadius: `${radius}px` }}>
          <img 
            src={item.url} 
            alt={item.title || ''} 
            loading="lazy"
            onError={(e)=>{
              const target = e.currentTarget
              // Avoid infinite loop
              if (target.dataset.fallbackApplied === '1') return
              target.dataset.fallbackApplied = '1'
              target.src = 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?q=80&w=600&auto=format&fit=crop'
            }}
          />
        </div>
      ))}
    </div>
  )
}
