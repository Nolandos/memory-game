import { describe, it, expect } from 'vitest'
import { boardConfig, storageKeys } from '../constats'

describe('Constants', () => {
  describe('boardConfig', () => {
    it('should have all required board configuration properties', () => {
      expect(boardConfig).toHaveProperty('tileGap')
      expect(boardConfig).toHaveProperty('tileBorderRadius')
      expect(boardConfig).toHaveProperty('width')
      expect(boardConfig).toHaveProperty('height')
      expect(boardConfig).toHaveProperty('maxFlippedTiles')
      expect(boardConfig).toHaveProperty('flipBackDelay')
      expect(boardConfig).toHaveProperty('parallaxStrength')
      expect(boardConfig).toHaveProperty('maxContainerWidth')
      expect(boardConfig).toHaveProperty('aspectRatio')
    })

    it('should have reasonable default values', () => {
      expect(boardConfig.tileGap).toBe(10)
      expect(boardConfig.maxFlippedTiles).toBe(2)
      expect(boardConfig.flipBackDelay).toBe(1000)
      expect(boardConfig.width).toBeGreaterThan(0)
      expect(boardConfig.height).toBeGreaterThan(0)
      expect(boardConfig.aspectRatio).toBeCloseTo(1.6)
    })

    it('should maintain proper aspect ratio', () => {
      const calculatedRatio = boardConfig.width / boardConfig.height
      expect(calculatedRatio).toBeCloseTo(boardConfig.aspectRatio)
    })
  })

  describe('storageKeys', () => {
    it('should have all required storage keys', () => {
      expect(storageKeys).toHaveProperty('MOVE_COUNT')
      expect(storageKeys).toHaveProperty('ELAPSED_TIME')
      expect(storageKeys).toHaveProperty('MATCHED_TILES')
      expect(storageKeys).toHaveProperty('GAME_HISTORY')
    })

    it('should have unique storage key values', () => {
      const values = Object.values(storageKeys)
      const uniqueValues = [...new Set(values)]
      expect(values.length).toBe(uniqueValues.length)
    })

    it('should have descriptive storage key names', () => {
      expect(storageKeys.MOVE_COUNT).toContain('move-count')
      expect(storageKeys.ELAPSED_TIME).toContain('elapsed-time')
      expect(storageKeys.MATCHED_TILES).toContain('matched-tiles')
      expect(storageKeys.GAME_HISTORY).toContain('history')
    })

    it('should prefix all keys with app identifier', () => {
      const values = Object.values(storageKeys)
      values.forEach(key => {
        expect(key).toMatch(/^memory-game-/)
      })
    })
  })
})
