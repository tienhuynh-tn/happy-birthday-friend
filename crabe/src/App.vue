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

interface IntroMessage {
  label?: string
  text: string
  variant?: 'default' | 'emphasis' | 'quote'
}

interface IntroWord {
  startIndex: number
  text: string
}

type CatReaction = 'idle' | 'ear-left' | 'ear-right' | 'paw-left' | 'paw-right' | 'look-left' | 'look-right' | 'wrong' | 'success'
type PasscodeStatus = 'idle' | 'checking' | 'error' | 'success'
type IntroStep = 'greeting' | 'countdown' | 'message' | 'done'

const PASSCODE = '1509'
const BIRTHDAY_MUSIC_SRC = './audio/song-1.mp3'
const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const introCountdownNumbers = [3, 2, 1]
const introMessages: IntroMessage[] = [
  {
    text: 'Hôm nay là sinh nhật của bạn đó!',
  },
  {
    text: 'Chúc bạn một tuổi mới thật nhiều niềm vui, yêu thương và những điều dịu dàng.',
  },
  {
    text: 'Ban đầu mình chỉ định gửi một lời chúc đơn giản.',
  },
  {
    text: 'Nhưng rồi mình dừng lại một chút.',
  },
  {
    text: 'Vì mình muốn chuẩn bị điều gì đó đặc biệt hơn.',
  },
  {
    text: 'Bởi vì,',
  },
  {
    text: 'Bạn rất đặc biệt :)',
    variant: 'emphasis',
  },
  {
    label: 'Một lời nhắn nhỏ',
    text: 'Càng biết trân trọng và ăn mừng cuộc sống, mình càng tìm thấy nhiều điều đáng để ăn mừng.',
    variant: 'quote',
  },
  {
    text: 'Một chiếc bánh nhỏ đang chờ bạn tự tay hoàn tất.',
  },
]

const buildIntroWords = (message: string): IntroWord[] => message.split(' ').map((word, index, words) => {
  const startIndex = words.slice(0, index).join(' ').length + (index > 0 ? 1 : 0)
  return {
    text: word,
    startIndex,
  }
})
const introMessageSlides = introMessages.map(message => ({
  ...message,
  variant: message.variant || 'default',
  words: buildIntroWords(message.text),
}))

