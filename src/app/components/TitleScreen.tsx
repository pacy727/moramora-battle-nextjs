// src/app/components/TitleScreen.tsx (Enhanced Version)
'use client'

import { useState } from 'react'
import { EnhancedCard } from './Card/EnhancedCard'
import { CardGallery } from './CardGallery/CardGallery'
import { FloatingParticles, BackgroundEffects } from './Feedback/VisualFeedbackSystem'
import { ChemicalCard } from '../types/game'

interface TitleScreenProps {
  onStartGame: () => void
}

export default function EnhancedTitleScreen({ onStartGame }: TitleScreenProps) {
  const [showCardGallery, setShowCardGallery] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // サンプルカード
  const sampleCards: ChemicalCard[] = [
    { formula: 'H₂O', value: '18', unit: 'g', meltingPoint: 0 },
    { formula: 'CO₂', value: '1.2', unit: 'mol', meltingPoint: -57 },
    { formula: 'O₂', value: '22.4', unit: 'L', meltingPoint: -218 }
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4 overflow-hidden relative">
      {/* 背景エフェクト */}
      <BackgroundEffects intensity="medium" theme="default" />
      
      {/* フローティング粒子 */}
      <FloatingParticles count={30} color="#fbbf24" size="medium" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* メインタイトル */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse-glow">
            ⚗️ モラモラバトル ⚗️
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-semibold mb-3 animate-typewriter">
            高校化学基礎のmol計算学習ゲーム
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto rounded-full animate-glow"></div>
        </div>

        {/* コンパクトなルール説明 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden animate-bounce-in">
          <FloatingParticles count={8} color="#60a5fa" size="small" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative z-10">
            <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className="text-3xl mb-2 animate-bounce">🎯</div>
              <h3 className="text-blue-300 font-semibold mb-2">目標</h3>
              <p className="text-white/80 text-sm">先に3ポイント獲得で勝利</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className="text-3xl mb-2 animate-heartbeat">⏱️</div>
              <h3 className="text-green-300 font-semibold mb-2">制限時間</h3>
              <p className="text-white/80 text-sm">各ラウンド10秒で判断</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className="text-3xl mb-2 animate-float-up">🧪</div>
              <h3 className="text-yellow-300 font-semibold mb-2">学習内容</h3>
              <p className="text-white/80 text-sm">mol計算・分子量・体積</p>
            </div>
          </div>
        </div>

        {/* サンプルカード表示 */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 animate-glow">
            💳 カードの例
          </h3>
          <div className="flex justify-center gap-4 mb-4">
            {sampleCards.map((card, index) => (
              <div
                key={index}
                className="transform transition-all duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <EnhancedCard
                  card={card}
                  size="medium"
                  glowEffect={hoveredCard === index}
                  isSelected={hoveredCard === index}
                />
              </div>
            ))}
          </div>
          
          {/* カードギャラリーボタン */}
          <button
            onClick={() => setShowCardGallery(true)}
            className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-300 underline decoration-dotted hover:decoration-solid"
          >
            📚 全てのカードを見る
          </button>
        </div>

        {/* ゲーム説明 */}
        <div className="bg-white/5 rounded-xl p-4 mb-8 text-white/70 text-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <p>お題に最適なカードを選んで勝利を目指そう！</p>
          <p>分子量、mol数、体積、融点などの化学知識を駆使して戦略的にプレイ。</p>
        </div>

        {/* スタートボタンエリア */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <button
            onClick={onStartGame}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-full text-lg md:text-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-2 hover:scale-110 animate-heartbeat relative overflow-hidden group"
          >
            <span className="relative z-10">🚀 ゲームスタート！</span>
            {/* ホバー時のライトエフェクト */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          
          {/* サブボタン */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowCardGallery(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              🃏 カード図鑑
            </button>
            
            <button
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              📖 ルール詳細
            </button>
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-8 text-white/60 text-xs space-y-2 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <p>化学の基礎をゲームで楽しく学習</p>
          <p>mol計算をマスターして化学が得意になろう！</p>
          <div className="flex justify-center items-center gap-2 text-white/40">
            <span>Made with</span>
            <span className="text-red-400 animate-heartbeat">❤️</span>
            <span>for chemistry students</span>
          </div>
        </div>

        {/* 装飾要素 */}
        <div className="absolute top-10 left-10 text-white/20 text-6xl animate-float-random">⚗️</div>
        <div className="absolute bottom-10 right-10 text-white/20 text-4xl animate-wave">🧪</div>
        <div className="absolute top-1/2 left-5 text-white/20 text-3xl animate-bounce">💡</div>
        <div className="absolute top-1/4 right-5 text-white/20 text-5xl animate-pulse">🔬</div>
      </div>

      {/* カードギャラリーモーダル */}
      {showCardGallery && (
        <CardGallery onClose={() => setShowCardGallery(false)} />
      )}
    </div>
  )
}