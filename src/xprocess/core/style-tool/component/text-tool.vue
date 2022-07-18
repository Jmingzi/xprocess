<script lang="ts" setup>
import Item from './item.vue'
import XColor from './color.vue'
import iconFontColor from '../icon/font-color.png'
import iconAlignLeft from '../icon/align-left.png'
import iconAlignCenter from '../icon/align-center.png'
import iconAlignRight from '../icon/align-right.png'
import iconItalics from '../icon/italics.png'
import iconBold from '../icon/bold.png'
import iconUnderline from '../icon/underline.png'

const fontStyle = [
  { icon: iconBold, field: 'bold' },
  { icon: iconItalics, field: 'italics' },
  { icon: iconUnderline, field: 'underline' }
]
const fontAlign = [
  { icon: iconAlignLeft, field: 'horizontalAlign', value: 'left' },
  { icon: iconAlignCenter, field: 'horizontalAlign', value: 'center' },
  { icon: iconAlignRight, field: 'horizontalAlign', value: 'right' }
]
</script>

<template>
  <div class="text-panel-item">
    <Item input title="字体大小">
      <template v-slot:default="{ font, handleChange }">
        <input
          class="tools-input"
          type="number"
          :value="font?.fontSize ?? 12"
          @blur="e => handleChange(e, 'fontSize', true)"
        >
      </template>
    </Item>

    <Item v-for="item in fontStyle">
      <template v-slot:default="{ font, handleChange }">
        <div
          class="xprocess__tool-item-inner"
          :class="{ active: font && font[item.field] }"
          @click="handleChange({ target: { value: !font[item.field] } }, item.field, true)"
        >
          <img :src="item.icon" alt="">
        </div>
      </template>
    </Item>
  </div>
  <div class="text-panel-item">
    <Item select title="字体颜色">
      <template v-slot:default="{ font, handleChange }">
        <XColor
          :value="font?.color ?? '#333333'"
          @change="e => handleChange(e, 'color', true)"
        >
          <img :src="iconFontColor" alt="">
        </XColor>
      </template>
    </Item>

    <Item v-for="item in fontAlign">
      <template v-slot:default="{ font, handleChange }">
        <div
          class="xprocess__tool-item-inner"
          :class="{ active: font && (font[item.field] === item.value) }"
          @click="handleChange({ target: { value: item.value } }, item.field, true)"
        >
          <img :src="item.icon" alt="">
        </div>
      </template>
    </Item>
  </div>
</template>

<style lang="less">
@import '../../../var';
input.tools-input::-webkit-inner-spin-button {
  opacity: 1;
}
.text-panel-item {
  display: flex;
  &:last-of-type {
    border-top: 1px @border-color solid;
    margin-top: 5px;
    padding-top: 5px;
  }
}
</style>
