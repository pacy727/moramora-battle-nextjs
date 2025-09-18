// src/app/components/BattleRoadScreen.tsx - 改良版（デザイン刷新）
'use client'

import { useState, useEffect } from 'react'
import { BackgroundEffects, FloatingParticles, Confetti } from './Feedback/VisualFeedbackSystem'

// 元素データ（1-54番）
const ELEMENTS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
  'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
  'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
  'Sb', 'Te', 'I', 'Xe'
]

interface BattleRoadScreenProps {
  currentElement: number // 0-53 (H-Xe)
  wins: number
  life: number
  isVictory: boolean
  isDefeat: boolean
  isGameClear: boolean
  onStartNextBattle: () => void
  onGameOver: () => void
  onRetry: () => void
}

type AnimationPhase = 'idle' | 'victory-mark' | 'player-move' | 'vs-animation' | 'defeat-mark' | 'life-decrease' | 'revenge' | 'game-clear'

export default function BattleRoadScreen({
  currentElement,
  wins,
  life,
  isVictory,
  isDefeat,
  isGameClear,
  onStartNextBattle,
  onGameOver,
  onRetry
}: BattleRoadScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle')
  const [showConfetti, setShowConfetti] = useState(false)
  const [displayedElements, setDisplayedElements] = useState<number[]>([])

  // 初期表示設定
  useEffect(() => {
    console.log('BattleRoad初期化:', { currentElement, wins, life, isVictory, isDefeat })
    
    // 表示する元素を常に更新
    const getDisplayedElements = () => {
      const playerPos = currentElement
      const startIndex = Math.max(0, Math.min(playerPos - 2, ELEMENTS.length - 5))
      return Array.from({ length: 5 }, (_, i) => startIndex + i).filter(i => i < ELEMENTS.length)
    }
    
    setDisplayedElements(getDisplayedElements())
    console.log('表示元素設定:', getDisplayedElements())
  }, [currentElement, isVictory, isDefeat])

  // 勝利アニメーション
  useEffect(() => {
    if (isVictory && animationPhase === 'idle') {
      console.log('勝利アニメーション開始')
      setAnimationPhase('victory-mark')
      
      setTimeout(() => {
        setAnimationPhase('player-move')
        // 表示要素を更新
        const newPlayerPos = currentElement + 1
        const startIndex = Math.max(0, Math.min(newPlayerPos - 2, ELEMENTS.length - 5))
        const newElements = Array.from({ length: 5 }, (_, i) => startIndex + i).filter(i => i < ELEMENTS.length)
        setDisplayedElements(newElements)
      }, 1500)
      
      setTimeout(() => {
        if (currentElement >= 53) { // Xeまで到達
          setAnimationPhase('game-clear')
          setShowConfetti(true)
        } else {
          setAnimationPhase('vs-animation')
        }
      }, 3500)
      
      setTimeout(() => {
        if (currentElement < 53) {
          console.log('次のバトルを開始')
          setAnimationPhase('idle') // アニメーション状態をリセット
          onStartNextBattle()
        }
      }, 5000)
    }
  }, [isVictory, animationPhase, currentElement, onStartNextBattle])

  // 敗北アニメーション
  useEffect(() => {
    if (isDefeat && animationPhase === 'idle') {
      console.log('敗北アニメーション開始')
      setAnimationPhase('defeat-mark')
      
      setTimeout(() => {
        setAnimationPhase('life-decrease')
      }, 1500)
      
      setTimeout(() => {
        if (life <= 1) { // 残りライフが0になる
          console.log('ゲームオーバー')
          onGameOver()
        } else {
          setAnimationPhase('revenge')
        }
      }, 3000)
      
      setTimeout(() => {
        if (life > 1) {
          console.log('リベンジ開始')
          setAnimationPhase('idle') // アニメーション状態をリセット
          onRetry()
        }
      }, 4500)
    }
  }, [isDefeat, animationPhase, life, onGameOver, onRetry])

  // ゲームクリア処理
  useEffect(() => {
    if (isGameClear) {
      setAnimationPhase('game-clear')
      setShowConfetti(true)
    }
  }, [isGameClear])

  // プレイヤーの位置を取得（修正版）
  const getPlayerPosition = () => {
    // 移動アニメーション中のみ次の位置を返す
    if (animationPhase === 'player-move') {
      return currentElement + 1
    }
    // それ以外は現在の位置
    return currentElement
  }

  // 元素の状態を取得（修正版）
  const getElementState = (elementIndex: number) => {
    const playerPos = getPlayerPosition()
    
    // 既に倒した元素
    if (elementIndex < currentElement) return 'defeated'
    
    // 現在勝利マークを表示中
    if (elementIndex === currentElement && animationPhase === 'victory-mark') return 'victory'
    
    // 現在敗北マークを表示中
    if (elementIndex === currentElement && animationPhase === 'defeat-mark') return 'current-defeat'
    
    // 現在の対戦相手
    if (elementIndex === currentElement && animationPhase === 'idle') return 'current-battle'
    
    // VSアニメーション中の次の相手
    if (elementIndex === currentElement + 1 && animationPhase === 'vs-animation') return 'current-battle'
    
    // 未来の相手
    if (elementIndex > currentElement) return 'upcoming'
    
    return 'normal'
  }

  // ライフ表示
  const renderLife = () => {
    const hearts = []
    for (let i = 0; i < 2; i++) {
      const isAlive = i < life
      const isDecreasing = animationPhase === 'life-decrease' && i === life - 1
      hearts.push(
        <span 
          key={i} 
          className={`text-4xl transition-all duration-1000 ${
            isAlive ? 'text-red-500' : 'text-gray-800'
          } ${isDecreasing ? 'animate-pulse scale-125' : ''}`}
        >
          {isAlive ? '♥' : '♡'}
        </span>
      )
    }
    return hearts
  }

  // 道路の描画
  const renderRoad = () => {
    return (
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
        {/* メインの道路 */}
        <div className="h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 relative overflow-hidden">
          {/* 道路のライン */}
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-1 bg-white opacity-60" />
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-yellow-200" />
          
          {/* 道路の継続表示 */}
          <div className="absolute -left-20 inset-y-0 w-20 bg-gradient-to-r from-yellow-600 to-yellow-500" />
          <div className="absolute -right-20 inset-y-0 w-20 bg-gradient-to-r from-yellow-500 to-yellow-600" />
        </div>
        
        {/* 道路の影 */}
        <div className="h-2 bg-gradient-to-r from-yellow-800 via-yellow-700 to-yellow-800 opacity-50" />
      </div>
    )
  }

  // 元素ロード表示（改良版）
  const renderElementRoad = () => {
    const playerPos = getPlayerPosition()
    const elementSpacing = 160 // 元素間の距離
    
    return (
      <div className="relative h-40 flex items-center justify-center">
        {/* 道路 */}
        {renderRoad()}
        
        {/* 元素とプレイヤーの配置 */}
        <div className="relative flex items-center justify-center gap-0" style={{ width: '800px' }}>
          {displayedElements.map((elementIndex, displayIndex) => {
            const element = ELEMENTS[elementIndex]
            const state = getElementState(elementIndex)
            const playerPos = getPlayerPosition()
            const isPlayerHere = elementIndex === playerPos
            
            console.log(`元素 ${element}(${elementIndex}):`, { state, playerPos, isPlayerHere, displayIndex })
            
            return (
              <div 
                key={elementIndex} 
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${displayIndex * elementSpacing}px`
                }}
              >
                {/* 元素駒（常に表示） */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm
                  border-4 shadow-xl relative transition-all duration-500 z-10
                  ${state === 'defeated' ? 'bg-gray-600 border-gray-400' : 
                    state === 'current-battle' ? 'bg-gradient-to-br from-red-400 to-orange-500 border-red-300 animate-pulse' :
                    state === 'upcoming' ? 'bg-gradient-to-br from-green-400 to-blue-500 border-green-300' : 
                    'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300'}
                `}>
                  {element}
                  
                  {/* 勝利マーク */}
                  {state === 'victory' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-400 animate-victory-mark-epic">
                      <div className="text-2xl font-bold">×</div>
                      <div className="text-xs font-bold">WIN</div>
                    </div>
                  )}
                  
                  {/* 敗北済みマーク */}
                  {state === 'defeated' && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-2xl font-bold">
                      ×
                    </div>
                  )}
                </div>
                
                {/* プレイヤー駒（該当位置のみ表示） */}
                {isPlayerHere && (
                  <div className={`
                    absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 
                    rounded-full flex items-center justify-center text-white font-bold text-sm
                    border-4 border-yellow-300 shadow-xl transform relative z-20 -mt-20
                    ${animationPhase === 'player-move' ? 'transition-transform duration-2000' : ''}
                    ${animationPhase === 'defeat-mark' ? 'animate-pulse' : 'animate-player-idle-epic'}
                  `}
                  style={{
                    transform: animationPhase === 'player-move' ? `translateX(${elementSpacing}px)` : 'none'
                  }}
                  >
                    YOU
                    {animationPhase === 'defeat-mark' && elementIndex === currentElement && (
                      <div className="absolute inset-0 flex items-center justify-center text-red-500 text-3xl font-bold animate-bounce-in">
                        ×
                      </div>
                    )}
                  </div>
                )}
                
                {/* 元素番号表示 */}
                <div className="text-white text-xs mt-2 bg-black/50 px-2 py-1 rounded">
                  {elementIndex + 1}. {element}
                </div>
                
                {/* VS表示 */}
                {state === 'current-battle' && animationPhase === 'vs-animation' && (
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-yellow-400 text-3xl font-bold animate-vs-zoom-epic z-30">
                    VS
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center relative overflow-hidden animate-page-enter-epic">
      {/* 壮大な背景エフェクト */}
      <BackgroundEffects intensity="high" theme="victory" />
      <FloatingParticles count={30} color="#ffd700" size="medium" />
      <Confetti active={showConfetti} />
      
      {/* 星空背景 */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4">
        {/* ライフ表示 */}
        <div className="absolute top-8 left-8">
          <div className="text-2xl font-bold text-white mb-2">Life:</div>
          <div className="flex gap-2">
            {renderLife()}
          </div>
        </div>

        {/* スコア表示 */}
        <div className="absolute top-8 right-8 text-right">
          <div className="text-4xl font-bold text-yellow-300 animate-pulse drop-shadow-lg">
            Score: {wins}勝
          </div>
        </div>

        {/* メインタイトル */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent animate-epic-title mb-4">
            🌟 ELEMENT BATTLE ROAD 🌟
          </h1>
          <div className="text-xl text-white/80">
            壮大なる元素の冒険の旅 - {currentElement + 1}/54 Elements
          </div>
        </div>

        {/* 元素ロード */}
        <div className="mb-16">
          {renderElementRoad()}
        </div>

        {/* ゲーム開始ボタン（初回表示時のみ） */}
        {animationPhase === 'idle' && !isVictory && !isDefeat && !isGameClear && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-2xl p-12 text-center animate-epic-title">
              <div className="text-4xl font-bold text-white mb-6">
                🧪 {ELEMENTS[currentElement]} との戦い！ 🧪
              </div>
              <div className="text-xl text-white mb-8">
                元素 #{currentElement + 1}: {ELEMENTS[currentElement]}（{
                  currentElement === 0 ? '水素' :
                  currentElement === 1 ? 'ヘリウム' :
                  currentElement === 2 ? 'リチウム' :
                  currentElement === 3 ? 'ベリリウム' :
                  currentElement === 4 ? 'ホウ素' :
                  ELEMENTS[currentElement]
                }）
              </div>
              <button
                onClick={() => {
                  console.log('バトル開始ボタンクリック')
                  onStartNextBattle()
                }}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-12 rounded-full text-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-2 hover:scale-110 animate-pulse-glow relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  ⚔️ <span>バトル開始！</span> ⚔️
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        )}

        {/* 特別なメッセージ */}
        {animationPhase === 'revenge' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-red-600/90 backdrop-blur-md rounded-2xl p-12 text-center animate-revenge-epic">
              <div className="text-6xl font-bold text-white mb-4">⚡ リベンジ！ ⚡</div>
              <div className="text-xl text-white">再び立ち上がれ、勇者よ！</div>
            </div>
          </div>
        )}

        {animationPhase === 'game-clear' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 backdrop-blur-md rounded-2xl p-16 text-center animate-game-clear-epic">
              <div className="text-8xl font-bold text-white mb-6 animate-bounce">🏆 GAME CLEAR! 🏆</div>
              <div className="text-3xl text-white mb-8">全54元素制覇達成！</div>
              <div className="text-xl text-white">君こそ真の元素マスターだ！</div>
            </div>
          </div>
        )}

        {life <= 0 && animationPhase !== 'game-clear' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-12 text-center animate-fade-in">
              <div className="text-6xl font-bold text-red-400 mb-8">💀 GAME OVER 💀</div>
              <div className="text-xl text-white mb-8">冒険は終わった...</div>
              <button
                onClick={onGameOver}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 animate-fade-in"
                style={{ animationDelay: '1s' }}
              >
                🏠 タイトルに戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}