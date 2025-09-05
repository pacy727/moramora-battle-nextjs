// src/app/components/Card/EnhancedCard.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChemicalCard } from '../../types/game'

interface EnhancedCardProps {
  card: ChemicalCard
  isSelected?: boolean
  isPlayed?: boolean
  isRevealing?: boolean
  isCorrect?: boolean | null
  isWrong?: boolean | null
  glowEffect?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  showBack?: boolean
}

export const EnhancedCard = ({
  card,
  isSelected = false,
  isPlayed = false,
  isRevealing = false,
  isCorrect = null,
  isWrong = null,
  glowEffect = false,
  onClick,
  disabled = false,
  size = 'medium',
  showBack = false
}: EnhancedCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  // フリップアニメーション制御
  useEffect(() => {
    if (isRevealing) {
      const timer = setTimeout(() => {
        setIsFlipped(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setIsFlipped(false)
    }
  }, [isRevealing])

  // 正解時のスパークルエフェクト
  useEffect(() => {
    if (isCorrect) {
      setShowSparkles(true)
      const timer = setTimeout(() => {
        setShowSparkles(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCorrect])

  const sizeClasses = {
    small: 'w-16 h-20 text-xs',
    medium: 'w-20 h-28 text-sm',
    large: 'w-24 h-32 text-base'
  }

  const getCardClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]} cursor-pointer relative transition-all duration-500 
      transform-gpu perspective-1000 card-container
    `
    
    const interactionClasses = `
      ${!disabled && onClick ? 'hover:scale-105 hover:-translate-y-2' : ''}
      ${isSelected ? 'scale-110 -translate-y-3 z-20' : ''}
      ${isPlayed ? 'scale-125 z-30' : ''}
      ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    `

    const effectClasses = `
      ${glowEffect ? 'animate-pulse-glow' : ''}
      ${isCorrect ? 'animate-correct-sparkle' : ''}
      ${isWrong ? 'animate-wrong-shake' : ''}
    `

    return `${baseClasses} ${interactionClasses} ${effectClasses}`
  }

  const getCardStyle = () => {
    let boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
    
    if (isSelected) {
      boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4), 0 0 0 2px #ef4444'
    } else if (isPlayed) {
      boxShadow = '0 12px 35px rgba(251, 191, 36, 0.6), 0 0 0 3px #fbbf24'
    } else if (isCorrect) {
      boxShadow = '0 8px 25px rgba(34, 197, 94, 0.6), 0 0 0 3px #22c55e'
    } else if (isWrong) {
      boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6), 0 0 0 3px #ef4444'
    }

    return { boxShadow }
  }

  return (
    <div 
      className={getCardClasses()}
      onClick={!disabled ? onClick : undefined}
      style={getCardStyle()}
    >
      {/* スパークルエフェクト */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* カード本体 */}
      <div className={`card-flip-inner ${isFlipped || showBack ? 'flipped' : ''}`}>
        {/* カード裏面 (隠し状態) */}
        <div className="card-face card-back">
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center border-2 border-white/20">
            <div className="text-white text-2xl font-bold opacity-50">?</div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            {/* カードの装飾パターン */}
            <div className="absolute inset-2 border border-white/20 rounded-lg" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* カード表面 */}
        <div className="card-face card-front">
          <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-2 flex flex-col justify-between border-2 border-gray-200 relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-200/30 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-6 h-6 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-tr-full" />
            
            {/* 化学式 */}
            <div className="text-center flex-1 flex items-center justify-center">
              <div className="text-gray-800 font-bold leading-tight">
                {card.formula}
              </div>
            </div>
            
            {/* 値と単位 */}
            <div className="text-center">
              <div className="text-gray-600 font-semibold text-xs">
                {card.value}{card.unit}
              </div>
            </div>

            {/* 分子量グレーダーインジケーター */}
            {card.unit === 'g' && (
              <div className="absolute top-1 left-1 w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full opacity-60" />
            )}
            {card.unit === 'mol' && (
              <div className="absolute top-1 left-1 w-1 h-4 bg-gradient-to-b from-green-400 to-teal-500 rounded-full opacity-60" />
            )}
            {card.unit === 'L' && (
              <div className="absolute top-1 left-1 w-1 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full opacity-60" />
            )}

            {/* ホログラフィック効果 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-xl opacity-50" />
          </div>
        </div>
      </div>

      {/* 選択時のリング効果 */}
      {isSelected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-pink-400 to-red-400 rounded-xl blur-sm opacity-75 animate-spin-slow" />
      )}

      {/* プレイ時のオーラ効果 */}
      {isPlayed && (
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-xl blur-md opacity-50 animate-pulse" />
      )}
    </div>
  )
}