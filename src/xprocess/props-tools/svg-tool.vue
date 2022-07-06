<script lang="ts" setup>
import Item from './item.vue'
import XColor from './color.vue'
import lineColor from './icon/line-color.png'
import bgColor from './icon/bg-color.png'
import iconTop from './icon/top.png'
import iconBottom from './icon/bottom.png'
import iconLineDash from './icon/dash-line.png'
import iconLineSolid from './icon/solid-line.png'
import { XProcessNode, NodeLine, state as editorState } from '../editor/state'

const onZIndex = (isTop: boolean, node: XProcessNode) => {
  const index = node.zIndex
  const indexMax = editorState.lines.length + editorState.nodes.length
  const decrease = (items: Array<XProcessNode | NodeLine>) => {
    items.forEach(it => {
      if (it.zIndex > index && it.zIndex <=indexMax) {
        it.zIndex -= 1
      }
    })
  }
  const add = (items: Array<XProcessNode | NodeLine>) => {
    items.forEach(it => {
      if (it.zIndex < index && it.zIndex >= 0) {
        it.zIndex += 1
      }
    })
  }
  if (isTop) {
    decrease(editorState.lines)
    decrease(editorState.nodes)
    node.zIndex = indexMax
  } else {
    add(editorState.lines)
    add(editorState.nodes)
    node.zIndex = 0
  }
}
</script>

<template>
  <Item select isFill title="填充色">
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.fill ?? '#ffffff'" @change="e => handleChange(e, 'fill')">
        <img :src="bgColor" alt="">
      </XColor>
    </template>
  </Item>
  <Item select title="线条颜色">
    <template v-slot:default="{ node, handleChange }">
      <XColor :value="node?.stroke ?? '#333333'" @change="e => handleChange(e, 'stroke')">
        <img :src="lineColor" alt="">
      </XColor>
    </template>
  </Item>

  <Item title="连线类型">
    <template v-slot:default="{ node, handleChange }">
      <div class="xprocess__tool-item-inner" @click="handleChange({ target: { value: node?.strokeDasharray !== 4 ? 4 : 0 } }, 'strokeDasharray')">
        <img :src="node?.strokeDasharray !== 4 ? iconLineSolid : iconLineDash" alt="">
      </div>
    </template>
  </Item>

  <div class="tools-input__division" />

  <Item title="置于顶层">
    <template v-slot:default="{ node, handleChange }">
      <div class="xprocess__tool-item-inner" @click="onZIndex(true, node)">
        <img :src="iconTop" alt="">
      </div>
    </template>
  </Item>
  <Item title="置于底层">
    <template v-slot:default="{ node, handleChange }">
      <div class="xprocess__tool-item-inner" @click="onZIndex(false, node)">
        <img :src="iconBottom" alt="">
      </div>
    </template>
  </Item>
</template>
