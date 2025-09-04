'use client'

import { useState, useEffect } from 'react'
import { useGame } from './lib/useGame'
import { ChemicalCard } from './types/game'

// カードコンポーネント
const Card = ({ 
  card, 
  isSelected, 
  isPlayed, 
  onClick 
}: {
  card: ChemicalCard
  isSelected?: boolean
  isPlayed?: boolean
  onClick?: () => void
}) => (
  <div
    className={`
      bg-gradient-to-br from-white to-gray-100 text-gray-800 p-4 rounded-xl cursor-pointer
      transition-all duration-300 min-w-[120px] text-center relative border-2
      shadow-lg hover:shadow-xl hover:-translate-y-1
      ${isSelected ? 'border-red-400 bg-gradient-to-br from-red-100 to-red-200' : 'border-transparent hover:border-blue-400'}
      ${isPlayed ? 'scale-110 border-yellow-400 shadow-yellow-400/50 shadow-2xl' : ''}
      ${onClick ? 'cursor-pointer' : 'cursor-default'}
    `}
    onClick={onClick}
  >
    <div className="text-xl font-bold mb-2 text-gray-800">{card.formula}</div>
    <div className="text-lg text-gray-600 font-semibold">{card.value}{card.unit}</div>
  </div>
)

export default function Home() {
  const {
    gameState,
    selectPlayerCard,
    startNewRound,
    startTimer,
    playCard,
    judgeRound,
    checkGameEnd,
    getFinalResult,
    resetGame
  } = useGame()

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [roundResult, setRoundResult] = useState<string | null>(null)
  const [resultClass, setResultClass] = useState<string>('')
  const [showNextButton, setShowNextButton] = useState<boolean>(false)

  const handleCardClick = (card: ChemicalCard, index: number) => {
    if (gameState.gamePhase !== 'thinking') return
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    // カード選択後、自動でプレイ
    setTimeout(() => {
      const { playerCard, computerCard } = playCard(card)
      
      // 判定を実行
      setTimeout(() => {
        if (gameState.currentTopic) {
          const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
          
          let resultText = ''
          let className = ''
          
          switch (result.winner) {
            case 'player':
              resultText = `🎉 あなたの勝利！ +1ポイント\n${result.explanation}`
              className = 'bg-green-100 text-green-800 border-green-300'
              break
            case 'computer':
              resultText = `💻 コンピューターの勝利！\n${result.explanation}`
              className = 'bg-red-100 text-red-800 border-red-300'
              break
            case 'tie':
              resultText = `🤝 引き分けです！\n${result.explanation}`
              className = 'bg-yellow-100 text-yellow-800 border-yellow-300'
              break
          }
          
          setRoundResult(resultText)
          setResultClass(className)
          setShowNextButton(true)
          
          // ゲーム終了判定
          setTimeout(() => {
            checkGameEnd()
          }, 100)
        }
      }, 1000)
    }, 500)
  }

  const handleStartNewRound = () => {
    setSelectedCardIndex(null)
    setRoundResult(null)
    setResultClass('')
    setShowNextButton(false)
    
    const topic = startNewRound()
    if (topic) {
      // タイマー開始
      startTimer(() => {
        // 時間切れで自動プレイ
        const { playerCard, computerCard } = playCard()
        
        setTimeout(() => {
          if (gameState.currentTopic) {
            const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
            
            let resultText = `⏰ 時間切れ！ランダム選択\n${result.explanation}`
            let className = 'bg-gray-100 text-gray-800 border-gray-300'
            
            if (result.winner === 'player') {
              resultText = `🎉 時間切れでしたが勝利！\n${result.explanation}`
              className = 'bg-green-100 text-green-800 border-green-300'
            } else if (result.winner === 'computer') {
              resultText = `💻 時間切れで敗北...\n${result.explanation}`
              className = 'bg-red-100 text-red-800 border-red-300'
            }
            
            setRoundResult(resultText)
            setResultClass(className)
            setShowNextButton(true)
            
            setTimeout(() => {
              checkGameEnd()
            }, 100)
          }
        }, 1000)
      })
    }
  }

  const handleResetGame = () => {
    setSelectedCardIndex(null)
    setRoundResult(null)
    setResultClass('')
    setShowNextButton(false)
    resetGame()
  }

  const finalResult = gameState.gamePhase === 'finished' ? getFinalResult() : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* タイトル */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
          ⚗️ モラモラバトル ⚗️
        </h1>

        {/* スコアボード */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-white text-xl mb-2">プレイヤー</div>
              <div className="text-4xl font-bold text-yellow-300 drop-shadow-lg">
                {gameState.playerScore}
              </div>
            </div>
            <div className="text-center text-white text-xl">
              🎯 先取目標: 3ポイント
            </div>
            <div className="text-center">
              <div className="text-white text-xl mb-2">コンピューター</div>
              <div className="text-4xl font-bold text-yellow-300 drop-shadow-lg">
                {gameState.computerScore}
              </div>
            </div>
          </div>
        </div>

        {/* お題とタイマー */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 mb-8 text-center min-h-[120px] flex flex-col justify-center shadow-2xl">
          <div className="text-2xl md:text-3xl font-bold text-red-300 mb-4 drop-shadow-lg">
            {gameState.currentTopic?.text || 'ゲーム開始を押してください'}
          </div>
          {gameState.timeLeft > 0 && (
            <div className={`text-4xl md:text-6xl font-bold drop-shadow-lg transition-all duration-300 ${
              gameState.timeLeft <= 3 ? 'text-red-400 animate-pulse scale-110' : 'text-yellow-300'
            }`}>
              {gameState.timeLeft}
            </div>
          )}
        </div>

        {/* カードエリア */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* プレイヤーエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
            <div className="text-center text-xl font-semibold text-yellow-300 mb-4">
              あなたの手札
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-6 min-h-[100px]">
              {gameState.playerHand.map((card, index) => (
                <Card
                  key={`${card.formula}-${card.unit}-${index}`}
                  card={card}
                  isSelected={selectedCardIndex === index}
                  onClick={() => handleCardClick(card, index)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center min-h-[140px]">
              {gameState.playerSelectedCard && (
                <Card card={gameState.playerSelectedCard} isPlayed />
              )}
            </div>
          </div>

          {/* コンピューターエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
            <div className="text-center text-xl font-semibold text-yellow-300 mb-4">
              コンピューターの手札
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-6 min-h-[100px]">
              {gameState.computerHand.map((card, index) => (
                <Card
                  key={`${card.formula}-${card.unit}-comp-${index}`}
                  card={card}
                />
              ))}
            </div>
            <div className="flex justify-center items-center min-h-[140px]">
              {gameState.computerSelectedCard && (
                <Card card={gameState.computerSelectedCard} isPlayed />
              )}
            </div>
          </div>
        </div>

        {/* 結果表示 */}
        {roundResult && (
          <div className={`rounded-xl p-6 mb-8 text-center font-semibold text-lg leading-relaxed max-h-48 overflow-y-auto border-2 ${resultClass}`}>
            {roundResult.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        {/* コントロールボタン */}
        <div className="text-center mb-8">
          {gameState.gamePhase === 'waiting' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-2"
            >
              ゲーム開始
            </button>
          )}
          
          {showNextButton && gameState.gamePhase !== 'finished' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-2"
            >
              次のラウンド
            </button>
          )}

          <button
            onClick={handleResetGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-2"
          >
            リセット
          </button>
        </div>

        {/* ゲーム終了画面 */}
        {finalResult && (
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6">ゲーム終了！</h2>
            <div 
              className="text-2xl mb-8 text-yellow-300 font-semibold"
              dangerouslySetInnerHTML={{ __html: finalResult.message }}
            />
            <button
              onClick={handleResetGame}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-10 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              新しいゲーム
            </button>
          </div>
        )}
      </div>
    </div>
  )
}