import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {
  type CS2WeaponsData,
  DIFFICULTY_CONFIG,
  type GameBoard,
  GameDifficulty,
  type GameHistoryEntry,
  type GameState,
  type ImageLoadStatus,
  type TileData,
  type Weapon,
  type WeaponSkin,
} from '@/types/game'
import seedrandom from 'seedrandom'
import { storageKeys } from '@/utils/constats.ts'

export const initialGameState: GameState = {
  isStarted: false,
  gameDifficulty: {
    level: GameDifficulty.MEDIUM,
    levelConfig: DIFFICULTY_CONFIG[GameDifficulty.MEDIUM],
  },
  board: undefined,
  seed: undefined,
  weaponImages: {},
  weaponsData: undefined,
  imageLoadStatus: {},
  moveCount: 0,
  elapsedTime: 0,
}

const generateBoard = (
  difficulty: GameDifficulty,
  customSeed?: string | number,
  weaponsData?: CS2WeaponsData,
): GameBoard => {
  const seed = customSeed || Date.now().toString()
  const config = DIFFICULTY_CONFIG[difficulty]
  const { rows, cols, pairs } = config
  const rng = seedrandom(seed.toString())

  let weaponPairs: Array<{
    id: string
    weaponName: string
    skinName: string
    displayName: string
    rarity: string
    weaponId: string
    skinId: string
  }> = []

  if (weaponsData && weaponsData.weapons && weaponsData.weapons.length > 0) {
    const allPossiblePairs: Array<{ weapon: Weapon; skin: WeaponSkin }> = []

    weaponsData.weapons.forEach((weapon) => {
      if (weapon.skins && weapon.skins.length > 0) {
        weapon.skins.forEach((skin) => {
          allPossiblePairs.push({ weapon, skin })
        })
      }
    })

    for (let i = allPossiblePairs.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[allPossiblePairs[i], allPossiblePairs[j]] = [allPossiblePairs[j], allPossiblePairs[i]]
    }
    const selectedPairs = allPossiblePairs.slice(0, pairs)

    weaponPairs = selectedPairs.map((pair) => ({
      id: `${pair.weapon.id}-${pair.skin.id}`,
      weaponName: pair.weapon.baseWeapon,
      skinName: pair.skin.name,
      displayName: `${pair.weapon.baseWeapon} | ${pair.skin.name}`,
      rarity: pair.skin.rarity,
      weaponId: pair.weapon.id.toString(),
      skinId: pair.skin.id,
    }))

    if (weaponPairs.length < pairs) {
      const missingPairs = pairs - weaponPairs.length
      for (let i = 0; i < missingPairs; i++) {
        const fallbackId = `fallback-${i + 1}`
        weaponPairs.push({
          id: fallbackId,
          weaponName: `Weapon ${i + 1}`,
          skinName: `Skin ${i + 1}`,
          displayName: `Weapon ${i + 1} | Skin ${i + 1}`,
          rarity: 'consumer',
          weaponId: fallbackId,
          skinId: fallbackId,
        })
      }
    }
  } else {
    for (let i = 1; i <= pairs; i++) {
      const fallbackId = `fallback-${i}`
      weaponPairs.push({
        id: fallbackId,
        weaponName: `Weapon ${i}`,
        skinName: `Skin ${i}`,
        displayName: `${i}`,
        rarity: 'consumer',
        weaponId: fallbackId,
        skinId: fallbackId,
      })
    }
  }

  const allTilesValues = []
  for (const weaponPair of weaponPairs) {
    allTilesValues.push(weaponPair)
    allTilesValues.push({ ...weaponPair })
  }

  for (let i = allTilesValues.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[allTilesValues[i], allTilesValues[j]] = [allTilesValues[j], allTilesValues[i]]
  }

  const tiles: TileData[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      if (index < allTilesValues.length) {
        const weaponInfo = allTilesValues[index]
        tiles.push({
          id: index,
          row,
          col,
          value: weaponInfo.displayName,
          baseWeapon: weaponInfo.weaponName,
          name: weaponInfo.skinName,
          isRevealed: false,
          isAnimating: false,
          isMatched: false,
          weaponId: weaponInfo.id,
          skinId: weaponInfo.skinId,
          rarity: weaponInfo.rarity,
        })
      }
    }
  }

  return {
    tiles,
    rows,
    cols,
    seed,
    pairs,
  }
}

const getDifficultyId = (difficulty: GameDifficulty): number => {
  const difficultyMap: Record<GameDifficulty, number> = {
    [GameDifficulty.EASY]: 1,
    [GameDifficulty.MEDIUM]: 2,
    [GameDifficulty.HARD]: 3,
    [GameDifficulty.EXPERT]: 4,
  }
  return difficultyMap[difficulty]
}

const getDifficultyFromId = (id: number): GameDifficulty => {
  switch (id) {
    case 1:
      return GameDifficulty.EASY
    case 2:
      return GameDifficulty.MEDIUM
    case 3:
      return GameDifficulty.HARD
    case 4:
      return GameDifficulty.EXPERT
    default:
      return GameDifficulty.MEDIUM
  }
}

