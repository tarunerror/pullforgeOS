'use client'

import React, { useEffect, useState } from 'react'

export default function PullforgeFavicon() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Generate favicon as SVG data URL
  const generateFavicon = () => {
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e293b"/>
            <stop offset="50%" style="stop-color:#334155"/>
            <stop offset="100%" style="stop-color:#475569"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="32" height="32" rx="6" fill="url(#bg)"/>
        
        <!-- Rotating gradient overlay -->
        <rect width="32" height="32" rx="6" fill="url(#bg)" opacity="0.3" transform="rotate(${rotation} 16 16)"/>
        
        <!-- P Letter -->
        <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" 
              text-anchor="middle" fill="#3b82f6" filter="url(#glow)">P</text>
        
        <!-- Glow effect -->
        <circle cx="16" cy="16" r="12" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.6"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  useEffect(() => {
    // Update favicon dynamically
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = generateFavicon()
    } else {
      const newFavicon = document.createElement('link')
      newFavicon.rel = 'icon'
      newFavicon.href = generateFavicon()
      document.head.appendChild(newFavicon)
    }
  }, [rotation])

  return null // This component only updates the favicon
}
