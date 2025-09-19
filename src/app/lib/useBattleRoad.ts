// src/app/lib/useBattleRoad.ts - バトルロード状態管理（修正版）
'use client'

import { useState, useCallback } from 'react'

export interface BattleRoadState {
  currentElement: number // 0-53 (H-Xe)
  wins: number
  life: number
  totalWins: number // 通算勝利数
}

export const useBattleRoad = () => {
  const [battleRoadState, setBattleRoadState] = useState<BattleRoadState>({
    currentElement: 0, // Hから開始
    wins: 0,
    life: 2,
    totalWins: 0
  })

  // 初回バトル開始フラグ
  const [hasStartedFirstBattle, setHasStartedFirstBattle] = useState(false)

  // 初回バトル開始
  const startFirstBattle = useCallback(() => {
    console.log('初回バトル開始フラグを設定')
    setHasStartedFirstBattle(true)
  }, [])

  // 勝利時の処理
  const handleVictory = useCallback(() => {
    console.log('勝利処理実行')
    setBattleRoadState(prev => ({
      ...prev,
      currentElement: prev.currentElement + 1,
      wins: prev.wins + 1,
      totalWins: prev.totalWins + 1
    }))
  }, [])

  // 敗北時の処理
  const handleDefeat = useCallback(() => {
    console.log('敗北処理実行')
    setBattleRoadState(prev => ({
      ...prev,
      life: prev.life - 1
    }))
  }, [])

  // ゲームオーバー時の処理（タイトル戻り時の完全リセット）
  const resetToTitle = useCallback(() => {
    console.log('タイトルに戻る - 全状態リセット')
    setBattleRoadState({
      currentElement: 0,
      wins: 0,
      life: 2,
      totalWins: 0 // 抜け道防止で完全リセット
    })
    setHasStartedFirstBattle(false) // 初回フラグもリセット
  }, [])

  // ライフ回復（リベンジ時は元素とスコアはそのまま）
  const retryBattle = useCallback(() => {
    console.log('リベンジ - 同じ元素と再戦')
    // ライフは減ったまま、同じ元素と再戦
    // 他の状態は変更なし
  }, [])

  // ゲームクリア判定
  const isGameClear = useCallback(() => {
    return battleRoadState.currentElement >= 54 // Xe(54番)まで到達
  }, [battleRoadState.currentElement])

  // 現在の元素名を取得
  const getCurrentElementSymbol = useCallback(() => {
    const elements = [
      'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
      'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
      'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
      'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
      'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
      'Sb', 'Te', 'I', 'Xe'
    ]
    return elements[battleRoadState.currentElement] || 'Unknown'
  }, [battleRoadState.currentElement])

  return {
    battleRoadState,
    hasStartedFirstBattle,
    startFirstBattle,
    handleVictory,
    handleDefeat,
    resetToTitle,
    retryBattle,
    isGameClear,
    getCurrentElementSymbol
  }
}