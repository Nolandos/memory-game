<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'
import { DIFFICULTY_CONFIG, GameDifficulty } from '@/types/game'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])

const store = useGameStore()
const { gameState } = storeToRefs(store)
const customSeed = ref('')
const useCustomSeed = ref(false)
const selectedDifficulty = ref(gameState.value.gameDifficulty.level)

const difficulties = computed(() => [
  {
    level: GameDifficulty.EASY,
    name: 'Easy',
    config: DIFFICULTY_CONFIG[GameDifficulty.EASY],
  },
  {
    level: GameDifficulty.MEDIUM,
    name: 'Medium',
    config: DIFFICULTY_CONFIG[GameDifficulty.MEDIUM],
  },
  {
    level: GameDifficulty.HARD,
    name: 'Hard',
    config: DIFFICULTY_CONFIG[GameDifficulty.HARD],
  },
  {
    level: GameDifficulty.EXPERT,
    name: 'Expert',
    config: DIFFICULTY_CONFIG[GameDifficulty.EXPERT],
  },
])

const handleStartGame = () => {
  if (useCustomSeed.value && customSeed.value.trim()) {
    store.startGame({
      customSeed: customSeed.value.trim(),
    })
  } else {
    store.startGame({
      difficulty: selectedDifficulty.value,
    })
  }

  emit('close')
}

const handleCancel = () => {
  customSeed.value = ''
  useCustomSeed.value = false
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
    @click.self="handleCancel"
  >
    <div
      class="bg-gray-800 rounded-xl w-11/12 max-w-md overflow-hidden shadow-2xl border border-gray-700"
    >
      <div class="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
        <h2 class="text-xl font-bold text-white">New Game</h2>
        <button
          class="text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          @click="handleCancel"
        >
          &times;
        </button>
      </div>

      <div class="p-5">
        <div class="mb-4">
          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              :value="false"
              v-model="useCustomSeed"
              name="seed-option"
              class="form-radio h-5 w-5 text-green-500"
            />
            <span class="ml-3 text-white">Random seed (new game)</span>
          </label>

          <div v-if="!useCustomSeed" class="mt-4">
            <p class="text-white mb-2 font-semibold">Select difficulty:</p>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="difficulty in difficulties"
                :key="difficulty.level"
                @click="selectedDifficulty = difficulty.level"
                class="cursor-pointer p-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                :class="{
                  'bg-gray-700 border-2': selectedDifficulty !== difficulty.level,
                  'bg-gray-700 border-2 border-[#ffa500] text-[#ffa500]':
                    selectedDifficulty === difficulty.level,
                }"
              >
                <p
                  class="text-center font-bold mb-1"
                  :class="{ 'text-[#ffa500]': selectedDifficulty === difficulty.level }"
                >
                  {{ difficulty.name }}
                </p>
                <div
                  class="text-xs text-center text-gray-400"
                  :class="{ 'text-[#ffa500]': selectedDifficulty === difficulty.level }"
                >
                  <p>{{ difficulty.config.rows }}×{{ difficulty.config.cols }} board</p>
                  <p>{{ difficulty.config.pairs }} pairs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              :value="true"
              v-model="useCustomSeed"
              name="seed-option"
              class="form-radio h-5 w-5 text-green-500"
            />
            <span class="ml-3 text-white">Custom seed</span>
          </label>
        </div>

        <div v-if="useCustomSeed" class="mt-4 p-4 bg-gray-700 rounded-lg">
          <div class="flex flex-col mb-6">
            <label for="customSeed" class="mb-1 text-gray-300 font-medium"
              >Enter Custom Seed:</label
            >
            <input
              id="customSeed"
              v-model="customSeed"
              type="text"
              class="p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Enter seed for repeatable board"
              :disabled="!useCustomSeed"
            />
            <p class="mt-2 text-sm text-gray-400">
              Seed allows you to recreate the same game board
            </p>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-700">
        <button
          @click="handleCancel"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          @click="handleStartGame"
          class="px-4 py-2 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-black font-bold rounded-lg shadow-lg hover:translate-y-[-2px] transition duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          :disabled="useCustomSeed && !customSeed.trim()"
        >
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
