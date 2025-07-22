<script setup lang="ts">
import GameControls from '@/components/game/GameControls.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import { useGameStore } from '@/stores/game'
import { storeToRefs } from 'pinia'

const store = useGameStore()
const { gameState } = storeToRefs(store)
</script>
<template>
  <div class="w-full flex flex-col items-center justify-center min-h-screen py-8 px-4">
    <h1 class="text-5xl font-bold mb-8 text-shadow-title text-center">
      <span class="text-logo-primary text-shadow-logo animate-logo">CS2</span>
      <span class="text-white ml-4">Memory Game</span>
    </h1>

    <div v-if="!gameState.isStarted" class="mt-12 w-full flex justify-center">
      <GameControls />
    </div>

    <GameBoard />
  </div>
</template>
<style scoped></style>
