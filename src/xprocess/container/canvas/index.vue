<script setup lang="ts">
import { ref, Ref, onMounted, inject, watchPostEffect, watch } from 'vue'
import Grid from './grid.vue'
import Reference from './reference-line.vue'
import { CANVAS_PADDING, BROWSER_SCROLL_WIDTH, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'
import { useDrag } from '../../hooks/use-drag'
import { circleSelect } from '../../operation/state'
import { state as editorState, getPointFromCanvas, canvasNodeMoving } from '../../editor/state'

const containerRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['mounted', 'rect'])
const { onMouseDown, registerCallback } = useDrag()

const size = inject<Ref<{ width: number, height: number }>>('page')
const layout = inject('layout')

const handleCircleSelectStart = (e: MouseEvent) => {
  onMouseDown(e)
  circleSelect.value = {
    open: true,
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

const isCircleBoxCoverNode = (
  circleBox: { start: number[], end: number[] },
  nodeBox: { start: number[], end: number[] }
) => {
  // 判断 node 的四个角是否有其中一个在圈选的范围内
  const points = [
    nodeBox.start,
    [nodeBox.end[0], nodeBox.start[1]],
    nodeBox.end,
    [nodeBox.start[0], nodeBox.end[1]]
  ]
  return points.some(point => (
    point[0] >= circleBox.start[0] &&
    point[0] <= circleBox.end[0] &&
    point[1] >= circleBox.start[1] &&
    point[1] <= circleBox.end[1]
  ))
}

onMounted(() => {
  emits(
    'mounted',
    document.body.clientWidth - CANVAS_MARGIN_LEFT * 2 - BROWSER_SCROLL_WIDTH,
    document.body.clientHeight - CANVAS_MARGIN_TOP * 2 - BROWSER_SCROLL_WIDTH
  )

  // 计算圈选范围
  registerCallback('mousemove', {
    handler: (data) => {
      if (circleSelect.value?.open && !canvasNodeMoving.value) {
        const { startX, startY, endX, endY, direction } = data
        const { isLeftTop, isLeftBottom, isRightBottom, isRightTop } = direction
        const start: number[] = []
        const end: number[] = []
        if (isRightBottom) {
          start.push(startX, startY)
          end.push(endX, endY)
        } else if (isRightTop) {
          start.push(startX, endY)
          end.push(endX, startY)
        } else if (isLeftTop) {
          start.push(endX, endY)
          end.push(startX, startY)
        } else if (isLeftBottom) {
          start.push(endX, startY)
          end.push(startX, endY)
        }
        circleSelect.value.start = getPointFromCanvas(start)
        circleSelect.value.end = getPointFromCanvas(end)
        // 计算圈选范围内的节点
        // 原理：盒子有交集
        editorState.selectedNodes = editorState.nodes.filter(node => isCircleBoxCoverNode(circleSelect.value!, node))
        // if (editorState.selectedNodes.length) {
        //   editorState.currentNode = editorState.selectedNodes[0]
        // }
      }
    },
    draggedWrapperEl: containerRef.value!
  })
  registerCallback('mouseup', {
    handler: () => {
      if (circleSelect.value) {
        circleSelect.value.start = []
        circleSelect.value.end = []
        circleSelect.value.open = false
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
      @mousedown.stop="handleCircleSelectStart"
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
