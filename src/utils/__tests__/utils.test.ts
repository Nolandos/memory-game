import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDifficulty, formatTime, playSound } from '../utils'
import { GameDifficulty } from '@/types/game'

global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  volume: 0,
} as unknown as HTMLAudioElement))

describe('Utils Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00')
      expect(formatTime(5)).toBe('00:05')
      expect(formatTime(30)).toBe('00:30')
      expect(formatTime(60)).toBe('01:00')
      expect(formatTime(90)).toBe('01:30')
      expect(formatTime(3661)).toBe('61:01')
    })

    it('should pad single digits with zero', () => {
      expect(formatTime(9)).toBe('00:09')
      expect(formatTime(69)).toBe('01:09')
    })
  })

  describe('formatDifficulty', () => {
    it('should format known difficulties correctly', () => {
      expect(formatDifficulty(GameDifficulty.EASY)).toBe('Easy')
      expect(formatDifficulty(GameDifficulty.MEDIUM)).toBe('Medium')
      expect(formatDifficulty(GameDifficulty.HARD)).toBe('Hard')
      expect(formatDifficulty(GameDifficulty.EXPERT)).toBe('Expert')
    })

    it('should return original string for unknown difficulty', () => {
      expect(formatDifficulty('unknown')).toBe('unknown')
      expect(formatDifficulty('custom')).toBe('custom')
    })
  })

  describe('playSound', () => {
    it('should create Audio instance and play sound', () => {
      const testPath = '/test/sound.mp3'
      const testVolume = 0.5

      playSound(testPath, testVolume)

      expect(global.Audio).toHaveBeenCalledWith(testPath)
      const audioInstance = vi.mocked(global.Audio).mock.results[0].value
      expect(audioInstance.volume).toBe(testVolume)
      expect(audioInstance.play).toHaveBeenCalled()
    })

    it('should handle audio playback errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockAudio = {
        play: vi.fn().mockRejectedValue(new Error('Audio error')),
        volume: 0,
      } as unknown as HTMLAudioElement
      vi.mocked(global.Audio).mockReturnValue(mockAudio)

      playSound('/test/sound.mp3', 0.5)

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(consoleSpy).toHaveBeenCalledWith('Audio playback error:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
