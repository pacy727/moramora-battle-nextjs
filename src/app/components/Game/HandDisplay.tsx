// src/app/components/Game/HandDisplay.tsx
'use client'

import { ChemicalCard } from '../../types/game'
import { EnhancedCard } from '../Card/EnhancedCard'

interface HandDisplayProps {
  cards: ChemicalCard[]
  isPlayerHand?: boolean
  selectedCardIndex?: number | null
  onCardSelect?: (card: ChemicalCard, index: number) => void
  canSelectCards?: boolean
  showBack?: boolean
}

export const HandDisplay = ({
  cards,
  isPlayerHand = false,
  selectedCardIndex = null,
  onCardSelect,
  canSelectCards = false,
  showBack = false
}: HandDisplayProps) => {
  const handleCardClick = (card: ChemicalCard, index: number) => {
    if (canSelectCards && onCardSelect) {
      onCardSelect(card, index)
    }
  }

  return (
    <div className={`h-28 backdrop-blur-sm border-b flex items-center justify-center p-2 ${
      isPlayerHand 
        ? 'bg-blue-900/20 border-blue-500/30' 
        : 'bg-red-900/20 border-red-500/30'
    }`}>
      <div className={`text-xs mb-1 absolute top-1 left-1/2 transform -translate-x-1/2 ${
        isPlayerHand ? 'text-blue-300' : 'text-red-300'
      }`}>
        {isPlayerHand ? 'あなたの手札' : 'CPUの手札（見える）'}
      </div>
      <div className="flex gap-2 mt-4">
        {cards.slice(0, 8).map((card, index) => (
          <div key={`${isPlayerHand ? 'player' : 'comp'}-${index}`} className="relative flex-shrink-0">
            <EnhancedCard 
              card={card} 
              size="small"
              showBack={showBack}
              disabled={!canSelectCards}
              isSelected={isPlayerHand && selectedCardIndex === index}
              onClick={() => handleCardClick(card, index)}
              glowEffect={canSelectCards && isPlayerHand}
            />
            
            {canSelectCards && isPlayerHand && (
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-400 animate-pulse border-2 border-white" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}