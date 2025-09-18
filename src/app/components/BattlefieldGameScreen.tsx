// src/app/components/BattlefieldGameScreen.tsx (デバッグ版)
'use client'

import { useState, useEffect } from 'react'
import { useGame } from '../lib/useGame'
import { ChemicalCard } from '../types/game'
import { EnhancedCard } from './Card/EnhancedCard'
import { GameHeader } from './Game/GameHeader'
import { HandDisplay } from './Game/HandDisplay'
import { BattleArena } from './Game/BattleArena'
import { GameEndModal } from './Game/GameEndModal'
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
  onRestart: () => void // 新しいpropを追加
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

export default function BattlefieldGameScreen({ onBackToTitle, onRestart, initialPlayerHand }: BattlefieldGameScreenProps) {
  const gameHook = useGame()
  
  // デバッグ: useGameの返り値を確認
  console.log('useGame返り値:', Object.keys(gameHook))
  
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

  // 初期手札設定
  useEffect(() => {
    if (initialPlayerHand.length > 0 && setPlayerHand) {
      setPlayerHand(initialPlayerHand)
    }
  }, [initialPlayerHand, setPlayerHand])

  // CPU難易度計算（ローカル実装）
  const calculateCPUDifficulty = () => {
    const winStreak = gameState?.winStreak || 0
    let randomness = 0.30 // デフォルト値
    
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
  }

  const cpuDifficulty = calculateCPUDifficulty()

  // スコアアニメーション表示
  const showScoreUpAnimation = (value: number) => {
    setScoreAnimation({
      show: true,
      value,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }

  // バトルシーケンスの実行
  const executeBattleSequence = (playerCard: ChemicalCard, computerCard: ChemicalCard) => {
    console.log('バトルシーケンス開始:', playerCard.formula, 'vs', computerCard.formula)

    // 1. プレイヤーカード表示
    setBattlePhase('player-card-reveal')
    setBattleResult({
      winner: 'tie', // 仮の値
      playerCard,
      computerCard,
      playerValue: 0,
      computerValue: 0
    })
    
    setTimeout(() => {
      // 2. コンピューターカード表示
      setBattlePhase('computer-card-reveal')
    }, 1000)
    
    setTimeout(() => {
      // 3. プレイヤー数値表示
      setBattlePhase('player-number-reveal')
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, playerValue } : null)
      console.log('プレイヤー計算値:', playerValue)
    }, 2000)
    
    setTimeout(() => {
      // 4. コンピューター数値表示
      setBattlePhase('computer-number-reveal')
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, computerValue } : null)
      console.log('コンピューター計算値:', computerValue)
    }, 3000)
    
    setTimeout(() => {
      // 5. ジャッジ表示
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
      
      console.log('ジャッジ結果:', result.winner)
      
      // エフェクト
      if (result.winner === 'player') {
        setShowConfetti(true)
        showScoreUpAnimation(1)
      }
    }, 4000)
    
    setTimeout(() => {
      // 6. ラウンド終了
      setBattlePhase('round-end')
      checkGameEnd()
    }, 7000)
  }

  // カード選択処理
  const handleCardSelect = (card: ChemicalCard, index: number) => {
    if (battlePhase !== 'card-selection') return
    
    console.log('カード選択:', card.formula, card.value + card.unit)
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    // useGameでカードバトルを実行
    const { playerCard, computerCard } = playCard(card)
    
    if (!playerCard || !computerCard || !gameState.currentTopic) return
    
    executeBattleSequence(playerCard, computerCard)
  }

  // 新しいラウンド開始
  const handleStartNewRound = () => {
    console.log('新しいラウンド開始')
    
    // 状態をリセット
    setBattlePhase('topic-reveal')
    setSelectedCardIndex(null)
    setBattleResult(null)
    setShowConfetti(false)
    
    const topic = startNewRound()
    if (topic) {
      setTopicDisplay(topic.text)
      
      // 3秒間お題を表示
      setTimeout(() => {
        setBattlePhase('timer-countdown')
        
        // タイマー開始
        startTimer(() => {
          // 時間切れ処理
          console.log('時間切れ')
          
          const { playerCard, computerCard } = playCard()
          
          if (!playerCard || !computerCard || !gameState.currentTopic) return
          
          executeBattleSequence(playerCard, computerCard)
        })
      }, 3000)
      
      // タイマー開始後、カード選択フェーズに移行
      setTimeout(() => {
        setBattlePhase('card-selection')
      }, 3500)
    }
  }

  // ゲーム終了時のエフェクト
  useEffect(() => {
    if (gameState.gamePhase === 'finished') {
      const finalResult = getFinalResult()
      if (finalResult?.winner === 'player') {
        setShowConfetti(true)
      }
    }
  }, [gameState.gamePhase, getFinalResult])

  // ゲーム再開処理 - シャッフル画面に戻る
  const handleRestart = () => {
    console.log('ゲーム再開 - シャッフル画面に戻ります')
    onRestart() // 親コンポーネント（page.tsx）でシャッフル画面に遷移
  }

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
          showBack={false} // オモテ表示
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

      {/* ゲーム終了モーダル */}
      <GameEndModal
        finalResult={finalResult}
        onRestart={handleRestart}
        onBackToTitle={onBackToTitle}
      />
    </div>
  )
}