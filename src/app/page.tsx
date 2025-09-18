'use client'

import { useState } from 'react'
import { ChemicalCard } from './types/game'
import TitleScreen from './components/TitleScreen'
import ShuffleScreen from './components/ShuffleScreen'
import BattlefieldGameScreen from './components/BattlefieldGameScreen'

type GameMode = 'title' | 'shuffle' | 'game'

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('title')
  const [playerHand, setPlayerHand] = useState<ChemicalCard[]>([])

  const handleStartGame = () => {
    setGameMode('shuffle')
  }

  const handleShuffleComplete = (finalHand: ChemicalCard[]) => {
    setPlayerHand(finalHand)
    setGameMode('game')
  }

  const handleBackToTitle = () => {
    setGameMode('title')
    setPlayerHand([])
  }

  const handleBackToTitleFromShuffle = () => {
    setGameMode('title')
  }

  // ゲーム終了後の再開処理 - シャッフル画面に戻る
  const handleRestart = () => {
    setPlayerHand([]) // 手札をクリア
    setGameMode('shuffle') // シャッフル画面に戻る
  }

  return (
    <>
      {gameMode === 'title' && (
        <TitleScreen onStartGame={handleStartGame} />
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
          onRestart={handleRestart} // 新しいpropを追加
          initialPlayerHand={playerHand}
        />
      )}
    </>
  )
}