const cookingSteps: CookingStep[] = [
  {
    id: 'cakeColor',
    label: 'Bột bánh',
    action: 'Trộn bột bánh',
    customLabel: 'Màu bột tùy chỉnh',
    options: [
      { label: 'Bạc hà', value: '#8fcfbd' },
      { label: 'Dâu', value: '#ef9faf' },
      { label: 'Mật ong', value: '#f3c86b' },
      { label: 'Cacao', value: '#b77b5f' },
    ],
  },
  {
    id: 'creamColor',
    label: 'Lớp kem',
    action: 'Thêm kem',
    customLabel: 'Màu kem tùy chỉnh',
    options: [
      { label: 'Vani', value: '#fff4d6' },
      { label: 'Đào', value: '#ffd2bd' },
      { label: 'Việt quất', value: '#b9c7f6' },
      { label: 'Hạt dẻ cười', value: '#d7ecc8' },
    ],
  },
  {
    id: 'candleColor',
    label: 'Nến',
    action: 'Cắm nến',
    customLabel: 'Màu nến tùy chỉnh',
    options: [
      { label: 'Đường trắng', value: '#fbfff8' },
      { label: 'San hô', value: '#ff9c8a' },
      { label: 'Trời xanh', value: '#a7d8f0' },
      { label: 'Tím hoa cà', value: '#d6c2ff' },
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
const showPasscodeHint = ref(false)
const isUnlocked = ref(false)
const isMusicPlaying = ref(false)
const introStep = ref<IntroStep>('greeting')
const introMessageIndex = ref(0)
const enteredPasscode = ref('')
const passcodeStatus = ref<PasscodeStatus>('idle')
const catReaction = ref<CatReaction>('idle')
const catLook = reactive({
  x: '0px',
  y: '0px',
})
const birthdayMusicRef = ref<HTMLAudioElement | null>(null)
const passcodeHintButtonRef = ref<HTMLButtonElement | null>(null)
const passcodeHintRef = ref<HTMLElement | null>(null)
let catReactionTimer: ReturnType<typeof setTimeout> | undefined
let catReactionFrame: ReturnType<typeof requestAnimationFrame> | undefined
let passcodeTimer: ReturnType<typeof setTimeout> | undefined
let introTimer: ReturnType<typeof setTimeout> | undefined

const activeStep = computed(() => cookingSteps[currentStepIndex.value])
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === cookingSteps.length - 1)
const isIntroComplete = computed(() => introStep.value === 'done')
const activeIntroMessage = computed(() => introMessageSlides[introMessageIndex.value])
const cookingToggleLabel = computed(() =>
  showCookingPanel.value ? 'Đóng trạm làm bánh' : 'Mở trạm làm bánh',
)
const musicToggleLabel = computed(() =>
  isMusicPlaying.value ? 'Tắt nhạc sinh nhật' : 'Bật nhạc sinh nhật',
)
const passcodeLabel = computed(() => `Đã nhập ${enteredPasscode.value.length}/4 số mật mã`)
const isPasscodeLocked = computed(() =>
  passcodeStatus.value === 'checking' || passcodeStatus.value === 'success',
)
const passcodeMessage = computed(() => {
  if (passcodeStatus.value === 'error')
    return 'Mật mã sai rồi, hãy thử lại, khó quá thì hỏi Coder nha 😉'

  if (passcodeStatus.value === 'success')
    return 'Mật mã đúng, tiến tiếp thôi'

  return ''
})
const catLookStyle = computed(() => ({
  '--cat-eye-x': catLook.x,
  '--cat-eye-y': catLook.y,
}))

const clearCatReactionTimer = () => {
  if (catReactionTimer)
    clearTimeout(catReactionTimer)

  if (catReactionFrame)
    cancelAnimationFrame(catReactionFrame)
}

const clearPasscodeTimer = () => {
  if (passcodeTimer)
    clearTimeout(passcodeTimer)
}

const clearIntroTimer = () => {
  if (introTimer)
    clearTimeout(introTimer)
}

const queueIntroStep = (step: IntroStep, delay: number) => {
  clearIntroTimer()
  introTimer = setTimeout(() => {
    introStep.value = step
  }, delay)
}

const queueNextIntroMessage = () => {
  clearIntroTimer()
  const duration = Math.max(3600, activeIntroMessage.value.text.length * 70 + 2100)

  introTimer = setTimeout(() => {
    if (introMessageIndex.value < introMessageSlides.length - 1) {
      introMessageIndex.value += 1
      return
    }

    introStep.value = 'done'
  }, duration)
}

const startIntroSequence = () => {
  introStep.value = 'greeting'
  introMessageIndex.value = 0
  queueIntroStep('countdown', 3600)
}

const resetCatLook = () => {
  catLook.x = '0px'
  catLook.y = '0px'
}

const playBirthdayMusic = async () => {
  const audio = birthdayMusicRef.value
  if (!audio)
    return

  audio.loop = true

  try {
    await audio.play()
    isMusicPlaying.value = true
  }
  catch {
    isMusicPlaying.value = false
  }
}

const pauseBirthdayMusic = () => {
  const audio = birthdayMusicRef.value
  if (!audio)
    return

  audio.pause()
  isMusicPlaying.value = false
}

const toggleBirthdayMusic = () => {
  if (isMusicPlaying.value) {
    pauseBirthdayMusic()
    return
  }

  playBirthdayMusic()
}

const setCatReaction = (reaction: CatReaction, duration = 180, resetLook = false) => {
  clearCatReactionTimer()
  catReaction.value = 'idle'

  catReactionFrame = requestAnimationFrame(() => {
    catReactionFrame = undefined
    catReaction.value = reaction

    if (reaction !== 'idle') {
      catReactionTimer = setTimeout(() => {
        catReaction.value = 'idle'
        if (resetLook)
          resetCatLook()
      }, duration)
    }
  })
}

const setCatLookForDigit = (digit: string) => {
  const number = Number(digit)
  const column = number === 0 ? 1 : (number - 1) % 3
  const row = number === 0 ? 3 : Math.floor((number - 1) / 3)

  catLook.x = column === 0 ? '-1.8px' : column === 2 ? '1.8px' : '0px'
  catLook.y = row >= 2 ? '1px' : '-.4px'
}

const getDigitReaction = (length: number): CatReaction => {
  const reactions: CatReaction[] = ['paw-left', 'paw-right', 'ear-left', 'ear-right']
  return reactions[(length - 1) % reactions.length]
}

const validatePasscode = (value: string) => {
  passcodeStatus.value = 'checking'
  clearPasscodeTimer()

  if (value === PASSCODE) {
    passcodeStatus.value = 'success'
    setCatReaction('success', 700)
    playBirthdayMusic()
    passcodeTimer = setTimeout(() => {
      isUnlocked.value = true
    }, 2400)
    return
  }

  passcodeStatus.value = 'error'
  setCatReaction('wrong', 900)
  passcodeTimer = setTimeout(() => {
    enteredPasscode.value = ''
    passcodeStatus.value = 'idle'
  }, 3200)
}

const enterPasscodeDigit = (digit: string) => {
  if (isPasscodeLocked.value || enteredPasscode.value.length >= 4)
    return

  const nextValue = `${enteredPasscode.value}${digit}`
  enteredPasscode.value = nextValue
  passcodeStatus.value = 'idle'
  setCatLookForDigit(digit)
  setCatReaction(getDigitReaction(nextValue.length), 210, nextValue.length < 4)

  if (nextValue === PASSCODE)
    playBirthdayMusic()

  if (nextValue.length === 4) {
    passcodeStatus.value = 'checking'
    clearPasscodeTimer()
    passcodeTimer = setTimeout(() => {
      validatePasscode(nextValue)
    }, 190)
  }
}

const deletePasscodeDigit = () => {
  if (isPasscodeLocked.value || enteredPasscode.value.length === 0)
    return

  enteredPasscode.value = enteredPasscode.value.slice(0, -1)
  passcodeStatus.value = 'idle'
  setCatReaction('look-left', 180, true)
}

const handlePasscodeKeydown = (event: KeyboardEvent) => {
  if (isUnlocked.value)
    return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    enterPasscodeDigit(event.key)
    return
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    deletePasscodeDigit()
    return
  }

  if (event.key === 'Enter' && enteredPasscode.value.length === 4) {
    event.preventDefault()
    validatePasscode(enteredPasscode.value)
  }
}

const handlePasscodePointerMove = (event: PointerEvent) => {
  if (isUnlocked.value)
    return

  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  const x = ((event.clientX - (bounds.left + bounds.width / 2)) / bounds.width) * 9
  const y = ((event.clientY - (bounds.top + bounds.height * 0.34)) / bounds.height) * 8

  catLook.x = `${Math.max(-2.8, Math.min(2.8, x)).toFixed(2)}px`
  catLook.y = `${Math.max(-1.8, Math.min(2.4, y)).toFixed(2)}px`
}

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
    return 'Nến đã tắt.'

  if (micStatus.value === 'requesting')
    return 'Hãy cho phép dùng micro để thổi tắt nến.'

  if (micStatus.value === 'listening')
    return 'Thổi vào micro nha.'

  if (hasFallback.value)
    return errorMessage.value

  return 'Cho phép dùng micro, rồi thổi để tắt nến.'
})

const handlePasscodeOutsidePointerDown = (event: PointerEvent) => {
  if (!showPasscodeHint.value)
    return

  const target = event.target
  if (!(target instanceof Node)) {
    showPasscodeHint.value = false
    return
  }

  if (passcodeHintButtonRef.value?.contains(target) || passcodeHintRef.value?.contains(target))
    return

  showPasscodeHint.value = false
}

watch(isUnlocked, (unlocked) => {
  if (unlocked)
    startIntroSequence()
})

watch(introStep, (step) => {
  if (step === 'countdown') {
    queueIntroStep('message', 4400)
    return
  }

  if (step === 'message')
    queueNextIntroMessage()
})

watch(introMessageIndex, () => {
  if (introStep.value === 'message')
    queueNextIntroMessage()
})

