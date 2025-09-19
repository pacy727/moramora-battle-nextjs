// src/app/components/BattlefieldGameScreen.tsx (最小化版 - 無限レンダリング完全対策)
'use client'

import { useState, useEffect, useRef } from 'react'
import { useGame } from '../lib/useGame'
import { ChemicalCard } from '../types/game'
import { EnhancedCard } from './Card/EnhancedCard'
import { GameHeader } from './Game/GameHeader'
import { HandDisplay } from './Game/HandDisplay'
import { BattleArena } from './Game/BattleArena'
import { 
  Confetti, 
  ScoreUpAnimation,
  BackgroundEffects 
} from './Feedback/VisualFeedbackSystem'
import { 
  getCardComparisonValue
} from '../lib/calculationUtils'

interface BattlefieldGameScreenProps {
  onBackToTitle: () => void
  onGameEnd: (result: 'victory' | 'defeat') => void
  initialPlayerHand: ChemicalCard[]
}

type BattlePhase = 
  | 'waiting' 
  | 'topic-reveal' 
  | 'timer-countdown' 
  | 'card-selection' 
  | 'player-card-reveal'
  | 'computer-card-reveal'
  | 'player-number-reveal'
  | 'computer-number-reveal'
  | 'judge-reveal'
  | 'round-end'

interface BattleResult {
  winner: 'player' | 'computer' | 'tie'
  playerCard: ChemicalCard
  computerCard: ChemicalCard
  playerValue: number
  computerValue: number
}

