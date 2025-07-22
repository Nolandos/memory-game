<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { formatDifficulty, formatTime } from '../../utils/utils.ts'
import { storageKeys } from '@/utils/constats.ts'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])

const gameHistory = ref<
  { moveCount: number; elapsedTime: number; difficulty: string; timestamp: number }[]
>([])

const loadGameHistory = () => {
  try {
    const historyJson = localStorage.getItem(storageKeys.GAME_HISTORY)
    if (historyJson) {
      gameHistory.value = JSON.parse(historyJson)
      gameHistory.value.sort((a, b) => b.timestamp - a.timestamp)
    }
  } catch (error) {
    console.error('Error reading game history:', error)
    gameHistory.value = []
  }
}

const handleClose = () => {
  emit('close')
}

onMounted(() => {
  if (props.isOpen) {
    loadGameHistory()
  }
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      loadGameHistory()
    }
  },
)
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
    @click.self="handleClose"
  >
    <div
      class="bg-gray-800 rounded-xl w-11/12 max-w-3xl overflow-hidden shadow-2xl border border-gray-700"
    >
      <div class="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
        <h2 class="text-xl font-bold text-white">History of Games</h2>
        <button
          class="text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          @click="handleClose"
        >
          &times;
        </button>
      </div>

      <div class="p-5">
        <div v-if="gameHistory.length === 0" class="text-center py-8 text-gray-400">
          No completed games in history.
        </div>

        <div v-else class="max-h-[60vh] overflow-y-auto">
          <table class="w-full border-collapse">
            <thead class="sticky top-0 bg-gray-800 z-10">
              <tr class="border-b border-gray-700 text-left text-gray-300">
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Level of difficulty</th>
                <th class="py-3 px-4">Moves</th>
                <th class="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(game, index) in gameHistory"
                :key="index"
                class="hover:bg-gray-700 border-b border-gray-700"
              >
                <td class="py-3 px-4 text-white">
                  {{ new Date(game.timestamp).toLocaleString() }}
                </td>
                <td class="py-3 px-4 text-white">{{ formatDifficulty(game.difficulty) }}</td>
                <td class="py-3 px-4 text-white">{{ game.moveCount }}</td>
                <td class="py-3 px-4 text-white">{{ formatTime(game.elapsedTime) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-end p-4 bg-gray-900 border-t border-gray-700">
        <button
          @click="handleClose"
          class="px-4 py-2 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white font-bold rounded-lg shadow-lg hover:translate-y-[-2px] transition duration-200 focus:outline-none"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: #2d3748; /* tailwind bg-gray-800 */
  border-radius: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: #4a5568; /* tailwind bg-gray-700 */
  border-radius: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: #718096; /* tailwind bg-gray-600 */
}

.max-h-\[60vh\] {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748; /* thumb track */
}
</style>
