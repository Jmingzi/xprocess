<script setup lang="ts">
import { watchEffect, ref, inject, computed } from 'vue'
import { state as editorState, isMultiSelect } from '../editor/state'
import { SvgType, SVG_TYPE } from '../svg-type/base'
import { useDrag } from '../hooks/use-drag'
import {
  handleOperationDotMouseDown,
  handleOperationDotMouseMove,
  handleOperationDotMouseUp,
  handleOperationSizeMouseDown,
  handleOperationSizeMouseMove,
  handleOperationSizeMouseUp,
  Edge,
  DirectionString,
} from './state'

// const type = inject<SvgType>('type')
// const nodeId = inject<number>('nodeId')
const nodeId = computed(() => editorState.currentNode?.id)
const lineDot: Edge[] = ['top', 'right', 'bottom', 'left']
const sizeDot = ['leftTop', 'rightTop', 'rightBottom', 'leftBottom']
const { onMouseDown, registerCallback } = useDrag()

const refDotEls = ref<Array<HTMLElement>>([])
const refDotEl = ref<HTMLElement | null>()
const refSizeEls = ref<Array<HTMLElement>>([])
const refSizeEl = ref<HTMLElement | null>()
const hasOperation = computed(() => editorState.currentNode?.type !== SVG_TYPE.LINE)
// const isActive = computed(() =>
//   editorState?.currentNode?.id === nodeId ||
//   (isMultiSelect.value && editorState.selectedNodes.some(x => x.id === nodeId))
// )
const isActive = computed(() => editorState?.currentNode?.id && !isMultiSelect.value)
const isActiveMultiSelected = computed(() => isMultiSelect.value && editorState.selectedNodes.some(x => x.id === nodeId.value))
const style = computed(() => {
  if (editorState.currentNode && hasOperation) {
    const { start, end } = editorState.currentNode
    const width = Math.abs(start[0] - end[0])
    const height = Math.abs(start[1] - end[1])
    return {
      left: `${start[0]}px`,
      top: `${start[1]}px`,
      width: `${width}px`,
      height: `${height}px`
    }
  }
})

const onOperationDotMouseDown = (e: MouseEvent, i: number, edgeString: Edge) => {
  handleOperationDotMouseDown(e, nodeId.value!, edgeString, e => {
    refDotEl.value = refDotEls.value[i]
    onMouseDown(e, el => el === refDotEl.value)
  })
}

const onOperationSizeMouseDown = (e: MouseEvent, i: number, dir: DirectionString) => {
  handleOperationSizeMouseDown(e, dir, () => {
    refSizeEl.value = refSizeEls.value[i]
    onMouseDown(e, el => el === refSizeEl.value)
  })
}

watchEffect(() => {
  if (refDotEl.value) {
    // 事件注册对于同一元素只会绑定一个事件
    registerCallback('mousemove', {
      handler: handleOperationDotMouseMove,
      draggedWrapperEl: refDotEl.value!
    })
    registerCallback('mouseup', {
      handler: handleOperationDotMouseUp,
      draggedWrapperEl: refDotEl.value!
    })
  }
  if (refSizeEl.value) {
    registerCallback('mousemove', {
      handler: handleOperationSizeMouseMove,
      draggedWrapperEl: refSizeEl.value!
    })
    registerCallback('mouseup', {
      handler: handleOperationSizeMouseUp,
      draggedWrapperEl: refSizeEl.value!
    })
  }
})
</script>

<template>
  <div
    v-show="style"
    class="xprocess__drop-wrap"
    :class="{
      active: isActive || isActiveMultiSelected,
      [editorState.currentNode?.type]: true
    }"
    :style="style"
  >
    <template v-for="(edge, i) in lineDot">
      <div
        v-if="hasOperation"
        v-show="isActive"
        class="xprocess__drop-wrap-dot"
        :class="edge"
        ref="refDotEls"
        @mousedown.stop="(e) => onOperationDotMouseDown(e, i, edge)"
      />
    </template>
    <template v-for="(dir, i) in sizeDot">
      <div
        v-if="hasOperation && isActive && !isMultiSelect"
        class="xprocess__drop-wrap-size"
        :class="dir"
        ref="refSizeEls"
        @mousedown.stop="(e) => onOperationSizeMouseDown(e, i, dir)"
      />
    </template>
  </div>
</template>

<style lang="less">
@import '../var';
.xprocess__drop-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  border: 1px transparent solid;
  z-index: @z-index-max;
  &.active {
    border-color: @main-color;
  }
  &-dot {
    pointer-events: all;
    position: absolute;
    width: 8px;
    height: 8px;
    border: 1px @main-color solid;
    border-radius: 50%;
    background-color: #fff;
    cursor: crosshair;
    &.top {
      left: 50%;
      top: 0;
      transform: translate(-50%, -50%);
    }
    &.right {
      top: 50%;
      right: 0;
      transform: translate(50%, -50%);
    }
    &.left {
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%);
    }
    &.bottom {
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 50%);
    }
  }

  &-size {
    pointer-events: all;
    position: absolute;
    width: 8px;
    height: 8px;
    border: 1px @main-color solid;
    //border-radius: 50%;
    background-color: #fff;
    &.leftTop {
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      cursor: nw-resize;
    }
    &.leftBottom {
      left: 0;
      bottom: 0;
      transform: translate(-50%, 50%);
      cursor: sw-resize;
    }
    &.rightTop {
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
      cursor: ne-resize;
    }
    &.rightBottom {
      right: 0;
      bottom: 0;
      transform: translate(50%, 50%);
      cursor: se-resize;
    }
  }
}
</style>
