// src/app/components/index.ts (修正版)
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

// ギャラリー関連
export { CardGallery } from './CardGallery/CardGallery'

// 画面コンポーネント
export { default as EnhancedTitleScreen } from './TitleScreen'
export { default as EnhancedGameScreen } from './GameScreen'

// 型定義をエクスポート（別ファイルから）
export type { 
  FeedbackMessage,
  VisualFeedbackSystemProps,
  FloatingParticlesProps,
  ConfettiProps,
  ScoreUpAnimationProps,
  BackgroundEffectsProps
} from '../types/feedback'