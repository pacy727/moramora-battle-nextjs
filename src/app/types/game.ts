// ゲームで使用する型定義
export interface ChemicalCard {
    formula: string
    value: string
    unit: 'g' | 'mol' | 'L'
    meltingPoint: number
  }
  
  export interface Topic {
    text: string
    judge: (cards: ChemicalCard[]) => number
    isReverse?: boolean
  }
  
  export interface GameState {
    playerScore: number
    computerScore: number
    playerHand: ChemicalCard[]
    computerHand: ChemicalCard[]
    currentTopic: Topic | null
    playerSelectedCard: ChemicalCard | null
    computerSelectedCard: ChemicalCard | null
    timeLeft: number
    gamePhase: 'waiting' | 'thinking' | 'revealing' | 'finished'
  }
  
  export interface GameConfig {
    TARGET_SCORE: number
    CARDS_PER_HAND: number
    ROUND_TIME: number
    AI_RANDOMNESS: number
  }
  
  export interface JudgeResult {
    winner: 'player' | 'computer' | 'tie'
    explanation: string
    playerScore: number
    computerScore: number
  }
  
  export interface FinalResult {
    winner: 'player' | 'computer' | 'tie'
    message: string
  }