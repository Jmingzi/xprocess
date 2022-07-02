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
    top: `${y - canvasRect!.value!.top}px`
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
.xprocess__over-panel {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  width: 400px;
  padding: 15px;
  transform: scale(0.5);
  transform-origin: left top;
  background-color: #fff;
  border: 2px #aaa solid;
  border-radius: 5px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, .15);
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 80px;
  }
}
</style>
