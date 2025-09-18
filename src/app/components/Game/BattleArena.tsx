// src/app/components/Game/BattleArena.tsx
'use client'

import { ChemicalCard, Topic } from '../../types/game'
import { EnhancedCard } from '../Card/EnhancedCard'
import { FloatingParticles } from '../Feedback/VisualFeedbackSystem'

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

interface BattleResult {
  winner: 'player' | 'computer' | 'tie'
  playerCard: ChemicalCard
  computerCard: ChemicalCard
  playerValue: number
  computerValue: number
}

interface BattleArenaProps {
  currentTopic: Topic | null
  topicDisplay: string
  timeLeft: number
  battlePhase: BattlePhase
  battleResult: BattleResult | null
  onStartNewRound: () => void
}

export const BattleArena = ({
  currentTopic,
  topicDisplay,
  timeLeft,
  battlePhase,
  battleResult,
  onStartNewRound
}: BattleArenaProps) => {
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
    return battleResult !== null && currentTopic !== null && (
      battlePhase === 'player-number-reveal' || 
      battlePhase === 'computer-number-reveal' || 
      battlePhase === 'judge-reveal' || 
      battlePhase === 'round-end'
    )
  }

  const shouldShowComputerNumber = (): boolean => {
    return battleResult !== null && currentTopic !== null && (
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

  const getUnitFromTopic = (topicText: string): string => {
    if (topicText.includes('質量') || topicText.includes('分子量')) return 'g'
    if (topicText.includes('mol数')) return 'mol'
    if (topicText.includes('体積')) return 'L'
    if (topicText.includes('融点')) return '℃'
    return ''
  }

  return (
    <div className="flex-1 relative bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm border-y border-white/10">
      <FloatingParticles count={15} color="#60a5fa" size="small" />
      
      {/* お題表示（大きく表示） */}
      {battlePhase === 'topic-reveal' && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-white backdrop-blur-md rounded-2xl p-8 text-center animate-zoom-in shadow-2xl border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">お題</h2>
            <div className="text-4xl font-bold text-purple-600 animate-pulse">
              {topicDisplay}
            </div>
          </div>
        </div>
      )}

      {/* お題表示（常時表示・小さく） */}
      {currentTopic && battlePhase !== 'topic-reveal' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-6 py-3 text-white font-bold text-lg border border-white/30">
            お題: {currentTopic.text}
          </div>
        </div>
      )}

      {/* タイマー表示 */}
      {(battlePhase === 'timer-countdown' || (battlePhase === 'card-selection' && timeLeft > 0)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
          <div className={`text-8xl font-bold transition-all duration-300 ${
            timeLeft <= 3 
              ? 'text-red-400 animate-pulse scale-125' 
              : timeLeft <= 5 
                ? 'text-yellow-300 animate-heartbeat' 
                : 'text-green-300'
          }`}>
            {timeLeft}
          </div>
        </div>
      )}

      {/* バトルエリア中央 */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex items-center gap-16">
          {/* CPUのカード */}
          <div className="flex flex-col items-center justify-center h-48 w-24 relative">
            {shouldShowComputerCard() ? (
              <>
                <div className="flex items-center justify-center flex-1">
                  <EnhancedCard 
                    card={battleResult!.computerCard} 
                    size="large"
                    isPlayed={true}
                    isCorrect={shouldShowCardEffects() && battleResult!.winner === 'computer' ? true : null}
                    isWrong={shouldShowCardEffects() && battleResult!.winner === 'player' ? true : null}
                  />
                </div>
                <div className="text-red-300 text-sm mt-2">CPU</div>
                {/* CPU側の数値表示 */}
                {shouldShowComputerNumber() && (
                  <div className="absolute left-[-120px] top-1/2 transform -translate-y-1/2 bg-red-500 backdrop-blur-md rounded-lg p-3 text-center border-2 border-white z-50 animate-fade-in-up">
                    <div className="text-white text-xs mb-1">CPU</div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(battleResult!.computerValue * 10) / 10}
                    </div>
                    <div className="text-white text-xs">
                      {getUnitFromTopic(currentTopic!.text)}
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
          <div className="text-center w-20">
            {battlePhase !== 'timer-countdown' && battlePhase !== 'card-selection' && (
              <div className="text-6xl font-bold text-white/50 animate-pulse">VS</div>
            )}
          </div>

          {/* プレイヤーのカード */}
          <div className="flex flex-col items-center justify-center h-48 w-24 relative">
            {shouldShowPlayerCard() ? (
              <>
                <div className="flex items-center justify-center flex-1">
                  <EnhancedCard 
                    card={battleResult!.playerCard} 
                    size="large"
                    isPlayed={true}
                    isCorrect={shouldShowCardEffects() && battleResult!.winner === 'player' ? true : null}
                    isWrong={shouldShowCardEffects() && battleResult!.winner === 'computer' ? true : null}
                  />
                </div>
                <div className="text-blue-300 text-sm mt-2">あなた</div>
                {/* プレイヤー側の数値表示 */}
                {shouldShowPlayerNumber() && (
                  <div className="absolute right-[-120px] top-1/2 transform -translate-y-1/2 bg-blue-500 backdrop-blur-md rounded-lg p-3 text-center border-2 border-white z-50 animate-fade-in-up">
                    <div className="text-white text-xs mb-1">あなた</div>
                    <div className="text-3xl font-bold text-white">
                      {Math.round(battleResult!.playerValue * 10) / 10}
                    </div>
                    <div className="text-white text-xs">
                      {getUnitFromTopic(currentTopic!.text)}
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

      {/* 勝敗メッセージ */}
      {shouldShowJudgeResult() && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black/80 backdrop-blur-md rounded-xl px-8 py-4 border-2 border-white/30 shadow-2xl">
            <div className="text-3xl font-bold animate-bounce-in text-center">
              {battleResult!.winner === 'player' && (
                <span className="text-green-400">🎉 プレイヤー勝利！ 🎉</span>
              )}
              {battleResult!.winner === 'computer' && (
                <span className="text-red-400">💻 CPU勝利！ 💻</span>
              )}
              {battleResult!.winner === 'tie' && (
                <span className="text-yellow-400">🤝 引き分け！ 🤝</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ゲーム開始ボタン */}
      {battlePhase === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80 backdrop-blur-md z-20">
          <button
            onClick={onStartNewRound}
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-2 hover:scale-110 animate-pulse-glow relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-3">
              🚀 <span>ゲーム開始</span> 🚀
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      )}

      {/* 次のラウンドボタン */}
      {battlePhase === 'round-end' && (
        <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80 backdrop-blur-md z-20">
          <button
            onClick={onStartNewRound}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-6 px-12 rounded-2xl text-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-2 hover:scale-110 animate-bounce-in relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-3">
              ⚡ <span>次のラウンド</span> ⚡
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      )}
    </div>
  )
}