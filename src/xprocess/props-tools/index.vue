<script setup lang="ts">
import { state as editorState, canvasNodeMoving } from '../editor/state'
import { currentLine } from '../operation/state'
import { computed, watchEffect, ref, nextTick, inject } from 'vue'
import TextTool from './text-tool.vue'
import SvgTool from './svg-tool.vue'
import Item from './item.vue'
import iconText2 from './icon/text2.png'

const showTextPanel = ref(false)
const nodeId = inject<number>('nodeId')
const data = computed(() => editorState.currentNode || currentLine.value)
const show = computed(() => data.value?.id === nodeId && !canvasNodeMoving.value)
const style = computed(() => {
  if (!data.value || !elRect.value) {
    return
  }
  const node = data.value as { start: number[], end: number[] }
  const nodeWidth = Math.abs(node.start[0] - node.end[0])
  // const nodeHeight = Math.abs(node.start[1] - node.end[1])
  const halfX = (elRect.value.width - nodeWidth) / 2
  return {
    left: `${-halfX}px`,
    top: `${-elRect.value.height - 30}px`
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
</script>

<template>
  <transition name="tools">
    <div
      v-if="show"
      ref="refEl"
      class="props-tool"
      :style="style"
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
@import '../var';
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
