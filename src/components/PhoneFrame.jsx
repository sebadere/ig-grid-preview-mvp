import React from 'react'

export default function PhoneFrame({ children, className='' }){
  return (
    <div className={`relative phone mx-auto w-full max-w-sm aspect-[9/16] overflow-hidden bg-black ${className}`}>
      <div className="camera-notch"></div>
      <div className="absolute inset-0 overflow-hidden p-2">{children}</div>
    </div>
  )
}
