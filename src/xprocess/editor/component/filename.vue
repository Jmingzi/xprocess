<script setup lang="ts">
import { ref, nextTick, inject } from 'vue'
import { state as editorState } from '../state'
import { DEFAULT_FILENAME } from '../../constant'
import { IConfig } from '../../index'

const config = inject<IConfig>('config')
const isPreview = ref(true)
const refEl = ref()
const onPreview = async () => {
  isPreview.value = false
  await nextTick()
  refEl.value.focus()
}
const onAlter = (e: FocusEvent) => {
  isPreview.value = true
  editorState.filename = (e.target! as HTMLInputElement).value.trim()
  if (!editorState.filename) {
    editorState.filename = DEFAULT_FILENAME
  }
}
</script>

<template>
  <div class="filename" @click="onPreview">
    <input
      :disabled="config.isReadonly()"
      :readonly="isPreview"
      ref="refEl"
      type="text"
      maxlength="50"
      v-model="editorState.filename"
      @blur="onAlter"
      @keyup.stop=""
      @keydown.stop=""
    >
    <span>.xs</span>
  </div>
</template>

<style lang="less">
@import '../../var';
.filename {
  font-size: 14px;
  pointer-events: all;
  margin-right: 10px;
  height: 100%;
  cursor: pointer;
  color: #333333;
  input {
    text-align: right;
    border: none;
    font: inherit;
    background-color: transparent;
    color: inherit;
    width: 300px;
    &[readonly] {
      cursor: pointer;
    }
    &:focus {
      outline: none;
    }
  }
}
</style>
