'use client'

import React, { useState, useEffect } from 'react'

interface PullforgeLogoProps {
  size?: number
  className?: string
}

export default function PullforgeLogoAnimated({ size = 40, className = '' }: PullforgeLogoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState(0)

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Logo Container */}
      <div 
        className={`relative w-full h-full transition-all duration-500 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        style={{
          transform: `perspective(200px) rotateY(${rotation * 0.5}deg) rotateX(${Math.sin(rotation * 0.02) * 5}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Background Glow */}
        <div 
          className="absolute inset-0 rounded-xl opacity-60 animate-pulse"
          style={{
            background: `conic-gradient(from ${rotation}deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)`,
            filter: 'blur(8px)',
            transform: 'translateZ(-10px)'
          }}
        />
        
        {/* Main Logo Shape */}
        <div 
          className="relative w-full h-full rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)`,
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.1),
              inset 0 -2px 4px rgba(0,0,0,0.3),
              0 4px 12px rgba(59, 130, 246, 0.3)
            `
          }}
        >
          {/* Inner Gradient Overlay */}
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              background: `conic-gradient(from ${rotation * 2}deg, transparent 0%, rgba(59, 130, 246, 0.2) 25%, transparent 50%, rgba(139, 92, 246, 0.2) 75%, transparent 100%)`,
              animation: 'spin 8s linear infinite'
            }}
          />
          
          {/* P Symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="text-white font-black text-lg leading-none"
              style={{
                fontSize: `${size * 0.45}px`,
                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(59, 130, 246, 0.5)',
                transform: `translateZ(5px) rotateY(${isHovered ? 180 : 0}deg)`,
                transition: 'transform 0.6s ease-in-out'
              }}
            >
              {isHovered ? 'OS' : 'P'}
            </div>
          </div>
          
          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${20 + (i * 8)}%`,
                transform: `translateZ(${i * 2}px) translateY(${Math.sin(rotation * 0.02 + i) * 3}px)`,
                animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
              }}
            />
          ))}
        </div>
        
        {/* Edge Highlights */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
            transform: `translateX(${Math.sin(rotation * 0.01) * 2}px)`
          }}
        />
      </div>
    </div>
  )
}
