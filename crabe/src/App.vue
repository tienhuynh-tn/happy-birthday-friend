<script lang="ts" setup>
import BirthdayCake from './components/BirthdayCake.vue'
import { useBlowToExtinguish } from './composables/useBlowToExtinguish'

const flameOut = ref(false)

const extinguishFlame = () => {
  flameOut.value = true
}

const {
  errorMessage,
  hasFallback,
  startListening,
  status: micStatus,
} = useBlowToExtinguish({
  onBlow: extinguishFlame,
})

const micHint = computed(() => {
  if (flameOut.value)
    return 'The candle is out.'

  if (micStatus.value === 'requesting')
    return 'Allow microphone access to blow out the candle.'

  if (micStatus.value === 'listening')
    return 'Blow into the microphone.'

  if (hasFallback.value)
    return errorMessage.value

  return 'Allow microphone, then blow to put out the candle.'
})

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: '🦀 🎂',
  meta: [{ name: 'description', content: 'A birthday cake and candle celebration for Crabe.' }],
})
</script>

<template>
  <main class="text-center text-gray-700 dark:text-gray-200">
    <div class="cake-stage" role="img" aria-label="Birthday cake with candle">
      <BirthdayCake :flame-out="flameOut" />
    </div>

    <div
      v-if="!flameOut"
      class="mic-tip"
      aria-live="polite"
    >
      <p>{{ micHint }}</p>
      <button
        v-if="!hasFallback"
        class="mic-tip__button"
        type="button"
        :disabled="micStatus === 'requesting' || micStatus === 'listening'"
        @click="startListening"
      >
        {{ micStatus === 'listening' ? 'Listening' : 'Use microphone' }}
      </button>
      <button
        v-else
        class="mic-tip__button"
        type="button"
        @click="extinguishFlame"
      >
        Blow candle
      </button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.text-center {
  position: relative;
}

.cake-stage {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  place-items: center;
  width: 100%;
  overflow: hidden;
}

.mic-tip {
  position: fixed;
  z-index: 2;
  right: 50%;
  bottom: max(20px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 32px);
  padding: 9px 10px;
  border: 1px solid rgba(79, 159, 139, 0.22);
  border-radius: 999px;
  background: rgba(255, 248, 239, 0.82);
  box-shadow: 0 10px 26px rgba(121, 82, 67, 0.14);
  color: #39534b;
  font-size: 12px;
  line-height: 1.25;
  transform: translateX(50%);
  backdrop-filter: blur(12px);
}

.mic-tip p {
  max-width: 190px;
  margin: 0;
}

.mic-tip__button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #4f9f8b;
  color: #fffaf3;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.mic-tip__button:disabled {
  cursor: default;
  opacity: 0.7;
}

@media (max-width: 420px) {
  .mic-tip {
    width: calc(100vw - 32px);
    justify-content: space-between;
  }
}
</style>
