// src/app/components/BattlefieldGameScreen.tsx (修正版 - UI改善)
'use client'

import { useState, useEffect } from 'react'
import { useGame } from '../lib/useGame'
import { ChemicalCard } from '../types/game'
import { EnhancedCard } from './Card/EnhancedCard'
import { 
  FloatingParticles, 
  Confetti, 
  ScoreUpAnimation,
  BackgroundEffects 
} from './Feedback/VisualFeedbackSystem'
import { 
  getCardComparisonValue
} from '../lib/calculationUtils'

interface BattlefieldGameScreenProps {
  onBackToTitle: () => void
}

type BattlePhase = 
  | 'waiting' 
  | 'topic-reveal' 
  | 'timer-countdown' 
  | 'card-selection' 
  | 'player-card-reveal'
  | 'computer-card-reveal'
  | 'player-number-reveal'
  | 'computer-number-reveal'
  | 'judge-reveal'
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

  // ローカル状態
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('waiting')
  const [topicDisplay, setTopicDisplay] = useState<string>('')
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [scoreAnimation, setScoreAnimation] = useState<{show: boolean, value: number, position: {x: number, y: number}} | null>(null)
  
  // バトル結果を保持するローカル状態
  const [battleResult, setBattleResult] = useState<{
    winner: 'player' | 'computer' | 'tie'
    playerCard: ChemicalCard
    computerCard: ChemicalCard
    playerValue: number
    computerValue: number
  } | null>(null)

  // スコアアニメーション表示
  const showScoreUpAnimation = (value: number) => {
    setScoreAnimation({
      show: true,
      value,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    })
    setTimeout(() => setScoreAnimation(null), 2000)
  }

  // 表示条件を判定するヘルパー関数
  const shouldShowPlayerCard = (): boolean => {
    return battleResult !== null && (
      battlePhase === 'player-card-reveal' || 
      battlePhase === 'computer-card-reveal' || 
      battlePhase === 'player-number-reveal' || 
      battlePhase === 'computer-number-reveal' || 
      battlePhase === 'judge-reveal' || 
      battlePhase === 'round-end'
    )
  }

  const shouldShowComputerCard = (): boolean => {
    return battleResult !== null && (
      battlePhase === 'computer-card-reveal' || 
      battlePhase === 'player-number-reveal' || 
      battlePhase === 'computer-number-reveal' || 
      battlePhase === 'judge-reveal' || 
      battlePhase === 'round-end'
    )
  }

  const shouldShowPlayerNumber = (): boolean => {
    return battleResult !== null && gameState.currentTopic !== null && (
      battlePhase === 'player-number-reveal' || 
      battlePhase === 'computer-number-reveal' || 
      battlePhase === 'judge-reveal' || 
      battlePhase === 'round-end'
    )
  }

  const shouldShowComputerNumber = (): boolean => {
    return battleResult !== null && gameState.currentTopic !== null && (
      battlePhase === 'computer-number-reveal' || 
      battlePhase === 'judge-reveal' || 
      battlePhase === 'round-end'
    )
  }

  const shouldShowJudgeResult = (): boolean => {
    return battleResult !== null && battlePhase === 'judge-reveal'
  }

  const shouldShowCardEffects = (): boolean => {
    return battlePhase === 'judge-reveal'
  }

  // カード選択処理（段階的表示版）
  const handleCardSelect = (card: ChemicalCard, index: number) => {
    if (battlePhase !== 'card-selection') return
    
    console.log('カード選択:', card.formula, card.value + card.unit)
    
    selectPlayerCard(card)
    setSelectedCardIndex(index)
    
    // useGameでカードバトルを実行
    const { playerCard, computerCard } = playCard(card)
    
    if (!playerCard || !computerCard || !gameState.currentTopic) return
    
    console.log('バトル実行 - プレイヤー:', playerCard.formula, 'CPU:', computerCard.formula)
    
    // 段階的表示開始
    // 1. プレイヤーカード表示
    setBattlePhase('player-card-reveal')
    setBattleResult({
      winner: 'tie', // 仮の値
      playerCard,
      computerCard,
      playerValue: 0,
      computerValue: 0
    })
    
    setTimeout(() => {
      // 2. コンピューターカード表示
      setBattlePhase('computer-card-reveal')
    }, 1000)
    
    setTimeout(() => {
      // 3. プレイヤー数値表示
      setBattlePhase('player-number-reveal')
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, playerValue } : null)
      console.log('プレイヤー計算値:', playerValue)
    }, 2000)
    
    setTimeout(() => {
      // 4. コンピューター数値表示
      setBattlePhase('computer-number-reveal')
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      setBattleResult(prev => prev ? { ...prev, computerValue } : null)
      console.log('コンピューター計算値:', computerValue)
    }, 3000)
    
    setTimeout(() => {
      // 5. ジャッジ表示
      setBattlePhase('judge-reveal')
      const result = judgeRound(playerCard, computerCard, gameState.currentTopic!)
      const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
      const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
      
      setBattleResult({
        winner: result.winner,
        playerCard,
        computerCard,
        playerValue,
        computerValue
      })
      
      console.log('ジャッジ結果:', result.winner)
      
      // エフェクト
      if (result.winner === 'player') {
        setShowConfetti(true)
        showScoreUpAnimation(1)
      }
    }, 4000)
    
    setTimeout(() => {
      // 6. ラウンド終了
      setBattlePhase('round-end')
      checkGameEnd()
    }, 7000)
  }

  // 新しいラウンド開始
  const handleStartNewRound = () => {
    console.log('新しいラウンド開始')
    
    // 状態をリセット
    setBattlePhase('topic-reveal')
    setSelectedCardIndex(null)
    setBattleResult(null)
    
    const topic = startNewRound()
    if (topic) {
      setTopicDisplay(topic.text)
      
      // 3秒間お題を表示
      setTimeout(() => {
        setBattlePhase('timer-countdown')
        
        // タイマー開始
        startTimer(() => {
          // 時間切れ処理（段階的表示版）
          console.log('時間切れ')
          
          const { playerCard, computerCard } = playCard()
          
          if (!playerCard || !computerCard || !gameState.currentTopic) return
          
          // 段階的表示開始
          // 1. プレイヤーカード表示
          setBattlePhase('player-card-reveal')
          setBattleResult({
            winner: 'tie', // 仮の値
            playerCard,
            computerCard,
            playerValue: 0,
            computerValue: 0
          })
          
          setTimeout(() => {
            // 2. コンピューターカード表示
            setBattlePhase('computer-card-reveal')
          }, 1000)
          
          setTimeout(() => {
            // 3. プレイヤー数値表示
            setBattlePhase('player-number-reveal')
            const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
            setBattleResult(prev => prev ? { ...prev, playerValue } : null)
          }, 2000)
          
          setTimeout(() => {
            // 4. コンピューター数値表示
            setBattlePhase('computer-number-reveal')
            const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
            setBattleResult(prev => prev ? { ...prev, computerValue } : null)
          }, 3000)
          
          setTimeout(() => {
            // 5. ジャッジ表示
            setBattlePhase('judge-reveal')
            const result = judgeRound(playerCard, computerCard, gameState.currentTopic!)
            const playerValue = getCardComparisonValue(playerCard, gameState.currentTopic!.text)
            const computerValue = getCardComparisonValue(computerCard, gameState.currentTopic!.text)
            
            setBattleResult({
              winner: result.winner,
              playerCard,
              computerCard,
              playerValue,
              computerValue
            })
            
            if (result.winner === 'player') {
              showScoreUpAnimation(1)
            }
          }, 4000)
          
          setTimeout(() => {
            // 6. ラウンド終了
            setBattlePhase('round-end')
            checkGameEnd()
          }, 7000)
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
    setShowConfetti(false)
    resetGame()
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
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* 背景エフェクト */}
      <BackgroundEffects 
        intensity="low" 
        theme={gameState.gamePhase === 'finished' 
          ? (finalResult?.winner === 'player' ? 'victory' : 'defeat')
          : 'default'
        }
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
        {/* ヘッダー */}
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

        {/* CPU手札エリア */}
        <div className="h-28 bg-red-900/20 backdrop-blur-sm border-b border-red-500/30 flex items-center justify-center p-2">
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
                <div className="text-xs mt-1 text-yellow-300">
                  どのカードでも選択可能です！mol計算で頑張りましょう
                </div>
              </div>
            </div>
          )}

          {/* バトルエリア中央 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-16">
              {/* CPUのカード */}
              <div className="text-center relative">
                <div className="text-red-300 text-sm mb-2">CPU</div>
                {shouldShowComputerCard() ? (
                  <>
                    <EnhancedCard 
                      card={battleResult!.computerCard} 
                      size="large"
                      isPlayed={true}
                      isCorrect={shouldShowCardEffects() && battleResult!.winner === 'computer' ? true : null}
                      isWrong={shouldShowCardEffects() && battleResult!.winner === 'player' ? true : null}
                    />
                    {/* CPU側の数値表示 */}
                    {shouldShowComputerNumber() && (
                      <div className="absolute left-[-120px] top-1/2 transform -translate-y-1/2 bg-red-500 backdrop-blur-md rounded-lg p-3 text-center border-2 border-white z-50 animate-fade-in-up">
                        <div className="text-white text-xs mb-1">CPU</div>
                        <div className="text-3xl font-bold text-white">
                          {Math.round(battleResult!.computerValue * 10) / 10}
                        </div>
                        <div className="text-white text-xs">
                          {gameState.currentTopic!.text.includes('質量') || gameState.currentTopic!.text.includes('分子量') ? 'g' :
                           gameState.currentTopic!.text.includes('mol数') ? 'mol' :
                           gameState.currentTopic!.text.includes('体積') ? 'L' :
                           gameState.currentTopic!.text.includes('融点') ? '℃' : ''}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-red-300/50 rounded-xl flex items-center justify-center">
                    <span className="text-red-300/50 text-sm">待機中</span>
                  </div>
                )}
              </div>

              {/* VS表示 */}
              <div className="text-center">
                <div className="text-6xl font-bold text-white/50 animate-pulse">VS</div>
                {shouldShowJudgeResult() && (
                  <div className="mt-4 text-lg font-bold animate-bounce-in">
                    {battleResult!.winner === 'player' && (
                      <span className="text-green-400">プレイヤー勝利！</span>
                    )}
                    {battleResult!.winner === 'computer' && (
                      <span className="text-red-400">CPU勝利！</span>
                    )}
                    {battleResult!.winner === 'tie' && (
                      <span className="text-yellow-400">引き分け！</span>
                    )}
                  </div>
                )}
              </div>

              {/* プレイヤーのカード */}
              <div className="text-center relative">
                <div className="text-blue-300 text-sm mb-2">あなた</div>
                {shouldShowPlayerCard() ? (
                  <>
                    <EnhancedCard 
                      card={battleResult!.playerCard} 
                      size="large"
                      isPlayed={true}
                      isCorrect={shouldShowCardEffects() && battleResult!.winner === 'player' ? true : null}
                      isWrong={shouldShowCardEffects() && battleResult!.winner === 'computer' ? true : null}
                    />
                    {/* プレイヤー側の数値表示 */}
                    {shouldShowPlayerNumber() && (
                      <div className="absolute right-[-120px] top-1/2 transform -translate-y-1/2 bg-blue-500 backdrop-blur-md rounded-lg p-3 text-center border-2 border-white z-50 animate-fade-in-up">
                        <div className="text-white text-xs mb-1">あなた</div>
                        <div className="text-3xl font-bold text-white">
                          {Math.round(battleResult!.playerValue * 10) / 10}
                        </div>
                        <div className="text-white text-xs">
                          {gameState.currentTopic!.text.includes('質量') || gameState.currentTopic!.text.includes('分子量') ? 'g' :
                           gameState.currentTopic!.text.includes('mol数') ? 'mol' :
                           gameState.currentTopic!.text.includes('体積') ? 'L' :
                           gameState.currentTopic!.text.includes('融点') ? '℃' : ''}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-blue-300/50 rounded-xl flex items-center justify-center">
                    <span className="text-blue-300/50 text-sm">選択中</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* プレイヤーの手札エリア - 拡大版 */}
        <div className="h-56 bg-blue-900/20 backdrop-blur-sm border-t border-blue-500/30 flex flex-col items-center justify-center p-4">
          <div className="text-blue-300 text-sm mb-3 font-semibold">あなたの手札</div>
          <div className="flex gap-3 overflow-x-auto px-2 py-6 w-full justify-center min-h-0 max-w-full">
            {gameState.playerHand.map((card, index) => (
              <div key={`${card.formula}-${card.unit}-${index}`} className="relative flex-shrink-0">
                <EnhancedCard
                  card={card}
                  isSelected={selectedCardIndex === index}
                  onClick={() => handleCardSelect(card, index)}
                  disabled={battlePhase !== 'card-selection'}
                  size="medium"
                  glowEffect={battlePhase === 'card-selection'}
                />
                
                {battlePhase === 'card-selection' && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-400 animate-pulse border-2 border-white" />
                )}
              </div>
            ))}
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