onMounted(() => {
  window.addEventListener('keydown', handlePasscodeKeydown)
  document.addEventListener('pointerdown', handlePasscodeOutsidePointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePasscodeKeydown)
  document.removeEventListener('pointerdown', handlePasscodeOutsidePointerDown)
  clearCatReactionTimer()
  clearPasscodeTimer()
  clearIntroTimer()
  pauseBirthdayMusic()
})

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: '🦀 🎂',
  meta: [{ name: 'description', content: 'Bánh sinh nhật và nến dành cho Crabe.' }],
})
</script>

<template>
  <main class="birthday-shell text-center text-gray-700 dark:text-gray-200">
    <audio
      ref="birthdayMusicRef"
      class="birthday-music"
      :src="BIRTHDAY_MUSIC_SRC"
      loop
      preload="auto"
      @play="isMusicPlaying = true"
      @pause="isMusicPlaying = false"
      @ended="isMusicPlaying = false"
      @error="isMusicPlaying = false"
    />

    <button
      v-if="isUnlocked"
      class="music-toggle"
      type="button"
      :class="{ 'music-toggle--playing': isMusicPlaying }"
      :aria-label="musicToggleLabel"
      :aria-pressed="isMusicPlaying"
      @click="toggleBirthdayMusic"
    >
      <svg
        class="music-toggle__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 18V5l10-2v13" />
        <path d="M9 18c0 1.7-1.6 3-3.5 3S2 19.7 2 18s1.6-3 3.5-3S9 16.3 9 18Z" />
        <path d="M19 16c0 1.7-1.6 3-3.5 3S12 17.7 12 16s1.6-3 3.5-3 3.5 1.3 3.5 3Z" />
      </svg>
    </button>

    <section
      v-if="!isUnlocked"
      class="passcode-screen"
      :class="`passcode-screen--${catReaction}`"
      aria-labelledby="passcode-title"
      @pointermove="handlePasscodePointerMove"
      @pointerleave="resetCatLook"
    >
      <div
        class="passcode-cat"
        :style="catLookStyle"
        :class="[
          `passcode-cat--${catReaction}`,
          `passcode-cat--digits-${enteredPasscode.length}`,
          {
            'passcode-cat--wrong': passcodeStatus === 'error',
            'passcode-cat--success': passcodeStatus === 'success',
          },
        ]"
        aria-hidden="true"
      >
        <svg
          class="cat-illustration"
          viewBox="0 0 220 220"
          role="presentation"
        >
          <g class="cat-tail">
            <path
              class="cat-tail-fill"
              d="M139.2 137.7c12.8-4 24.6-13 29.6-24.9 4.9-11.6 3.6-23.8-2.4-27.1-5.1-2.8-12 2.6-14.9 12.1-1.7 5.6-1.2 12.2 1.9 18.4-2.8.8-5.2-.1-7.1-2.9-3.3-5-3-13.4.8-21.1 5.8-11.9 17.2-17.1 25.2-10.9 8.5 6.6 8.7 22.2 1.7 36.7-6.2 12.8-19.6 22.9-34.5 26.2z"
            />
            <path
              class="cat-patch cat-patch--tail"
              d="M166.8 84.3c4.7 2.4 6.5 8.1 4.3 13.5-4.6-1.8-6-6.6-4.3-13.5z"
            />
          </g>

          <g class="cat-body">
            <path
              class="cat-neck"
              d="M92.4 111.6c7.9 5.5 23 5.8 31.2.3l2.4 15.6c-9.4 6.1-25.5 6-35-.4z"
            />
            <path
              class="cat-leg cat-leg--left"
              d="M86.8 123.4c-8.1 7.4-12.4 25.7-10.5 44.8 4.6 3.7 11.8 3.4 15.7-.7.2-17.7 3.8-31.2 10-40.1-3.6-5-10.3-8.4-15.2-4z"
            />
            <path
              class="cat-leg cat-leg--right"
              d="M129.5 123.1c8.7 7.4 13.5 25.9 11.8 45.3-4.5 3.7-11.8 3.5-15.8-.5-.5-18.1-4.4-31.8-10.9-40.7 3.7-5.2 10.1-8.2 14.9-4.1z"
            />
          </g>

          <g class="cat-head">
            <path
              class="cat-ear cat-ear--left"
              d="M42.8 65.2c-13.2-22.5-13-43.3-5.1-49 8.2-5.9 27.3 12.8 37.7 32.2z"
            />
            <path
              class="cat-ear cat-ear--right"
              d="M142.1 48.2c12.6-18.8 31.5-34.3 38.9-27.5 7 6.4 3.6 27.2-9.7 47.1z"
            />
            <path
              class="cat-head-fill"
              d="M39.8 71.8c.4-29.4 23.8-49.5 62-49.7 40.7-.2 72.8 22.9 73.2 53.9.2 15.4-6.6 29.2-19.4 38.6-11.8 8.8-29.5 13.6-50.5 13.3-20.9-.3-38.2-5.1-49.5-14.3-11.3-9.2-16-23.6-15.8-41.8z"
            />
            <path
              class="cat-inner-ear cat-inner-ear--left"
              d="M42.2 27.1c6.2 4.7 14.8 15.3 19.9 26.9l-17.5 7.2c-4.3-13.4-5.2-25.7-2.4-34.1z"
            />
            <path
              class="cat-inner-ear cat-inner-ear--right"
              d="M174.4 31.4c-7 3.6-16.9 13.1-22.9 24.2l16.5 8.7c5.4-12.1 7.8-24 6.4-32.9z"
            />
            <path
              class="cat-patch cat-patch--head"
              d="M79.1 24.7c10.5-5 25.9-4.2 37 1-7.2 10.6-24.5 10.9-37-1z"
            />
            <path
              class="cat-patch cat-patch--forehead-left"
              d="M61.7 39.6c5.4-4.2 12.7-5.9 18.6-4.1-1.6 6.1-11.8 9.6-18.6 4.1z"
            />
            <path
              class="cat-patch cat-patch--forehead-dot"
              d="M123.9 34.3c4.7-1.8 9.4-.8 12 2.2-2.3 4.2-9 4.6-12-2.2z"
            />
            <path
              class="cat-patch cat-patch--ear-tip"
              d="M166.6 20.6c6.2-1.8 11.9.1 14 5.9 1.3 3.8.1 10.6-3 18.5-7.2-4-10.5-12.1-11-24.4z"
            />
          </g>

          <g class="cat-face">
            <g class="cat-eye cat-eye--left" aria-hidden="true">
              <path
                class="cat-eye-shape"
                d="M69.8 76.3c-1.3-8.9 3.7-16.5 11.5-16.8 8.7-.3 13.4 6.9 12.1 16.4-1.1 8-5.7 14-12 14-6.5.1-10.5-5.6-11.6-13.6z"
              />
              <path class="cat-eye-shine cat-eye-shine--big" d="M75.1 66.3c2.5-3.1 7.3-3.4 10-.8-1.7 4.5-7.9 5-10 .8z" />
              <path class="cat-eye-shine cat-eye-shine--small" d="M87.1 79.6c1.4-1.1 3.4-.5 3.5 1.3-1.1 1.4-3.4 1-3.5-1.3z" />
              <path class="cat-eyelash cat-eyelash--left-a" d="M71.2 61.4c-2.9-2.5-5.8-3.2-8.7-2" />
              <path class="cat-eyelash cat-eyelash--left-b" d="M70.3 65.6c-3.3-1.1-6.1-.5-8.2 1.6" />
            </g>
            <g class="cat-eye cat-eye--right" aria-hidden="true">
              <path
                class="cat-eye-shape"
                d="M122.8 75.3c-1.1-9 3.8-16.4 11.4-16.3 8.4.1 12.9 7.1 11.6 16.5-1.1 7.9-5.5 13.9-11.6 13.9-6.6.1-10.4-5.8-11.4-14.1z"
              />
              <path class="cat-eye-shine cat-eye-shine--big" d="M127.9 65.8c2.5-3 7.1-3.3 9.8-.7-1.7 4.3-7.6 4.8-9.8.7z" />
              <path class="cat-eye-shine cat-eye-shine--small" d="M139.3 78.9c1.4-1.1 3.4-.4 3.5 1.2-1.1 1.4-3.3 1-3.5-1.2z" />
              <path class="cat-eyelash cat-eyelash--right-a" d="M144.2 61c3-2.4 5.9-3 9-1.7" />
              <path class="cat-eyelash cat-eyelash--right-b" d="M145.2 65.2c3.3-1 6-.3 8 1.8" />
            </g>
            <path class="cat-happy-eye cat-happy-eye--left" d="M66.8 74.4c6.9-6.7 19.9-6.7 26.3.3" />
            <path class="cat-happy-eye cat-happy-eye--right" d="M121.4 73.8c6.5-6.4 18.8-6.6 25.4.1" />
            <path class="cat-blush cat-blush--left" d="M53.1 92.4c4.7-5.7 15.7-6.2 20.8-.7-3 6.8-16.4 7.5-20.8.7z" />
            <path class="cat-blush cat-blush--right" d="M140.2 90.9c5.2-5.3 16.2-4.5 20.1 1.4-5.1 6.6-17.9 5.8-20.1-1.4z" />
            <path class="cat-nose" d="M101.1 87.7c3.7-3.1 9.6-3 13.3.2-1.6 5.3-10.6 5.6-13.3-.2z" />
            <path class="cat-mouth cat-mouth--idle" d="M107.6 94.1c-2.9 4.9-8.5 5.2-11.8 1.2m12-.9c3.1 4.6 8.9 4.4 11.8 0" />
            <path class="cat-mouth cat-mouth--happy" d="M96 95.2c5.1 8.2 18.5 7.9 23.7-.6" />
            <path class="cat-mouth cat-mouth--sad" d="M96.7 101.5c5.8-4.5 16.6-4.6 22.2-.3" />
            <path class="cat-whisker cat-whisker--left-a" d="M84.3 91.2c-9.1-2.7-18.2-2.6-26.8.4" />
            <path class="cat-whisker cat-whisker--left-b" d="M84.5 98.4c-8.2 1-15.5 4.1-21.3 8.9" />
            <path class="cat-whisker cat-whisker--right-a" d="M129.8 90.3c9.4-3 18.4-2.9 26.9.1" />
            <path class="cat-whisker cat-whisker--right-b" d="M130.4 97.5c8.6.9 16.1 3.9 22.5 8.7" />
          </g>

          <g class="cat-accessories">
            <path
              class="cat-collar"
              d="M82.9 132.2c15.8 7 37.9 7.4 53.5-.4"
            />
            <path
              class="cat-pendant-link"
              d="M109.5 136.7v6.2"
            />
            <path
              class="cat-heart"
              d="M109.4 145.4c-3.2-3.9-9.2-.4-6.9 4.2 1.4 2.8 4.2 4.8 6.9 6.7 2.9-1.9 6-4 7.3-6.9 2.1-4.7-4.2-7.8-7.3-4z"
            />
          </g>

        </svg>
      </div>

      <div class="passcode-panel">
        <svg
          class="cat-paw-overlay"
          viewBox="0 0 150 64"
          role="presentation"
          aria-hidden="true"
        >
          <path
            class="cat-paw cat-paw--left"
            d="M42.5 15.8c-5.6-4.4-13.4-4.5-19.1-.4-6.1 4.4-8.7 13.1-5.6 20.3 4.1 9.4 17.6 11.2 25.5 3.3 6.5-6.6 6.2-17.1-.8-23.2z"
          />
          <path
            class="cat-paw-line cat-paw-line--left"
            d="M25.9 26.7c.9 2.4.3 5.3-1.7 7.4m8-7.2c.6 2.9-.3 5.7-2.6 7.7m7.9-5.9c.2 2.6-.9 5.1-3 6.9"
          />
          <path
            class="cat-paw cat-paw--right"
            d="M107.5 15.4c5.8-4.2 13.9-3.8 19.3.7 5.7 4.8 7.8 13.7 4.3 20.6-4.6 9.2-18.2 10.4-25.5 2.1-6.1-6.8-5.5-17.9 1.9-23.4z"
          />
          <path
            class="cat-paw-line cat-paw-line--right"
            d="M124.1 26.6c-1 2.4-.5 5.3 1.5 7.5m-7.8-7.3c-.8 2.9.1 5.7 2.3 7.7m-7.8-5.9c-.3 2.6.8 5.1 2.8 6.9"
          />
        </svg>
        <div class="passcode-header">
          <p>
            CHỈ DÀNH CHO BẠN
          </p>
          <button
            ref="passcodeHintButtonRef"
            class="passcode-hint-button"
            type="button"
            aria-label="Xem gợi ý mật mã"
            aria-controls="passcode-hint"
            :aria-expanded="showPasscodeHint"
            @click="showPasscodeHint = !showPasscodeHint"
          >
            <svg
              class="passcode-hint-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 21h6" />
              <path d="M10 17h4" />
              <path d="M8.4 14.4A6 6 0 1 1 15.6 14.4c-.8.7-1.1 1.4-1.1 2.1h-5c0-.7-.3-1.4-1.1-2.1Z" />
              <path d="M12 3v2" />
            </svg>
          </button>
          <h1 id="passcode-title">
            Hãy nhập mật mã
          </h1>
          <div
            v-if="showPasscodeHint"
            id="passcode-hint"
            ref="passcodeHintRef"
            class="passcode-hint-popover"
            role="dialog"
            aria-label="Gợi ý mật mã"
          >
            <button
              class="passcode-hint-close"
              type="button"
              aria-label="Đóng gợi ý mật mã"
              @click="showPasscodeHint = false"
            >
              x
            </button>
            <p>Mật mã chính là một ngày đặc biệt của bạn trong năm</p>
          </div>
        </div>

        <div
          class="passcode-dots"
          role="status"
          aria-live="polite"
          :aria-label="passcodeLabel"
        >
          <span
            v-for="index in 4"
            :key="index"
            class="passcode-dot"
            :class="{ 'passcode-dot--filled': enteredPasscode.length >= index }"
          />
        </div>

        <p
          class="passcode-message"
          :class="{ 'passcode-message--error': passcodeStatus === 'error' }"
          aria-live="polite"
        >
          {{ passcodeMessage }}
        </p>

        <div class="passcode-keypad" aria-label="Bàn phím mật mã">
          <button
            v-for="digit in keypadNumbers"
            :key="digit"
            class="keypad-button"
            type="button"
            :disabled="isPasscodeLocked"
            @click="enterPasscodeDigit(digit)"
          >
            {{ digit }}
          </button>
          <span class="keypad-spacer" aria-hidden="true" />
          <button
            class="keypad-button"
            type="button"
            :disabled="isPasscodeLocked"
            @click="enterPasscodeDigit('0')"
          >
            0
          </button>
          <button
            class="keypad-button keypad-button--backspace"
            type="button"
            aria-label="Xóa số vừa nhập"
            :disabled="isPasscodeLocked || enteredPasscode.length === 0"
            @click="deletePasscodeDigit"
          >
            <span aria-hidden="true">⌫</span>
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="!isIntroComplete"
      class="birthday-intro"
      aria-live="polite"
      aria-label="Lời chúc sinh nhật dành cho Crabe"
    >
      <div v-if="introStep === 'greeting'" class="intro-card intro-card--greeting">
        <p class="intro-kicker">
          Xin chào
        </p>
        <h1>Crabe</h1>
        <p>Hôm nay có một điều nhỏ xinh dành riêng cho bạn.</p>
      </div>

      <div v-else-if="introStep === 'countdown'" class="intro-card intro-card--countdown">
        <div class="intro-countdown" aria-hidden="true">
          <span
            v-for="(number, index) in introCountdownNumbers"
            :key="number"
            class="intro-count"
            :style="{ '--count-delay': `${index * 850}ms` }"
          >
            {{ number }}
          </span>
          <span class="intro-ready">Sẵn sàng</span>
        </div>
        <p class="sr-only">
          Đếm ngược 3, 2, 1.
        </p>
      </div>

      <div
        v-else
        :key="activeIntroMessage.text"
        class="intro-card intro-card--message"
        :class="`intro-card--${activeIntroMessage.variant}`"
      >
        <p v-if="activeIntroMessage.label" class="intro-message-label">
          {{ activeIntroMessage.label }}
        </p>
        <p class="intro-message" :aria-label="activeIntroMessage.text">
          <span
            v-for="(word, wordIndex) in activeIntroMessage.words"
            :key="`${word.text}-${wordIndex}`"
            class="intro-message-word"
          >
            <span
              v-for="(char, charIndex) in word.text"
              :key="`${char}-${charIndex}`"
              :style="{ '--char-delay': `${(word.startIndex + charIndex) * 70}ms` }"
              aria-hidden="true"
            >
              {{ char }}
            </span>
            <span
              v-if="wordIndex < activeIntroMessage.words.length - 1"
              :style="{ '--char-delay': `${(word.startIndex + word.text.length) * 70}ms` }"
              aria-hidden="true"
            >
              &nbsp;
            </span>
          </span>
        </p>
      </div>
    </section>

    <div v-else class="cake-stage" role="img" aria-label="Bánh sinh nhật có nến">
      <BirthdayCake
        :cake-color="selectedColors.cakeColor"
        :cream-color="selectedColors.creamColor"
        :candle-color="selectedColors.candleColor"
        :flame-out="flameOut"
      />
    </div>

    <button
      v-if="isUnlocked && isIntroComplete && !cakeBaked"
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
      v-if="isUnlocked && isIntroComplete && !cakeBaked && showCookingPanel"
      id="cake-cooking-station"
      class="chef-station"
      aria-label="Trạm làm bánh"
    >
      <div class="station-header">
        <p>Bước {{ currentStepIndex + 1 }}/{{ cookingSteps.length }}</p>
        <h1>{{ activeStep.action }}</h1>
      </div>

      <div class="step-tabs" aria-label="Các bước làm bánh">
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
          Quay lại
        </button>
        <button
          class="station-button"
          type="button"
          @click="goNext"
        >
          {{ isLastStep ? 'Hoàn tất bánh' : 'Tiếp' }}
        </button>
      </div>
    </section>

    <div
      v-if="isUnlocked && isIntroComplete && cakeBaked && !flameOut"
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
        {{ micStatus === 'listening' ? 'Đang nghe' : 'Dùng micro' }}
      </button>
      <button
        v-else
        class="mic-tip__button"
        type="button"
        @click="extinguishFlame"
      >
        Thổi nến
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

