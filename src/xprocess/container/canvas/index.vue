<script setup lang="ts">
import { ref, Ref, onMounted, inject, watchPostEffect, watch } from 'vue'
import Grid from './grid.vue'
import Reference from './reference-line.vue'
import { CANVAS_PADDING, BROWSER_SCROLL_WIDTH, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'

const containerRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['mounted', 'rect'])

const size = inject<Ref<{ width: number, height: number }>>('page')
const layout = inject('layout')

watchPostEffect(() => {
  if (size?.value.width && size.value.height) {
    setTimeout(() => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        emits('rect', rect)
      }
    })
  }
})

watch(() => layout, () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    emits('rect', rect)
  }
}, { deep: true })

onMounted(() => {
  emits(
    'mounted',
    document.body.clientWidth - CANVAS_MARGIN_LEFT * 2 - BROWSER_SCROLL_WIDTH,
    document.body.clientHeight - CANVAS_MARGIN_TOP * 2 - BROWSER_SCROLL_WIDTH
  )
})
</script>

<template>
  <slot name="moving" />
  <div
    class="xprocess-content_wrap"
    :style="{
      width: `${size.width}px`,
      height: `${size.height}px`,
      padding: `${CANVAS_PADDING}px`
    }"
  >
    <div
      class="xprocess-canvas"
      :ref="v => containerRef = v"
    >
      <Grid />
      <Reference />
      <slot />
    </div>
  </div>
</template>

<style lang="less">
.xprocess-content_wrap {
  position: relative;
  box-sizing: content-box;
  user-select: none;
}
.xprocess-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
