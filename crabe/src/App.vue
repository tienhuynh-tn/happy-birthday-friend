<script lang="ts" setup>
import BirthdayCake from './components/BirthdayCake.vue'
import { useBlowToExtinguish } from './composables/useBlowToExtinguish'

interface IngredientOption {
  label: string
  value: string
}

interface CookingStep {
  id: 'cakeColor' | 'creamColor' | 'candleColor'
  label: string
  action: string
  customLabel: string
  options: IngredientOption[]
}

const cookingSteps: CookingStep[] = [
  {
    id: 'cakeColor',
    label: 'Cake batter',
    action: 'Mix batter',
    customLabel: 'Custom batter',
    options: [
      { label: 'Mint', value: '#8fcfbd' },
      { label: 'Berry', value: '#ef9faf' },
      { label: 'Honey', value: '#f3c86b' },
      { label: 'Cocoa', value: '#b77b5f' },
    ],
  },
  {
    id: 'creamColor',
    label: 'Cream swirl',
    action: 'Add cream',
    customLabel: 'Custom cream',
    options: [
      { label: 'Vanilla', value: '#fff4d6' },
      { label: 'Peach', value: '#ffd2bd' },
      { label: 'Blueberry', value: '#b9c7f6' },
      { label: 'Pistachio', value: '#d7ecc8' },
    ],
  },
  {
    id: 'candleColor',
    label: 'Candle',
    action: 'Place candle',
    customLabel: 'Custom candle',
    options: [
      { label: 'Sugar', value: '#fbfff8' },
      { label: 'Coral', value: '#ff9c8a' },
      { label: 'Sky', value: '#a7d8f0' },
      { label: 'Lilac', value: '#d6c2ff' },
    ],
  },
]

const selectedColors = reactive({
  cakeColor: cookingSteps[0].options[0].value,
  creamColor: cookingSteps[1].options[0].value,
  candleColor: cookingSteps[2].options[0].value,
})

const currentStepIndex = ref(0)
const cakeBaked = ref(false)
const flameOut = ref(false)
const showCookingPanel = ref(false)

const activeStep = computed(() => cookingSteps[currentStepIndex.value])
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === cookingSteps.length - 1)
const cookingToggleLabel = computed(() =>
  showCookingPanel.value ? 'Close cake cooking station' : 'Open cake cooking station',
)

const selectColor = (color: string) => {
  selectedColors[activeStep.value.id] = color
  if (flameOut.value)
    flameOut.value = false
}

const updateCustomColor = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectColor(input.value)
}

const goBack = () => {
  if (!isFirstStep.value)
    currentStepIndex.value -= 1
}

const goNext = () => {
  if (isLastStep.value) {
    cakeBaked.value = true
    flameOut.value = false
    showCookingPanel.value = false
    return
  }

  currentStepIndex.value += 1
}

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
  <main class="birthday-shell text-center text-gray-700 dark:text-gray-200">
    <div class="cake-stage" role="img" aria-label="Birthday cake with candle">
      <BirthdayCake
        :cake-color="selectedColors.cakeColor"
        :cream-color="selectedColors.creamColor"
        :candle-color="selectedColors.candleColor"
        :flame-out="flameOut"
      />
    </div>

    <button
      v-if="!cakeBaked"
      class="cooking-toggle"
      type="button"
      :aria-label="cookingToggleLabel"
      aria-controls="cake-cooking-station"
      :aria-expanded="showCookingPanel"
      @click="showCookingPanel = !showCookingPanel"
    >
      <span aria-hidden="true">🍳</span>
    </button>

    <section
      v-if="!cakeBaked && showCookingPanel"
      id="cake-cooking-station"
      class="chef-station"
      aria-label="Cake cooking station"
    >
      <div class="station-header">
        <p>Step {{ currentStepIndex + 1 }} of {{ cookingSteps.length }}</p>
        <h1>{{ activeStep.action }}</h1>
      </div>

      <div class="step-tabs" aria-label="Cooking steps">
        <button
          v-for="(step, index) in cookingSteps"
          :key="step.id"
          class="step-tab"
          type="button"
          :class="{ 'step-tab--active': index === currentStepIndex }"
          :aria-current="index === currentStepIndex ? 'step' : undefined"
          @click="currentStepIndex = index"
        >
          {{ index + 1 }}
        </button>
      </div>

      <div class="color-tray" :aria-label="activeStep.label">
        <button
          v-for="option in activeStep.options"
          :key="option.value"
          class="color-chip"
          type="button"
          :class="{ 'color-chip--active': selectedColors[activeStep.id] === option.value }"
          :style="{ '--chip-color': option.value }"
          :aria-pressed="selectedColors[activeStep.id] === option.value"
          @click="selectColor(option.value)"
        >
          <span class="color-chip__swatch" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </button>
      </div>

      <label class="custom-color">
        <span>{{ activeStep.customLabel }}</span>
        <input
          :value="selectedColors[activeStep.id]"
          type="color"
          @input="updateCustomColor"
        >
      </label>

      <div class="station-actions">
        <button
          class="station-button station-button--secondary"
          type="button"
          :disabled="isFirstStep"
          @click="goBack"
        >
          Back
        </button>
        <button
          class="station-button"
          type="button"
          @click="goNext"
        >
          {{ isLastStep ? 'Bake cake' : 'Next' }}
        </button>
      </div>
    </section>

    <div
      v-if="cakeBaked && !flameOut"
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

