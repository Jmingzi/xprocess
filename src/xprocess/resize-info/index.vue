<script lang="ts" setup>
import { state as editorState, isNodeLine, isMultiSelect } from '../editor/state'
import {computed, nextTick, ref, watchEffect} from 'vue'

const node = computed(() => editorState.currentNode)
const width = computed(() => node.value ? Math.abs(node.value.start[0] - node.value.end[0]) : 0)
const height = computed(() => node.value ? Math.abs(node.value.start[1] - node.value.end[1]) : 0)
const refEl = ref()
const elRect = ref()

const style = computed(() => {
  if (!node.value || !elRect.value) {
    return
  }
  const nodeWidth = Math.abs(node.value.start[0] - node.value.end[0])
  const nodeHeight = Math.abs(node.value.start[1] - node.value.end[1])
  const halfX = (nodeWidth - elRect.value.width) / 2
  return {
    left: `${halfX + node.value.start[0]}px`,
    top: `${nodeHeight + node.value.start[1] + 10}px`
  }
})

watchEffect(() => {
  if (refEl.value) {
    nextTick(() => {
      elRect.value = refEl.value.getBoundingClientRect()
    })
  }
})
</script>

<template>
  <div
    v-if="!isNodeLine(node?.id) && !isMultiSelect"
    class="xprocess-resize-info"
    ref="refEl"
    :style="style"
  >
    宽: {{ width }} 高: {{ height }}
  </div>
</template>

<style lang="less">
@import '../var';
.xprocess-resize-info {
  position: absolute;
  width: fit-content;
  min-width: 80px;
  background-color: #f7f8f9;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px @border-color solid;
  border-radius: 3px;
  color: #666;
  text-align: center;
  z-index: @z-index-max;
}
</style>
