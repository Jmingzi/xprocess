<script setup lang="ts">
import { ref, onMounted, reactive, provide } from 'vue'
import Grid from './grid.vue'

const containerRef = ref<HTMLElement | null>(null)
const containerRect = ref<DOMRect>()
const emits = defineEmits(['mounted'])
const size = reactive({
  width: 1050,
  height: 1500
})
provide('page', size)
defineProps<{}>()

onMounted(() => {
  containerRect.value = containerRef.value!.getBoundingClientRect()
  emits('mounted', containerRect.value)
})
</script>

<template>
  <slot name="moving" />
  <div
    class="xprocess-content_wrap"
    :style="{
      width: `${size.width}px`,
      height: `${size.height}px`
    }"
  >
    <div
      class="xprocess-canvas"
      :ref="v => containerRef = v"
    >
      <Grid />
      <slot />
    </div>
  </div>
</template>

<style lang="less">
.xprocess-content_wrap {
  position: relative;
  background: url(./images/canvas_bg.jpeg) fixed;
  padding: 1000px;
  box-sizing: content-box;
}
.xprocess-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
}
</style>
