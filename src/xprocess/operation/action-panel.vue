<script setup lang="ts">
import { state as editorState, getDirection } from '../editor/state'
import SvgType from '../svg-type/index.vue'
import { useCanvas } from '../container/canvas/use-canvas'
import { computed, ref, onMounted, watchEffect, nextTick } from 'vue'
import { lineUpActionPanelData, handleCreateToNode } from './state'

const refEl = ref<HTMLElement>()
const elRect = ref()

const { rect: canvasRect } = useCanvas()
const style = computed(() => {
  if (!lineUpActionPanelData.value) {
    return
  }
  const { mouseData, x, y } = lineUpActionPanelData.value
  const { startX, startY, endX, endY } = mouseData
  const { isLeftTop, isLeftBottom, isRightBottom, isRightTop } = getDirection([startX, startY], [endX, endY])
  const deltaX = isLeftTop || isLeftBottom ? elRect.value?.width ?? 0 : 0
  return {
    left: `${x - canvasRect!.value!.left - deltaX}px`,
    top: `${y - canvasRect!.value!.top}px`,
    zIndex: editorState.nodes.length + editorState.lines.length + 1
  }
})

watchEffect(() => {
  if (refEl.value) {
    nextTick(() => {
      elRect.value = refEl.value!.getBoundingClientRect()
    })
  }
})
</script>

<template>
  <div
    v-if="!!lineUpActionPanelData"
    ref="refEl"
    class="xprocess__over-panel"
    :style="style"
    @click.stop=""
  >
    <div
      v-for="item in editorState.localComponentList"
      @click="handleCreateToNode(item)"
    >
      <SvgType v-bind="item" />
    </div>
  </div>
</template>

<style lang="less">
@import '../var';
.xprocess__over-panel {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  background-color: #fff;
  border: 1px @border-color solid;
  border-radius: 4px;
  box-shadow: @shadow-tools;
  width: 160px;
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    &:hover {
      background-color: @hover-bg;
      border-radius: 4px;
    }
    svg {
      cursor: pointer!important;
    }
  }
}
</style>
