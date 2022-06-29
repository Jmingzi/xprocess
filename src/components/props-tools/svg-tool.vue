<script lang="ts" setup>
import Item from './item.vue'
import XColor from './color.vue'
import handwritten_fill from './icon/handwritten_fill.png'
import text_impression_line from './icon/text_impression_line.png'
</script>

<template>
  <Item select isFill>
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.fill ?? '#ffffff'" @change="e => handleChange(e, 'fill')">
        <img :src="text_impression_line" alt="">
      </XColor>
    </template>
  </Item>
  <Item select>
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.stroke ?? '#333333'" @change="e => handleChange(e, 'stroke')">
        <img :src="handwritten_fill" alt="">
      </XColor>
    </template>
  </Item>
</template>
