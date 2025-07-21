import { GameDifficulty } from '@/types/game.ts'

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatDifficulty = (difficulty: string): string => {
  switch (difficulty) {
    case GameDifficulty.EASY:
      return 'Easy'
    case GameDifficulty.MEDIUM:
      return 'Medium'
    case GameDifficulty.HARD:
      return 'Hard'
    case GameDifficulty.EXPERT:
      return 'Expert'
    default:
      return difficulty
  }
}

export const playSound = (path: string, volume: number) => {
  const audio = new Audio(path)
  audio.volume = volume
  audio.play().catch((err) => console.error('Audio playback error:', err))
}
