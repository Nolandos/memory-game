<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import anime from 'animejs/lib/anime.es.js'
import { v4 as uuidv4 } from 'uuid'
import GameCompletedModal from '../modals/GameCompletedModal.vue'
import { boardConfig } from '@/utils/constats.ts'
import { type Tile, WeaponRarity } from '@/types/game.ts'
import { formatTime, playSound } from '@/utils/utils.ts'

const store = useGameStore()
const { endGame, incrementMoveCount, startGameTimer, loadData } = store
const { gameState } = storeToRefs(store)
const gameCanvas = ref<HTMLCanvasElement | null>(null)
const gameContainer = ref<HTMLDivElement | null>(null)
const flippedTilesCount = ref(0)
const showGameCompletedModal = ref(false)
const mousePosition = ref({ x: 0, y: 0 })
const hoveredTileId = ref<string | null>(null)
let flipBackTimer: number | null = null
let animationFrameId: number | null = null
const tiles = ref<Tile[]>([])
const containerWidth = ref(0)
const canvasScale = ref(1)

const canvasDimensions = computed(() => {
  const width = Math.min(containerWidth.value, boardConfig.maxContainerWidth)
  const height = width / boardConfig.aspectRatio

  return {
    width,
    height,
  }
})

const drawTile = (ctx: CanvasRenderingContext2D, tile: Tile) => {
  const { id, x, y, width, height, scaleX } = tile
  const { parallaxStrength, tileBorderRadius } = boardConfig
  ctx.save()

  let parallaxX = 0
  let parallaxY = 0
  let rotateX = 0
  let rotateY = 0

  const isHovered = hoveredTileId.value === id

  if (isHovered) {
    const tileCenter = {
      x: x + width / 2,
      y: y + height / 2,
    }

    const normalizedX = (mousePosition.value.x - tileCenter.x) / (width / 2)
    const normalizedY = (mousePosition.value.y - tileCenter.y) / (height / 2)

    parallaxX = normalizedX * parallaxStrength * -0.5
    parallaxY = normalizedY * parallaxStrength * -0.5

    rotateX = normalizedY * 8
    rotateY = normalizedX * -8
  }

  ctx.translate(x + width / 2 + parallaxX, y + height / 2 + parallaxY)

  if (isHovered) {
    ctx.transform(1, rotateX * 0.005, rotateY * 0.005, 1, 0, 0)
  }

  ctx.scale(scaleX, 1)

  if (scaleX > 0) {
    ctx.fillStyle = '#E67E22'
  } else {
    const rarity = tile.rarity || WeaponRarity.CONSUMER
    let baseColor1, baseColor2, backgroundColor

    switch (rarity) {
      case WeaponRarity.CONSUMER:
        baseColor1 = '#b0c3d9'
        baseColor2 = '#c3d4e6'
        backgroundColor = '#8fa7bd'
        break
      case WeaponRarity.INDUSTRIAL:
        baseColor1 = '#5e98d9'
        baseColor2 = '#7baed6'
        backgroundColor = '#4a84c5'
        break
      case WeaponRarity.MIL_SPEC:
        baseColor1 = '#4b69ff'
        baseColor2 = '#7aa6fc'
        backgroundColor = '#3f57d5'
        break
      case WeaponRarity.RESTRICTED:
        baseColor1 = '#8847ff'
        baseColor2 = '#ad76ff'
        backgroundColor = '#7239d8'
        break
      case WeaponRarity.CLASSIFIED:
        baseColor1 = '#d32ce6'
        baseColor2 = '#e75ae0'
        backgroundColor = '#b225c4'
        break
      case WeaponRarity.COVERT:
        baseColor1 = '#eb4b4b'
        baseColor2 = '#ff7272'
        backgroundColor = '#ca3a3a'
        break
      case WeaponRarity.CONTRABAND:
        baseColor1 = '#e4ae39'
        baseColor2 = '#ffcf56'
        backgroundColor = '#c99c31'
        break
      default:
        baseColor1 = '#b0c3d9'
        baseColor2 = '#c3d4e6'
        backgroundColor = '#8fa7bd'
    }

    ctx.fillStyle = backgroundColor

    ctx.beginPath()
    ctx.roundRect(-width / 2, -height / 2, width, height, tileBorderRadius)
    ctx.fill()

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2)

    gradient.addColorStop(0, hexToRgba(baseColor2, 1.0))
    gradient.addColorStop(0.15, hexToRgba(baseColor2, 1.0))
    gradient.addColorStop(0.5, hexToRgba(baseColor1, 0.9))
    gradient.addColorStop(1.0, hexToRgba(baseColor1, 0.7))

    const highlightGradient = ctx.createLinearGradient(
      -width / 2,
      -height / 2,
      width / 2,
      -height * 0.3,
    )
    highlightGradient.addColorStop(0, hexToRgba('#ffffff', 0.3))
    highlightGradient.addColorStop(1, hexToRgba('#ffffff', 0.0))

    ctx.fillStyle = gradient

    ctx.beginPath()
    ctx.roundRect(-width / 2, -height / 2, width, height, tileBorderRadius)
    ctx.fill()

    ctx.fillStyle = highlightGradient
    ctx.beginPath()
    ctx.roundRect(-width / 2, -height / 2, width, height, tileBorderRadius)
    ctx.fill()
  }

  ctx.beginPath()
  ctx.roundRect(-width / 2, -height / 2, width, height, tileBorderRadius)
  ctx.fill()

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  if (tile.isMatched) {
    ctx.strokeStyle = '#FFCC00'
    ctx.lineWidth = 3
  } else {
    ctx.strokeStyle = scaleX > 0 ? 'transparent' : 'transparent'
    ctx.lineWidth = 2
  }
  ctx.stroke()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  if (scaleX > 0) {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${Math.round(height * 0.3)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CS 2', 0, 0)
  }

  if (scaleX < 0) {
    ctx.scale(-1, 1)
    const weaponName = tile.baseWeapon || ''
    const skinName = tile.name || ''
    let imageDisplayed = false
    let displayedWeaponName = ''
    const maxWidth = width * 0.8

    if (tile.skinId && gameState.value.weaponImages && gameState.value.weaponImages[tile.skinId]) {
      const img = gameState.value.weaponImages[tile.skinId]
      if (
        img.complete &&
        img.naturalWidth > 0 &&
        gameState.value.imageLoadStatus &&
        gameState.value.imageLoadStatus[tile.skinId]
      ) {
        const scale = Math.min((width * 0.8) / img.naturalWidth, (height * 0.6) / img.naturalHeight)
        const imgWidth = img.naturalWidth * scale
        const imgHeight = img.naturalHeight * scale
        ctx.drawImage(img, -imgWidth / 2, -height * 0.3, imgWidth, imgHeight)
        imageDisplayed = true
      }
    }

    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '18px Arial'

    if (imageDisplayed) {
      displayedWeaponName = `${weaponName} | ${skinName}`

      let fontSize = 12
      if (skinName.length > 15) {
        fontSize = Math.max(10, 14 - (skinName.length - 15) * 0.3)
      }
      ctx.font = `${fontSize}px Arial`
    } else {
      let fontSize = 16
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillText(weaponName, 0, -12)
      displayedWeaponName = skinName

      fontSize = 14
      if (skinName.length > 15) {
        fontSize = Math.max(10, 14 - (skinName.length - 15) * 0.3)
      }
      ctx.font = `${fontSize}px Arial`
    }

    let textToDisplay = displayedWeaponName
    if (ctx.measureText(textToDisplay).width > maxWidth) {
      while (ctx.measureText(textToDisplay + '...').width > maxWidth && textToDisplay.length > 0) {
        textToDisplay = textToDisplay.slice(0, -1)
      }
      textToDisplay += '...'
    }

    ctx.fillText(textToDisplay, 0, height * 0.32)
  }

  ctx.restore()
}
const drawTiles = () => {
  const canvas = gameCanvas.value
  const { tileGap } = boardConfig
  if (!canvas || !gameState.value.board) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const { rows, cols } = gameState.value.board

  const availableWidth = canvas.width - tileGap * (cols + 1)
  const availableHeight = canvas.height - tileGap * (rows + 1)

  const tileWidth = availableWidth / cols
  const tileHeight = availableHeight / rows

  if (tiles.value.length === 0) {
    tiles.value = gameState.value.board.tiles.map((tile) => {
      const { row, col } = tile
      const x = tileGap + col * (tileWidth + tileGap)
      const y = tileGap + row * (tileHeight + tileGap)
      return {
        id: uuidv4(),
        row,
        col,
        x,
        y,
        width: tileWidth,
        height: tileHeight,
        scaleX: tile.isMatched || tile.isRevealed ? -1 : 1,
        isRevealed: tile.isRevealed || tile.isMatched,
        isAnimating: false,
        isMatched: tile.isMatched,
        value: tile.value,
        baseWeapon: tile.baseWeapon,
        name: tile.name,
        weaponId: tile.weaponId,
        skinId: tile.skinId,
        rarity: tile.rarity,
      }
    })
  }
  tiles.value.forEach((tile) => {
    drawTile(ctx, tile)
  })
}
const handleEndGame = () => {
  endGame()
}

