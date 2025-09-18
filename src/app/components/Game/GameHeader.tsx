// src/app/components/Game/GameHeader.tsx
'use client'

interface GameHeaderProps {
  playerScore: number
  computerScore: number
  winStreak: number
  cpuLevel: string
  cpuAccuracy: string
  onBackToTitle: () => void
}

export const GameHeader = ({ 
  playerScore, 
  computerScore, 
  winStreak, 
  cpuLevel, 
  cpuAccuracy, 
  onBackToTitle 
}: GameHeaderProps) => {
  return (
    <>
      {/* メインヘッダー */}
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
            <div className="text-3xl font-bold text-yellow-300">{playerScore}</div>
          </div>
          <div className="text-white text-lg">VS</div>
          <div className="text-center">
            <div className="text-white text-sm">CPU</div>
            <div className="text-3xl font-bold text-yellow-300">{computerScore}</div>
          </div>
        </div>
      </div>

      {/* 連勝記録とCPU難易度表示 */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-2">
        <div className="flex justify-between items-center text-sm">
          <div className="text-green-300">
            🏆 連勝記録: <span className="font-bold">{winStreak}勝</span>
          </div>
          <div className="text-red-300">
            🤖 CPU難易度: <span className="font-bold">{cpuLevel}</span> 
            <span className="text-xs ml-1">({cpuAccuracy})</span>
          </div>
        </div>
      </div>
    </>
  )
}