<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const containerRect = ref<DOMRect>()
const emits = defineEmits(['mounted'])
defineProps<{}>()

onMounted(() => {
  containerRect.value = containerRef.value!.getBoundingClientRect()
  emits('mounted', containerRect.value)
})
</script>

<template>
  <slot name="moving" />
  <div class="xprocess-content_wrap">
    <div
      class="xprocess-canvas"
      :ref="v => containerRef = v"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="less">
.xprocess-content_wrap {
  width: 1050px;
  height: 1500px;
  background: url(./images/canvas_bg.jpeg);
  padding: 1000px;
  box-sizing: content-box;
}
.xprocess-canvas {
  position: relative;
  width: 1050px;
  height: 1500px;
  background-color: #fff;
}
</style>
