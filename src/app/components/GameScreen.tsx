// src/app/components/GameScreen.tsx (修正版 - レスポンシブ対応)
'use client'

import { useState, useEffect } from 'react'
import { useGame } from '../lib/useGame'
import { ChemicalCard } from '../types/game'
import { FeedbackMessage } from '../types/feedback'
import { EnhancedCard } from './Card/EnhancedCard'
import { 
  VisualFeedbackSystem, 
  FloatingParticles, 
  Confetti, 
  ScoreUpAnimation,
  BackgroundEffects 
} from './Feedback/VisualFeedbackSystem'

interface GameScreenProps {
  onBackToTitle: () => void
}

export default function EnhancedGameScreen({ onBackToTitle }: GameScreenProps) {
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
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([])
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [scoreAnimation, setScoreAnimation] = useState<{show: boolean, value: number, position: {x: number, y: number}} | null>(null)
  const [cardStates, setCardStates] = useState<{[key: number]: {isCorrect: boolean | null, isWrong: boolean | null}}>({})
  const [revealingCards, setRevealingCards] = useState<boolean>(false)

  // フィードバックメッセージ追加
  const addFeedbackMessage = (type: FeedbackMessage['type'], title: string, message: string, duration = 4000) => {
    const newMessage: FeedbackMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration
    }
    setFeedbackMessages(prev => [...prev, newMessage])
  }
  
  // フィードバックメッセージ削除
  const dismissMessage = (id: string) => {
    setFeedbackMessages(prev => prev.filter(msg => msg.id !== id))
  }

  // スコアアニメーション表示
  const showScoreUpAnimation = (value: number, element?: HTMLElement) => {
    const rect = element?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2 }
    setScoreAnimation({
      show: true,
      value,
      position: { x: rect.left, y: rect.top }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }

  const handleCardClick = (card: ChemicalCard, index: number) => {
    if (gameState.gamePhase !== 'thinking') return
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    // カード選択フィードバック
    addFeedbackMessage('info', 'カード選択', `${card.formula} (${card.value}${card.unit}) を選択しました`, 2000)
    
    // カード選択後、自動でプレイ
    setTimeout(() => {
      setRevealingCards(true)
      const { playerCard, computerCard } = playCard(card)
      
      if (!playerCard || !computerCard) return
      
      // 判定を実行
      setTimeout(() => {
        if (gameState.currentTopic) {
          const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
          
          let resultText = ''
          let className = ''
          let feedbackType: FeedbackMessage['type'] = 'info'
          
          // カード状態更新
          const newCardStates = { ...cardStates }
          
          switch (result.winner) {
            case 'player':
              resultText = `🎉 あなたの勝利！ +1ポイント\n${result.explanation}`
              className = 'bg-green-100 text-green-800 border-green-300'
              feedbackType = 'success'
              newCardStates[index] = { isCorrect: true, isWrong: false }
              showScoreUpAnimation(1)
              
              // 勝利時のエフェクト
              if (result.playerScore >= 3) {
                setShowConfetti(true)
                addFeedbackMessage('success', '🎊 ゲーム勝利！', 'おめでとうございます！あなたの勝利です！', 6000)
              } else {
                addFeedbackMessage('success', 'ラウンド勝利！', `素晴らしい判断です！スコア: ${result.playerScore}`, 3000)
              }
              break
              
            case 'computer':
              resultText = `💻 コンピューターの勝利！\n${result.explanation}`
              className = 'bg-red-100 text-red-800 border-red-300'
              feedbackType = 'error'
              newCardStates[index] = { isCorrect: false, isWrong: true }
              addFeedbackMessage('error', 'ラウンド敗北', `惜しい！次のラウンドで取り返しましょう`, 3000)
              break
              
            case 'tie':
              resultText = `🤝 引き分けです！\n${result.explanation}`
              className = 'bg-yellow-100 text-yellow-800 border-yellow-300'
              feedbackType = 'warning'
              newCardStates[index] = { isCorrect: null, isWrong: null }
              addFeedbackMessage('warning', '引き分け', '互角の勝負でした！', 3000)
              break
          }
          
          setCardStates(newCardStates)
          setRoundResult(resultText)
          setResultClass(className)
          setShowNextButton(true)
          setRevealingCards(false)
          
          // ゲーム終了判定
          setTimeout(() => {
            checkGameEnd()
          }, 100)
        }
      }, 1500)
    }, 800)
  }

  const handleStartNewRound = () => {
    setSelectedCardIndex(null)
    setRoundResult(null)
    setResultClass('')
    setShowNextButton(false)
    setCardStates({})
    setRevealingCards(false)
    
    const topic = startNewRound()
    if (topic) {
      addFeedbackMessage('info', '新しいラウンド', `お題: ${topic.text}`, 3000)
      
      // タイマー開始
      startTimer(() => {
        // 時間切れで自動プレイ
        setRevealingCards(true)
        const { playerCard, computerCard } = playCard()
        
        if (!playerCard || !computerCard) return
        
        setTimeout(() => {
          if (gameState.currentTopic) {
            const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
            
            let resultText = `⏰ 時間切れ！ランダム選択\n${result.explanation}`
            let className = 'bg-gray-100 text-gray-800 border-gray-300'
            let feedbackType: FeedbackMessage['type'] = 'warning'
            
            if (result.winner === 'player') {
              resultText = `🎉 時間切れでしたが勝利！\n${result.explanation}`
              className = 'bg-green-100 text-green-800 border-green-300'
              feedbackType = 'success'
              showScoreUpAnimation(1)
            } else if (result.winner === 'computer') {
              resultText = `💻 時間切れで敗北...\n${result.explanation}`
              className = 'bg-red-100 text-red-800 border-red-300'
              feedbackType = 'error'
            }
            
            addFeedbackMessage(feedbackType, '時間切れ', 'もう少し早く判断してみましょう！', 4000)
            
            setRoundResult(resultText)
            setResultClass(className)
            setShowNextButton(true)
            setRevealingCards(false)
            
            setTimeout(() => {
              checkGameEnd()
            }, 100)
          }
        }, 1500)
      })
    }
  }

  const handleResetGame = () => {
    setSelectedCardIndex(null)
    setRoundResult(null)
    setResultClass('')
    setShowNextButton(false)
    setCardStates({})
    setRevealingCards(false)
    setFeedbackMessages([])
    setShowConfetti(false)
    resetGame()
    addFeedbackMessage('info', 'ゲームリセット', '新しいゲームを開始しました！', 2000)
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

  const finalResult = gameState.gamePhase === 'finished' ? getFinalResult() : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-2 md:p-4 overflow-hidden relative">
      {/* 背景エフェクト */}
      <BackgroundEffects 
        intensity="medium" 
        theme={gameState.gamePhase === 'finished' 
          ? (finalResult?.winner === 'player' ? 'victory' : 'defeat')
          : 'default'
        }
      />
      
      {/* フィードバックシステム */}
      <VisualFeedbackSystem 
        messages={feedbackMessages}
        onMessageDismiss={dismissMessage}
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

      <div className="max-w-6xl mx-auto min-h-screen flex flex-col relative z-10 py-2">
        {/* コンパクトヘッダー */}
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <button
            onClick={onBackToTitle}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-white font-semibold py-1 px-2 md:px-3 rounded-lg transition-all duration-300 backdrop-blur-sm text-xs md:text-sm hover:scale-105"
          >
            ← タイトル
          </button>
          
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent animate-pulse-glow">
            ⚗️ モラモラバトル ⚗️
          </h1>
          
          <div className="w-12 md:w-16"></div>
        </div>

        {/* コンパクトスコアボード */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 mb-2 md:mb-3 shadow-xl relative overflow-hidden">
          <FloatingParticles count={5} size="small" />
          <div className="flex justify-between items-center relative z-10">
            <div className="text-center">
              <div className="text-white text-xs md:text-sm mb-1">プレイヤー</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-300 animate-pulse">
                {gameState.playerScore}
              </div>
            </div>
            <div className="text-center text-white text-xs md:text-sm">🎯 先取3P</div>
            <div className="text-center">
              <div className="text-white text-xs md:text-sm mb-1">CPU</div>
              <div className="text-xl md:text-2xl font-bold text-yellow-300 animate-pulse">
                {gameState.computerScore}
              </div>
            </div>
          </div>
        </div>

        {/* コンパクトお題とタイマー */}
        <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 md:p-4 mb-2 md:mb-3 text-center shadow-xl relative overflow-hidden">
          <div className="text-sm md:text-lg lg:text-xl font-bold text-red-300 mb-1 md:mb-2 animate-bounce-in">
            {gameState.currentTopic?.text || 'ゲーム開始を押してください'}
          </div>
          {gameState.timeLeft > 0 && (
            <div className={`text-xl md:text-2xl lg:text-3xl font-bold transition-all duration-300 ${
              gameState.timeLeft <= 3 
                ? 'text-red-400 animate-pulse scale-110' 
                : gameState.timeLeft <= 5 
                  ? 'text-yellow-300 animate-heartbeat' 
                  : 'text-green-300'
            }`}>
              {gameState.timeLeft}
            </div>
          )}
        </div>

        {/* コンパクトカードエリア - フレックスボックスで高さ調整 */}
        <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-3 min-h-0">
          {/* プレイヤーエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 shadow-xl flex flex-col relative overflow-hidden min-h-0">
            <div className="text-center text-xs md:text-sm font-semibold text-yellow-300 mb-1 md:mb-2">あなたの手札</div>
            <div className="flex flex-wrap gap-1 justify-center mb-2 md:mb-3 flex-1 min-h-0 overflow-y-auto">
              {gameState.playerHand.map((card, index) => (
                <EnhancedCard
                  key={`${card.formula}-${card.unit}-${index}`}
                  card={card}
                  isSelected={selectedCardIndex === index}
                  isCorrect={cardStates[index]?.isCorrect}
                  isWrong={cardStates[index]?.isWrong}
                  onClick={() => handleCardClick(card, index)}
                  disabled={gameState.gamePhase !== 'thinking'}
                  size="small"
                />
              ))}
            </div>
            <div className="flex justify-center items-center h-16 md:h-20">
              {gameState.playerSelectedCard && (
                <EnhancedCard 
                  card={gameState.playerSelectedCard} 
                  isPlayed 
                  isRevealing={revealingCards}
                  size="small"
                />
              )}
            </div>
          </div>

          {/* コンピューターエリア */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-3 shadow-xl flex flex-col relative overflow-hidden min-h-0">
            <div className="text-center text-xs md:text-sm font-semibold text-yellow-300 mb-1 md:mb-2">CPUの手札</div>
            <div className="flex flex-wrap gap-1 justify-center mb-2 md:mb-3 flex-1 min-h-0 overflow-y-auto">
              {gameState.computerHand.map((card, index) => (
                <EnhancedCard 
                  key={`${card.formula}-${card.unit}-comp-${index}`} 
                  card={card} 
                  size="small"
                  showBack={true}
                />
              ))}
            </div>
            <div className="flex justify-center items-center h-16 md:h-20">
              {gameState.computerSelectedCard && (
                <EnhancedCard 
                  card={gameState.computerSelectedCard} 
                  isPlayed 
                  isRevealing={revealingCards}
                  size="small"
                />
              )}
            </div>
          </div>
        </div>

        {/* 結果表示（コンパクト） */}
        {roundResult && (
          <div className={`rounded-lg p-2 md:p-3 mb-2 md:mb-3 text-center font-semibold text-xs leading-relaxed border-2 max-h-20 md:max-h-24 overflow-y-auto ${resultClass} animate-fade-in-up`}>
            {roundResult.split('\n').map((line, index) => (
              <div key={index} className="text-xs">{line}</div>
            ))}
          </div>
        )}

        {/* コンパクトコントロールボタン */}
        <div className="text-center flex-shrink-0">
          {gameState.gamePhase === 'waiting' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-1.5 md:py-2 px-4 md:px-6 rounded-full text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1 animate-pulse-glow"
            >
              開始
            </button>
          )}
          
          {showNextButton && gameState.gamePhase !== 'finished' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-1.5 md:py-2 px-4 md:px-6 rounded-full text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1 animate-bounce-in"
            >
              次へ
            </button>
          )}

          <button
            onClick={handleResetGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 mx-1"
          >
            リセット
          </button>
        </div>

        {/* コンパクトゲーム終了画面 */}
        {finalResult && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 md:p-6 text-center shadow-2xl max-w-sm md:max-w-md w-full animate-zoom-in relative overflow-hidden">
              <FloatingParticles count={15} color="#fbbf24" />
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 animate-heartbeat">ゲーム終了！</h2>
              <div 
                className="text-base md:text-lg mb-4 md:mb-6 text-yellow-300 font-semibold animate-typewriter"
                dangerouslySetInnerHTML={{ __html: finalResult.message }}
              />
              <div className="space-x-2">
                <button
                  onClick={handleResetGame}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-bounce-in"
                >
                  もう一度
                </button>
                <button
                  onClick={onBackToTitle}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-1.5 md:py-2 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-bounce-in"
                  style={{ animationDelay: '0.1s' }}
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