'use client'

import React, { useEffect, useState } from 'react'
import { useWindows } from '@/contexts/WindowContext'
import Window from './Window'
import Taskbar from './Taskbar'
import AppLauncher from './AppLauncher'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
}

export default function Desktop() {
  const { windows } = useWindows()
  const [particles, setParticles] = useState<Particle[]>([])
  const [time, setTime] = useState(0)

  // Initialize floating particles
  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2,
    }))
    setParticles(initialParticles)
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - particle.speed,
        x: particle.x + Math.sin(time * 0.01 + particle.id) * 0.5,
        ...(particle.y < -10 && {
          y: window.innerHeight + 10,
          x: Math.random() * window.innerWidth,
        })
      })))
    }, 50)

    return () => clearInterval(interval)
  }, [time])

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-cyan-900/10" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, 0.5)`
            }}
          />
        ))}
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 z-10">
        <AppLauncher />
      </div>

      {/* Windows */}
      <div className="absolute inset-0">
        {windows.map((window) => (
          <Window key={window.id} windowData={window} />
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  )
}
