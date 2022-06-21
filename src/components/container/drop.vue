<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import NodeWrap from '../node-wrap/index.vue'
import { useCanvas } from './canvas/use-canvas'
import { useDrag, IEventHandler } from '../../hooks/use-drag'
import { SvgType } from '../svg-type/base'
import { state as editorState, setCurrentNode, isMovable } from '../editor/state'

const { rect: canvasRect, inCanvas, isStartInCanvas } = useCanvas()
const { onMouseDown: handleMouseDown, registerCallback } = useDrag()
const elRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['move', 'drop'])
const props = defineProps<{
  position: number[],
  type: SvgType,
  nodeId: number
}>()

provide('type', props.type)
provide('nodeId', props.nodeId)

const onMouseDown = (e: MouseEvent) => {
  if (isMovable(props.nodeId)) {
    handleMouseDown(e)
    setCurrentNode(props.nodeId)
    isStartInCanvas.value = inCanvas(e)
  }
}

const handlerMove: IEventHandler = (data, e) => {
  if (inCanvas(e)) {
    emits('move', data, e)
  }
}
onMounted(() => {
  registerCallback('mousemove', {
    handler: handlerMove,
    draggedWrapperEl: elRef.value!
  })
})
</script>

<template>
  <div
    :style="{
      left: `${position[0] - canvasRect.left}px`,
      top: `${position[1] - canvasRect.top}px`
    }"
    class="drop"
    @mousedown="onMouseDown"
  >
    <div
      :ref="v => elRef = v"
      class="drop__node"
    >
      <slot />
    </div>
    <NodeWrap />
  </div>
</template>

<style lang="less">
.drop {
  position: absolute;
  &:hover .xprocess__drop-wrap-dot {
    display: block!important;
  }
  &__node {
    display: flex;
  }
}
</style>
