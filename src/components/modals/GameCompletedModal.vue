<script setup lang="ts">
import { GameDifficulty } from '@/types/game'
import { formatDifficulty, formatTime } from '@/utils/utils.ts'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  moveCount: {
    type: Number,
    default: 0,
  },
  elapsedTime: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    default: GameDifficulty.MEDIUM,
  },
})

const emit = defineEmits(['close', 'continue'])

const handleClose = () => {
  emit('close')
}

const handleContinue = () => {
  emit('continue')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
    @click.self="handleClose"
  >
    <div
      class="bg-gray-800 rounded-xl w-11/12 max-w-lg overflow-hidden shadow-2xl border border-gray-700"
    >
      <div class="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
        <h2 class="text-xl font-bold text-white">Game completed!</h2>
        <button
          class="text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <div class="p-5 text-white">
        <div class="text-center mb-6">
          <div class="text-2xl font-bold text-yellow-400 mb-3">Congratulations!</div>
          <div class="text-lg">You have discovered all the pairs!</div>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-bold mb-3 text-center">Your score:</h3>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-gray-800 rounded p-3">
              <div class="text-gray-400 mb-1">Level of difficulty</div>
              <div class="font-bold">{{ formatDifficulty(difficulty) }}</div>
            </div>
            <div class="bg-gray-800 rounded p-3">
              <div class="text-gray-400 mb-1">Moves</div>
              <div class="font-bold">{{ moveCount }}</div>
            </div>
            <div class="bg-gray-800 rounded p-3 col-span-2">
              <div class="text-gray-400 mb-1">Time</div>
              <div class="font-bold text-xl">{{ formatTime(elapsedTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between p-4 bg-gray-900 border-t border-gray-700">
        <button
          @click="handleContinue"
          class="px-4 py-2 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-black font-bold rounded-lg shadow-lg hover:translate-y-[-2px] transition duration-200 focus:outline-none"
        >
          Back
        </button>
        <button
          @click="handleClose"
          class="px-4 py-2 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white font-bold rounded-lg shadow-lg hover:translate-y-[-2px] transition duration-200 focus:outline-none"
        >
          Exit
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
