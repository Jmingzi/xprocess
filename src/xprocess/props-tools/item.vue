<script lang="ts" setup>
import iconTriangleDownFill from './icon/triangle_down_fill.png'
import { state as editorState, isNodeLine } from '../editor/state'
import { currentLine } from '../operation/state'
import { computed, provide } from 'vue'

defineProps<{
  active?: boolean
  select?: boolean
  input?: boolean
  isFill?: boolean
  field?: string
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
      select
    }"
    v-if="!(isFill && isNodeLine(node.id))"
  >
    <slot
      :font="font"
      :node="node"
      :handleChange="handleChange"
      :field="field"
    />
    <img
      v-if="select"
      class="xprocess__tool-item--select"
      :src="iconTriangleDownFill"
    >
  </div>
</template>

<style lang="less">
@import '../var';
.xprocess__tool-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 30px;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  &:not(&.unactivated):hover {
    background-color: @hover-bg;
  }
  &-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    overflow: hidden;
    &.active {
      //border-color: @border-color;
      box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
    }
  }
  //&.unactivated {
  //  opacity: 0.6;
  //  pointer-events: none;
  //}
  img {
    width: 15px;
  }
  input {
    width: 80%;
    height: 80%;
    border: none;
    background-color: transparent;
    padding: 0;
    &:focus {
      outline: none;
    }
  }
  &.input {
    width: 50px;
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
    width: 6px!important;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
