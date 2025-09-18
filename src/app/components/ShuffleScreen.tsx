// src/app/components/ShuffleScreen.tsx
'use client'

import { useState, useEffect } from 'react'
import { EnhancedCard } from './Card/EnhancedCard'
import { FloatingParticles, BackgroundEffects } from './Feedback/VisualFeedbackSystem'
import { ChemicalCard } from '../types/game'
import { CHEMICAL_CARDS } from '../lib/gameData'

interface ShuffleScreenProps {
  onShuffleComplete: (finalHand: ChemicalCard[]) => void
  onBackToTitle: () => void
}

export default function ShuffleScreen({ onShuffleComplete, onBackToTitle }: ShuffleScreenProps) {
  const [playerHand, setPlayerHand] = useState<ChemicalCard[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [shuffleCount, setShuffleCount] = useState(0)

  // 初期手札を生成
  useEffect(() => {
    generateInitialHand()
    
    // 10秒タイマー開始
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // 時間切れで自動確定
          setTimeout(() => {
            handleComplete()
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 初期手札生成
  const generateInitialHand = () => {
    const shuffled = [...CHEMICAL_CARDS].sort(() => Math.random() - 0.5)
    setPlayerHand(shuffled.slice(0, 8))
  }

  // 新しい手札を生成（重複を避ける）
  const generateNewHand = () => {
    const shuffled = [...CHEMICAL_CARDS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 8)
  }

  // シャッフル実行
  const handleShuffle = () => {
    if (isShuffling || timeLeft <= 0) return

    setIsShuffling(true)
    setShuffleCount(prev => prev + 1)

    // カードフリップアニメーション（1秒）
    setTimeout(() => {
      const newHand = generateNewHand()
      setPlayerHand(newHand)
      setIsShuffling(false)
    }, 1000)
  }

  // 決定ボタン
  const handleComplete = () => {
    onShuffleComplete(playerHand)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-2 md:p-4 overflow-hidden relative">
      {/* 背景エフェクト */}
      <BackgroundEffects intensity="medium" theme="default" />
      <FloatingParticles count={15} color="#fbbf24" size="medium" />

      <div className="max-w-4xl w-full mx-auto text-center relative z-10 py-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBackToTitle}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 backdrop-blur-sm hover:scale-105"
          >
            ← タイトル
          </button>
          
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              🔀 手札シャッフル 🔀
            </h1>
          </div>
          
          <div className="w-16"></div>
        </div>

        {/* タイマー表示 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 shadow-xl">
          <h2 className="text-white text-lg mb-2">手札を決めてください</h2>
          <div className={`text-4xl font-bold transition-all duration-300 ${
            timeLeft <= 3 
              ? 'text-red-400 animate-pulse scale-125' 
              : timeLeft <= 5 
                ? 'text-yellow-300 animate-heartbeat' 
                : 'text-green-300'
          }`}>
            {timeLeft}
          </div>
          <div className="text-white/70 text-sm mt-2">
            シャッフル回数: {shuffleCount}/10
          </div>
        </div>

        {/* 手札表示 */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 shadow-xl">
          <h3 className="text-white text-lg font-bold mb-4">あなたの手札</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 justify-items-center">
            {playerHand.map((card, index) => (
              <div key={`${card.formula}-${card.unit}-${index}`} className="relative">
                <EnhancedCard
                  card={card}
                  size="small"
                  isRevealing={isShuffling}
                  showBack={isShuffling}
                  disabled={true}
                />
                {isShuffling && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleShuffle}
              disabled={isShuffling || timeLeft <= 0}
              className={`
                bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                text-white font-bold py-3 px-8 rounded-full text-lg 
                transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1
                ${(isShuffling || timeLeft <= 0) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                relative overflow-hidden group
              `}
            >
              {isShuffling ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  シャッフル中...
                </span>
              ) : (
                <>
                  🔀 シャッフル
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </>
              )}
            </button>

            <button
              onClick={handleComplete}
              disabled={timeLeft <= 0 && isShuffling}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
            >
              <span className="relative z-10">✓ 決定！</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>

          {/* 説明文 */}
          <div className="bg-white/5 rounded-xl p-4 text-white/80 text-sm">
            <p className="mb-2">🎯 気に入った手札になるまでシャッフルできます</p>
            <p className="mb-2">⏰ 制限時間は10秒、1回のシャッフルには1秒かかります</p>
            <p>🃏 シャッフル後は相手の手札も見えるようになります</p>
          </div>
        </div>

        {/* 時間切れメッセージ */}
        {timeLeft <= 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl animate-zoom-in">
              <h3 className="text-white text-xl font-bold mb-4">⏰ 時間切れ！</h3>
              <p className="text-white/80 mb-4">現在の手札で確定します</p>
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}