const generateCombinedSeed = (difficulty: GameDifficulty, seed: string | number): string => {
  const difficultyId = getDifficultyId(difficulty)
  return `${difficultyId}&${seed}`
}

const parseCombinedSeed = (combinedSeed: string): { difficulty: GameDifficulty; seed: string } => {
  try {
    const [difficultyPart, seedPart] = combinedSeed.split('&')
    const difficultyId = Number(difficultyPart)

    if (isNaN(difficultyId) || !seedPart) {
      return { difficulty: GameDifficulty.MEDIUM, seed: combinedSeed }
    }

    return {
      difficulty: getDifficultyFromId(difficultyId),
      seed: seedPart,
    }
  } catch (e) {
    console.error(e)
    return { difficulty: GameDifficulty.MEDIUM, seed: combinedSeed }
  }
}

const updateUrlWithSeed = (seed: string | number, difficulty: GameDifficulty) => {
  const combinedSeed = generateCombinedSeed(difficulty, seed)
  const url = new URL(window.location.href)
  url.searchParams.set('seed', combinedSeed)
  window.history.replaceState({}, '', url.toString())
}

const clearSeedFromUrl = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('seed')
  window.history.replaceState({}, '', url.toString())
}

export const getSeedFromUrl = (): { seed?: string; difficulty?: GameDifficulty } => {
  const url = new URL(window.location.href)
  const combinedSeed = url.searchParams.get('seed')

  if (!combinedSeed) {
    return { seed: undefined, difficulty: undefined }
  }

  if (combinedSeed.includes('&')) {
    const { difficulty, seed } = parseCombinedSeed(combinedSeed)
    return { seed, difficulty }
  }

  return { seed: combinedSeed, difficulty: GameDifficulty.MEDIUM }
}

const loadCS2WeaponsData = async (): Promise<CS2WeaponsData | undefined> => {
  try {
    const response = await fetch('/data/cs2-weapons.json')
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading CS2 weapon data:', error)
    return undefined
  }
}

const preloadWeaponImages = async (
  weaponsData: CS2WeaponsData,
): Promise<{
  weaponImages: Record<string, HTMLImageElement>
  imageLoadStatus: ImageLoadStatus
}> => {
  const weaponImages: Record<string, HTMLImageElement> = {}
  const imageLoadStatus: ImageLoadStatus = {}

  if (!weaponsData || !weaponsData.weapons || weaponsData.weapons.length === 0) {
    console.warn('No weapons data for loading images')
    return { weaponImages, imageLoadStatus }
  }
  const skinIds = new Set<string>()

  weaponsData.weapons.forEach((weapon) => {
    if (weapon.skins && weapon.skins.length > 0) {
      weapon.skins.forEach((skin) => {
        if (skin.id) {
          skinIds.add(skin.id)
        }
      })
    }
  })

  const loadPromises: Promise<void>[] = []

  skinIds.forEach((skinId) => {
    const imageUrl = `/images/weapons/${skinId}.webp`

    const img = new Image()
    weaponImages[skinId] = img
    imageLoadStatus[skinId] = false

    const promise = new Promise<void>((resolve) => {
      img.onload = () => {
        imageLoadStatus[skinId] = true
        resolve()
      }

      img.onerror = () => {
        imageLoadStatus[skinId] = false
        console.warn(`Failed to load image: ${skinId}`)
        resolve()
      }

      img.src = imageUrl
    })

    loadPromises.push(promise)
  })

  await Promise.all(loadPromises)

  return { weaponImages, imageLoadStatus }
}