const getSeedParam = () => {
  const url = new URL(window.location.href)
  return url.searchParams.get('seed')
}

const copySeed = async () => {
  const seedParam = getSeedParam()
  if (seedParam && seedParam) {
    try {
      await navigator.clipboard.writeText(seedParam)
      alert('Seed copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy seed:', err)
    }
  }
}
const canFlipTile = (tile: Tile) => {
  const { maxFlippedTiles } = boardConfig
  if (tile.isMatched) return false
  if (tile.isAnimating) return false
  if (tile.isRevealed) return true

  return !(flippedTilesCount.value >= maxFlippedTiles && !tile.isRevealed)
}
const checkForMatch = () => {
  const revealedTiles = tiles.value.filter((t) => t.isRevealed && !t.isMatched)

  if (revealedTiles.length === 2) {
    const [first, second] = revealedTiles

    if (first.weaponId === second.weaponId) {
      first.isMatched = true
      second.isMatched = true
      flippedTilesCount.value = 0

      playSound('/sound/matched-cards.mp3', 0.5)
      if (first.weaponId) {
        const { updateMatchedTiles } = useGameStore()
        updateMatchedTiles([first.weaponId])
      }

      if (flipBackTimer !== null) {
        clearTimeout(flipBackTimer)
        flipBackTimer = null
      }
      checkWinCondition()

      return true
    }
  }
}
const checkWinCondition = () => {
  const { saveGameToHistory, stopGameTimer } = useGameStore()
  const allMatched = tiles.value.length > 0 && tiles.value.every((tile) => tile.isMatched)

  if (allMatched) {
    stopGameTimer()
    saveGameToHistory()
    playSound('/sound/win-game.mp3', 0.7)
    showGameCompletedModal.value = true
  }
}
const flipTile = (tile: Tile) => {
  if (!canFlipTile(tile)) return
  if (!tile.isRevealed) {
    incrementMoveCount()
    if (gameState.value.moveCount === 1) {
      startGameTimer()
    }
  }

  tile.isAnimating = true
  const startScaleX = tile.scaleX
  const targetScaleX = tile.isRevealed ? 1 : -1

  const tileAnimation = { scaleX: startScaleX }
  playSound('/sound/flip-card.mp3', 0.5)

  tile.isRevealed = !tile.isRevealed
  if (tile.isRevealed) {
    flippedTilesCount.value++

    if (flippedTilesCount.value >= boardConfig.maxFlippedTiles) {
      const isMatch = checkForMatch()
      if (!isMatch) {
        if (flipBackTimer !== null) {
          clearTimeout(flipBackTimer)
        }
        flipBackTimer = setTimeout(() => {
          flipBackAllTiles()
        }, boardConfig.flipBackDelay)
      }
    }
  } else {
    flippedTilesCount.value--
  }

  anime({
    targets: tileAnimation,
    scaleX: targetScaleX,
    duration: 800,
    easing: 'easeInOutQuad',
    update: function () {
      tile.scaleX = tileAnimation.scaleX
      drawTiles()
    },
    complete: function () {
      tile.scaleX = targetScaleX
      tile.isAnimating = false
    },
  })
}
const flipBackAllTiles = () => {
  tiles.value.forEach((tile) => {
    if (tile.isRevealed && !tile.isAnimating && !tile.isMatched) {
      flipTile(tile)
    }
  })

  if (flipBackTimer !== null) {
    clearTimeout(flipBackTimer)
    flipBackTimer = null
  }
}
const handleCanvasClick = (event: MouseEvent) => {
  const canvas = gameCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = (event.clientX - rect.left) / (rect.width / boardConfig.width)
  const mouseY = (event.clientY - rect.top) / (rect.height / boardConfig.height)

  const clickedTile = tiles.value.find((tile) => {
    return (
      mouseX >= tile.x &&
      mouseX <= tile.x + tile.width &&
      mouseY >= tile.y &&
      mouseY <= tile.y + tile.height
    )
  })

  if (clickedTile) flipTile(clickedTile)
}
const handleMouseMove = (event: MouseEvent) => {
  const canvas = gameCanvas.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  mousePosition.value = {
    x: (event.clientX - rect.left) / (rect.width / boardConfig.width),
    y: (event.clientY - rect.top) / (rect.height / boardConfig.height),
  }

  const hoveredTile = tiles.value.find((tile) => {
    return (
      mousePosition.value.x >= tile.x &&
      mousePosition.value.x <= tile.x + tile.width &&
      mousePosition.value.y >= tile.y &&
      mousePosition.value.y <= tile.y + tile.height
    )
  })

  hoveredTileId.value = hoveredTile ? hoveredTile.id : null
}
const handleTouchMove = (event: TouchEvent) => {
  const canvas = gameCanvas.value
  if (!canvas || !event.touches[0]) return

  const rect = canvas.getBoundingClientRect()
  mousePosition.value = {
    x: (event.touches[0].clientX - rect.left) / (rect.width / boardConfig.width),
    y: (event.touches[0].clientY - rect.top) / (rect.height / boardConfig.height),
  }

  const hoveredTile = tiles.value.find((tile) => {
    return (
      mousePosition.value.x >= tile.x &&
      mousePosition.value.x <= tile.x + tile.width &&
      mousePosition.value.y >= tile.y &&
      mousePosition.value.y <= tile.y + tile.height
    )
  })

  hoveredTileId.value = hoveredTile ? hoveredTile.id : null
}
const handleMouseLeave = () => {
  hoveredTileId.value = null
}
const handleGameCompleted = () => {
  showGameCompletedModal.value = false
  endGame()
}
const animateParallax = () => {
  if (gameState.value.isStarted && gameCanvas.value) {
    drawTiles()
  }
  animationFrameId = requestAnimationFrame(animateParallax)
}

