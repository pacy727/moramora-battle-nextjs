import { ChemicalCard, Topic, GameConfig } from '../types/game'

// 化学カードのデータ
export const CHEMICAL_CARDS: ChemicalCard[] = [
  // 分子量での比較用
  { formula: 'H₂', value: '2', unit: 'g', meltingPoint: -259 },
  { formula: 'He', value: '4', unit: 'g', meltingPoint: -272 },
  { formula: 'CH₄', value: '16', unit: 'g', meltingPoint: -182 },
  { formula: 'H₂O', value: '18', unit: 'g', meltingPoint: 0 },
  { formula: 'NH₃', value: '17', unit: 'g', meltingPoint: -78 },
  { formula: 'N₂', value: '28', unit: 'g', meltingPoint: -210 },
  { formula: 'O₂', value: '32', unit: 'g', meltingPoint: -218 },
  { formula: 'CO₂', value: '44', unit: 'g', meltingPoint: -57 },
  { formula: 'NaCl', value: '58.5', unit: 'g', meltingPoint: 801 },
  { formula: 'CaO', value: '56', unit: 'g', meltingPoint: 2613 },
  
  // モル数での比較用
  { formula: 'H₂O', value: '0.5', unit: 'mol', meltingPoint: 0 },
  { formula: 'CO₂', value: '1.2', unit: 'mol', meltingPoint: -57 },
  { formula: 'NaCl', value: '0.3', unit: 'mol', meltingPoint: 801 },
  { formula: 'O₂', value: '2.5', unit: 'mol', meltingPoint: -218 },
  { formula: 'CH₄', value: '1.8', unit: 'mol', meltingPoint: -182 },
  { formula: 'NH₃', value: '3.0', unit: 'mol', meltingPoint: -78 },
  { formula: 'CaO', value: '0.8', unit: 'mol', meltingPoint: 2613 },
  { formula: 'MgO', value: '1.5', unit: 'mol', meltingPoint: 2852 },
  
  // 体積での比較用（標準状態）
  { formula: 'H₂', value: '11.2', unit: 'L', meltingPoint: -259 },
  { formula: 'CO₂', value: '22.4', unit: 'L', meltingPoint: -57 },
  { formula: 'NH₃', value: '44.8', unit: 'L', meltingPoint: -78 },
  { formula: 'O₂', value: '67.2', unit: 'L', meltingPoint: -218 },
  { formula: 'N₂', value: '89.6', unit: 'L', meltingPoint: -210 },
  { formula: 'CH₄', value: '33.6', unit: 'L', meltingPoint: -182 }
]

// お題のリスト
export const TOPICS: Topic[] = [
  { 
    text: '分子量が最も小さいもの', 
    judge: (cards) => {
      const gCards = cards.filter(c => c.unit === 'g')
      if (gCards.length === 0) return -1
      return Math.min(...gCards.map(c => parseFloat(c.value)))
    },
    isReverse: true
  },
  { 
    text: '分子量が最も大きいもの', 
    judge: (cards) => {
      const gCards = cards.filter(c => c.unit === 'g')
      if (gCards.length === 0) return -1
      return Math.max(...gCards.map(c => parseFloat(c.value)))
    }
  },
  { 
    text: 'mol数が最も小さいもの', 
    judge: (cards) => {
      const molCards = cards.filter(c => c.unit === 'mol')
      if (molCards.length === 0) return -1
      return Math.min(...molCards.map(c => parseFloat(c.value)))
    },
    isReverse: true
  },
  { 
    text: 'mol数が最も大きいもの', 
    judge: (cards) => {
      const molCards = cards.filter(c => c.unit === 'mol')
      if (molCards.length === 0) return -1
      return Math.max(...molCards.map(c => parseFloat(c.value)))
    }
  },
  { 
    text: '体積(L)が最も小さいもの', 
    judge: (cards) => {
      const lCards = cards.filter(c => c.unit === 'L')
      if (lCards.length === 0) return -1
      return Math.min(...lCards.map(c => parseFloat(c.value)))
    },
    isReverse: true
  },
  { 
    text: '体積(L)が最も大きいもの', 
    judge: (cards) => {
      const lCards = cards.filter(c => c.unit === 'L')
      if (lCards.length === 0) return -1
      return Math.max(...lCards.map(c => parseFloat(c.value)))
    }
  },
  { 
    text: '融点が最も低いもの', 
    judge: (cards) => Math.min(...cards.map(c => c.meltingPoint)),
    isReverse: true
  },
  { 
    text: '融点が最も高いもの', 
    judge: (cards) => Math.max(...cards.map(c => c.meltingPoint))
  }
]

// ゲーム設定
export const GAME_CONFIG: GameConfig = {
  TARGET_SCORE: 3,
  CARDS_PER_HAND: 8,
  ROUND_TIME: 10,
  AI_RANDOMNESS: 0.3 // 30%の確率でランダムな選択
}