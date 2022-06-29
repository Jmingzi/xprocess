<script lang="ts" setup>
import iconTriangleDownFill from './icon/triangle_down_fill.png'
import { state as editorState } from '../editor/state'
import { currentLine } from '../operation/state'
import { computed, provide } from 'vue'

defineProps<{
  active?: boolean
  select?: boolean
  input?: boolean
}>()

const font = computed(() => editorState.currentNode?.font || currentLine.value?.font)
const node = computed(() => editorState.currentNode || currentLine.value)
provide('font', font)
provide('node', node)

const handleChange = (e: InputEvent, field: any, isFontStyle: Boolean) => {
  const el = e.target as HTMLInputElement
  if (editorState.currentNode) {
    // @ts-ignore
    (isFontStyle ? editorState.currentNode.font : editorState.currentNode)[field] = el.value
  } else if (currentLine.value?.font) {
    // @ts-ignore
    (isFontStyle ? currentLine.value.font : currentLine.value)[field] = el.value
  }
}
</script>

<template>
  <div
    class="xprocess__tool-item"
    :class="{
      input,
      select,
      unactivated: !node
    }"
  >
    <slot :font="font" :node="node" :handleChange="handleChange" />
    <img
      v-if="select"
      class="xprocess__tool-item--select"
      :src="iconTriangleDownFill"
    >
  </div>
</template>

<style lang="less">
.xprocess__tool-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 25px;
  width: 30px;
  @border-color: #aaaaaa;
  padding: 0 5px;
  border: 1px transparent solid;
  &:not(&.unactivated):hover {
    border-color: @border-color;
  }
  &.unactivated {
    opacity: 0.6;
    pointer-events: none;
  }
  input {
    width: 100%;
    height: 80%;
    border: none;
    background-color: transparent;
    padding: 0;
    &:focus {
      outline: none;
    }
  }
  &.input {
    width: 40px;
    padding: 0;
  }
  &.select {
    width: 40px;
    .xcolor {
      width: 100%;
    }
  }
  &--select {
    position: absolute;
    width: 8px;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
