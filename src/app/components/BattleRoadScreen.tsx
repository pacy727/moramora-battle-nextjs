// src/app/components/BattleRoadScreen.tsx - 簡素化版（無限レンダリング対策）
'use client'

import { useState, useEffect, useRef } from 'react'
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

type AnimationPhase = 
  | 'waiting'
  | 'ready' 
  | 'victory-sequence'
  | 'defeat-sequence'
  | 'game-clear'

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
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('waiting')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showBattleMessage, setShowBattleMessage] = useState(false)
  const [roadOffset, setRoadOffset] = useState(0)
  
  // アニメーション実行を防ぐためのref
  const animationExecutedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  console.log('BattleRoadScreen render:', {
    currentElement,
    isVictory,
    isDefeat,
    animationPhase,
    animationExecuted: animationExecutedRef.current
  })

  // 状態変化時のリセット処理
  useEffect(() => {
    // 新しいバトルが始まった時（currentElementが変わった時）
    const shouldReset = !isVictory && !isDefeat && !isGameClear
    if (shouldReset) {
      console.log('状態リセット')
      animationExecutedRef.current = false
      setRoadOffset(0)
    }
  }, [currentElement, isVictory, isDefeat, isGameClear])

  // 表示する元素を計算
  const getDisplayedElements = () => {
    const startIndex = Math.max(0, Math.min(currentElement - 2, ELEMENTS.length - 5))
    return Array.from({ length: 5 }, (_, i) => startIndex + i).filter(i => i < ELEMENTS.length)
  }

  const displayedElements = getDisplayedElements()

  // 初期状態の設定
  useEffect(() => {
    if (!isVictory && !isDefeat && !isGameClear && animationPhase === 'waiting') {
      console.log('初期状態設定 - 1.5秒後にバトルメッセージ表示')
      
      const timer = setTimeout(() => {
        setShowBattleMessage(true)
        setAnimationPhase('ready')
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [isVictory, isDefeat, isGameClear, animationPhase])

  // 勝利状態の監視と即座の反応
  useEffect(() => {
    console.log('勝利状態監視useEffect:', { 
      isVictory, 
      animationExecuted: animationExecutedRef.current,
      currentElement,
      animationPhase
    })
    
    if (isVictory && !animationExecutedRef.current) {
      console.log('=== 勝利アニメーション開始 ===')
      animationExecutedRef.current = true
      
      setShowBattleMessage(false)
      setAnimationPhase('victory-sequence')

      // 即座に最初のステップを実行
      setTimeout(() => {
        console.log('Step 1: 勝利マーク表示 (1秒)')
        
        setTimeout(() => {
          console.log('Step 2: 道路移動開始 (1.5秒)')
          setRoadOffset(-160)
          
          setTimeout(() => {
            console.log('Step 3: 次のメッセージ判定 (2秒)')
            if (currentElement >= 53) {
              console.log('ゲームクリア!')
              setAnimationPhase('game-clear')
              setShowConfetti(true)
            } else {
              console.log('次バトルメッセージ表示')
              setShowBattleMessage(true)
              
              setTimeout(() => {
                console.log('Step 4: 次のバトル開始処理 (2秒)')
                setAnimationPhase('waiting')
                setShowBattleMessage(false)
                setRoadOffset(0)
                animationExecutedRef.current = false
                
                console.log('onStartNextBattle() を呼び出し')
                onStartNextBattle()
              }, 2000)
            }
          }, 2000)
        }, 1500)
      }, 1000)
    }
  }, [isVictory, currentElement, onStartNextBattle])

  // 敗北状態の監視
  useEffect(() => {
    console.log('敗北状態監視useEffect:', { 
      isDefeat, 
      animationExecuted: animationExecutedRef.current,
      life 
    })
    
    if (isDefeat && !animationExecutedRef.current) {
      console.log('敗北状態検出 - アニメーション開始')
      animationExecutedRef.current = true
      
      setShowBattleMessage(false)
      setAnimationPhase('defeat-sequence')

      // 敗北時の現在のライフを保存
      const currentLife = life

      const timer = setTimeout(() => {
        console.log('敗北処理実行 - ライフ:', currentLife)
        
        if (currentLife <= 1) {
          console.log('ゲームオーバー処理')
          onGameOver()
        } else {
          console.log('リベンジ処理')
          setAnimationPhase('waiting')
          animationExecutedRef.current = false
          onRetry()
        }
      }, 3000)

      return () => {
        console.log('敗北アニメーション useEffect クリーンアップ')
        clearTimeout(timer)
      }
    }
  }, [isDefeat]) // 依存関係を最小化（life、onGameOver、onRetryを削除）

  // ゲームクリア処理
  useEffect(() => {
    if (isGameClear && animationPhase !== 'game-clear') {
      setAnimationPhase('game-clear')
      setShowConfetti(true)
    }
  }, [isGameClear, animationPhase])

  // 元素の状態を取得
  const getElementState = (elementIndex: number) => {
    // 既に倒した元素（現在の元素より小さい番号）
    if (elementIndex < currentElement) return 'defeated'
    
    // 現在勝利中の元素（現在の元素と一致し、勝利アニメーション中）
    if (elementIndex === currentElement && animationPhase === 'victory-sequence') return 'victory'
    
    // 現在敗北中の元素
    if (elementIndex === currentElement && animationPhase === 'defeat-sequence') return 'current-defeat'
    
    // 現在の対戦相手（通常状態）
    if (elementIndex === currentElement) return 'current-battle'
    
    // 未来の相手
    if (elementIndex > currentElement) return 'upcoming'
    
    return 'normal'
  }

  // ライフ表示
  const renderLife = () => {
    const hearts = []
    for (let i = 0; i < 2; i++) {
      const isAlive = i < life
      const isDecreasing = animationPhase === 'defeat-sequence' && i === life - 1
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
        <div className="h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 relative overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-1 bg-white opacity-60" />
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-yellow-200" />
          <div className="absolute -left-20 inset-y-0 w-20 bg-gradient-to-r from-yellow-600 to-yellow-500" />
          <div className="absolute -right-20 inset-y-0 w-20 bg-gradient-to-r from-yellow-500 to-yellow-600" />
        </div>
        <div className="h-2 bg-gradient-to-r from-yellow-800 via-yellow-700 to-yellow-800 opacity-50" />
      </div>
    )
  }

  // 元素ロード表示
  const renderElementRoad = () => {
    const elementSpacing = 160

    return (
      <div className="relative h-40 flex items-center justify-center">
        {renderRoad()}
        
        <div 
          className="relative flex items-center justify-center gap-0 transition-transform duration-1500 ease-out" 
          style={{ 
            width: '800px',
            transform: `translateX(${roadOffset}px)`
          }}
        >
          {displayedElements.map((elementIndex, displayIndex) => {
            const element = ELEMENTS[elementIndex]
            const state = getElementState(elementIndex)
            const isPlayerHere = elementIndex === currentElement
            
            return (
              <div 
                key={`element-${elementIndex}`} 
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${displayIndex * elementSpacing}px`
                }}
              >
                {/* 元素駒 */}
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
                    <div className="absolute inset-0 flex items-center justify-center text-white overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-red-500 opacity-80 rounded-full animate-ping" />
                      <div className="relative z-10 text-white text-2xl font-bold">×</div>
                    </div>
                  )}
                  
                  {/* 敗北済みマーク */}
                  {state === 'defeated' && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-2xl font-bold">
                      ×
                    </div>
                  )}
                </div>
                
                {/* プレイヤー駒 */}
                {isPlayerHere && (
                  <div className={`
                    absolute w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 
                    rounded-full flex items-center justify-center text-white font-bold text-sm
                    border-4 border-yellow-300 shadow-xl transform relative z-20 -mt-20
                    ${animationPhase === 'victory-sequence' ? 'animate-bounce' : 
                      animationPhase === 'defeat-sequence' ? 'animate-pulse' : 
                      'animate-pulse'}
                  `}>
                    YOU
                    {animationPhase === 'defeat-sequence' && (
                      <div className="absolute inset-0 flex items-center justify-center text-red-500 text-3xl font-bold">
                        ×
                      </div>
                    )}
                  </div>
                )}
                
                {/* 元素番号表示 */}
                <div className="text-white text-xs mt-2 bg-black/50 px-2 py-1 rounded">
                  {elementIndex + 1}. {element}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 元素名を取得
  const getElementName = (index: number) => {
    const names = [
      '水素', 'ヘリウム', 'リチウム', 'ベリリウム', 'ホウ素', '炭素', '窒素', '酸素', 'フッ素', 'ネオン',
      'ナトリウム', 'マグネシウム', 'アルミニウム', 'ケイ素', 'リン', '硫黄', '塩素', 'アルゴン', 'カリウム', 'カルシウム'
    ]
    return names[index] || ELEMENTS[index]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center relative overflow-hidden">
      <BackgroundEffects intensity="high" theme="victory" />
      <FloatingParticles count={30} color="#ffd700" size="medium" />
      <Confetti active={showConfetti} />
      
      {/* 星空背景 */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
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
          <div className="flex gap-2">{renderLife()}</div>
        </div>

        {/* スコア表示 */}
        <div className="absolute top-8 right-8 text-right">
          <div className="text-4xl font-bold text-yellow-300 animate-pulse drop-shadow-lg">
            Score: {wins}勝
          </div>
        </div>

        {/* メインタイトル */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            🌟 ELEMENT BATTLE ROAD 🌟
          </h1>
          <div className="text-xl text-white/80">
            壮大なる元素の冒険の旅 - {currentElement + 1}/54 Elements
          </div>
        </div>

        {/* 元素ロード */}
        <div className="mb-16">{renderElementRoad()}</div>

        {/* バトル開始ボタン */}
        {showBattleMessage && animationPhase === 'ready' && (
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="text-4xl font-bold text-white mb-6">
                🧪 {ELEMENTS[currentElement]} との戦い！ 🧪
              </div>
              <div className="text-xl text-white mb-8">
                元素 #{currentElement + 1}: {ELEMENTS[currentElement]}（{getElementName(currentElement)}）
              </div>
              <button
                onClick={() => {
                  console.log('バトル開始ボタンクリック')
                  setShowBattleMessage(false)
                  onStartNextBattle()
                }}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-12 rounded-full text-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-2 hover:scale-110 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  ⚔️ <span>バトル開始！</span> ⚔️
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        )}

        {/* 次のバトルメッセージ */}
        {showBattleMessage && animationPhase === 'victory-sequence' && currentElement < ELEMENTS.length - 1 && (
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-green-600/90 to-teal-600/90 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="text-4xl font-bold text-white mb-6">
                🧪 次の挑戦者: {ELEMENTS[currentElement]} 🧪
              </div>
              <div className="text-xl text-white mb-8">
                元素 #{currentElement + 1}: {ELEMENTS[currentElement]}（{getElementName(currentElement)}）
              </div>
              <div className="text-lg text-white/80">
                次のバトルが始まります...
              </div>
            </div>
          </div>
        )}

        {/* 特別なメッセージ */}
        {animationPhase === 'defeat-sequence' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-red-600/90 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="text-6xl font-bold text-white mb-4">⚡ 敗北... ⚡</div>
              <div className="text-xl text-white">
                {life <= 1 ? 'ゲームオーバー...' : 'リベンジの機会あり！'}
              </div>
            </div>
          </div>
        )}

        {animationPhase === 'game-clear' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 backdrop-blur-md rounded-2xl p-16 text-center">
              <div className="text-8xl font-bold text-white mb-6 animate-bounce">🏆 GAME CLEAR! 🏆</div>
              <div className="text-3xl text-white mb-8">全54元素制覇達成！</div>
              <div className="text-xl text-white">君こそ真の元素マスターだ！</div>
            </div>
          </div>
        )}

        {life <= 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="text-6xl font-bold text-red-400 mb-8">💀 GAME OVER 💀</div>
              <div className="text-xl text-white mb-8">冒険は終わった...</div>
              <button
                onClick={onGameOver}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300"
              >
                🏠 タイトルに戻る
              </button>
            </div>
          </div>
        )}

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/50 text-white p-4 rounded text-sm font-mono z-50">
            <div>Phase: {animationPhase}</div>
            <div>Element: {currentElement} ({ELEMENTS[currentElement]})</div>
            <div>Victory: {isVictory.toString()}</div>
            <div>Defeat: {isDefeat.toString()}</div>
            <div>Message: {showBattleMessage.toString()}</div>
            <div>Offset: {roadOffset}px</div>
            <div>Executed: {animationExecutedRef.current.toString()}</div>
            <div>Displayed Elements: {displayedElements.join(', ')}</div>
            <div>Element States:</div>
            {displayedElements.map(el => (
              <div key={el} style={{fontSize: '10px', marginLeft: '10px'}}>
                {el}: {ELEMENTS[el]} = {getElementState(el)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}