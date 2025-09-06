// src/app/lib/calculationUtils.ts
import { ChemicalCard } from '../types/game'

// 分子量データベース（一般的な化合物）
const MOLECULAR_WEIGHTS: Record<string, number> = {
  'H₂': 2,
  'He': 4,
  'CH₄': 16,
  'NH₃': 17,
  'H₂O': 18,
  'N₂': 28,
  'O₂': 32,
  'CO₂': 44,
  'CaO': 56,
  'NaCl': 58.5,
  'MgO': 40
}

// カードの値を目標の単位に変換
export const convertCardValue = (card: ChemicalCard, targetUnit: 'g' | 'mol' | 'L', targetProperty?: 'meltingPoint'): number => {
  const molecularWeight = MOLECULAR_WEIGHTS[card.formula]
  
  if (targetProperty === 'meltingPoint') {
    return card.meltingPoint
  }

  const currentValue = parseFloat(card.value)
  
  // 現在の単位から目標単位への変換
  switch (card.unit) {
    case 'g':
      if (targetUnit === 'g') return currentValue
      if (targetUnit === 'mol' && molecularWeight) return currentValue / molecularWeight
      if (targetUnit === 'L' && molecularWeight) return (currentValue / molecularWeight) * 22.4
      break
      
    case 'mol':
      if (targetUnit === 'mol') return currentValue
      if (targetUnit === 'g' && molecularWeight) return currentValue * molecularWeight
      if (targetUnit === 'L') return currentValue * 22.4
      break
      
    case 'L':
      if (targetUnit === 'L') return currentValue
      if (targetUnit === 'mol') return currentValue / 22.4
      if (targetUnit === 'g' && molecularWeight) return (currentValue / 22.4) * molecularWeight
      break
  }
  
  return -1 // 変換不可
}

// お題に応じたカードの比較値を計算
export const calculateComparisonValue = (card: ChemicalCard, topicText: string): number => {
  if (topicText.includes('分子量')) {
    if (topicText.includes('小さい')) {
      const value = convertCardValue(card, 'g')
      return value === -1 ? -1 : 1000 - value // 小さいほど高スコア
    } else {
      return convertCardValue(card, 'g') // 大きいほど高スコア
    }
  }
  
  if (topicText.includes('mol数')) {
    if (topicText.includes('小さい')) {
      const value = convertCardValue(card, 'mol')
      return value === -1 ? -1 : 1000 - value
    } else {
      return convertCardValue(card, 'mol')
    }
  }
  
  if (topicText.includes('体積')) {
    if (topicText.includes('小さい')) {
      const value = convertCardValue(card, 'L')
      return value === -1 ? -1 : 1000 - value
    } else {
      return convertCardValue(card, 'L')
    }
  }
  
  if (topicText.includes('融点')) {
    if (topicText.includes('低い')) {
      return 3000 - card.meltingPoint
    } else {
      return card.meltingPoint + 3000
    }
  }
  
  return 0
}

// カードの詳細な変換表示用
export const getCardConversionDisplay = (card: ChemicalCard, topicText: string): string => {
  const molecularWeight = MOLECULAR_WEIGHTS[card.formula]
  
  if (topicText.includes('体積') && card.unit !== 'L') {
    if (card.unit === 'mol') {
      const volume = parseFloat(card.value) * 22.4
      return `${card.formula} ${card.value}mol = ${volume}L`
    } else if (card.unit === 'g' && molecularWeight) {
      const mol = parseFloat(card.value) / molecularWeight
      const volume = mol * 22.4
      return `${card.formula} ${card.value}g = ${mol.toFixed(2)}mol = ${volume.toFixed(1)}L`
    }
  }
  
  if (topicText.includes('mol数') && card.unit !== 'mol') {
    if (card.unit === 'g' && molecularWeight) {
      const mol = parseFloat(card.value) / molecularWeight
      return `${card.formula} ${card.value}g = ${mol.toFixed(2)}mol`
    } else if (card.unit === 'L') {
      const mol = parseFloat(card.value) / 22.4
      return `${card.formula} ${card.value}L = ${mol.toFixed(2)}mol`
    }
  }
  
  if (topicText.includes('分子量') && card.unit === 'g') {
    return `${card.formula} 分子量 ${card.value}g/mol`
  }
  
  if (topicText.includes('融点')) {
    return `${card.formula} 融点 ${card.meltingPoint}℃`
  }
  
  return `${card.formula} ${card.value}${card.unit}`
}

// バトル結果の詳細説明を生成
export const generateBattleExplanation = (
  playerCard: ChemicalCard, 
  computerCard: ChemicalCard, 
  topicText: string
): string => {
  const playerDisplay = getCardConversionDisplay(playerCard, topicText)
  const computerDisplay = getCardConversionDisplay(computerCard, topicText)
  
  const playerValue = calculateComparisonValue(playerCard, topicText)
  const computerValue = calculateComparisonValue(