<script setup lang="ts">
import { ref, onMounted, h, createApp } from 'vue'
import { useDrag, IEventHandler } from '../hooks/use-drag'
import { useCanvas } from './canvas/use-canvas'
import { getPointFromCanvas, getReferenceLine, state as editorState, NodeRect, NodeText } from '../editor/state'
import { SVG_TYPE, SvgType } from '../svg-type/base'
import { ENLARGE_TIMES_FROM_LOCAL_SIZE } from '../constant'
import SvgTypeComponent from '../svg-type/index.vue'

const elRef = ref<HTMLElement | null>(null)
const canDrop = ref(false)
const emits = defineEmits(['drop'])
const props = defineProps<{ type: SvgType }>()
const { registerCallback, onMouseDown: handleMouseDown } = useDrag()
const { isStartInCanvas, inCanvasDOM, inCanvasRect, rect: canvasRect } = useCanvas()

const handler: IEventHandler = (data, e, wrapper) => {
  if (inCanvasRect(e) && canDrop.value) {
    emits('drop', data, wrapper)
    editorState.referenceLines = []
  } else {
    // console.log('false')
  }
}
const onMouseDown = (e: MouseEvent) => {
  isStartInCanvas.value = inCanvasDOM(e)
  handleMouseDown(
    e,
    el => el === elRef.value,
    el => {
      canDrop.value = false
      // 将本地缩小的尺寸放大到等比
      const svg = el.querySelector('svg')!
      const local = editorState.localComponentList.find(x => svg.classList.contains(x.type))!
      const width = local.end[0] * ENLARGE_TIMES_FROM_LOCAL_SIZE
      const height = local.end[1] * ENLARGE_TIMES_FROM_LOCAL_SIZE
      const renderLocalProps = {
        ...local,
        end: [width, height]
      }
      // @ts-ignore
      const ins = createApp({ render: () => h(SvgTypeComponent, renderLocalProps) })
      const div = document.createElement('div')
      ins.mount(div)
      return div.innerHTML
    }
  )
}
onMounted(() => {
  registerCallback('mouseup', {
    handler,
    draggedWrapperEl: elRef.value!
  })
  registerCallback('mousemove', {
    handler: (data, e, wrapper, moveState) => {
      if (inCanvasRect(e)) {
        canDrop.value = Math.abs(data.deltaX) >= 5 && Math.abs(data.deltaY) >= 5
        // 计算参考线
        const local = editorState.localComponentList.find(x => x.type === props.type)!
        const start = getPointFromCanvas([data.endTopLeftX, data.endTopLeftY])
        const width = local.end[0] * ENLARGE_TIMES_FROM_LOCAL_SIZE
        const height = local.end[1] * ENLARGE_TIMES_FROM_LOCAL_SIZE
        const node = {
          start,
          end: [start[0] + width, start[1] + height],
          id: 0
        }
        // 参考线的吸附会直接修改引用值
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
  justify-content: center;
}
</style>
