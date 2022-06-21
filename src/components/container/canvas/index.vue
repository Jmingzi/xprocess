<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const containerRect = ref<DOMRect>()
const emits = defineEmits(['mounted'])
defineProps<{}>()
// defineExpose<{
//   canvasRect: Ref<DOMRect | undefined>
// }>({
//   canvasRect: containerRect
// })

onMounted(() => {
  containerRect.value = containerRef.value!.getBoundingClientRect()
  emits('mounted', containerRect.value)
})
</script>

<template>
  <slot name="moving" />
  <div class="xprocess-canvas" :ref="v => containerRef = v">
    <slot />
  </div>
</template>

<style lang="less">
.xprocess {
  &-canvas {
    position: relative;
  }
}
</style>
