<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue'
import { useCanvas } from './use-canvas'
import { useDrag, IEventHandler } from '../../component/use-drag'
import { setCurrentLine, currentLine } from '../operator/state'
import {
  state as editorState,
  setCurrentNode,
  isMovable,
  isNodeLine,
  getDirection,
  selectNode,
  XProcessNode,
  NodeLine,
  canvasNodeMoving,
  getPointFromCanvas
} from '../../editor/state'
import { SvgType, SVG_TYPE, DEFAULT_FONT } from '../svg/base'
import XText from '../operator/rich-text.vue'
import { getLineInfo, onSegment } from '../svg/utils/line'

const { inCanvasRect, isStartInCanvas, calCanvasSize } = useCanvas()
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
  fontEditable?: boolean
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
/**
 * 仅仅提供给 line.vue 文件使用
 */
provide('currentLine', currentLine)

const isActive = computed(() => editorState.currentNode?.id === props.id || editorState.selectedNodes.some(x => x.id === props.id))
const getLinePosition = (start: number[], end: number[]) => {
  // x, y 是图形左上角的点
  let x: number = start[0]
  let y: number = start[1]
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
  return {
    x, y
  }
}

const position = computed(() => {
  const { start, end, type, zIndex } = props
  // x, y 是图形左上角的点
  let x: number = start[0]
  let y: number = start[1]
  if (type === SVG_TYPE.LINE) {
    const p = getLinePosition(start, end)
    x = p.x
    y = p.y
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
    isStartInCanvas.value = true
  } else if (isNodeLine(props.id)) {
    // 判断当前点击位置在线条上
    const line = editorState.lines.find(x => x.id === props.id)
    if (line) {
      const { isPolyline, lineSegment } = getLineInfo(line)
      const mousePoint = getPointFromCanvas([e.clientX, e.clientY])
      // 鼠标点击坐标转换为当前线条的相对坐标
      const linePosition = getLinePosition(line.start, line.end)
      mousePoint[0] -= linePosition.x
      mousePoint[1] -= linePosition.y
      if (isPolyline) {
        // 当前点击点是否在线段上
        if (lineSegment.some(segment => onSegment(segment[0], segment[1], mousePoint))) {
          setCurrentLine(props.id)
          // console.log('set current line.')
        } else {
          setCurrentLine()
        }
      }
    }
    setCurrentNode()
  }
}

const onMouseOver = () => {
  editorState.hoverNode = editorState.nodes.find(x => x.id === props.id)
}
const onMouseOut = () => {
  editorState.hoverNode = undefined
}

const handlerMove: IEventHandler = (data, e) => {
  if (inCanvasRect(e)) {
    canvasNodeMoving.value = true
    emits('move', data, e)
  }
}

const onClick = () => {
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
      canvasNodeMoving.value = false
      editorState.referenceLines = []
      // 计算画布尺寸
      calCanvasSize()
    },
    draggedWrapperEl: elRef.value!
  })
})
</script>

<template>
  <div
    :style="position"
    class="drop"
    :class="{
      active: isActive
    }"
    @mousedown="onMouseDown"
    @mouseover="onMouseOver"
    @mouseleave="onMouseOut"
    @click.stop="onClick"
    @dblclick="onDoubleClick"
  >
    <div
      :ref="v => elRef = v"
      class="drop__node"
    >
      <slot />
    </div>
    <XText />
  </div>
</template>

<style lang="less">
@import '../../var';
.drop {
  position: absolute;
  border: 1px transparent solid;
  &.active {
    border-color: @main-color;
  }
  &__node {
    display: flex;
  }
}
</style>
