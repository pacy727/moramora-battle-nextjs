'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChemicalCard, GameState, Topic, JudgeResult, FinalResult } from '../types/game'
import { CHEMICAL_CARDS, TOPICS, GAME_CONFIG } from './gameData'

// ユーティリティ関数
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const evaluateCard = (card: ChemicalCard, topic: Topic): number => {
  switch (topic.text) {
    case '分子量が最も小さいもの':
      if (card.unit !== 'g') return 0
      return 1000 - parseFloat(card.value)
    case '分子量が最も大きいもの':
      if (card.unit !== 'g') return 0
      return parseFloat(card.value)
    case 'mol数が最も小さいもの':
      if (card.unit !== 'mol') return 0
      return 1000 - parseFloat(card.value)
    case 'mol数が最も大きいもの':
      if (card.unit !== 'mol') return 0
      return parseFloat(card.value)
    case '体積(L)が最も小さいもの':
      if (card.unit !== 'L') return 0
      return 1000 - parseFloat(card.value)
    case '体積(L)が最も大きいもの':
      if (card.unit !== 'L') return 0
      return parseFloat(card.value)
    case '融点が最も低いもの':
      return 3000 - card.meltingPoint
    case '融点が最も高いもの':
      return card.meltingPoint + 3000
    default:
      return Math.random() * 100
  }
}

