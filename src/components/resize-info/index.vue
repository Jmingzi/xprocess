<script lang="ts" setup>
import { state as editorState } from '../editor/state'
import { computed } from 'vue'

const width = computed(() => editorState.currentNode ? Math.abs(editorState.currentNode.start[0] - editorState.currentNode.end[0]) : 0)
const height = computed(() => editorState.currentNode ? Math.abs(editorState.currentNode.start[1] - editorState.currentNode.end[1]) : 0)
</script>

<template>
  <div class="xprocess-resize-info">
    宽: {{ width }} 高: {{ height }}
  </div>
</template>

<style lang="less">
.xprocess-resize-info {
  position: absolute;
  bottom: -30px;
  left: 50%;
  width: fit-content;
  min-width: 80px;
  transform: translateX(-50%);
  background-color: #f7f8f9;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px #eee solid;
  border-radius: 3px;
  color: #666;
  text-align: center;
}
</style>
