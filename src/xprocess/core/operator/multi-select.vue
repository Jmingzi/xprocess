<script setup lang="ts">
import {
  state as editorState,
  isMultiSelect,
  XProcessNode,
  handleMultiNodesMove,
  handleMultiNodesUp
} from '../../editor/state'
import { computed, ref, watchEffect, nextTick } from 'vue'
import { useDrag } from '../../component/use-drag'

const { onMouseDown, registerCallback } = useDrag()
const refEl = ref()
const style = computed(() => {
  if (!isMultiSelect.value) {
    return
  }

  // 从 nodes 中找到四个边界
  let minLeft = -1
  let maxRight = -1
  let minTop = -1
  let maxBottom = -1
  let zIndex = -1
  editorState.selectedNodes.forEach((node, i) => {
    const init = i === 0
    if (init || node.start[0] <= minLeft) {
      minLeft = node.start[0]
    }
    if (init || node.end[0] >= maxRight) {
      maxRight = node.end[0]
    }
    if (init || node.start[1] <= minTop) {
      minTop = node.start[1]
    }
    if (init || node.end[1] >= maxBottom) {
      maxBottom = node.end[1]
    }
    if (init || node.zIndex < zIndex) {
      zIndex = node.zIndex
    }
  })

  const padding = 20
  return {
    left: `${minLeft - padding}px`,
    top: `${minTop - padding}px`,
    width: `${maxRight - minLeft + padding * 2}px`,
    height: `${maxBottom - minTop + padding * 2}px`,
    zIndex
  }
})

let copySelectedNodes: XProcessNode[]
const handleMousedown = (e: MouseEvent) => {
  copySelectedNodes = JSON.parse(JSON.stringify(editorState.selectedNodes))
  onMouseDown(e)
}

watchEffect(() => {
  if (refEl.value) {
    nextTick(() => {
      registerCallback('mousemove', {
        handler: (data) => {
          handleMultiNodesMove(copySelectedNodes, [data.deltaX, data.deltaY])
        },
        draggedWrapperEl: refEl.value
      })
      registerCallback('mouseup', {
        handler: (data) => {
          handleMultiNodesUp()
        },
        draggedWrapperEl: refEl.value
      })
    })
  }
})
</script>

<template>
  <div
    v-if="isMultiSelect"
    ref="refEl"
    class="multi-select"
    :style="style"
    @mousedown.stop="handleMousedown"
  />
</template>

<style lang="less">
@import '../../var';
.multi-select {
  position: absolute;
  z-index: 0;
  border: 1px @focus-color solid;
  cursor: move;
  &:hover {
    box-shadow: @shadow-hover;
  }
}
</style>
