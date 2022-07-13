<script setup lang="ts">
import { ref, Ref, onMounted, inject, watchPostEffect, watch } from 'vue'
import Grid from './grid.vue'
import Reference from './reference-line.vue'
import { CANVAS_PADDING, BROWSER_SCROLL_WIDTH, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'
import { useDrag } from '../../hooks/use-drag'
import { circleSelect } from '../../operation/state'

const containerRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['mounted', 'rect'])
const { onMouseDown, registerCallback } = useDrag()

const size = inject<Ref<{ width: number, height: number }>>('page')
const layout = inject('layout')

const handleCircleSelectStart = (e: MouseEvent) => {
  onMouseDown(e)
  circleSelect.value = {
    start: [e.clientX, e.clientY],
    end: []
  }
}

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

  registerCallback('mousemove', {
    handler: (data) => {
      if (circleSelect.value) {
        circleSelect.value.end = [data.endX, data.endY]
        circleSelect.value.direction = data.direction
        // 计算圈选范围内的节点
        // 原理：盒子有交集
      }
    },
    draggedWrapperEl: containerRef.value!
  })
  registerCallback('mouseup', {
    handler: () => {
      if (circleSelect.value) {
        circleSelect.value.start = []
        circleSelect.value.end = []
      }
    },
    draggedWrapperEl: containerRef.value!
  })
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
      @mousedown="handleCircleSelectStart"
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