.birthday-shell {
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
}

.cake-stage {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  padding: 24px 16px 32px;
  box-sizing: border-box;
  place-items: center;
  width: 100%;
  overflow: hidden;
}

.cooking-toggle {
  position: fixed;
  z-index: 4;
  top: max(18px, env(safe-area-inset-top));
  right: 18px;
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(79, 159, 139, 0.26);
  border-radius: 50%;
  background: rgba(255, 250, 243, 0.88);
  box-shadow: 0 10px 26px rgba(121, 82, 67, 0.14);
  color: #315448;
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  place-items: center;
  backdrop-filter: blur(12px);
}

.chef-station {
  position: fixed;
  z-index: 3;
  top: calc(max(18px, env(safe-area-inset-top)) + 56px);
  right: 14px;
  width: min(360px, calc(100vw - 28px));
  padding: 12px;
  border: 1px solid rgba(79, 159, 139, 0.26);
  border-radius: 16px;
  background: rgba(255, 250, 243, 0.9);
  box-shadow: 0 18px 42px rgba(121, 82, 67, 0.18);
  color: #39534b;
  text-align: left;
  backdrop-filter: blur(14px);
}

.station-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.station-header p {
  margin: 0;
  color: rgba(57, 83, 75, 0.64);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.station-header h1 {
  margin: 0;
  color: #315448;
  font-size: 20px;
  line-height: 1.05;
}

.step-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.step-tab {
  min-height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(79, 159, 139, 0.18);
  color: transparent;
  cursor: pointer;
}

.step-tab--active {
  background: #4f9f8b;
}

.color-tray {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.color-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 6px 9px;
  border: 1px solid rgba(79, 159, 139, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.58);
  color: #39534b;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.color-chip--active {
  border-color: #4f9f8b;
  box-shadow: inset 0 0 0 1px rgba(79, 159, 139, 0.3);
}

.color-chip__swatch {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(57, 83, 75, 0.18);
  border-radius: 50%;
  background: var(--chip-color);
}

.custom-color {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  padding: 7px 9px;
  border: 1px dashed rgba(79, 159, 139, 0.32);
  border-radius: 12px;
  color: #45665c;
  font-size: 12px;
  font-weight: 700;
}

.custom-color input {
  width: 44px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.station-actions {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 8px;
  margin-top: 12px;
}

.station-button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: #4f9f8b;
  color: #fffaf3;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.station-button--secondary {
  border: 1px solid rgba(79, 159, 139, 0.26);
  background: rgba(255, 255, 255, 0.5);
  color: #45665c;
}

.station-button:disabled {
  cursor: default;
  opacity: 0.46;
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

  .station-header {
    display: block;
  }

  .station-header h1 {
    margin-top: 4px;
  }

  .color-chip {
    min-width: 0;
    font-size: 11px;
  }
}
</style>
