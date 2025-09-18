// src/app/components/index.ts (更新版)
// コンポーネントの統一エクスポートファイル

// カード関連
export { EnhancedCard } from './Card/EnhancedCard'

// フィードバック関連
export { 
  VisualFeedbackSystem,
  FloatingParticles,
  Confetti,
  ScoreUpAnimation,
  BackgroundEffects
} from './Feedback/VisualFeedbackSystem'

// ゲーム関連コンポーネント（新規追加）
export { GameHeader } from './Game/GameHeader'
export { HandDisplay } from './Game/HandDisplay'
export { BattleArena } from './Game/BattleArena'
export { GameEndModal } from './Game/GameEndModal'

// ギャラリー関連
export { CardGallery } from './CardGallery/CardGallery'

// 画面コンポーネント
export { default as EnhancedTitleScreen } from './TitleScreen'
export { default as EnhancedGameScreen } from './GameScreen'
export { default as ShuffleScreen } from './ShuffleScreen'
export { default as BattlefieldGameScreen } from './BattlefieldGameScreen'

// 型定義をエクスポート
export type { 
  FeedbackMessage,
  VisualFeedbackSystemProps,
  FloatingParticlesProps,
  ConfettiProps,
  ScoreUpAnimationProps,
  BackgroundEffectsProps
} from '../types/feedback'