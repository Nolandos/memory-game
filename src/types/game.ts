export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum WeaponRarity {
  CONSUMER = 'consumer',
  INDUSTRIAL = 'industrial',
  MIL_SPEC = 'mil-spec',
  RESTRICTED = 'restricted',
  CLASSIFIED = 'classified',
  COVERT = 'covert',
  CONTRABAND = 'contraband',
}

export type difficultyConfig = { rows: number; cols: number; pairs: number }

export const DIFFICULTY_CONFIG: Record<GameDifficulty, difficultyConfig> = {
  [GameDifficulty.EASY]: { rows: 3, cols: 4, pairs: 6 },
  [GameDifficulty.MEDIUM]: { rows: 4, cols: 4, pairs: 8 },
  [GameDifficulty.HARD]: { rows: 4, cols: 6, pairs: 12 },
  [GameDifficulty.EXPERT]: { rows: 6, cols: 6, pairs: 18 },
}

export interface TileData {
  id: number
  row: number
  col: number
  value: number | string
  baseWeapon?: string
  name?: string
  isRevealed?: boolean
  isAnimating?: boolean
  isMatched?: boolean
  weaponId?: string
  skinId?: string
  rarity?: string
}

export interface GameBoard {
  tiles: TileData[]
  rows: number
  cols: number
  seed: string | number
  pairs: number
}

export interface ImageLoadStatus {
  [skinId: string]: boolean
}

export interface WeaponSkin {
  id: string
  name: string
  rarity: string
  imageUrl: string
}

export interface Weapon {
  id: number
  baseWeapon: string
  skins: WeaponSkin[]
}

export interface CS2WeaponsData {
  rarities: Record<
    string,
    {
      id: number
      name: string
      color: string
    }
  >
  weapons: Weapon[]
}

export interface Tile {
  id: string
  row: number
  col: number
  x: number
  y: number
  width: number
  height: number
  scaleX: number
  isRevealed: boolean
  isAnimating: boolean
  isMatched: boolean
  value: string | number
  baseWeapon?: string
  name?: string
  weaponId?: string
  skinId?: string
  rarity?: string
}

export interface GameHistoryEntry {
  moveCount: number
  elapsedTime: number
  difficulty: GameDifficulty
  timestamp: number
}

export interface GameState {
  isStarted: boolean
  gameDifficulty: {
    level: GameDifficulty
    levelConfig: difficultyConfig
  }
  board?: GameBoard
  seed?: string | number
  weaponsData?: CS2WeaponsData
  weaponImages?: Record<string, HTMLImageElement>
  imageLoadStatus?: ImageLoadStatus
  moveCount: number
  elapsedTime: number
}
