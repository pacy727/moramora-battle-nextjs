// src/app/lib/gameData.ts (修正版 - 正しいお題とカードデータ)
import { ChemicalCard, Topic, GameConfig } from '../types/game'

// 化学カードのデータ
export const CHEMICAL_CARDS: ChemicalCard[] = [
  // mol数カード（これが表示されるカード）
  { formula: 'H₂', value: '2', unit: 'mol', meltingPoint: -259 },
  { formula: 'He', value: '1', unit: 'mol', meltingPoint: -272 },
  { formula: 'CH₄', value: '1.5', unit: 'mol', meltingPoint: -182 },
  { formula: 'H₂O', value: '3', unit: 'mol', meltingPoint: 0 },
  { formula: 'NH₃', value: '2.5', unit: 'mol', meltingPoint: -78 },
  { formula: 'N₂', value: '1', unit: 'mol', meltingPoint: -210 },
  { formula: 'O₂', value: '1.2', unit: 'mol', meltingPoint: -218 },
  { formula: 'CO₂', value: '0.8', unit: 'mol', meltingPoint: -57 },
  
  // 分子量カード（g/mol単位）
  { formula: 'H₂', value: '2', unit: 'g', meltingPoint: -259 },
  { formula: 'He', value: '4', unit: 'g', meltingPoint: -272 },
  { formula: 'CH₄', value: '16', unit: 'g', meltingPoint: -182 },
  { formula: 'H₂O', value: '18', unit: 'g', meltingPoint: 0 },
  { formula: 'NH₃', value: '17', unit: 'g', meltingPoint: -78 },
  { formula: 'N₂', value: '28', unit: 'g', meltingPoint: -210 },
  { formula: 'O₂', value: '32', unit: 'g', meltingPoint: -218 },
  { formula: 'CO₂', value: '44', unit: 'g', meltingPoint: -57 },
  
  // 体積カード（L単位）
  { formula: 'H₂', value: '44.8', unit: 'L', meltingPoint: -259 },
  { formula: 'CO₂', value: '17.92', unit: 'L', meltingPoint: -57 },
  { formula: 'NH₃', value: '56', unit: 'L', meltingPoint: -78 },
  { formula: 'O₂', value: '26.88', unit: 'L', meltingPoint: -218 },
  { formula: 'N₂', value: '22.4', unit: 'L', meltingPoint: -210 },
  { formula: 'CH₄', value: '33.6', unit: 'L', meltingPoint: -182 }
]

// お題のリスト（修正版）
export const TOPICS: Topic[] = [
  { 
    text: '最も質量の小さいもの', 
    judge: (cards) => {
      const masses = cards.map(c => {
        // mol数から質量を計算
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'mol') return parseFloat(c.value) * mw
        if (c.unit === 'g') return parseFloat(c.value)
        return parseFloat(c.value)
      })
      return Math.min(...masses)
    },
    isReverse: true
  },
  { 
    text: '最も質量の大きいもの', 
    judge: (cards) => {
      const masses = cards.map(c => {
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'mol') return parseFloat(c.value) * mw
        if (c.unit === 'g') return parseFloat(c.value)
        return parseFloat(c.value)
      })
      return Math.max(...masses)
    }
  },
  { 
    text: '最もmol数の小さいもの', 
    judge: (cards) => {
      const mols = cards.map(c => {
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'mol') return parseFloat(c.value)
        if (c.unit === 'g') return parseFloat(c.value) / mw
        if (c.unit === 'L') return parseFloat(c.value) / 22.4
        return parseFloat(c.value)
      })
      return Math.min(...mols)
    },
    isReverse: true
  },
  { 
    text: '最もmol数の大きいもの', 
    judge: (cards) => {
      const mols = cards.map(c => {
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'mol') return parseFloat(c.value)
        if (c.unit === 'g') return parseFloat(c.value) / mw
        if (c.unit === 'L') return parseFloat(c.value) / 22.4
        return parseFloat(c.value)
      })
      return Math.max(...mols)
    }
  },
  { 
    text: '最も体積の小さいもの', 
    judge: (cards) => {
      const volumes = cards.map(c => {
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'L') return parseFloat(c.value)
        if (c.unit === 'mol') return parseFloat(c.value) * 22.4
        if (c.unit === 'g') return (parseFloat(c.value) / mw) * 22.4
        return parseFloat(c.value)
      })
      return Math.min(...volumes)
    },
    isReverse: true
  },
  { 
    text: '最も体積の大きいもの', 
    judge: (cards) => {
      const volumes = cards.map(c => {
        const molecularWeights: Record<string, number> = {
          'H₂': 2, 'He': 4, 'CH₄': 16, 'H₂O': 18, 'NH₃': 17, 'N₂': 28, 'O₂': 32, 'CO₂': 44
        }
        const mw = molecularWeights[c.formula] || 1
        if (c.unit === 'L') return parseFloat(c.value)
        if (c.unit === 'mol') return parseFloat(c.value) * 22.4
        if (c.unit === 'g') return (parseFloat(c.value) / mw) * 22.4
        return parseFloat(c.value)
      })
      return Math.max(...volumes)
    }
  },
  { 
    text: '最も融点の低いもの', 
    judge: (cards) => Math.min(...cards.map(c => c.meltingPoint)),
    isReverse: true
  },
  { 
    text: '最も融点の高いもの', 
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