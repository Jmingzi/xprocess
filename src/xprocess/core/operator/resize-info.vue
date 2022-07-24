<script lang="ts" setup>
import { state as editorState, isNodeLine, isMultiSelect } from '../../editor/state'
import { computed, nextTick, ref, watchEffect, watch } from 'vue'

const node = computed(() => editorState.currentNode)
const width = computed(() => node.value ? Math.abs(node.value.start[0] - node.value.end[0]) : 0)
const height = computed(() => node.value ? Math.abs(node.value.start[1] - node.value.end[1]) : 0)
const refEl = ref()
const elRect = ref()
const show = ref(false)

const style = computed(() => {
  if (!node.value || !elRect.value) {
    return
  }
  const nodeWidth = Math.abs(node.value.start[0] - node.value.end[0])
  const nodeHeight = Math.abs(node.value.start[1] - node.value.end[1])
  const halfX = (nodeWidth - elRect.value.width) / 2
  return {
    left: `${parseFloat(String(halfX + node.value.start[0]))}px`,
    top: `${parseFloat(String(nodeHeight + node.value.start[1] + 10))}px`
  }
})

let handle = 0
watch(() => ([editorState.currentNode?.start, editorState.currentNode?.end]), ([start, end], [oldStart, oldEnd]) => {
  if (start && end && oldStart && oldEnd) {
    const width = Math.abs(start[0] - end[0])
    const height = Math.abs(start[1] - end[1])
    const oWidth = Math.abs(oldStart[0] - oldEnd[0])
    const oHeight = Math.abs(oldStart[1] - oldEnd[1])
    if (width !== oWidth || height !== oHeight) {
      show.value = true
      clearTimeout(handle)
      handle = setTimeout(() => {
        show.value = false
      }, 1000)
    }
  }
}, { deep: true })

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
    v-if="show && !isNodeLine(node?.id) && !isMultiSelect"
    class="xprocess-resize-info"
    ref="refEl"
    :style="style"
  >
    宽: {{ width }} 高: {{ height }}
  </div>
</template>

<style lang="less">
@import '../../var';
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
