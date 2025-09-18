'use client'

import { useState } from 'react'
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
  const handleStartGame = () => {
    resetToTitle() // 連勝記録リセット（抜け道防止）
    setGameMode('battle-road')
  }

  // バトルロードからシャッフル画面へ（初回 or 勝利後）
  const handleStartNextBattle = () => {
    console.log('handleStartNextBattle呼び出し')
    console.log('hasStartedFirstBattle:', hasStartedFirstBattle)
    console.log('startFirstBattle:', typeof startFirstBattle)
    
    if (!hasStartedFirstBattle) {
      // 初回バトル開始
      if (typeof startFirstBattle === 'function') {
        startFirstBattle()
      } else {
        console.error('startFirstBattle is not a function:', startFirstBattle)
      }
    }
    
    setGameResult(null)
    setGameMode('shuffle')
  }

  // シャッフル完了後ゲーム画面へ
  const handleShuffleComplete = (finalHand: ChemicalCard[]) => {
    setPlayerHand(finalHand)
    setGameMode('game')
  }

  // ゲーム結果を受けてバトルロード画面へ
  const handleGameEnd = (result: 'victory' | 'defeat') => {
    setGameResult(result)
    
    if (result === 'victory') {
      handleVictory()
    } else {
      handleDefeat()
    }
    
    setGameMode('battle-road')
  }

  // ゲームオーバー時タイトルへ
  const handleGameOver = () => {
    resetToTitle()
    setGameMode('title')
  }

  // リベンジ時の処理
  const handleRetry = () => {
    retryBattle()
    setGameResult(null)
    setGameMode('shuffle')
  }

  // タイトルに戻る（どの画面からでも）
  const handleBackToTitle = () => {
    resetToTitle() // 連勝記録完全リセット
    setGameMode('title')
    setPlayerHand([])
    setGameResult(null)
  }

  // シャッフル画面からタイトルに戻る
  const handleBackToTitleFromShuffle = () => {
    handleBackToTitle()
  }

  return (
    <>
      {gameMode === 'title' && (
        <TitleScreen onStartGame={handleStartGame} />
      )}
      
      {gameMode === 'battle-road' && (
        <BattleRoadScreen
          currentElement={battleRoadState.currentElement}
          wins={battleRoadState.wins}
          life={battleRoadState.life}
          isVictory={gameResult === 'victory'}
          isDefeat={gameResult === 'defeat'}
          isGameClear={isGameClear()}
          onStartNextBattle={handleStartNextBattle}
          onGameOver={handleGameOver}
          onRetry={handleRetry}
        />
      )}
      
      {gameMode === 'shuffle' && (
        <ShuffleScreen 
          onShuffleComplete={handleShuffleComplete}
          onBackToTitle={handleBackToTitleFromShuffle}
        />
      )}
      
      {gameMode === 'game' && (
        <BattlefieldGameScreen 
          onBackToTitle={handleBackToTitle}
          onGameEnd={handleGameEnd} // 勝敗結果を受け取る新しいprop
          initialPlayerHand={playerHand}
        />
      )}
    </>
  )
}