<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue'
import Operation from '../operation/index.vue'
import { useCanvas } from './canvas/use-canvas'
import { useDrag, IEventHandler } from '../hooks/use-drag'
import { setCurrentLine, currentLine } from '../operation/state'
import {
  state as editorState,
  setCurrentNode,
  isMovable,
  isNodeLine,
  getDirection,
  selectNode,
  DEFAULT_FONT,
  XProcessNode,
  NodeLine
} from '../editor/state'
import { SvgType, SVG_TYPE } from '../svg-type/base'
import XText from '../text/index.vue'
import ResizeInfo from '../resize-info/index.vue'

const { inCanvas, isStartInCanvas } = useCanvas()
const { onMouseDown: handleMouseDown, registerCallback } = useDrag()
const elRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['move', 'drop'])
const props = defineProps<{
  id: number
  type: SvgType
  start: number[]
  end: number[]
  zIndex: number
  // 以下为无用 props，仅仅是接收后 dom 属性好看美观
  fromLines?: any[]
  toLines?: any
  font?: any
  fromNode?: any
  toNode?: any
  lineType?: string
  stroke?: string
  strokeWidth?: number
  fill?: string
  round?: number
}>()

provide('type', props.type)
provide('nodeId', props.id)

const position = computed(() => {
  const { start, end, type, zIndex } = props
  // x, y 是图形左上角的点
  let x: number = start[0]
  let y: number = start[1]
  if (type === SVG_TYPE.LINE) {
    // start, end 是线条的起点和终点
    // 需要转换为左上角点的位置
    const { isLeftTop, isLeftBottom, isRightTop, isRightBottom } = getDirection(start, end)
    if (isRightBottom) {
      x = start[0]
      y = start[1]
    } else if (isRightTop) {
      x = start[0]
      y = end[1]
    } else if (isLeftTop) {
      x = end[0]
      y = end[1]
    } else if (isLeftBottom) {
      x = end[0]
      y = start[1]
    }
  }

  return {
    left: `${x}px`,
    top: `${y}px`,
    zIndex
  }
})

const onMouseDown = (e: MouseEvent) => {
  if (isMovable(props.id)) {
    const hasMetaKey = e.metaKey
    handleMouseDown(e)
    const nextCurrentNodeId = selectNode(props.id, hasMetaKey)
    setCurrentNode(nextCurrentNodeId)
    setCurrentLine()
    isStartInCanvas.value = inCanvas(e)
  } else if (isNodeLine(props.id)) {
    setCurrentLine(props.id)
    setCurrentNode()
  }
}

const handlerMove: IEventHandler = (data, e) => {
  if (inCanvas(e)) {
    emits('move', data, e)
  }
}

const onDoubleClick = () => {
  const createFont = (node: XProcessNode | NodeLine) => {
    // 创建空的文本内容
    node.fontEditable = true
    if (!node.font) {
      node.font = { ...DEFAULT_FONT }
    }
  }
  if (isNodeLine(props.id) && currentLine.value) {
    createFont(currentLine.value)
  } else if (editorState.currentNode) {
    createFont(editorState.currentNode)
  }
}

onMounted(() => {
  registerCallback('mousemove', {
    handler: handlerMove,
    draggedWrapperEl: elRef.value!
  })
  registerCallback('mouseup', {
    handler: () => {
      editorState.referenceLines = []
    },
    draggedWrapperEl: elRef.value!
  })
})
</script>

<template>
  <div
    :style="position"
    class="drop"
    @mousedown="onMouseDown"
    @click.stop=""
    @dblclick="onDoubleClick"
  >
    <div
      :ref="v => elRef = v"
      class="drop__node"
    >
      <slot />
    </div>
    <XText />
    <Operation />
    <ResizeInfo />
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
