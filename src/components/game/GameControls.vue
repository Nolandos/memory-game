<script setup lang="ts">
import { ref } from 'vue'
import NewGameModal from '@/components/modals/NewGameModal.vue'
import ResultsModal from '@/components/modals/ResultsModal.vue'

const isModalOpen = ref(false)
const isResultsModalOpen = ref(false)

const handleNewGameClick = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleResultsClick = () => {
  isResultsModalOpen.value = true
}

const closeResultsModal = () => {
  isResultsModalOpen.value = false
}
</script>

<template>
  <div
    class="border border-border-primary rounded-lg p-modal-spacing w-full min-w-[320px] max-w-[550px]"
  >
    <div class="flex flex-col gap-4 items-center">
      <button
        @click="handleNewGameClick"
        class="bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-black border-none px-6 py-4 rounded-[10px] text-[1.2rem] w-full font-bold cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-wider shadow-[0_4px_15px_rgba(0,255,136,0.3)]"
      >
        🎮 New Game
      </button>
      <button
        @click="handleResultsClick"
        class="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-none px-6 py-4 rounded-[10px] text-[1.2rem] w-full font-bold cursor-pointer transition-all duration-300 ease-in-out uppercase tracking-wider shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
      >
        📊 Results
      </button>
    </div>
    <NewGameModal :is-open="isModalOpen" @close="closeModal" />
    <ResultsModal :is-open="isResultsModalOpen" @close="closeResultsModal" />
  </div>
</template>

<style scoped></style>