export default function BattlefieldGameScreen({ onBackToTitle, onGameEnd, initialPlayerHand }: BattlefieldGameScreenProps) {
  const gameHook = useGame()
  
  // 重複実行防止のref
  const gameEndHandledRef = useRef<boolean>(false)
  const initialHandSetRef = useRef<boolean>(false)

  const {
    gameState,
    setPlayerHand,
    selectPlayerCard,
    startNewRound,
    startTimer,
    playCard,
    judgeRound,
    checkGameEnd,
    getFinalResult,
    resetGame
  } = gameHook

  // ローカル状態管理（最小限）
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('waiting')
  const [topicDisplay, setTopicDisplay] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [scoreAnimation, setScoreAnimation] = useState<{
    show: boolean
    value: number
    position: {x: number, y: number}
  } | null>(null)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)

  console.log('BattlefieldGameScreen render:', {
    gamePhase: gameState.gamePhase,
    playerScore: gameState.playerScore,
    computerScore: gameState.computerScore,
    gameEndHandled: gameEndHandledRef.current
  })

  // 初期手札設定（一度だけ実行）
  useEffect(() => {
    if (!initialHandSetRef.current && initialPlayerHand.length > 0 && gameState.playerHand.length === 0) {
      console.log('初期手札設定実行')
      initialHandSetRef.current = true
      setPlayerHand(initialPlayerHand)
    }
  }, [initialPlayerHand, gameState.playerHand.length, setPlayerHand])

  // ゲーム終了判定（シンプル版）
  useEffect(() => {
    if (gameState.gamePhase === 'finished' && !gameEndHandledRef.current) {
      gameEndHandledRef.current = true
      console.log('ゲーム終了検出')
      
      const finalResult = getFinalResult()
      console.log('最終結果:', finalResult)
      
      if (finalResult?.winner === 'player') {
        setShowConfetti(true)
        setTimeout(() => {
          console.log('勝利コールバック実行')
          onGameEnd('victory')
        }, 1500)
      } else {
        setTimeout(() => {
          console.log('敗北コールバック実行')
          onGameEnd('defeat')
        }, 1500)
      }
    }
  }, [gameState.gamePhase])

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      console.log('BattlefieldGameScreen unmount')
      gameEndHandledRef.current = false
      initialHandSetRef.current = false
    }
  }, [])

  // CPU難易度計算（静的）
  const cpuDifficulty = {
    winStreak: gameState?.winStreak || 0,
    accuracy: '70%',
    level: '中級'
  }

  // スコアアニメーション表示
  const showScoreUpAnimation = (value: number) => {
    setScoreAnimation({
      show: true,
      value,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }

  // バトルシーケンスの実行（簡素化）
  const executeBattleSequence = (playerCard: ChemicalCard, computerCard: ChemicalCard) => {
    console.log('バトルシーケンス開始:', playerCard.formula, 'vs', computerCard.formula)

    setBattlePhase('player-card-reveal')
    setBattleResult({
      winner: 'tie',
      playerCard,
      computerCard,
      playerValue: 0,
      computerValue: 0
    })
    
    setTimeout(() => setBattlePhase('computer-card-reveal'), 500)
    
    setTimeout(() => {
      setBattlePhase('player-number-reveal')
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, playerValue } : null)
    }, 1000)
    
    setTimeout(() => {
      setBattlePhase('computer-number-reveal')
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, computerValue } : null)
    }, 1500)
    
    setTimeout(() => {
      setBattlePhase('judge-reveal')
      const result = judgeRound(playerCard, computerCard, gameState.currentTopic!)
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      
      setBattleResult({
        winner: result.winner,
        playerCard,
        computerCard,
        playerValue,
        computerValue
      })
      
      if (result.winner === 'player') {
        setShowConfetti(true)
        showScoreUpAnimation(1)
      }
    }, 2000)
    
    setTimeout(() => {
      setBattlePhase('round-end')
      checkGameEnd()
    }, 3500)
  }

  // カード選択処理
  const handleCardSelect = (card: ChemicalCard, index: number) => {
    if (battlePhase !== 'card-selection') return
    
    console.log('カード選択:', card.formula)
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    const { playerCard, computerCard } = playCard(card)
    if (playerCard && computerCard && gameState.currentTopic) {
      executeBattleSequence(playerCard, computerCard)
    }
  }

  // 新しいラウンド開始
  const handleStartNewRound = () => {
    console.log('新しいラウンド開始')
    
    setBattlePhase('topic-reveal')
    setSelectedCardIndex(null)
    setBattleResult(null)
    setShowConfetti(false)
    
    const topic = startNewRound()
    if (topic) {
      setTopicDisplay(topic.text)
      
      setTimeout(() => {
        setBattlePhase('timer-countdown')
        startTimer(() => {
          console.log('時間切れ')
          const { playerCard, computerCard } = playCard()
          if (playerCard && computerCard && gameState.currentTopic) {
            executeBattleSequence(playerCard, computerCard)
          }
        })
      }, 1500)
      
      setTimeout(() => setBattlePhase('card-selection'), 1750)
    }
  }

  const finalResult = gameState.gamePhase === 'finished' ? getFinalResult() : null

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      <BackgroundEffects 
        intensity="low" 
        theme={gameState.gamePhase === 'finished' 
          ? (finalResult?.winner === 'player' ? 'victory' : 'defeat')
          : 'default'
        }
      />
      
      <Confetti active={showConfetti} />
      
      {scoreAnimation && (
        <ScoreUpAnimation 
          show={scoreAnimation.show}
          value={scoreAnimation.value}
          position={scoreAnimation.position}
        />
      )}

      <div className="h-full flex flex-col relative z-10">
        <GameHeader
          playerScore={gameState.playerScore}
          computerScore={gameState.computerScore}
          winStreak={cpuDifficulty.winStreak}
          cpuLevel={cpuDifficulty.level}
          cpuAccuracy={cpuDifficulty.accuracy}
          onBackToTitle={onBackToTitle}
        />

        <HandDisplay
          cards={gameState.computerHand}
          isPlayerHand={false}
          showBack={false}
          canSelectCards={false}
        />

        <BattleArena
          currentTopic={gameState.currentTopic}
          topicDisplay={topicDisplay}
          timeLeft={gameState.timeLeft}
          battlePhase={battlePhase}
          battleResult={battleResult}
          onStartNewRound={handleStartNewRound}
        />

        <div className="h-56 bg-blue-900/20 backdrop-blur-sm border-t border-blue-500/30 flex flex-col items-center justify-center p-4 relative">
          <div className="text-blue-300 text-sm mb-3 font-semibold">あなたの手札</div>
          
          {battlePhase === 'round-end' && (
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-20">
              <button
                onClick={handleStartNewRound}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-2 hover:scale-110 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  ⚡ <span>次のラウンド</span> ⚡
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          )}
          
          <div className="flex gap-3 overflow-x-auto px-2 py-6 w-full justify-center min-h-0 max-w-full">
            {gameState.playerHand.map((card, index) => (
              <div key={`${card.formula}-${card.unit}-${index}`} className="relative flex-shrink-0">
                <EnhancedCard
                  card={card}
                  isSelected={selectedCardIndex === index}
                  onClick={() => handleCardSelect(card, index)}
                  disabled={battlePhase !== 'card-selection'}
                  size="medium"
                  glowEffect={battlePhase === 'card-selection'}
                />
                
                {battlePhase === 'card-selection' && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-400 animate-pulse border-2 border-white" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {finalResult && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl max-w-md animate-zoom-in relative overflow-hidden">
            <h2 className="text-3xl font-bold text-white mb-6 animate-heartbeat">
              {finalResult.winner === 'player' ? '🎉 勝利！' : '💻 敗北...'}
            </h2>
            <div 
              className="text-xl mb-8 text-yellow-300 font-semibold"
              dangerouslySetInnerHTML={{ __html: finalResult.message }}
            />
            <div className="text-white mb-4">
              バトルロード画面に戻ります...
            </div>
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
    </div>
  )
}