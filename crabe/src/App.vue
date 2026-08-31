<script lang="ts" setup>
import BirthdayCake from './components/BirthdayCake.vue'

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
      <BirthdayCake />
    </div>
  </main>
</template>

<style lang="scss" scoped>
.cake-stage {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  place-items: center;
  width: 100%;
  overflow: hidden;
}
</style>
