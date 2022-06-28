<script lang="ts" setup>
import { state as editorState, IFont } from '../editor/state'
import { computed } from 'vue'
import Item from './item.vue'
import XColor from './color.vue'
import handwritten_fill from './icon/handwritten_fill.png'
import text_impression_line from './icon/text_impression_line.png'

const node = computed(() => editorState.currentNode)
const handleChange = (e: InputEvent, field: keyof IFont) => {
  const el = e.target as HTMLInputElement
  if (editorState.currentNode) {
    // @ts-ignore
    editorState.currentNode[field] = el.value
  }
}
</script>

<template>
  <Item>
    <XColor :value="node?.fill ?? '#333333'" @change="e => handleChange(e, 'fill')">
      <img :src="text_impression_line" alt="">
    </XColor>
  </Item>
  <Item>
    <XColor :value="node?.stroke ?? '#333333'" @change="e => handleChange(e, 'stroke')">
      <img :src="handwritten_fill" alt="">
    </XColor>
  </Item>
</template>
