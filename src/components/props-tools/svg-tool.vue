<script lang="ts" setup>
import Item from './item.vue'
import XColor from './color.vue'
import lineColor from './icon/line-color.png'
import bgColor from './icon/bg-color.png'
</script>

<template>
  <Item select isFill>
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.fill ?? '#ffffff'" @change="e => handleChange(e, 'fill')">
        <img :src="bgColor" alt="">
      </XColor>
    </template>
  </Item>
  <Item select>
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.stroke ?? '#333333'" @change="e => handleChange(e, 'stroke')">
        <img :src="lineColor" alt="">
      </XColor>
    </template>
  </Item>
</template>
