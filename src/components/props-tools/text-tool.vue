<script lang="ts" setup>
import Item from './item.vue'
import XColor from './color.vue'
import iconFontColor from './icon/text_fontstyles_line.png'
</script>

<template>
  <Item input>
    <template v-slot:default="{ font, handleChange }">
      <input
        type="number"
        :value="font?.fontSize ?? 13"
        @blur="e => handleChange(e, 'fontSize', true)"
      >
    </template>
  </Item>
  <Item select>
    <template v-slot:default="{ font, handleChange }">
      <XColor
        :value="font?.color ?? '#333333'"
        @change="e => handleChange(e, 'color', true)"
      >
        <img :src="iconFontColor" alt="">
      </XColor>
    </template>
  </Item>
</template>

<style lang="less">
</style>
