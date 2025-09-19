'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChemicalCard } from './types/game'
import { useBattleRoad } from './lib/useBattleRoad'
import TitleScreen from './components/TitleScreen'
import BattleRoadScreen from './components/BattleRoadScreen'
import ShuffleScreen from './components/ShuffleScreen'
import BattlefieldGameScreen from './components/BattlefieldGameScreen'

type GameMode = 'title' | 'battle-road' | 'shuffle' | 'game'

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('title')
  const [playerHand, setPlayerHand] = useState<ChemicalCard[]>([])
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null)

  // バトルロード状態管理
  const {
    battleRoadState,
    hasStartedFirstBattle,
    startFirstBattle,
    handleVictory,
    handleDefeat,
    resetToTitle,
    retryBattle,
    isGameClear
  } = useBattleRoad()

  // タイトル画面からゲーム開始
  const handleStartGame = useCallback(() => {
    resetToTitle() // 連勝記録リセット（抜け道防止）
    setGameMode('battle-road')
  }, [resetToTitle])

  // バトルロードからシャッフル画面へ（初回 or 勝利後）
  const handleStartNextBattle = useCallback(() => {
    console.log('handleStartNextBattle呼び出し')
    console.log('hasStartedFirstBattle:', hasStartedFirstBattle)
    
    if (!hasStartedFirstBattle) {
      // 初回バトル開始
      startFirstBattle()
    }
    
    setGameResult(null)
    setGameMode('shuffle')
  }, [hasStartedFirstBattle, startFirstBattle])

  // シャッフル完了後ゲーム画面へ
  const handleShuffleComplete = useCallback((finalHand: ChemicalCard[]) => {
    setPlayerHand(finalHand)
    setGameMode('game')
  }, [])

  // ゲーム結果を受けてバトルロード画面へ
  const handleGameEnd = useCallback((result: 'victory' | 'defeat') => {
    console.log('ゲーム結果受信:', result)
    setGameResult(result)
    
    if (result === 'victory') {
      handleVictory()
    } else {
      handleDefeat()
    }
    
    setGameMode('battle-road')
  }, [handleVictory, handleDefeat])

  // ゲームオーバー時タイトルへ
  const handleGameOver = useCallback(() => {
    resetToTitle()
    setGameMode('title')
  }, [resetToTitle])

  // リベンジ時の処理
  const handleRetry = useCallback(() => {
    retryBattle()
    setGameResult(null)
    setGameMode('shuffle')
  }, [retryBattle])

  // タイトルに戻る（どの画面からでも）
  const handleBackToTitle = useCallback(() => {
    resetToTitle() // 連勝記録完全リセット
    setGameMode('title')
    setPlayerHand([])
    setGameResult(null)
  }, [resetToTitle])

  // シャッフル画面からタイトルに戻る
  const handleBackToTitleFromShuffle = useCallback(() => {
    handleBackToTitle()
  }, [handleBackToTitle])

  // ゲームクリア判定をメモ化
  const gameCleared = useMemo(() => isGameClear(), [isGameClear])

  // BattleRoadScreenのpropsをメモ化
  const battleRoadProps = useMemo(() => ({
    currentElement: battleRoadState.currentElement,
    wins: battleRoadState.wins,
    life: battleRoadState.life,
    isVictory: gameResult === 'victory',
    isDefeat: gameResult === 'defeat',
    isGameClear: gameCleared,
    onStartNextBattle: handleStartNextBattle,
    onGameOver: handleGameOver,
    onRetry: handleRetry
  }), [
    battleRoadState.currentElement,
    battleRoadState.wins,
    battleRoadState.life,
    gameResult,
    gameCleared,
    handleStartNextBattle,
    handleGameOver,
    handleRetry
  ])

  // BattlefieldGameScreenのpropsを最小化
  const stableOnBackToTitle = () => {
    console.log('onBackToTitle実行')
    resetToTitle()
    setGameMode('title')
    setPlayerHand([])
    setGameResult(null)
  }

  const stableOnGameEnd = (result: 'victory' | 'defeat') => {
    console.log('onGameEnd実行:', result)
    setGameResult(result)
    
    if (result === 'victory') {
      handleVictory()
    } else {
      handleDefeat()
    }
    
    setGameMode('battle-road')
  }

  return (
    <>
      {gameMode === 'title' && (
        <TitleScreen onStartGame={handleStartGame} />
      )}
      
      {gameMode === 'battle-road' && (
        <BattleRoadScreen {...battleRoadProps} />
      )}
      
      {gameMode === 'shuffle' && (
        <ShuffleScreen 
          onShuffleComplete={handleShuffleComplete}
          onBackToTitle={handleBackToTitleFromShuffle}
        />
      )}
      
      {gameMode === 'game' && (
        <BattlefieldGameScreen 
          onBackToTitle={stableOnBackToTitle}
          onGameEnd={stableOnGameEnd}
          initialPlayerHand={playerHand}
        />
      )}
    </>
  )
}