animateParallax()

const updateContainerWidth = () => {
  if (gameContainer.value) {
    containerWidth.value = gameContainer.value.clientWidth
  }
}

const handleResize = () => {
  updateContainerWidth()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  if (flipBackTimer !== null) {
    clearTimeout(flipBackTimer)
  }

  window.removeEventListener('resize', handleResize)
})

watch(
  () => [
    gameState.value.isStarted,
    gameState.value.gameDifficulty,
    gameCanvas.value,
    gameState.value.board,
  ],
  (_n, _o, onCleanup) => {
    if (gameState.value.isStarted && gameCanvas.value) {
      updateContainerWidth()
      drawTiles()
    }
    onCleanup(() => {
      tiles.value = []
      flippedTilesCount.value = 0
    })
  },
  { immediate: true, deep: true },
)

watch(canvasDimensions, (dimensions) => {
  canvasScale.value = dimensions.width / boardConfig.width
})
</script>
<template>
  <div v-if="gameState.isStarted" ref="gameContainer" class="w-full max-w-4xl mx-auto px-4">
    <div
      class="game-stats mb-4 flex flex-wrap justify-between items-center text-lg font-bold gap-2"
    >
      <div
        class="move-counter bg-gradient-to-r from-indigo-500 to-purple-600 py-2 px-4 rounded-lg text-white flex-grow sm:flex-grow-0"
      >
        Moves: {{ gameState.moveCount }}
      </div>
      <button
        @click="copySeed"
        class="bg-gradient-to-r from-amber-500 to-orange-500 py-2 px-4 rounded-lg text-white flex items-center gap-2 text-sm md:text-lg flex-grow sm:flex-grow-0"
        title="Copy seed to clipboard"
      >
        <span class="hidden sm:inline">Seed:</span> {{ getSeedParam() }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      <div
        class="timer bg-gradient-to-r from-rose-500 to-pink-600 py-2 px-4 rounded-lg text-white flex-grow sm:flex-grow-0"
      >
        Time: {{ formatTime(gameState.elapsedTime) }}
      </div>
    </div>
    <div class="canvas-container w-full flex justify-center">
      <canvas
        ref="gameCanvas"
        id="game-memory-canvas"
        :width="boardConfig.width"
        :height="boardConfig.height"
        class="border rounded-xl shadow-lg bg-gray-50"
        :style="{ width: canvasDimensions.width + 'px', height: canvasDimensions.height + 'px' }"
        @click="handleCanvasClick"
        @mousemove="handleMouseMove"
        @touchmove.prevent="handleTouchMove"
        @mouseleave="handleMouseLeave"
      ></canvas>
    </div>
    <div class="flex justify-center mt-4">
      <button
        @click="handleEndGame"
        class="bg-gradient-to-br from-[#ff5252] to-[#d32f2f] text-white border-none px-6 py-3 rounded-[10px] text-[1rem] md:text-[1.1rem] font-bold cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-wider shadow-[0_4px_15px_rgba(255,82,82,0.3)] w-full sm:w-auto min-w-[120px]"
      >
        End Game
      </button>
    </div>
  </div>
  <GameCompletedModal
    :is-open="showGameCompletedModal"
    :move-count="gameState.moveCount"
    :elapsed-time="gameState.elapsedTime"
    :difficulty="gameState.gameDifficulty.level"
    @close="handleGameCompleted"
    @continue="showGameCompletedModal = false"
  />
</template>
<style scoped>
.canvas-container canvas {
  max-width: 100%;
}
</style>
