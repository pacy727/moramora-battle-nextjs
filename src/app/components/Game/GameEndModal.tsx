// src/app/components/Game/GameEndModal.tsx
'use client'

import { FinalResult } from '../../types/game'
import { FloatingParticles } from '../Feedback/VisualFeedbackSystem'

interface GameEndModalProps {
  finalResult: FinalResult | null
  onRestart: () => void
  onBackToTitle: () => void
}

export const GameEndModal = ({ finalResult, onRestart, onBackToTitle }: GameEndModalProps) => {
  if (!finalResult) return null

  return (
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
            onClick={onRestart}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
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
  )
}