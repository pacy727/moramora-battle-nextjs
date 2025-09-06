// src/app/components/BattlefieldGameScreen.tsx (更新版 - 新しい計算システム統合)
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
import { 
  getCardDisplayValue, 
  getDetailedCalculation,
  isCardSuitableForTopic 
} from '../lib/calculationUtils'

interface BattlefieldGameScreenProps {
  onBackToTitle: () => void
}

type BattlePhase = 
  | 'waiting' 
  | 'topic-reveal' 
  | 'timer-countdown' 
  | 'card-selection' 
  | 'cards-revealed' 
  | 'battle-result' 
  | 'round-end'

export default function BattlefieldGameScreen({ onBackToTitle }: BattlefieldGameScreenProps) {
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
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('waiting')
  const [topicDisplay, setTopicDisplay] = useState<string>('')
  const [battleResult, setBattleResult] = useState<{
    winner: 'player' | 'computer' | 'tie'
    explanation: string
    playerValue: string
    computerValue: string
    detailedExplanation?: string
  } | null>(null)
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([])
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [scoreAnimation, setScoreAnimation] = useState<{show: boolean, value: number, position: {x: number, y: number}} | null>(null)
  const [cardSuitability, setCardSuitability] = useState<{[key: number]: boolean}>({})

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

  // カード適性を更新
  useEffect(() => {
    if (gameState.currentTopic && battlePhase === 'card-selection') {
      const newSuitability: {[key: number]: boolean} = {}
      gameState.playerHand.forEach((card, index) => {
        newSuitability[index] = isCardSuitableForTopic(card, gameState.currentTopic!.text)
      })
      setCardSuitability(newSuitability)
    }
  }, [gameState.currentTopic, gameState.playerHand, battlePhase])

  // カード選択処理
  const handleCardSelect = (card: ChemicalCard, index: number) => {
    if (battlePhase !== 'card-selection') return
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    setBattlePhase('cards-revealed')
    
    // カード適性チェックでフィードバック
    if (gameState.currentTopic) {
      const isSuitable = isCardSuitableForTopic(card, gameState.currentTopic.text)
      const calculation = getDetailedCalculation(card, gameState.currentTopic.text)
      
      if (isSuitable) {
        addFeedbackMessage('success', 'カード選択完了', `${calculation}`, 3000)
      } else {
        addFeedbackMessage('warning', '注意', `このカードでも計算可能です: ${calculation}`, 4000)
      }
    }
    
    // カードバトル実行
    setTimeout(() => {
      const { playerCard, computerCard } = playCard(card)
      
      if (!playerCard || !computerCard) return
      
      // 判定実行
      setTimeout(() => {
        if (gameState.currentTopic) {
          const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
          
          // 新しい計算システムを使用してバトル結果の詳細を計算
          const playerValue = getCardDisplayValue(playerCard, gameState.currentTopic.text)
          const computerValue = getCardDisplayValue(computerCard, gameState.currentTopic.text)
          const playerDetailedCalc = getDetailedCalculation(playerCard, gameState.currentTopic.text)
          const computerDetailedCalc = getDetailedCalculation(computerCard, gameState.currentTopic.text)
          
          setBattleResult({
            winner: result.winner,
            explanation: result.explanation,
            playerValue,
            computerValue,
            detailedExplanation: `あなた: ${playerDetailedCalc}\nCPU: ${computerDetailedCalc}`
          })
          
          setBattlePhase('battle-result')
          
          // 勝利時のエフェクト
          if (result.winner === 'player') {
            setShowConfetti(true)
            showScoreUpAnimation(1)
            addFeedbackMessage('success', 'ラウンド勝利！', `あなた: ${playerValue} vs CPU: ${computerValue}`, 4000)
          } else if (result.winner === 'computer') {
            addFeedbackMessage('error', 'ラウンド敗北', `あなた: ${playerValue} vs CPU: ${computerValue}`, 4000)
          } else {
            addFeedbackMessage('warning', '引き分け', `あなた: ${playerValue} = CPU: ${computerValue}`, 4000)
          }
          
          // 3秒後にラウンド終了
          setTimeout(() => {
            setBattlePhase('round-end')
            checkGameEnd()
          }, 3000)
        }
      }, 1000)
    }, 1000)
  }

  // スコアアニメーション表示
  const showScoreUpAnimation = (value: number) => {
    setScoreAnimation({
      show: true,
      value,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }

  // 新しいラウンド開始
  const handleStartNewRound = () => {
    setBattlePhase('topic-reveal')
    setSelectedCardIndex(null)
    setBattleResult(null)
    setCardSuitability({})
    
    const topic = startNewRound()
    if (topic) {
      setTopicDisplay(topic.text)
      addFeedbackMessage('info', '新しいお題', topic.text, 3000)
      
      // 3秒間お題を表示
      setTimeout(() => {
        setBattlePhase('timer-countdown')
        
        // タイマー開始
        startTimer(() => {
          // 時間切れ処理
          setBattlePhase('cards-revealed')
          const { playerCard, computerCard } = playCard()
          
          if (!playerCard || !computerCard) return
          
          setTimeout(() => {
            if (gameState.currentTopic) {
              const result = judgeRound(playerCard, computerCard, gameState.currentTopic)
              
              const playerValue = getCardDisplayValue(playerCard, gameState.currentTopic.text)
              const computerValue = getCardDisplayValue(computerCard, gameState.currentTopic.text)
              const playerDetailedCalc = getDetailedCalculation(playerCard, gameState.currentTopic.text)
              const computerDetailedCalc = getDetailedCalculation(computerCard, gameState.currentTopic.text)
              
              setBattleResult({
                winner: result.winner,
                explanation: result.explanation,
                playerValue,
                computerValue,
                detailedExplanation: `あなた: ${playerDetailedCalc}\nCPU: ${computerDetailedCalc}`
              })
              
              setBattlePhase('battle-result')
              addFeedbackMessage('warning', '時間切れ', 'ランダムに選択されました', 3000)
              
              if (result.winner === 'player') {
                showScoreUpAnimation(1)
              }
              
              setTimeout(() => {
                setBattlePhase('round-end')
                checkGameEnd()
              }, 3000)
            }
          }, 1000)
        })
      }, 3000)
      
      // タイマー開始後、カード選択フェーズに移行
      setTimeout(() => {
        setBattlePhase('card-selection')
      }, 3500)
    }
  }

  // ゲームリセット
  const handleResetGame = () => {
    setBattlePhase('waiting')
    setSelectedCardIndex(null)
    setBattleResult(null)
    setTopicDisplay('')
    setFeedbackMessages([])
    setShowConfetti(false)
    setCardSuitability({})
    resetGame()
  }

  // ゲーム終了時のエフェクト
  useEffect(() => {
    if (gameState.gamePhase === 'finished') {
      const finalResult = getFinalResult()
      if (finalResult?.winner === 'player') {
        setShowConfetti(true)
        addFeedbackMessage('success', '🎊 ゲーム勝利！', 'おめでとうございます！', 10000)
      } else if (finalResult?.winner === 'computer') {
        addFeedbackMessage('error', '💻 ゲーム敗北', '次回頑張りましょう！', 10000)
      }
    }
  }, [gameState.gamePhase, getFinalResult])

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

      <div className="h-full flex flex-col relative z-10">
        {/* ヘッダー（スコアとコントロール） */}
        <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm">
          <button
            onClick={onBackToTitle}
            className="bg-gray-500/20 hover:bg-gray-500/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 backdrop-blur-sm hover:scale-105"
          >
            ← タイトル
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              ⚗️ モラモラバトル ⚗️
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-white text-sm">プレイヤー</div>
              <div className="text-3xl font-bold text-yellow-300">{gameState.playerScore}</div>
            </div>
            <div className="text-white text-lg">VS</div>
            <div className="text-center">
              <div className="text-white text-sm">CPU</div>
              <div className="text-3xl font-bold text-yellow-300">{gameState.computerScore}</div>
            </div>
          </div>
        </div>

        {/* コンピューターの手札エリア */}
        <div className="h-24 bg-red-900/20 backdrop-blur-sm border-b border-red-500/30 flex items-center justify-center">
          <div className="flex gap-2">
            {gameState.computerHand.slice(0, 6).map((card, index) => (
              <EnhancedCard 
                key={`comp-${index}`} 
                card={card} 
                size="small"
                showBack={true}
                disabled={true}
              />
            ))}
          </div>
        </div>

        {/* バトルフィールド */}
        <div className="flex-1 relative bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm border-y border-white/10">
          <FloatingParticles count={15} color="#60a5fa" size="small" />
          
          {/* お題表示 */}
          {battlePhase === 'topic-reveal' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 text-center animate-zoom-in">
                <h2 className="text-3xl font-bold text-white mb-4">お題</h2>
                <div className="text-4xl font-bold text-yellow-300 animate-pulse">
                  {topicDisplay}
                </div>
              </div>
            </div>
          )}

          {/* タイマー表示 */}
          {battlePhase === 'timer-countdown' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-8xl font-bold transition-all duration-300 ${
                gameState.timeLeft <= 3 
                  ? 'text-red-400 animate-pulse scale-125' 
                  : gameState.timeLeft <= 5 
                    ? 'text-yellow-300 animate-heartbeat' 
                    : 'text-green-300'
              }`}>
                {gameState.timeLeft}
              </div>
            </div>
          )}

          {/* カード選択中の指示 */}
          {battlePhase === 'card-selection' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-3 text-white font-semibold animate-pulse">
                カードを選択してください ({gameState.timeLeft}秒)
              </div>
            </div>
          )}

          {/* バトルエリア中央 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-16">
              {/* コンピューターのカード */}
              <div className="text-center">
                <div className="text-red-300 text-sm mb-2">CPU</div>
                {gameState.computerSelectedCard && battlePhase !== 'card-selection' ? (
                  <EnhancedCard 
                    card={gameState.computerSelectedCard} 
                    size="large"
                    isPlayed={true}
                    isCorrect={battleResult?.winner === 'computer' ? true : null}
                    isWrong={battleResult?.winner === 'player' ? true : null}
                  />
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-red-300/50 rounded-xl flex items-center justify-center">
                    <span className="text-red-300/50 text-sm">待機中</span>
                  </div>
                )}
                {battleResult && (
                  <div className="mt-2 text-sm text-white bg-black/30 rounded px-2 py-1">
                    {battleResult.computerValue}
                  </div>
                )}
              </div>

              {/* VS表示 */}
              <div className="text-center">
                <div className="text-6xl font-bold text-white/50 animate-pulse">VS</div>
                {battleResult && (
                  <div className="mt-4 text-lg font-bold">
                    {battleResult.winner === 'player' && (
                      <span className="text-green-400">プレイヤー勝利！</span>
                    )}
                    {battleResult.winner === 'computer' && (
                      <span className="text-red-400">CPU勝利！</span>
                    )}
                    {battleResult.winner === 'tie' && (
                      <span className="text-yellow-400">引き分け！</span>
                    )}
                  </div>
                )}
              </div>

              {/* プレイヤーのカード */}
              <div className="text-center">
                <div className="text-blue-300 text-sm mb-2">あなた</div>
                {gameState.playerSelectedCard && battlePhase !== 'card-selection' ? (
                  <EnhancedCard 
                    card={gameState.playerSelectedCard} 
                    size="large"
                    isPlayed={true}
                    isCorrect={battleResult?.winner === 'player' ? true : null}
                    isWrong={battleResult?.winner === 'computer' ? true : null}
                  />
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-blue-300/50 rounded-xl flex items-center justify-center">
                    <span className="text-blue-300/50 text-sm">選択中</span>
                  </div>
                )}
                {battleResult && (
                  <div className="mt-2 text-sm text-white bg-black/30 rounded px-2 py-1">
                    {battleResult.playerValue}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* バトル結果詳細 */}
          {battleResult && battlePhase === 'battle-result' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/50 backdrop-blur-md rounded-lg px-6 py-4 text-center max-w-md">
                <div className="text-white text-sm leading-relaxed mb-2">
                  {battleResult.explanation.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                {battleResult.detailedExplanation && (
                  <div className="text-white/80 text-xs leading-relaxed border-t border-white/20 pt-2 mt-2">
                    <div className="font-semibold mb-1">計算詳細:</div>
                    {battleResult.detailedExplanation.split('\n').map((line, index) => (
                      <div key={index} className="font-mono">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* プレイヤーの手札エリア */}
        <div className="h-32 bg-blue-900/20 backdrop-blur-sm border-t border-blue-500/30 flex flex-col items-center justify-center">
          <div className="text-blue-300 text-sm mb-2">あなたの手札</div>
          <div className="flex gap-2 overflow-x-auto px-4">
            {gameState.playerHand.map((card, index) => {
              const isSuitable = cardSuitability[index]
              const isGrayed = battlePhase === 'card-selection' && isSuitable === false
              
              return (
                <div key={`${card.formula}-${card.unit}-${index}`} className="relative">
                  <EnhancedCard
                    card={card}
                    isSelected={selectedCardIndex === index}
                    onClick={() => handleCardSelect(card, index)}
                    disabled={battlePhase !== 'card-selection'}
                    size="medium"
                    glowEffect={battlePhase === 'card-selection' && isSuitable === true}
                  />
                  
                  {/* カード適性インジケーター */}
                  {battlePhase === 'card-selection' && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isSuitable 
                        ? 'bg-green-400 animate-pulse' 
                        : 'bg-yellow-400 opacity-60'
                    }`} />
                  )}
                  
                  {/* グレーアウトオーバーレイ */}
                  {isGrayed && (
                    <div className="absolute inset-0 bg-gray-600/50 rounded-xl flex items-center justify-center">
                      <span className="text-xs text-white/80">要計算</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="p-4 bg-black/20 backdrop-blur-sm text-center">
          {battlePhase === 'waiting' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-pulse-glow"
            >
              ゲーム開始
            </button>
          )}
          
          {battlePhase === 'round-end' && gameState.gamePhase !== 'finished' && (
            <button
              onClick={handleStartNewRound}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-bounce-in"
            >
              次のラウンド
            </button>
          )}

          <button
            onClick={handleResetGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ml-4"
          >
            リセット
          </button>
        </div>
      </div>

      {/* ゲーム終了画面 */}
      {finalResult && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl max-w-md animate-zoom-in relative overflow-hidden">
            <FloatingParticles count={20} color="#fbbf24" />
            <h2 className="text-3xl font-bold text-white mb-6 animate-heartbeat">ゲーム終了！</h2>
            <div 
              className="text-xl mb-8 text-yellow-300 font-semibold"
              dangerouslySetInnerHTML={{ __html: finalResult.message }}
            />
            <div className="space-x-4">
              <button
                onClick={handleResetGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                もう一度
              </button>
              <button
                onClick={onBackToTitle}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                タイトル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}