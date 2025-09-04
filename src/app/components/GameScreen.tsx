import { useState } from 'react'
import { useGame } from '../lib/useGame'
import { ChemicalCard } from '../types/game'

// カードコンポーネント（コンパクト版）
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
      bg-gradient-to-br from-white to-gray-100 text-gray-800 p-2 rounded-lg cursor-pointer
      transition-all duration-300 min-w-[70px] text-center relative border-2
      shadow-md hover:shadow-lg hover:-translate-y-1
      ${isSelected ? 'border-red-400 bg-gradient-to-br from-red-100 to-red-200' : 'border-transparent hover:border-blue-400'}
      ${isPlayed ? 'scale-110 border-yellow-400 shadow-yellow-400/50 shadow-xl' : ''}
      ${onClick ? 'cursor-pointer' : 'cursor-default'}
    `}
    onClick={onClick}
  >
    <div className="text-sm font-bold mb-1 text-gray-800">{card.formula}</div>
    <div className="text-xs text-gray-600 font-semibold">{card.value}{card.unit}</div>
  </div>
)

interface GameScreenProps {
  onBackToTitle: () => void
}

export default function GameScreen({ onBackToTitle }: GameScreenProps) {
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
      
      if (!playerCard || !computerCard) return
      
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
        
        if (!playerCard || !computerCard) return
        
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
    <div className="h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-3 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* コンパクトヘッダー */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={onBackToTitle}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-white font-semibold py-1 px-3 rounded-lg transition-all duration-300 backdrop-blur-sm text-sm"
          >
            ← タイトル
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            ⚗️ モラモラバトル ⚗️
          </h1>
          
          <div className="w-16"></div>
        </div>

        {/* コンパクトスコアボード */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-3 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-white text-sm mb-1">プレイヤー</div>
              <div className="text-2xl font-bold text-yellow-300">{gameState.playerScore}</div>
            </div>
            <div className="text-center text-white text-sm">🎯 先取3P</div>
            <div className="text-center">
              <div className="text-white text-sm mb-1">CPU</div>
              <div className="text-2xl font-bold text-yellow-300">{gameState.computerScore}</div>
            </div>
          </div>
        </div>

        {/* コンパクトお題とタイマー */}
        <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 mb-3 text-center shadow-xl">
          <div className="text-lg md:text-xl font-bold text-red-300 mb-2">
            {gameState.currentTopic?.text || 'ゲーム開始を押してください'}
          </div>
          {gameState.timeLeft > 0 && (
            <div className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
              gameState.timeLeft <= 3 ? 'text-red-400 animate-pulse scale-110' : 'text-yellow-300'
            }`}>
              {gameState.timeLeft}
            </div>
          )}
        </div>

        {/* コンパクトカードエリア */}
        <div className="flex-1 grid md:grid-cols-2 gap-3 mb-3">
          {/* プレイヤーエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-xl flex flex-col">
            <div className="text-center text-sm font-semibold text-yellow-300 mb-2">あなたの手札</div>
            <div className="flex flex-wrap gap-1 justify-center mb-3 flex-1">
              {gameState.playerHand.map((card, index) => (
                <Card
                  key={`${card.formula}-${card.unit}-${index}`}
                  card={card}
                  isSelected={selectedCardIndex === index}
                  onClick={() => handleCardClick(card, index)}
                />
              ))}
            </div>
            <div className="flex justify-center items-center h-20">
              {gameState.playerSelectedCard && <Card card={gameState.playerSelectedCard} isPlayed />}
            </div>
          </div>

          {/* コンピューターエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-xl flex flex-col">
            <div className="text-center text-sm font-semibold text-yellow-300 mb-2">CPUの手札</div>
            <div className="flex flex-wrap gap-1 justify-center mb-3 flex-1">
              {gameState.computerHand.map((card, index) => (
                <Card key={`${card.formula}-${card.unit}-comp-${index}`} card={card} />
              ))}
            </div>
            <div className="flex justify-center items-center h-20">
              {gameState.computerSelectedCard && <Card card={gameState.computerSelectedCard} isPlayed />}
            </div>
          </div>
        </div>

        {/* 結果表示（コンパクト） */}
        {roundResult && (
          <div className={`rounded-lg p-3 mb-3 text-center font-semibold text-xs leading-relaxed border-2 max-h-24 overflow-y-auto ${resultClass}`}>
            {roundResult.split('\n').map((line, index) => (
              <div key={index} className="text-xs">{line}</div>
            ))}
          </div>
        )}

        {/* コンパクトコントロールボタン */}
        <div className="text-center">
          {gameState.gamePhase === 'waiting' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-6 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1"
            >
              開始
            </button>
          )}
          
          {showNextButton && gameState.gamePhase !== 'finished' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-6 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1"
            >
              次へ
            </button>
          )}

          <button
            onClick={handleResetGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1"
          >
            リセット
          </button>
        </div>

        {/* コンパクトゲーム終了画面 */}
        {finalResult && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">ゲーム終了！</h2>
              <div 
                className="text-lg mb-6 text-yellow-300 font-semibold"
                dangerouslySetInnerHTML={{ __html: finalResult.message }}
              />
              <div className="space-x-2">
                <button
                  onClick={handleResetGame}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  もう一度
                </button>
                <button
                  onClick={onBackToTitle}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  タイトル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
