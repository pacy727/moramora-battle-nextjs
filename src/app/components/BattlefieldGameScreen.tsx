// src/app/components/BattlefieldGameScreen.tsx (修正版 - 無限レンダリング対策)
'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  
  // useRefを使って前回の値を記憶
  const prevGamePhaseRef = useRef<string>('waiting')
  const gameEndHandledRef = useRef<boolean>(false)

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

  // ローカル状態管理
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

  // 初期手札設定（一度だけ実行）
  useEffect(() => {
    if (initialPlayerHand.length > 0 && setPlayerHand && gameState.playerHand.length === 0) {
      console.log('初期手札設定:', initialPlayerHand.length)
      setPlayerHand(initialPlayerHand)
    }
  }, [initialPlayerHand, setPlayerHand, gameState.playerHand.length])

  // CPU難易度計算（メモ化）
  const cpuDifficulty = useMemo(() => {
    const winStreak = gameState?.winStreak || 0
    let randomness = 0.30
    
    if (winStreak <= 5) randomness = 0.30
    else if (winStreak <= 10) randomness = 0.25
    else if (winStreak <= 15) randomness = 0.20
    else if (winStreak <= 20) randomness = 0.15
    else if (winStreak <= 25) randomness = 0.10
    else if (winStreak <= 30) randomness = 0.05
    else randomness = 0.00
    
    const accuracy = Math.round((1 - randomness) * 100)
    
    return {
      winStreak,
      accuracy: `${accuracy}%`,
      level: winStreak <= 5 ? '初級' :
             winStreak <= 15 ? '中級' :
             winStreak <= 25 ? '上級' :
             winStreak <= 35 ? '最上級' : '神級'
    }
  }, [gameState?.winStreak])

  // スコアアニメーション表示（useCallback化）
  const showScoreUpAnimation = useCallback((value: number) => {
    setScoreAnimation({
      show: true,
      value,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }, [])

  // バトルシーケンスの実行（useCallback化）
  const executeBattleSequence = useCallback((playerCard: ChemicalCard, computerCard: ChemicalCard) => {
    console.log('バトルシーケンス開始:', playerCard.formula, 'vs', computerCard.formula)

    // 1. プレイヤーカード表示
    setBattlePhase('player-card-reveal')
    setBattleResult({
      winner: 'tie',
      playerCard,
      computerCard,
      playerValue: 0,
      computerValue: 0
    })
    
    setTimeout(() => {
      setBattlePhase('computer-card-reveal')
    }, 1000)
    
    setTimeout(() => {
      setBattlePhase('player-number-reveal')
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, playerValue } : null)
    }, 2000)
    
    setTimeout(() => {
      setBattlePhase('computer-number-reveal')
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, computerValue } : null)
    }, 3000)
    
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
    }, 4000)
    
    setTimeout(() => {
      setBattlePhase('round-end')
      checkGameEnd()
    }, 7000)
  }, [gameState.currentTopic, judgeRound, checkGameEnd, showScoreUpAnimation])

  // カード選択処理（useCallback化）
  const handleCardSelect = useCallback((card: ChemicalCard, index: number) => {
    if (battlePhase !== 'card-selection') return
    
    console.log('カード選択:', card.formula, card.value + card.unit)
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    const { playerCard, computerCard } = playCard(card)
    
    if (!playerCard || !computerCard || !gameState.currentTopic) return
    
    executeBattleSequence(playerCard, computerCard)
  }, [battlePhase, selectPlayerCard, playCard, gameState.currentTopic, executeBattleSequence])

  // 新しいラウンド開始（useCallback化）
  const handleStartNewRound = useCallback(() => {
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
          if (!playerCard || !computerCard || !gameState.currentTopic) return
          executeBattleSequence(playerCard, computerCard)
        })
      }, 3000)
      
      setTimeout(() => {
        setBattlePhase('card-selection')
      }, 3500)
    }
  }, [startNewRound, startTimer, playCard, gameState.currentTopic, executeBattleSequence])

  // ゲーム終了処理（useCallback化・重複実行防止）
  const handleGameFinish = useCallback((result: 'victory' | 'defeat') => {
    if (gameEndHandledRef.current) return // 重複実行防止
    
    gameEndHandledRef.current = true
    console.log('ゲーム終了処理:', result)
    
    setTimeout(() => {
      onGameEnd(result)
    }, 2000)
  }, [onGameEnd])

  // ゲーム終了時のエフェクト（最適化）
  useEffect(() => {
    const currentPhase = gameState.gamePhase
    
    // 前回と同じフェーズの場合は何もしない
    if (currentPhase === prevGamePhaseRef.current) return
    
    prevGamePhaseRef.current = currentPhase
    
    if (currentPhase === 'finished' && !gameEndHandledRef.current) {
      const finalResult = getFinalResult()
      if (finalResult?.winner === 'player') {
        setShowConfetti(true)
        handleGameFinish('victory')
      } else {
        handleGameFinish('defeat')
      }
    }
  }, [gameState.gamePhase, getFinalResult, handleGameFinish])

  // コンポーネントアンマウント時にrefをリセット
  useEffect(() => {
    return () => {
      gameEndHandledRef.current = false
    }
  }, [])

  const finalResult = gameState.gamePhase === 'finished' ? getFinalResult() : null

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* 背景エフェクト */}
      <BackgroundEffects 
        intensity="low" 
        theme={gameState.gamePhase === 'finished' 
          ? (finalResult?.winner === 'player' ? 'victory' : 'defeat')
          : 'default'
        }
      />
      
      {/* コンフェッティ */}
      <Confetti active={showConfetti} />
      
      {/* スコアアップアニメーション */}
      {scoreAnimation && (
        <ScoreUpAnimation 
          show={scoreAnimation.show}
          value={scoreAnimation.value}
          position={scoreAnimation.position}
        />
      )}

      <div className="h-full flex flex-col relative z-10">
        {/* ゲームヘッダー */}
        <GameHeader
          playerScore={gameState.playerScore}
          computerScore={gameState.computerScore}
          winStreak={cpuDifficulty.winStreak}
          cpuLevel={cpuDifficulty.level}
          cpuAccuracy={cpuDifficulty.accuracy}
          onBackToTitle={onBackToTitle}
        />

        {/* CPU手札エリア - オモテ表示 */}
        <HandDisplay
          cards={gameState.computerHand}
          isPlayerHand={false}
          showBack={false}
          canSelectCards={false}
        />

        {/* バトルアリーナ */}
        <BattleArena
          currentTopic={gameState.currentTopic}
          topicDisplay={topicDisplay}
          timeLeft={gameState.timeLeft}
          battlePhase={battlePhase}
          battleResult={battleResult}
          onStartNewRound={handleStartNewRound}
        />

        {/* プレイヤー手札エリア */}
        <div className="h-56 bg-blue-900/20 backdrop-blur-sm border-t border-blue-500/30 flex flex-col items-center justify-center p-4 relative">
          <div className="text-blue-300 text-sm mb-3 font-semibold">あなたの手札</div>
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

      {/* ゲーム終了画面（簡易版） */}
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