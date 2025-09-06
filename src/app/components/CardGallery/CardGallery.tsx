// src/app/components/CardGallery/CardGallery.tsx (修正版 - レスポンシブ対応)
'use client'

import { useState } from 'react'
import { EnhancedCard } from '../Card/EnhancedCard'
import { ChemicalCard } from '../../types/game'
import { CHEMICAL_CARDS } from '../../lib/gameData'

interface CardGalleryProps {
  onClose: () => void
}

export const CardGallery = ({ onClose }: CardGalleryProps) => {
  const [selectedCard, setSelectedCard] = useState<ChemicalCard | null>(null)
  const [animationState, setAnimationState] = useState<{
    isSelected: boolean
    isPlayed: boolean
    isRevealing: boolean
    isCorrect: boolean | null
    isWrong: boolean | null
    showBack: boolean
  }>({
    isSelected: false,
    isPlayed: false,
    isRevealing: false,
    isCorrect: null,
    isWrong: null,
    showBack: false
  })

  const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'large'>('medium')

  const toggleAnimation = (key: keyof typeof animationState) => {
    setAnimationState(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const resetAnimations = () => {
    setAnimationState({
      isSelected: false,
      isPlayed: false,
      isRevealing: false,
      isCorrect: null,
      isWrong: null,
      showBack: false
    })
  }

  const testCorrectAnimation = () => {
    setAnimationState(prev => ({ ...prev, isCorrect: true, isWrong: false }))
    setTimeout(() => {
      setAnimationState(prev => ({ ...prev, isCorrect: null }))
    }, 2000)
  }

  const testWrongAnimation = () => {
    setAnimationState(prev => ({ ...prev, isWrong: true, isCorrect: false }))
    setTimeout(() => {
      setAnimationState(prev => ({ ...prev, isWrong: null }))
    }, 2000)
  }

  const testFlipAnimation = () => {
    setAnimationState(prev => ({ ...prev, isRevealing: true }))
    setTimeout(() => {
      setAnimationState(prev => ({ ...prev, isRevealing: false }))
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">🃏 カードギャラリー</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* コントロールパネル */}
        <div className="bg-white/5 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
          <h3 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">アニメーションテスト</h3>
          
          {/* サイズ選択 */}
          <div className="mb-3 md:mb-4">
            <label className="text-white text-xs md:text-sm block mb-2">カードサイズ:</label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentSize(size)}
                  className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-all ${
                    currentSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* アニメーションコントロール */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 mb-3 md:mb-4">
            <button
              onClick={() => toggleAnimation('isSelected')}
              className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm transition-all ${
                animationState.isSelected
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              選択状態
            </button>
            
            <button
              onClick={() => toggleAnimation('isPlayed')}
              className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm transition-all ${
                animationState.isPlayed
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              プレイ状態
            </button>
            
            <button
              onClick={() => toggleAnimation('showBack')}
              className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm transition-all ${
                animationState.showBack
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              裏面表示
            </button>
            
            <button
              onClick={testFlipAnimation}
              className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all"
            >
              フリップ
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 md:gap-2">
            <button
              onClick={testCorrectAnimation}
              className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm bg-green-500 hover:bg-green-600 text-white transition-all"
            >
              正解アニメ
            </button>
            
            <button
              onClick={testWrongAnimation}
              className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              不正解アニメ
            </button>
            
            <button
              onClick={resetAnimations}
              className="px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm bg-gray-500 hover:bg-gray-600 text-white transition-all"
            >
              リセット
            </button>
          </div>
        </div>

        {/* テスト用カード表示エリア */}
        {selectedCard && (
          <div className="bg-white/5 rounded-xl p-4 md:p-6 mb-4 md:mb-6 text-center">
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">プレビュー</h3>
            <div className="flex justify-center">
              <EnhancedCard
                card={selectedCard}
                isSelected={animationState.isSelected}
                isPlayed={animationState.isPlayed}
                isRevealing={animationState.isRevealing}
                isCorrect={animationState.isCorrect}
                isWrong={animationState.isWrong}
                showBack={animationState.showBack}
                size={currentSize}
                onClick={() => console.log('Card clicked!')}
              />
            </div>
            <div className="text-white/70 text-xs md:text-sm mt-3 md:mt-4">
              <p>化学式: {selectedCard.formula}</p>
              <p>値: {selectedCard.value}{selectedCard.unit}</p>
              <p>融点: {selectedCard.meltingPoint}℃</p>
            </div>
          </div>
        )}

        {/* カード一覧 */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
          {CHEMICAL_CARDS.map((card, index) => (
            <div key={`${card.formula}-${card.unit}-${index}`} className="flex flex-col items-center">
              <EnhancedCard
                card={card}
                size="small"
                onClick={() => setSelectedCard(card)}
              />
              <div className="text-white/60 text-xs mt-1 text-center">
                {card.formula}
              </div>
            </div>
          ))}
        </div>

        {/* 統計情報 */}
        <div className="bg-white/5 rounded-xl p-3 md:p-4 mt-4 md:mt-6">
          <h3 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">📊 カード統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-300">
                {CHEMICAL_CARDS.length}
              </div>
              <div className="text-white/70 text-xs md:text-sm">総カード数</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-300">
                {CHEMICAL_CARDS.filter(c => c.unit === 'g').length}
              </div>
              <div className="text-white/70 text-xs md:text-sm">分子量カード</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-yellow-300">
                {CHEMICAL_CARDS.filter(c => c.unit === 'mol').length}
              </div>
              <div className="text-white/70 text-xs md:text-sm">mol数カード</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-purple-300">
                {CHEMICAL_CARDS.filter(c => c.unit === 'L').length}
              </div>
              <div className="text-white/70 text-xs md:text-sm">体積カード</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 md:mt-6">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 md:px-6 rounded-full transition-all duration-300 hover:scale-105 text-sm md:text-base"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}