export const useGameStore = defineStore('game', () => {
  const { seed: seedFromUrl, difficulty: difficultyFromUrl } = getSeedFromUrl()
  const initialDifficulty = difficultyFromUrl || GameDifficulty.MEDIUM
  let timerInterval: number | null = null
  const gameState: Ref<GameState> = ref({
    ...initialGameState,
    seed: seedFromUrl,
    isStarted: !!seedFromUrl,
    gameDifficulty: {
      level: initialDifficulty,
      levelConfig: DIFFICULTY_CONFIG[initialDifficulty],
    },
  })

  const saveGameStateToStorage = () => {
    if (gameState.value.isStarted) {
      sessionStorage.setItem(storageKeys.MOVE_COUNT, gameState.value.moveCount.toString())
      sessionStorage.setItem(storageKeys.ELAPSED_TIME, gameState.value.elapsedTime.toString())
    }
  }
  const loadGameStateFromStorage = () => {
    const moveCount = sessionStorage.getItem(storageKeys.MOVE_COUNT)
    const elapsedTime = sessionStorage.getItem(storageKeys.ELAPSED_TIME)
    const matchedTilesJson = sessionStorage.getItem(storageKeys.MATCHED_TILES)

    if (moveCount !== null) {
      gameState.value.moveCount = parseInt(moveCount, 10)
    }

    if (elapsedTime !== null) {
      gameState.value.elapsedTime = parseInt(elapsedTime, 10)
    }

    if (matchedTilesJson && gameState.value.board) {
      try {
        const matchedWeaponIds = JSON.parse(matchedTilesJson) as string[]

        gameState.value.board.tiles.forEach((tile) => {
          if (tile.weaponId && matchedWeaponIds.includes(tile.weaponId)) {
            tile.isMatched = true
            tile.isRevealed = true
          }
        })
      } catch (error) {
        console.error('Error parsing matched tiles data:', error)
      }
    }

    if (
      gameState.value.isStarted &&
      gameState.value.moveCount > 0 &&
      gameState.value.elapsedTime > 0
    ) {
      startGameTimer()
    }
  }
  const clearGameStateFromStorage = () => {
    sessionStorage.removeItem(storageKeys.MOVE_COUNT)
    sessionStorage.removeItem(storageKeys.ELAPSED_TIME)
    sessionStorage.removeItem(storageKeys.MATCHED_TILES)
  }
  const saveGameToHistory = () => {
    try {
      const historyJson = localStorage.getItem(storageKeys.GAME_HISTORY)
      let gameHistory: GameHistoryEntry[] = historyJson ? JSON.parse(historyJson) : []

      gameHistory = [
        ...gameHistory,
        {
          moveCount: gameState.value.moveCount,
          elapsedTime: gameState.value.elapsedTime,
          difficulty: gameState.value.gameDifficulty.level,
          timestamp: Date.now(),
        },
      ]

      localStorage.setItem(storageKeys.GAME_HISTORY, JSON.stringify(gameHistory))
    } catch (error) {
      console.error('Error while saving game history:', error)
    }
  }
  const incrementMoveCount = () => {
    gameState.value.moveCount++
    saveGameStateToStorage()
  }
  const startGameTimer = () => {
    if (timerInterval === null) {
      const savedTime = sessionStorage.getItem(storageKeys.ELAPSED_TIME)
      if (savedTime !== null && gameState.value.isStarted) {
        gameState.value.elapsedTime = parseInt(savedTime, 10)
      } else {
        gameState.value.elapsedTime = 0
      }

      timerInterval = window.setInterval(() => {
        gameState.value.elapsedTime++
        saveGameStateToStorage()
      }, 1000)
    }
  }
  const stopGameTimer = () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
  const endGame = () => {
    stopGameTimer()
    clearSeedFromUrl()
    clearGameStateFromStorage()
    gameState.value = {
      ...initialGameState,
      weaponImages: gameState.value.weaponImages,
      weaponsData: gameState.value.weaponsData,
      imageLoadStatus: gameState.value.imageLoadStatus,
      seed: undefined,
    }
  }
  const startGame = (options?: { customSeed?: string; difficulty?: GameDifficulty }) => {
    const difficulty = options?.difficulty || gameState.value.gameDifficulty.level
    clearGameStateFromStorage()
    if (difficulty !== gameState.value.gameDifficulty.level) {
      gameState.value.gameDifficulty = {
        level: difficulty,
        levelConfig: DIFFICULTY_CONFIG[difficulty],
      }
    }

    gameState.value.moveCount = 0
    gameState.value.elapsedTime = 0
    const weaponsData = gameState.value.weaponsData
    const board = generateBoard(difficulty, options?.customSeed, weaponsData)
    gameState.value.board = board
    gameState.value.seed = board.seed
    gameState.value.isStarted = true
    updateUrlWithSeed(board.seed, difficulty)
  }
  const loadData = async () => {
    try {
      const data = await loadCS2WeaponsData()
      if (data) {
        gameState.value.weaponsData = data
        const { weaponImages, imageLoadStatus } = await preloadWeaponImages(data)

        gameState.value.weaponImages = weaponImages
        gameState.value.imageLoadStatus = imageLoadStatus
        if (seedFromUrl) {
          gameState.value.board = generateBoard(initialDifficulty, seedFromUrl, data)
        }
        if (gameState.value.isStarted && gameState.value.moveCount > 0) {
          startGameTimer()
        }
      } else {
        if (seedFromUrl) {
          gameState.value.board = generateBoard(initialDifficulty, seedFromUrl, undefined)
        }
      }

      loadGameStateFromStorage()
    } catch (err) {
      console.error('Error while loading game state:', err)
    }
  }

  const updateMatchedTiles = (matchedTileIds: string[]) => {
    if (gameState.value.board) {
      const existingMatchedTilesJson = sessionStorage.getItem(storageKeys.MATCHED_TILES)
      let existingMatchedTiles: string[] = []

      if (existingMatchedTilesJson) {
        try {
          existingMatchedTiles = JSON.parse(existingMatchedTilesJson) as string[]
        } catch (e) {
          console.error('Error parsing matched tiles:', e)
        }
      }

      const updatedMatchedTiles = [...new Set([...existingMatchedTiles, ...matchedTileIds])]
      sessionStorage.setItem(storageKeys.MATCHED_TILES, JSON.stringify(updatedMatchedTiles))
    }
  }

  return {
    gameState,
    loadData,
    startGame,
    endGame,
    incrementMoveCount,
    startGameTimer,
    stopGameTimer,
    saveGameToHistory,
    updateMatchedTiles,
  }
})
