import React from 'react'

export default function Grid({ rows, gap=1, radius=6, cols=3, id }){
  const style = { gap: `${gap}px`, gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }
  return (
    <div id={id} className="grid h-full" style={style}>
      {rows.map((item, idx) => (
        <div key={idx} className="sq" style={{ borderRadius: `${radius}px` }}>
          <img src={item.url} alt={item.title || ''} />
        </div>
      ))}
    </div>
  )
}
