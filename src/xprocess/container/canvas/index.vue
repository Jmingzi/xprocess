<script setup lang="ts">
import { ref, onMounted, reactive, provide, computed } from 'vue'
import Grid from './grid.vue'
import Reference from './reference-line.vue'
import { state as editorState } from '../../editor/state'
import { CANVAS_PADDING, BROWSER_SCROLL_WIDTH, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'

const containerRef = ref<HTMLElement | null>(null)
const containerRect = ref<DOMRect>()
const emits = defineEmits(['mounted'])
const minSize = reactive({
  width: 1050,
  height: 1050
})

// 根据节点的边界自动计算宽高
const size = computed(() => {
  let minLeft = 100000
  let maxRight = 0
  let minTop = 100000
  let maxBottom = 0
  editorState.nodes.forEach(node => {
    if (node.start[0] < minLeft) {
      minLeft = node.start[0]
    }
    if (node.end[0] > maxRight) {
      maxRight = node.end[0]
    }
    if (node.start[0] < minTop) {
      minTop = node.start[0]
    }
    if (node.start[1] > maxBottom) {
      maxBottom = node.start[1]
    }
  })
  // console.log({
  //   width: maxRight - minLeft < minSize.width ? minSize.width : maxRight - minLeft,
  //   height: maxBottom - minTop < minSize.height ? minSize.height : maxBottom - minTop,
  // })
  return {
    width: maxRight - minLeft < minSize.width ? minSize.width : maxRight - minLeft,
    height: maxBottom - minTop < minSize.height ? minSize.height : maxBottom - minTop,
  }
})

provide('page', size)
defineProps<{}>()

onMounted(() => {
  minSize.width = document.body.clientWidth - CANVAS_MARGIN_LEFT * 2 - BROWSER_SCROLL_WIDTH
  minSize.height = document.body.clientHeight - CANVAS_MARGIN_TOP * 2 - BROWSER_SCROLL_WIDTH
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
  //background: url(./images/canvas_bg.jpeg) fixed;
  //padding: 500px;
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
