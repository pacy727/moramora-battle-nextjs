'use client'

import { useState } from 'react'
import TitleScreen from './components/TitleScreen'
import GameScreen from './components/GameScreen'

type GameMode = 'title' | 'game'

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('title')

  const handleStartGame = () => {
    setGameMode('game')
  }

  const handleBackToTitle = () => {
    setGameMode('title')
  }

  return (
    <>
      {gameMode === 'title' && (
        <TitleScreen onStartGame={handleStartGame} />
      )}
      
      {gameMode === 'game' && (
        <GameScreen onBackToTitle={handleBackToTitle} />
      )}
    </>
  )
}