.birthday-music {
  display: none;
}

.music-toggle {
  position: fixed;
  z-index: 10;
  top: 14px;
  right: 14px;
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid rgba(79, 159, 139, 0.24);
  border-radius: 50%;
  background: rgba(255, 250, 243, 0.78);
  box-shadow: 0 12px 28px rgba(121, 82, 67, 0.14);
  color: rgba(49, 84, 72, 0.68);
  cursor: pointer;
  place-items: center;
  backdrop-filter: blur(12px);
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;
}

.music-toggle:active {
  transform: translateY(1px) scale(0.97);
}

.music-toggle:focus-visible {
  outline: 3px solid rgba(79, 159, 139, 0.34);
  outline-offset: 2px;
}

.music-toggle--playing {
  background: rgba(79, 159, 139, 0.16);
  color: #315448;
}

.music-toggle__icon {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.birthday-intro {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  padding: 32px 20px;
  box-sizing: border-box;
  place-items: center;
  overflow: hidden;
  color: #315448;
}

.intro-card {
  display: grid;
  justify-items: center;
  width: min(360px, 100%);
  text-align: center;
}

.intro-card p,
.intro-card h1 {
  margin: 0;
}

.intro-kicker {
  color: rgba(57, 83, 75, 0.58);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  animation: intro-rise 560ms ease both;
}

.intro-card--greeting h1 {
  margin-top: 8px;
  color: #4f9f8b;
  font-size: clamp(52px, 16vw, 74px);
  font-weight: 900;
  line-height: 0.96;
  animation: intro-pop 740ms 120ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.intro-card--greeting p:last-child {
  max-width: 280px;
  margin-top: 18px;
  color: rgba(57, 83, 75, 0.76);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.42;
  animation: intro-rise 560ms 520ms ease both;
}

.intro-countdown {
  position: relative;
  width: min(280px, 72vw);
  height: 180px;
}

.intro-count,
.intro-ready {
  display: grid;
  position: absolute;
  inset: 0;
  align-items: center;
  justify-items: center;
  color: #4f9f8b;
  font-weight: 900;
  line-height: 1;
}

.intro-count {
  opacity: 0;
  font-size: clamp(78px, 26vw, 126px);
  animation: intro-count 820ms var(--count-delay) cubic-bezier(0.18, 0.78, 0.22, 1) both;
}

.intro-ready {
  opacity: 0;
  color: #315448;
  font-size: clamp(34px, 11vw, 52px);
  animation: intro-ready 720ms 2550ms cubic-bezier(0.18, 0.78, 0.22, 1) both;
}

.intro-message {
  max-width: 315px;
  color: #315448;
  font-size: clamp(26px, 8.5vw, 40px);
  font-weight: 850;
  line-height: 1.16;
  overflow-wrap: normal;
  word-break: normal;
}

.intro-message-label {
  margin-bottom: 14px !important;
  color: rgba(57, 83, 75, 0.58);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  animation: intro-rise 560ms ease both;
}

.intro-card--emphasis .intro-message {
  max-width: 340px;
  color: #4f9f8b;
  font-size: clamp(38px, 12vw, 58px);
  line-height: 1.02;
}

.intro-card--quote .intro-message {
  max-width: 340px;
  color: rgba(49, 84, 72, 0.9);
  font-size: clamp(22px, 7vw, 32px);
  font-weight: 800;
  line-height: 1.24;
}

.intro-message-word {
  display: inline-block;
  white-space: nowrap;
}

.intro-message-word span {
  display: inline-block;
  opacity: 0;
  transform: translateY(8px);
  animation: intro-letter 360ms var(--char-delay) ease both;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

.passcode-screen {
  display: grid;
  position: relative;
  align-content: center;
  justify-items: center;
  min-height: 100vh;
  min-height: 100svh;
  padding: 32px 18px;
  box-sizing: border-box;
  overflow: hidden;
}

@keyframes intro-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes intro-pop {
  from {
    opacity: 0;
    transform: scale(0.84) rotate(-3deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes intro-count {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-24deg);
  }
  28%,
  70% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(1.8) rotate(12deg);
  }
}

@keyframes intro-ready {
  0% {
    opacity: 0;
    transform: scale(0.76);
  }
  45%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes intro-letter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.passcode-panel {
  position: relative;
  width: min(330px, 100%);
  padding: 18px 16px 16px;
  border: 1px solid rgba(79, 159, 139, 0.22);
  border-radius: 18px;
  background: rgba(255, 250, 243, 0.82);
  box-shadow: 0 20px 44px rgba(121, 82, 67, 0.15);
  color: #39534b;
  backdrop-filter: blur(12px);
}

.passcode-header p,
.passcode-header h1,
.passcode-message {
  margin: 0;
}

.passcode-header p {
  color: rgba(57, 83, 75, 0.62);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}

.passcode-header h1 {
  margin-top: 6px;
  color: #315448;
  font-size: 25px;
  line-height: 1.08;
}

.passcode-hint-button {
  display: grid;
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid rgba(79, 159, 139, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 6px 14px rgba(121, 82, 67, 0.12);
  color: #315448;
  font: inherit;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  place-items: center;
}

.passcode-hint-icon {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.passcode-hint-button:focus-visible {
  outline: 3px solid rgba(79, 159, 139, 0.34);
  outline-offset: 2px;
}

.passcode-hint-popover {
  position: absolute;
  z-index: 5;
  top: 48px;
  right: 12px;
  width: min(238px, calc(100% - 24px));
  padding: 12px 34px 12px 12px;
  box-sizing: border-box;
  border: 1px solid rgba(79, 159, 139, 0.22);
  border-radius: 14px;
  background: rgba(255, 250, 243, 0.96);
  box-shadow: 0 14px 30px rgba(121, 82, 67, 0.18);
  color: rgba(57, 83, 75, 0.78);
  text-align: left;
  backdrop-filter: blur(12px);
}

.passcode-hint-popover p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.42;
  text-transform: none;
}

.passcode-hint-close {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(79, 159, 139, 0.12);
  color: #315448;
  font: inherit;
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  place-items: center;
}

.passcode-hint-close:focus-visible {
  outline: 3px solid rgba(79, 159, 139, 0.34);
  outline-offset: 2px;
}

.passcode-dots {
  display: grid;
  grid-template-columns: repeat(4, 16px);
  justify-content: center;
  gap: 13px;
  min-height: 18px;
  margin: 20px 0 11px;
}

.passcode-dot {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(79, 159, 139, 0.45);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  transition: background 180ms ease, transform 180ms ease, border-color 180ms ease;
}

.passcode-dot--filled {
  border-color: #4f9f8b;
  background: #4f9f8b;
  transform: scale(1.08);
}

.passcode-message {
  min-height: 18px;
  color: rgba(57, 83, 75, 0.72);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.passcode-message--error {
  color: #a85045;
}

.passcode-keypad {
  display: grid;
  grid-template-columns: repeat(3, 62px);
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.keypad-button,
.keypad-spacer {
  width: 62px;
  height: 52px;
}

.keypad-button {
  padding: 0;
  border: 1px solid rgba(79, 159, 139, 0.2);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 8px 18px rgba(121, 82, 67, 0.1);
  color: #315448;
  font: inherit;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition: background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.keypad-button:active {
  transform: translateY(1px) scale(0.98);
}

.keypad-button:focus-visible {
  outline: 3px solid rgba(79, 159, 139, 0.34);
  outline-offset: 2px;
}

.keypad-button:disabled {
  cursor: default;
  opacity: 0.54;
}

.keypad-button--backspace {
  font-size: 20px;
}

.passcode-cat {
  position: relative;
  z-index: 1;
  width: 216px;
  height: 214px;
  margin-bottom: -52px;
  transform-origin: 50% 100%;
  animation: cat-breathe 3400ms ease-in-out infinite;
  --cat-eye-x: 0px;
  --cat-eye-y: 0px;
}

.passcode-panel {
  position: relative;
  z-index: 2;
  overflow: visible;
}

.cat-illustration {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.cat-illustration * {
  vector-effect: non-scaling-stroke;
}

.cat-head,
.cat-face,
.cat-paw,
.cat-ear,
.cat-body,
.cat-accessories,
.cat-eye,
.cat-heart,
.cat-tail {
  transform-box: fill-box;
  transform-origin: center;
}

.cat-tail {
  transform-origin: 22% 88%;
  animation: cat-tail 4300ms ease-in-out infinite;
}

.cat-tail-fill {
  fill: #fff4e5;
  stroke: #315448;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
}

.cat-neck,
.cat-head-fill,
.cat-ear,
.cat-paw,
.cat-leg {
  fill: #fff4e5;
  stroke: #315448;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cat-head {
  transform: rotate(-2.4deg);
  transition: transform 260ms cubic-bezier(0.18, 0.78, 0.22, 1);
}

.cat-body {
  opacity: 0.98;
  transform-origin: 50% 65%;
}

.cat-ear {
  transition: transform 220ms cubic-bezier(0.18, 0.78, 0.22, 1);
}

.cat-inner-ear {
  fill: #f4b8bd;
  opacity: 0.86;
  stroke: #315448;
  stroke-width: 1.55;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cat-blush {
  fill: #f3a9b6;
  opacity: 0.58;
  transition: opacity 220ms ease;
}

.cat-patch {
  fill: #f2c8ad;
  opacity: 0.66;
}

.cat-collar {
  fill: none;
  stroke: #eea5ad;
  stroke-width: 3.2;
  stroke-linecap: round;
}

.cat-pendant-link {
  fill: none;
  stroke: #eea5ad;
  stroke-width: 1.7;
  stroke-linecap: round;
}

.cat-heart {
  fill: #e8758e;
  stroke: #315448;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform-origin: 50% 0;
}

.cat-eye {
  transform: translate(var(--cat-eye-x), var(--cat-eye-y));
  transition: opacity 160ms ease, transform 180ms ease;
}

.cat-eye-shape {
  fill: #243f38;
  stroke: #315448;
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform-box: fill-box;
  transform-origin: center;
  animation: cat-blink 6200ms ease-in-out infinite;
}

.cat-eye-shine {
  fill: #fffdf4;
  opacity: 0.95;
}

.cat-mouth,
.cat-paw-line,
.cat-happy-eye,
.cat-whisker,
.cat-eyelash {
  fill: none;
  stroke: #315448;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cat-nose {
  fill: #e78e9f;
  stroke: #315448;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cat-whisker {
  opacity: 0.6;
  stroke-width: 1.25;
}

.cat-eyelash {
  opacity: 0.72;
  stroke-width: 1.5;
}

.cat-leg {
  opacity: 0.92;
}

.cat-paw-overlay {
  position: absolute;
  z-index: 3;
  top: -38px;
  left: 50%;
  display: block;
  width: 150px;
  height: 64px;
  overflow: visible;
  pointer-events: none;
  transform: translateX(-50%);
}

.cat-paw-overlay * {
  vector-effect: non-scaling-stroke;
}

.cat-paw {
  transition: transform 190ms cubic-bezier(0.18, 0.78, 0.22, 1);
}

.passcode-cat--ear-left .cat-ear--left {
  animation: cat-ear-twitch-left 230ms ease;
}

.passcode-cat--ear-right .cat-ear--right {
  animation: cat-ear-twitch-right 230ms ease;
}

.passcode-cat--ear-right .cat-tail {
  animation: cat-tail-flick 250ms ease;
}

.passcode-cat--ear-left .cat-head,
.passcode-cat--ear-right .cat-head {
  animation: cat-head-notice 210ms ease;
}

.passcode-cat--paw-left .cat-paw--left,
.passcode-screen--paw-left .cat-paw-overlay .cat-paw--left {
  transform: translate(1px, 4px) rotate(7deg) scaleY(0.93);
}

.passcode-cat--paw-right .cat-paw--right,
.passcode-screen--paw-right .cat-paw-overlay .cat-paw--right {
  transform: translate(-1px, 4px) rotate(-7deg) scaleY(0.93);
}

.passcode-cat--paw-left .cat-eye,
.passcode-cat--paw-right .cat-eye {
  transform: translate(var(--cat-eye-x), calc(var(--cat-eye-y) - 1px)) scaleY(1.08);
}

.passcode-cat--look-left .cat-eye {
  transform: translate(calc(var(--cat-eye-x) - 1px), var(--cat-eye-y));
}

.passcode-cat--look-right .cat-eye {
  transform: translate(calc(var(--cat-eye-x) + 1px), var(--cat-eye-y));
}

.passcode-cat--digits-2 .cat-head {
  transform: rotate(-.8deg) translateY(-1px);
}

.passcode-cat--digits-3 .cat-head {
  transform: rotate(.8deg) translateY(-2px);
}

.passcode-cat--digits-3 .cat-eye {
  transform: translate(var(--cat-eye-x), calc(var(--cat-eye-y) - 1px)) scale(1.04);
}

.passcode-cat--success {
  animation: cat-celebrate 620ms ease both;
}

.cat-happy-eye,
.passcode-cat--success .cat-eye {
  opacity: 0;
}

.cat-mouth--happy,
.cat-mouth--sad,
.passcode-cat--success .cat-mouth--idle,
.passcode-cat--wrong .cat-mouth--idle {
  opacity: 0;
}

.passcode-cat--success .cat-happy-eye {
  opacity: 1;
}

.passcode-cat--success .cat-mouth--happy,
.passcode-cat--wrong .cat-mouth--sad {
  opacity: 1;
}

.passcode-cat--success .cat-paw--left,
.passcode-screen--success .cat-paw-overlay .cat-paw--left {
  transform: translate(0, -4px) rotate(-7deg);
}

.passcode-cat--success .cat-paw--right,
.passcode-screen--success .cat-paw-overlay .cat-paw--right {
  transform: translate(0, -4px) rotate(7deg);
}

.passcode-cat--success .cat-head {
  transform: rotate(-1deg) translateY(-3px);
}

.passcode-cat--success .cat-tail {
  animation: cat-tail-happy 620ms ease both;
}

.passcode-cat--success .cat-blush {
  opacity: 0.78;
}

.passcode-cat--success .cat-heart {
  animation: cat-heart-bounce 620ms ease both;
}

.passcode-cat--wrong .cat-head {
  transform: rotate(4deg) translateY(2px);
}

.passcode-cat--wrong .cat-ear--left {
  transform: translate(2px, 6px) rotate(12deg);
}

.passcode-cat--wrong .cat-ear--right {
  transform: translate(-2px, 6px) rotate(-12deg);
}

.passcode-cat--wrong .cat-paw--left,
.passcode-screen--wrong .cat-paw-overlay .cat-paw--left {
  transform: translate(4px, 1px) rotate(8deg);
}

.passcode-cat--wrong .cat-paw--right,
.passcode-screen--wrong .cat-paw-overlay .cat-paw--right {
  transform: translate(-4px, 1px) rotate(-8deg);
}

.passcode-cat--wrong .cat-eye {
  transform: translate(0, 2px) scaleY(0.78);
}

.passcode-cat--wrong {
  animation: cat-wrong 420ms ease;
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
  .passcode-screen {
    padding: 24px 14px;
  }

  .passcode-panel {
    padding: 16px 13px 14px;
  }

  .passcode-header h1 {
    font-size: 22px;
  }

  .passcode-keypad {
    grid-template-columns: repeat(3, minmax(54px, 60px));
    gap: 9px;
  }

  .keypad-button,
  .keypad-spacer {
    width: 100%;
    height: 50px;
  }

  .passcode-cat {
    width: 198px;
    height: 196px;
    margin-bottom: -48px;
  }

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

@keyframes cat-breathe {
  0%,
  100% {
    transform: translateY(0) scaleY(1);
  }

  50% {
    transform: translateY(2px) scaleY(0.99);
  }
}

@keyframes cat-blink {
  0%,
  91%,
  100% {
    transform: scaleY(1);
  }

  94% {
    transform: scaleY(0.08);
  }

  96% {
    transform: scaleY(1);
  }
}

@keyframes cat-tail {
  0%,
  100% {
    transform: rotate(-2deg);
  }

  50% {
    transform: rotate(5deg);
  }
}

@keyframes cat-ear-twitch-left {
  0%,
  100% {
    transform: translate(0, 0) rotate(0);
  }

  45% {
    transform: translate(-1px, 1px) rotate(-9deg);
  }

  70% {
    transform: translate(0, 0) rotate(4deg);
  }
}

@keyframes cat-ear-twitch-right {
  0%,
  100% {
    transform: translate(0, 0) rotate(0);
  }

  45% {
    transform: translate(1px, 1px) rotate(9deg);
  }

  70% {
    transform: translate(0, 0) rotate(-4deg);
  }
}

@keyframes cat-head-notice {
  0%,
  100% {
    transform: rotate(-2.4deg) translateY(0);
  }

  48% {
    transform: rotate(-1deg) translateY(-2px);
  }
}

@keyframes cat-tail-happy {
  0%,
  100% {
    transform: rotate(-2deg);
  }

  36% {
    transform: rotate(12deg);
  }

  68% {
    transform: rotate(-7deg);
  }
}

@keyframes cat-tail-flick {
  0%,
  100% {
    transform: rotate(-2deg);
  }

  42% {
    transform: rotate(9deg) translateY(-1px);
  }

  72% {
    transform: rotate(-5deg);
  }
}

@keyframes cat-heart-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  42% {
    transform: translateY(-4px) scale(1.12);
  }

  72% {
    transform: translateY(-1px) scale(.98);
  }
}

@keyframes cat-wrong {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-3px);
  }
}

@keyframes cat-celebrate {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  42% {
    transform: translateY(-8px) rotate(-3deg);
  }

  72% {
    transform: translateY(-4px) rotate(3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .passcode-cat,
  .cat-eye-shape,
  .cat-tail,
  .cat-ear--left,
  .cat-ear--right,
  .cat-heart,
  .passcode-cat--success,
  .passcode-cat--wrong {
    animation: none;
  }

  .cat-paw,
  .cat-eye,
  .keypad-button,
  .passcode-dot {
    transition: none;
  }
}
</style>
