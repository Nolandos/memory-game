import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../game'
import { GameDifficulty } from '@/types/game'

global.fetch = vi.fn()

const mockLocation = {
  href: 'http://localhost:3000/',
  search: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

window.history.replaceState = vi.fn()

describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    vi.resetAllMocks()
    vi.useFakeTimers()

    mockLocation.href = 'http://localhost:3000/'

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    })
  })

  it('should have correct initial state', () => {
    const gameStore = useGameStore()
    expect(gameStore.gameState.isStarted).toBeFalsy()
    expect(gameStore.gameState.moveCount).toBe(0)
    expect(gameStore.gameState.elapsedTime).toBe(0)
    expect(gameStore.gameState.gameDifficulty.level).toBe(GameDifficulty.MEDIUM)
  })

  it('should start a game', () => {
    const gameStore = useGameStore()
    gameStore.startGame()

    expect(gameStore.gameState.isStarted).toBeTruthy()
    expect(gameStore.gameState.board).toBeDefined()
    expect(gameStore.gameState.seed).toBeDefined()
    expect(window.history.replaceState).toHaveBeenCalled()
  })

  it('should increment move count', () => {
    const gameStore = useGameStore()
    gameStore.startGame()

    expect(gameStore.gameState.moveCount).toBe(0)
    gameStore.incrementMoveCount()
    expect(gameStore.gameState.moveCount).toBe(1)
    expect(sessionStorage.setItem).toHaveBeenCalled()
  })

  it('should end game and reset state', () => {
    const gameStore = useGameStore()
    gameStore.startGame()
    gameStore.incrementMoveCount()

    expect(gameStore.gameState.isStarted).toBeTruthy()
    expect(gameStore.gameState.moveCount).toBe(1)

    gameStore.endGame()

    expect(gameStore.gameState.isStarted).toBeFalsy()
    expect(gameStore.gameState.moveCount).toBe(0)
    expect(gameStore.gameState.board).toBeUndefined()
  })

  it('should start and stop game timer', () => {
    const gameStore = useGameStore()
    gameStore.startGame()
    gameStore.startGameTimer()

    vi.advanceTimersByTime(5000)

    expect(gameStore.gameState.elapsedTime).toBe(5)

    gameStore.stopGameTimer()

    vi.advanceTimersByTime(5000)

    expect(gameStore.gameState.elapsedTime).toBe(5)
  })

  it('should generate board with different difficulties', () => {
    const gameStore = useGameStore()

    gameStore.startGame({ difficulty: GameDifficulty.EASY })
    expect(gameStore.gameState.gameDifficulty.level).toBe(GameDifficulty.EASY)
    expect(gameStore.gameState.board?.tiles.length).toBeGreaterThan(0)

    gameStore.startGame({ difficulty: GameDifficulty.HARD })
    expect(gameStore.gameState.gameDifficulty.level).toBe(GameDifficulty.HARD)
    expect(gameStore.gameState.board?.tiles.length).toBeGreaterThan(0)
  })

  it('should use custom seed when starting game', () => {
    const gameStore = useGameStore()
    const customSeed = 'test-seed-123'

    gameStore.startGame({ customSeed })

    expect(gameStore.gameState.seed).toBe(customSeed)
    expect(gameStore.gameState.board?.seed).toBe(customSeed)
  })
})
