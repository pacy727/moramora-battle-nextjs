// src/app/components/Feedback/VisualFeedbackSystem.tsx (修正版)
'use client'

import { useState, useEffect, useMemo } from 'react'
import type { 
  FeedbackMessage, 
  VisualFeedbackSystemProps,
  FloatingParticlesProps,
  ConfettiProps,
  ScoreUpAnimationProps,
  BackgroundEffectsProps
} from '../../types/feedback'

export const VisualFeedbackSystem = ({ messages, onMessageDismiss }: VisualFeedbackSystemProps) => {
  const [visibleMessages, setVisibleMessages] = useState<FeedbackMessage[]>([])

  useEffect(() => {
    setVisibleMessages(messages)

    // 自動削除タイマー
    const timers = messages.map(message => {
      if (message.duration) {
        return setTimeout(() => {
          onMessageDismiss(message.id)
        }, message.duration)
      }
      return null
    })

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [messages, onMessageDismiss])

  const getMessageStyles = (type: FeedbackMessage['type']) => {
    const baseStyles = "transform transition-all duration-500 ease-out"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 text-white border-l-4 border-green-300`
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-pink-500 text-white border-l-4 border-red-300`
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-l-4 border-yellow-300`
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-l-4 border-blue-300`
      default:
        return `${baseStyles} bg-gradient-to-r from-gray-500 to-slate-500 text-white border-l-4 border-gray-300`
    }
  }

  const getIcon = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return '🎉'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleMessages.map((message, index) => (
        <div
          key={message.id}
          className={`
            ${getMessageStyles(message.type)}
            p-4 rounded-lg shadow-2xl backdrop-blur-md
            animate-slide-in-right
          `}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl flex-shrink-0">
              {getIcon(message.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{message.title}</h4>
              <p className="text-xs opacity-90 leading-relaxed">{message.message}</p>
            </div>
            <button
              onClick={() => onMessageDismiss(message.id)}
              className="text-white/70 hover:text-white transition-colors duration-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
          
          {/* プログレスバー */}
          {message.duration && (
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/50 rounded-full animate-progress-bar"
                style={{ animationDuration: `${message.duration}ms` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// フローティング粒子エフェクト（修正版）
export const FloatingParticles = ({ 
  count = 20, 
  color = '#fbbf24',
  size = 'medium' 
}: FloatingParticlesProps) => {
  const [mounted, setMounted] = useState(false)
  
  // クライアントサイドでマウント後に初期化
  useEffect(() => {
    setMounted(true)
  }, [])

  const particles = useMemo(() => {
    if (!mounted) return []
    
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      animationDuration: 2 + Math.random() * 3
    }))
  }, [count, mounted])

  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  }

  if (!mounted) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`
            absolute ${sizeClasses[size]} rounded-full opacity-70
            animate-float-up
          `}
          style={{
            backgroundColor: color,
            left: `${particle.left}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`
          }}
        />
      ))}
    </div>
  )
}

// 勝利時のコンフェッティエフェクト
export const Confetti = ({ active, duration = 3000 }: ConfettiProps) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (active && mounted) {
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [active, duration, mounted])

  const confettiParticles = useMemo(() => {
    if (!mounted || !showConfetti) return []
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7']
    
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      width: 4 + Math.random() * 4,
      height: 4 + Math.random() * 4,
      animationDelay: Math.random() * 0.5,
      animationDuration: 2 + Math.random() * 2
    }))
  }, [mounted, showConfetti])

  if (!mounted || !showConfetti) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {confettiParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.backgroundColor,
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`
          }}
        />
      ))}
    </div>
  )
}

// スコアアップアニメーション
export const ScoreUpAnimation = ({ show, value, position }: ScoreUpAnimationProps) => {
  if (!show) return null

  return (
    <div
      className="fixed pointer-events-none z-50 animate-score-up"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
        +{value}
      </div>
    </div>
  )
}

// バックグラウンドエフェクト（修正版）
export const BackgroundEffects = ({ 
  intensity = 'medium',
  theme = 'default'
}: BackgroundEffectsProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const particles = useMemo(() => {
    if (!mounted) return []

    const getParticleCount = () => {
      switch (intensity) {
        case 'low': return 10
        case 'medium': return 20
        case 'high': return 40
        default: return 20
      }
    }

    const getThemeColors = () => {
      switch (theme) {
        case 'victory':
          return ['#fbbf24', '#34d399', '#60a5fa']
        case 'defeat':
          return ['#ef4444', '#f97316', '#ec4899']
        default:
          return ['#a855f7', '#3b82f6', '#06b6d4']
      }
    }

    const colors = getThemeColors()
    const count = getParticleCount()

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      width: 2 + Math.random() * 6,
      height: 2 + Math.random() * 6,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 5 + Math.random() * 10
    }))
  }, [intensity, theme, mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 動く粒子 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-20 animate-float-random"
          style={{
            backgroundColor: particle.backgroundColor,
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`
          }}
        />
      ))}
      
      {/* グラデーションオーバーレイ */}
      <div 
        className={`
          absolute inset-0 opacity-5
          ${theme === 'victory' ? 'bg-gradient-to-br from-green-400 to-blue-400' : ''}
          ${theme === 'defeat' ? 'bg-gradient-to-br from-red-400 to-pink-400' : ''}
          ${theme === 'default' ? 'bg-gradient-to-br from-purple-400 to-blue-400' : ''}
        `}
      />
    </div>
  )
}