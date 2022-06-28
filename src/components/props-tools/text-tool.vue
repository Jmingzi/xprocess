<script lang="ts" setup>
import { state as editorState, IFont } from '../editor/state'
import { computed } from 'vue'
import Item from './item.vue'
import XColor from './color.vue'
import iconFontColor from './icon/text_fontstyles_line.png'

const font = computed(() => editorState.currentNode?.font)
const handleChange = (e: InputEvent, field: keyof IFont) => {
  const el = e.target as HTMLInputElement
  if (editorState.currentNode?.font) {
    // @ts-ignore
    editorState.currentNode.font[field] = el.value
  }
}
</script>

<template>
  <Item input>
    <input type="number" :value="font?.fontSize" @blur="e => handleChange(e, 'fontSize')">
  </Item>
  <Item select>
    <XColor
      :value="font?.color ?? '#333333'"
      @change="e => handleChange(e, 'color')"
    >
      <img :src="iconFontColor" alt="">
    </XColor>
  </Item>
</template>

<style lang="less">
</style>
