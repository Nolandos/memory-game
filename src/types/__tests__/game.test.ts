import { describe, expect, it } from 'vitest'
import { DIFFICULTY_CONFIG, GameDifficulty, WeaponRarity } from '../game'

describe('Game Types', () => {
  describe('GameDifficulty enum', () => {
    it('should have all difficulty levels', () => {
      expect(GameDifficulty.EASY).toBe('easy')
      expect(GameDifficulty.MEDIUM).toBe('medium')
      expect(GameDifficulty.HARD).toBe('hard')
      expect(GameDifficulty.EXPERT).toBe('expert')
    })

    it('should have 4 difficulty levels', () => {
      const difficultyLevels = Object.values(GameDifficulty)
      expect(difficultyLevels).toHaveLength(4)
    })
  })

  describe('WeaponRarity enum', () => {
    it('should have all rarity levels', () => {
      expect(WeaponRarity.CONSUMER).toBe('consumer')
      expect(WeaponRarity.INDUSTRIAL).toBe('industrial')
      expect(WeaponRarity.MIL_SPEC).toBe('mil-spec')
      expect(WeaponRarity.RESTRICTED).toBe('restricted')
      expect(WeaponRarity.CLASSIFIED).toBe('classified')
      expect(WeaponRarity.COVERT).toBe('covert')
      expect(WeaponRarity.CONTRABAND).toBe('contraband')
    })

    it('should have 7 rarity levels', () => {
      const rarityLevels = Object.values(WeaponRarity)
      expect(rarityLevels).toHaveLength(7)
    })
  })

  describe('DIFFICULTY_CONFIG', () => {
    it('should have configuration for all difficulty levels', () => {
      expect(DIFFICULTY_CONFIG[GameDifficulty.EASY]).toBeDefined()
      expect(DIFFICULTY_CONFIG[GameDifficulty.MEDIUM]).toBeDefined()
      expect(DIFFICULTY_CONFIG[GameDifficulty.HARD]).toBeDefined()
      expect(DIFFICULTY_CONFIG[GameDifficulty.EXPERT]).toBeDefined()
    })

    it('should have proper board dimensions for easy level', () => {
      const easyConfig = DIFFICULTY_CONFIG[GameDifficulty.EASY]
      expect(easyConfig.rows).toBe(3)
      expect(easyConfig.cols).toBe(4)
      expect(easyConfig.pairs).toBe(6)

      expect(easyConfig.rows * easyConfig.cols).toBe(easyConfig.pairs * 2)
    })

    it('should have proper board dimensions for medium level', () => {
      const mediumConfig = DIFFICULTY_CONFIG[GameDifficulty.MEDIUM]
      expect(mediumConfig.rows).toBe(4)
      expect(mediumConfig.cols).toBe(4)
      expect(mediumConfig.pairs).toBe(8)

      expect(mediumConfig.rows * mediumConfig.cols).toBe(mediumConfig.pairs * 2)
    })

    it('should have proper board dimensions for hard level', () => {
      const hardConfig = DIFFICULTY_CONFIG[GameDifficulty.HARD]
      expect(hardConfig.rows).toBe(4)
      expect(hardConfig.cols).toBe(6)
      expect(hardConfig.pairs).toBe(12)

      expect(hardConfig.rows * hardConfig.cols).toBe(hardConfig.pairs * 2)
    })

    it('should have proper board dimensions for expert level', () => {
      const expertConfig = DIFFICULTY_CONFIG[GameDifficulty.EXPERT]
      expect(expertConfig.rows).toBe(6)
      expect(expertConfig.cols).toBe(6)
      expect(expertConfig.pairs).toBe(18)

      expect(expertConfig.rows * expertConfig.cols).toBe(expertConfig.pairs * 2)
    })

    it('should have increasing difficulty progression', () => {
      const easy = DIFFICULTY_CONFIG[GameDifficulty.EASY]
      const medium = DIFFICULTY_CONFIG[GameDifficulty.MEDIUM]
      const hard = DIFFICULTY_CONFIG[GameDifficulty.HARD]
      const expert = DIFFICULTY_CONFIG[GameDifficulty.EXPERT]

      expect(easy.pairs).toBeLessThan(medium.pairs)
      expect(medium.pairs).toBeLessThan(hard.pairs)
      expect(hard.pairs).toBeLessThan(expert.pairs)

      expect(easy.rows * easy.cols).toBeLessThan(medium.rows * medium.cols)
      expect(medium.rows * medium.cols).toBeLessThan(hard.rows * hard.cols)
      expect(hard.rows * hard.cols).toBeLessThan(expert.rows * expert.cols)
    })
  })
})
