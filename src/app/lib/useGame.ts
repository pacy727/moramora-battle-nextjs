'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { ChemicalCard, GameState, Topic, JudgeResult, FinalResult } from '../types/game'
import { CHEMICAL_CARDS, TOPICS, GAME_CONFIG } from './gameData'
import { 
  calculateCardSuitability, 
  determineWinner, 
  generateBattleExplanation
} from './calculationUtils'

// 拡張されたゲーム状態
interface EnhancedGameState extends GameState {
  winStreak: number // 連勝数を追加
}

// ユーティリティ関数
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// CPU難易度を計算（連勝数に応じて調整）
const calculateCPURandomness = (winStreak: number): number => {
  if (winStreak <= 5) return 0.30  // 1-5勝: 30%ランダム
  if (winStreak <= 10) return 0.25 // 6-10勝: 25%ランダム  
  if (winStreak <= 15) return 0.20 // 11-15勝: 20%ランダム
  if (winStreak <= 20) return 0.15 // 16-20勝: 15%ランダム
  if (winStreak <= 25) return 0.10 // 21-25勝: 10%ランダム
  if (winStreak <= 30) return 0.05 // 26-30勝: 5%ランダム
  return 0.00 // 31勝以上: 0%ランダム（完全最適解）
}

export const useGame = () => {
  const [gameState, setGameState] = useState<EnhancedGameState>({
    playerScore: 0,
    computerScore: 0,
    playerHand: [],
    computerHand: [],
    currentTopic: null,
    playerSelectedCard: null,
    computerSelectedCard: null,
    timeLeft: 0,
    gamePhase: 'waiting',
    winStreak: 0 // 連勝数を初期化
  })

  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  
  // refを使って前回の状態を記録
  const prevPlayerHandRef = useRef<ChemicalCard[]>([])

  // 手札を設定（シャッフル画面から受け取る）
  const setPlayerHand = useCallback((hand: ChemicalCard[]) => {
    // 前回と同じ手札の場合は何もしない
    if (JSON.stringify(prevPlayerHandRef.current) === JSON.stringify(hand)) {
      console.log('同じ手札のため、setPlayerHandをスキップ')
      return
    }
    
    console.log('新しい手札を設定:', hand.length)
    prevPlayerHandRef.current = hand
    
    // CPUの手札も同時に生成
    const remainingCards = CHEMICAL_CARDS.filter(card => 
      !hand.some(playerCard => 
        playerCard.formula === card.formula && 
        playerCard.value === card.value && 
        playerCard.unit === card.unit
      )
    )
    const shuffledCpuCards = shuffleArray(remainingCards)
    
    setGameState(prev => ({
      ...prev,
      playerHand: hand,
      computerHand: shuffledCpuCards.slice(0, GAME_CONFIG.CARDS_PER_HAND),
      gamePhase: 'thinking'
    }))
  }, [])

  // カードを配る（従来の方法 - 後方互換性のため保持）
  const dealCards = useCallback(() => {
    const shuffledCards = shuffleArray(CHEMICAL_CARDS)
    setGameState(prev => ({
      ...prev,
      playerHand: shuffledCards.slice(0, GAME_CONFIG.CARDS_PER_HAND),
      computerHand: shuffledCards.slice(GAME_CONFIG.CARDS_PER_HAND, GAME_CONFIG.CARDS_PER_HAND * 2)
    }))
  }, [])

  // ランダムなお題を選択
  const selectRandomTopic = useCallback((): Topic => {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
    setGameState(prev => ({ ...prev, currentTopic: topic }))
    return topic
  }, [])

  // コンピューターのカード選択（難易度調整付き）
  const computerSelectCard = useCallback((currentTopic: Topic | null, computerHand: ChemicalCard[], winStreak: number) => {
    if (!currentTopic) {
      return computerHand[0] || null
    }

    const cpuRandomness = calculateCPURandomness(winStreak)
    
    // ランダム性を適用
    if (Math.random() < cpuRandomness) {
      const randomIndex = Math.floor(Math.random() * computerHand.length)
      return computerHand[randomIndex]
    }

    // 最適解を選択
    let bestCardIndex = 0
    let bestScore = -1

    computerHand.forEach((card, index) => {
      const score = calculateCardSuitability(card, currentTopic.text)
      if (score > bestScore) {
        bestScore = score
        bestCardIndex = index
      }
    })

    return computerHand[bestCardIndex]
  }, [])

  // タイマー開始
  const startTimer = useCallback((onTimeout: () => void) => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    setGameState(prev => ({ ...prev, timeLeft: GAME_CONFIG.ROUND_TIME }))

    const newInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(newInterval)
          setTimerInterval(null)
          onTimeout()
          return { ...prev, timeLeft: 0 }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    setTimerInterval(newInterval)
  }, [timerInterval])

  // ラウンド判定（連勝数管理付き）
  const judgeRound = useCallback((playerCard: ChemicalCard, computerCard: ChemicalCard, topic: Topic): JudgeResult => {
    const winner = determineWinner(playerCard, computerCard, topic.text)
    const explanation = generateBattleExplanation(playerCard, computerCard, topic.text)

    // スコアと連勝数更新
    setGameState(prev => {
      const newPlayerScore = winner === 'player' ? prev.playerScore + 1 : prev.playerScore
      const newComputerScore = winner === 'computer' ? prev.computerScore + 1 : prev.computerScore
      const newWinStreak = winner === 'player' ? prev.winStreak + 1 : 0 // 負けたらリセット
      
      return {
        ...prev,
        playerScore: newPlayerScore,
        computerScore: newComputerScore,
        winStreak: newWinStreak,
        // 使用したカードを手札から除去
        playerHand: prev.playerHand.filter(card => 
          !(card.formula === playerCard.formula && card.value === playerCard.value && card.unit === playerCard.unit)
        ),
        computerHand: prev.computerHand.filter(card => 
          !(card.formula === computerCard.formula && card.value === computerCard.value && card.unit === computerCard.unit)
        ),
        playerSelectedCard: null,
        computerSelectedCard: null
      }
    })

    const newPlayerScore = winner === 'player' ? gameState.playerScore + 1 : gameState.playerScore
    const newComputerScore = winner === 'computer' ? gameState.computerScore + 1 : gameState.computerScore

    return {
      winner,
      explanation,
      playerScore: newPlayerScore,
      computerScore: newComputerScore
    }
  }, [gameState.playerScore, gameState.computerScore])

  // ゲーム終了判定
  const checkGameEnd = useCallback((): boolean => {
    if (gameState.playerScore >= GAME_CONFIG.TARGET_SCORE || gameState.computerScore >= GAME_CONFIG.TARGET_SCORE) {
      setGameState(prev => ({ ...prev, gamePhase: 'finished' }))
      return true
    }

    if (gameState.playerHand.length === 0 || gameState.computerHand.length === 0) {
      setGameState(prev => ({ ...prev, gamePhase: 'finished' }))
      return true
    }

    return false
  }, [gameState.playerScore, gameState.computerScore, gameState.playerHand.length, gameState.computerHand.length])

  // 最終結果取得（メモ化）
  const getFinalResult = useCallback((): FinalResult => {
    if (gameState.playerScore >= GAME_CONFIG.TARGET_SCORE) {
      const message = gameState.winStreak >= 10 
        ? `🎊 おめでとうございます！<br>連勝記録: ${gameState.winStreak}勝！<br>素晴らしい戦績です！`
        : `🎊 おめでとうございます！<br>連勝記録: ${gameState.winStreak}勝`
      return { winner: 'player', message }
    } else if (gameState.computerScore >= GAME_CONFIG.TARGET_SCORE) {
      // 連勝数はリセットされる
      setGameState(prev => ({ ...prev, winStreak: 0 }))
      return { winner: 'computer', message: '💻 コンピューターの勝利です。<br>連勝記録が途切れました...' }
    } else {
      // カードが尽きた場合のスコア判定
      if (gameState.playerScore > gameState.computerScore) {
        const message = `🎊 カードが尽きました！<br>連勝記録: ${gameState.winStreak}勝`
        return { winner: 'player', message }
      } else if (gameState.computerScore > gameState.playerScore) {
        setGameState(prev => ({ ...prev, winStreak: 0 }))
        return { winner: 'computer', message: '💻 カードが尽きました。<br>連勝記録が途切れました...' }
      } else {
        return { winner: 'tie', message: '🤝 カードが尽きました。<br>引き分けです！' }
      }
    }
  }, [gameState.playerScore, gameState.computerScore, gameState.winStreak])

  // ゲームリセット（連勝数は保持）
  const resetGame = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    setGameState(prev => ({
      ...prev,
      playerScore: 0,
      computerScore: 0,
      playerHand: [],
      computerHand: [],
      currentTopic: null,
      playerSelectedCard: null,
      computerSelectedCard: null,
      timeLeft: 0,
      gamePhase: 'waiting'
      // winStreak は保持
    }))
    
    // ref もリセット
    prevPlayerHandRef.current = []
  }, [timerInterval])

  // 完全リセット（連勝数もリセット）
  const fullReset = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    setGameState({
      playerScore: 0,
      computerScore: 0,
      playerHand: [],
      computerHand: [],
      currentTopic: null,
      playerSelectedCard: null,
      computerSelectedCard: null,
      timeLeft: 0,
      gamePhase: 'waiting',
      winStreak: 0
    })
    
    // ref もリセット
    prevPlayerHandRef.current = []
  }, [timerInterval])

  // プレイヤーカード選択
  const selectPlayerCard = useCallback((card: ChemicalCard) => {
    if (gameState.gamePhase !== 'thinking') return
    setGameState(prev => ({ ...prev, playerSelectedCard: card }))
  }, [gameState.gamePhase])

  // 新しいラウンド開始
  const startNewRound = useCallback(() => {
    if (gameState.gamePhase === 'finished') return null
    if (gameState.playerHand.length === 0 || gameState.computerHand.length === 0) {
      setGameState(prev => ({ ...prev, gamePhase: 'finished' }))
      return null
    }

    const topic = selectRandomTopic()
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'thinking',
      playerSelectedCard: null,
      computerSelectedCard: null,
      timeLeft: GAME_CONFIG.ROUND_TIME
    }))

    return topic
  }, [gameState.gamePhase, gameState.playerHand.length, gameState.computerHand.length, selectRandomTopic])

  // カードをプレイ（難易度調整付き）
  const playCard = useCallback((selectedCard?: ChemicalCard) => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    const playerCard = selectedCard || gameState.playerSelectedCard || gameState.playerHand[Math.floor(Math.random() * gameState.playerHand.length)]
    const computerCard = computerSelectCard(gameState.currentTopic, gameState.computerHand, gameState.winStreak)

    if (!playerCard || !computerCard) {
      console.error('プレイヤーまたはコンピューターのカードが見つかりません')
      return { playerCard: null, computerCard: null }
    }

    setGameState(prev => ({
      ...prev,
      playerSelectedCard: playerCard,
      computerSelectedCard: computerCard,
      gamePhase: 'revealing'
    }))

    return { playerCard, computerCard }
  }, [gameState.playerSelectedCard, gameState.currentTopic, gameState.computerHand, gameState.playerHand, gameState.winStreak, computerSelectCard, timerInterval])

  // 現在のCPU難易度を取得（メモ化）
  const getCurrentCPUDifficulty = useMemo(() => {
    const randomness = calculateCPURandomness(gameState.winStreak)
    const accuracy = Math.round((1 - randomness) * 100)
    return {
      winStreak: gameState.winStreak,
      accuracy: `${accuracy}%`,
      level: gameState.winStreak <= 5 ? '初級' :
             gameState.winStreak <= 15 ? '中級' :
             gameState.winStreak <= 25 ? '上級' :
             gameState.winStreak <= 35 ? '最上級' : '神級'
    }
  }, [gameState.winStreak])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  return useMemo(() => ({
    gameState,
    dealCards,
    setPlayerHand,
    selectRandomTopic,
    startTimer,
    judgeRound,
    checkGameEnd,
    getFinalResult,
    resetGame,
    fullReset,
    selectPlayerCard,
    startNewRound,
    playCard,
    getCurrentCPUDifficulty
  }), [
    gameState,
    dealCards,
    setPlayerHand,
    selectRandomTopic,
    startTimer,
    judgeRound,
    checkGameEnd,
    getFinalResult,
    resetGame,
    fullReset,
    selectPlayerCard,
    startNewRound,
    playCard,
    getCurrentCPUDifficulty
  ])
}