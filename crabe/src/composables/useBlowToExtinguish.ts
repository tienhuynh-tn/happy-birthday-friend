import { computed, onBeforeUnmount, ref } from 'vue'

type BlowStatus = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported'

interface UseBlowToExtinguishOptions {
  onBlow: () => void
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext
}

export function useBlowToExtinguish(options: UseBlowToExtinguishOptions) {
  const status = ref<BlowStatus>('idle')
  const errorMessage = ref('')

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let stream: MediaStream | null = null
  let frameId = 0
  let loudSince = 0

  const hasMicrophoneApi = () => {
    return typeof window !== 'undefined'
      && typeof navigator !== 'undefined'
      && !!navigator.mediaDevices?.getUserMedia
      && !!(window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext)
  }

  const stopListening = async () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
      frameId = 0
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }

    if (audioContext) {
      await audioContext.close()
      audioContext = null
    }

    analyser = null
    loudSince = 0
  }

  const handleBlow = async () => {
    options.onBlow()
    await stopListening()
  }

  const watchInput = () => {
    if (!analyser)
      return

    const samples = new Uint8Array(analyser.fftSize)
    const detect = () => {
      if (!analyser)
        return

      analyser.getByteTimeDomainData(samples)

      let total = 0
      for (const sample of samples) {
        const normalized = (sample - 128) / 128
        total += normalized * normalized
      }

      const rms = Math.sqrt(total / samples.length)
      const now = performance.now()

      if (rms > 0.16) {
        loudSince ||= now
        if (now - loudSince > 260) {
          handleBlow().catch(() => undefined)
          return
        }
      }
      else {
        loudSince = 0
      }

      frameId = requestAnimationFrame(detect)
    }

    frameId = requestAnimationFrame(detect)
  }

  const startListening = async () => {
    if (!hasMicrophoneApi()) {
      status.value = 'unsupported'
      errorMessage.value = 'Microphone is not available here.'
      return
    }

    status.value = 'requesting'
    errorMessage.value = ''

    try {
      await stopListening()

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      const AudioContextConstructor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext
      if (!AudioContextConstructor) {
        status.value = 'unsupported'
        errorMessage.value = 'Use the button below to blow out the candle.'
        await stopListening()
        return
      }

      audioContext = new AudioContextConstructor()
      const source = audioContext.createMediaStreamSource(stream)
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)

      if (audioContext.state === 'suspended')
        await audioContext.resume()

      status.value = 'listening'
      watchInput()
    }
    catch (error) {
      await stopListening()

      const name = error instanceof DOMException ? error.name : ''
      status.value = name === 'NotAllowedError' || name === 'PermissionDeniedError'
        ? 'denied'
        : 'unsupported'
      errorMessage.value = 'Use the button below to blow out the candle.'
    }
  }

  onBeforeUnmount(() => {
    stopListening().catch(() => undefined)
  })

  return {
    errorMessage,
    hasFallback: computed(() => status.value === 'denied' || status.value === 'unsupported'),
    startListening,
    status,
    stopListening,
  }
}
