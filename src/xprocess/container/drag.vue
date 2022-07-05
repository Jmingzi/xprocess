<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDrag, IEventHandler } from '../hooks/use-drag'
import { useCanvas } from './canvas/use-canvas'
import { getPointFromCanvas, getReferenceLine, state as editorState, NodeRect } from '../editor/state'
import { SvgType } from '../svg-type/base'

const elRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['drop'])
const props = defineProps<{ type: SvgType }>()
const { registerCallback, onMouseDown: handleMouseDown } = useDrag()
const { isStartInCanvas, inCanvas, rect: canvasRect } = useCanvas()

const handler: IEventHandler = (data, e, wrapper) => {
  if (inCanvas(e)) {
    emits('drop', data, wrapper)
    editorState.referenceLines = []
  } else {
    // console.log('false')
  }
}
const onMouseDown = (e: MouseEvent) => {
  isStartInCanvas.value = inCanvas(e)
  handleMouseDown(
    e,
    el => el === elRef.value,
    el => el.querySelector('svg')!.outerHTML
  )
}
onMounted(() => {
  registerCallback('mouseup', {
    handler,
    draggedWrapperEl: elRef.value!
  })
  registerCallback('mousemove', {
    handler: (data, e, wrapper, moveState) => {
      if (inCanvas(e)) {
        // 计算参考线
        const local = editorState.localComponentList.find(x => x.type === props.type)!
        const start = getPointFromCanvas([data.endTopLeftX, data.endTopLeftY])
        const node = { start, end: [start[0] + local.end[0], start[1] + local.end[1]], id: 0 }
        getReferenceLine(node as NodeRect)
        // 将参考线的吸附修改映射到 state
        if (moveState && canvasRect && canvasRect.value) {
          moveState.endTopLeftX = node.start[0] + canvasRect.value.left
          moveState.endTopLeftY = node.start[1] + canvasRect.value.top
          moveState.endX = moveState.endTopLeftX + moveState.startOffsetTopLeftX
          moveState.endY = moveState.endTopLeftY + moveState.startOffsetTopLeftY
        }
      }
    },
    draggedWrapperEl: elRef.value!
  })
})
</script>

<template>
  <div
    :ref="v => elRef = v"
    class="xprocess__drag"
    @mousedown="onMouseDown"
  >
    <slot />
  </div>
</template>

<style lang="less">
.xprocess__drag {
  display: flex;
}
</style>
