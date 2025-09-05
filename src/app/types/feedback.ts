// src/app/types/feedback.ts
export interface FeedbackMessage {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }
  
  export interface VisualFeedbackSystemProps {
    messages: FeedbackMessage[]
    onMessageDismiss: (id: string) => void
  }
  
  export interface FloatingParticlesProps {
    count?: number
    color?: string
    size?: 'small' | 'medium' | 'large'
  }
  
  export interface ConfettiProps {
    active: boolean
    duration?: number
  }
  
  export interface ScoreUpAnimationProps {
    show: boolean
    value: number
    position: { x: number; y: number }
  }
  
  export interface BackgroundEffectsProps {
    intensity?: 'low' | 'medium' | 'high'
    theme?: 'default' | 'victory' | 'defeat'
  }