const getJudgeExplanation = (playerCard: ChemicalCard, computerCard: ChemicalCard, topic: Topic): string => {
  const topicText = topic.text
  let explanation = ''

  switch (topicText) {
    case '分子量が最も小さいもの':
    case '分子量が最も大きいもの':
      if (playerCard.unit === 'g' && computerCard.unit === 'g') {
        const playerMW = parseFloat(playerCard.value)
        const computerMW = parseFloat(computerCard.value)
        explanation = `あなた: ${playerCard.formula} (分子量 ${playerMW})\nコンピューター: ${computerCard.formula} (分子量 ${computerMW})`
        if (topicText.includes('小さい')) {
          explanation += `\n→ ${playerMW < computerMW ? playerCard.formula : computerCard.formula} の方が小さい`
        } else {
          explanation += `\n→ ${playerMW > computerMW ? playerCard.formula : computerCard.formula} の方が大きい`
        }
      } else {
        explanation = `お題は分子量ですが、片方または両方のカードがg単位ではありません`
      }
      break

    case 'mol数が最も小さいもの':
    case 'mol数が最も大きいもの':
      if (playerCard.unit === 'mol' && computerCard.unit === 'mol') {
        const playerMol = parseFloat(playerCard.value)
        const computerMol = parseFloat(computerCard.value)
        explanation = `あなた: ${playerCard.formula} (${playerMol} mol)\nコンピューター: ${computerCard.formula} (${computerMol} mol)`
        if (topicText.includes('小さい')) {
          explanation += `\n→ ${playerMol < computerMol ? playerCard.formula : computerCard.formula} の方が少ない`
        } else {
          explanation += `\n→ ${playerMol > computerMol ? playerCard.formula : computerCard.formula} の方が多い`
        }
      } else {
        explanation = `お題はmol数ですが、片方または両方のカードがmol単位ではありません`
      }
      break

    case '体積(L)が最も小さいもの':
    case '体積(L)が最も大きいもの':
      if (playerCard.unit === 'L' && computerCard.unit === 'L') {
        const playerVol = parseFloat(playerCard.value)
        const computerVol = parseFloat(computerCard.value)
        explanation = `あなた: ${playerCard.formula} (${playerVol} L)\nコンピューター: ${computerCard.formula} (${computerVol} L)`
        if (topicText.includes('小さい')) {
          explanation += `\n→ ${playerVol < computerVol ? playerCard.formula : computerCard.formula} の方が体積が小さい`
        } else {
          explanation += `\n→ ${playerVol > computerVol ? playerCard.formula : computerCard.formula} の方が体積が大きい`
        }
      } else {
        explanation = `お題は体積ですが、片方または両方のカードがL単位ではありません`
      }
      break

    case '融点が最も低いもの':
    case '融点が最も高いもの':
      const playerMP = playerCard.meltingPoint
      const computerMP = computerCard.meltingPoint
      explanation = `あなた: ${playerCard.formula} (融点 ${playerMP}℃)\nコンピューター: ${computerCard.formula} (融点 ${computerMP}℃)`
      if (topicText.includes('低い')) {
        explanation += `\n→ ${playerMP < computerMP ? playerCard.formula : computerCard.formula} の方が融点が低い`
      } else {
        explanation += `\n→ ${playerMP > computerMP ? playerCard.formula : computerCard.formula} の方が融点が高い`
      }
      break
  }

  return explanation
}

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerScore: 0,
    computerScore: 0,
    playerHand: [],
    computerHand: [],
    currentTopic: null,
    playerSelectedCard: null,
    computerSelectedCard: null,
    timeLeft: 0,
    gamePhase: 'waiting'
  })

  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // カードを配る
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

  // コンピューターのカード選択
  const computerSelectCard = useCallback((currentTopic: Topic, computerHand: ChemicalCard[]) => {
    let bestCardIndex = 0
    let bestScore = -1

    computerHand.forEach((card, index) => {
      const score = evaluateCard(card, currentTopic)
      if (score > bestScore) {
        bestScore = score
        bestCardIndex = index
      }
    })

    // ランダム性を追加
    if (Math.random() < GAME_CONFIG.AI_RANDOMNESS) {
      bestCardIndex = Math.floor(Math.random() * computerHand.length)
    }

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

  // ラウンド判定
  const judgeRound = useCallback((playerCard: ChemicalCard, computerCard: ChemicalCard, topic: Topic): JudgeResult => {
    const playerScore = evaluateCard(playerCard, topic)
    const computerScore = evaluateCard(computerCard, topic)
    const explanation = getJudgeExplanation(playerCard, computerCard, topic)

    let winner: 'player' | 'computer' | 'tie' = 'tie'
    if (playerScore > computerScore) {
      winner = 'player'
      setGameState(prev => ({ ...prev, playerScore: prev.playerScore + 1 }))
    } else if (computerScore > playerScore) {
      winner = 'computer'
      setGameState(prev => ({ ...prev, computerScore: prev.computerScore + 1 }))
    }

    // 使用したカードを手札から除去
    setGameState(prev => ({
      ...prev,
      playerHand: prev.playerHand.filter(card => card !== playerCard),
      computerHand: prev.computerHand.filter(card => card !== computerCard),
      playerSelectedCard: null,
      computerSelectedCard: null
    }))

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

  // 最終結果取得
  const getFinalResult = useCallback((): FinalResult => {
    if (gameState.playerScore >= GAME_CONFIG.TARGET_SCORE) {
      return { winner: 'player', message: '🎊 おめでとうございます！<br>あなたの勝利です！' }
    } else if (gameState.computerScore >= GAME_CONFIG.TARGET_SCORE) {
      return { winner: 'computer', message: '💻 コンピューターの勝利です。<br>次回頑張りましょう！' }
    } else {
      // カードが尽きた場合のスコア判定
      if (gameState.playerScore > gameState.computerScore) {
        return { winner: 'player', message: '🎊 カードが尽きました！<br>スコア勝ちです！' }
      } else if (gameState.computerScore > gameState.playerScore) {
        return { winner: 'computer', message: '💻 カードが尽きました。<br>コンピューターのスコア勝ちです。' }
      } else {
        return { winner: 'tie', message: '🤝 カードが尽きました。<br>引き分けです！' }
      }
    }
  }, [gameState.playerScore, gameState.computerScore])

  // ゲームリセット
  const resetGame = useCallback(() => {
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
      gamePhase: 'waiting'
    })

    dealCards()
  }, [dealCards, timerInterval])

  // プレイヤーカード選択
  const selectPlayerCard = useCallback((card: ChemicalCard) => {
    if (gameState.gamePhase !== 'thinking') return

    setGameState(prev => ({ ...prev, playerSelectedCard: card }))
  }, [gameState.gamePhase])

  // 新しいラウンド開始
  const startNewRound = useCallback(() => {
    if (gameState.gamePhase === 'finished') return
    if (gameState.playerHand.length === 0 || gameState.computerHand.length === 0) {
      setGameState(prev => ({ ...prev, gamePhase: 'finished' }))
      return
    }

    const topic = selectRandomTopic()
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'thinking',
      playerSelectedCard: null,
      computerSelectedCard: null 
    }))

    return topic
  }, [gameState.gamePhase, gameState.playerHand.length, gameState.computerHand.length, selectRandomTopic])

  // カードをプレイ
  const playCard = useCallback((selectedCard?: ChemicalCard) => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    const playerCard = selectedCard || gameState.playerSelectedCard || gameState.playerHand[Math.floor(Math.random() * gameState.playerHand.length)]
    const computerCard = computerSelectCard(gameState.currentTopic!, gameState.computerHand)

    setGameState(prev => ({
      ...prev,
      playerSelectedCard: playerCard,
      computerSelectedCard: computerCard,
      gamePhase: 'revealing'
    }))

    return { playerCard, computerCard }
  }, [gameState.playerSelectedCard, gameState.currentTopic, gameState.computerHand, gameState.playerHand, computerSelectCard, timerInterval])

  // 初期化
  useEffect(() => {
    dealCards()
  }, [dealCards])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  return {
    gameState,
    dealCards,
    selectRandomTopic,
    startTimer,
    judgeRound,
    checkGameEnd,
    getFinalResult,
    resetGame,
    selectPlayerCard,
    startNewRound,
    playCard
  }
}