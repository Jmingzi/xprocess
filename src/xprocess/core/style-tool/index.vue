<script setup lang="ts">
import { state as editorState, canvasNodeMoving, isMultiSelect } from '../../editor/state'
import { currentLine } from '../operator/state'
import { computed, watchEffect, ref, nextTick, watch } from 'vue'
import TextTool from './component/text-tool.vue'
import SvgTool from './component/svg-tool.vue'
import Item from './component/item.vue'
import iconText2 from './icon/text2.png'

const showTextPanel = ref(false)
const data = computed(() => editorState.currentNode || currentLine.value)
const show = ref(false)
const style = computed(() => {
  if (!data.value || !elRect.value) {
    return
  }
  const node = data.value as { start: number[], end: number[] }
  const nodeWidth = Math.abs(node.start[0] - node.end[0])
  // const nodeHeight = Math.abs(node.start[1] - node.end[1])
  const halfX = (elRect.value.width - nodeWidth) / 2
  // 线条的起点不一定是左上角
  const left = Math.min(node.start[0], node.end[0])
  const top = Math.min(node.start[1], node.end[1])
  return {
    left: `${left - halfX}px`,
    top: `${-60 + top}px`
  }
})

const refEl = ref()
const elRect = ref()
watchEffect(() => {
  if (refEl.value) {
    nextTick(() => {
      elRect.value = refEl.value.getBoundingClientRect()
    })
  }
})
watchEffect(() => {
  if (!show.value) {
    showTextPanel.value = false
  }
})
watch(() => data.value?.id && !canvasNodeMoving.value, value => {
  show.value = !!value
})
</script>

<template>
  <transition name="tools">
    <div
      v-if="show && !isMultiSelect"
      ref="refEl"
      class="props-tool"
      :style="style"
      @click.stop=""
    >
      <Item title="文本样式" @click.native="showTextPanel = !showTextPanel">
        <img :src="iconText2" >
      </Item>
      <div class="tools-input__division" />
      <SvgTool />
      <transition name="text">
        <div v-show="showTextPanel" class="props-tool__text-panel">
          <TextTool />
        </div>
      </transition>
    </div>
  </transition>
</template>

<style lang="less">
@import '../../var';
.props-tool {
  position: absolute;
  background-color: #fff;
  box-shadow: @shadow-tools;
  z-index: @z-index-max;
  height: fit-content;
  border: 1px @border-color solid;
  display: flex;
  padding: 5px;
  .tools-input__division {
    width: 1px;
    height: 26px;
    background-color: @border-color;
    margin: 0 5px;
  }

  &__text-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(calc(100% + 5px));
    background-color: #ffffff;
    border: 1px @border-color solid;
    box-shadow: @shadow-tools;
    padding: 5px;
  }
}

.tools-enter-active,
.tools-leave-active {
  transition: all 0.3s ease;
}

.tools-enter-from,
.tools-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.text-enter-active,
.text-leave-active {
  transition: all 0.3s ease;
}

.text-enter-from,
.text-leave-to {
  opacity: 0;
}
</style>
