<script setup lang="ts">
import back from './icon-system/back.png'
import { ref, nextTick } from 'vue'
import { state as editorState } from '../editor/state'

const isPreview = ref(true)
const refEl = ref()
const onPreview = async () => {
  isPreview.value = false
  await nextTick()
  refEl.value.focus()
}
const onAlter = (e: InputEvent) => {
  isPreview.value = true
  editorState.filename = (e.target! as HTMLInputElement).value
}
</script>

<template>
  <img
    class="xprocess__back"
    title="返回列表"
    :src="back"
    width="20"
    @click="$router.back()"
  >
  <div class="filename">
    <div
      v-if="isPreview"
      class="filename__preview"
      @click="onPreview"
    >
      {{ editorState.filename }}
    </div>
    <input
      v-else
      ref="refEl"
      type="text"
      v-model="editorState.filename"
      @blur="onAlter"
    >
  </div>
</template>

<style lang="less">
.xprocess__back {
  cursor: pointer;
}
.filename {
  margin-left: 10px;
  font-size: 14px;
  width: 154px;
  &__preview {
    padding: 3px 10px;
    cursor: pointer;
    &:hover {
      background-color: #dedede;
      border-radius: 2px;
    }
  }
}
</style>
