import { ref } from 'vue'
import {
  createItem,
  NodeLine,
  NodeRect,
  LocalListItem,
  state as editorState,
  getDirection,
  getEdge,
  onDrop,
  setCurrentNode,
  getPointFromCanvas,
  deleteNode,
  deleteLine,
  copyAndCreateNode,
  moveNodeLines,
  onCalCanvasSize,
  getReferenceLine
} from '../../editor/state'
import { DEFAULT_PROPS, SVG_TYPE, SvgType } from '../svg/base'
import { IEventHandlerData } from '../../component/use-drag'
import { CANVAS_CLASS, ENLARGE_TIMES_FROM_LOCAL_SIZE } from '../../constant'
import { getTargetPath } from '../../utils'

export type Edge = 'top' | 'right' | 'bottom' | 'left'
export type DirectionString = 'leftTop' | 'rightTop' | 'rightBottom' | 'leftBottom'

export const currentLine = ref<NodeLine>()
export const lineUpActionPanelData = ref<{
  x: number
  y: number
  mouseData: IEventHandlerData
} | null>()
export const circleSelect = ref<{
  open: boolean
  start: number[]
  end: number[]
}>()

export function setCurrentLine (id?: number) {
  currentLine.value = editorState.lines.find(x => x.id === id)
}

export const handleOperationDotMouseDown = (
  e: MouseEvent,
  nodeId: number,
  edgeString: Edge,
  callback: (e: MouseEvent) => void
) => {
  callback(e)
  const node = editorState.nodes.find(x => x.id === nodeId)!
  const { isTop, isBottom, isLeft, isRight } = getEdge(edgeString)
  const width = Math.abs(node.start[0] - node.end[0])
  const height = Math.abs(node.start[1] - node.end[1])
  // 创建线条
  let x = 0
  let y = 0
  // 距离图形左上角点的宽高比例
  let ratioX = 1
  let ratioY = 1
  // 自动吸附节点边界
  if (isTop || isBottom) {
    x = node.start[0] + width / 2
    y = isTop ? node.start[1] : node.end[1]
    // ratioX = (x - node.start[0]) / width
    ratioX = 0.5
    ratioY = isTop ? 0 : 1
  } else {
    x = isLeft ? node.start[0] : node.end[0]
    y = node.start[1] + height / 2
    ratioX = isLeft ? 0 : 1
    // ratioY = (y - node.start[1]) / height
    ratioY = 0.5
  }
  currentLine.value = {
    ...createItem(),
    ...DEFAULT_PROPS,
    type: SVG_TYPE.LINE as SvgType,
    start: [x, y],
    end: [x, y],
    lineType: 'polyline',
    fromNode: {
      nodeId,
      edge: edgeString,
      ratioX,
      ratioY
    },
    toNode: {
      nodeId: 0,
      edge: edgeString,
      ratioX: 0,
      ratioY: 0
    }
  }
  // 为节点添加线条依赖
  node.fromLines.push(currentLine.value)
  editorState.lines.push(currentLine.value)
}

export const handleOperationDotMouseMove = (evData: IEventHandlerData) => {
  const line = currentLine.value!
  const { startX, startY, endX, endY } = evData
  const { isLeftTop, isRightBottom, isLeftBottom, isRightTop } = getDirection([startX, startY], [endX, endY])
  // start 和 end 是线条的起点和终点
  // 并不是左上角和右下角的点位置
  // 这里直接计算得出 start 和 end 的坐标即可
  if (isRightTop) {
    line.end = [
      line.start[0] + Math.abs(endX - startX),
      line.start[1] - Math.abs(endY - startY)
    ]
  } else if (isRightBottom) {
    line.end = [
      line.start[0] + Math.abs(endX - startX),
      line.start[1] + Math.abs(endY - startY)
    ]
  } else if (isLeftBottom) {
    line.end = [
      line.start[0] - Math.abs(endX - startX),
      line.start[1] + Math.abs(endY - startY)
    ]
  } else if (isLeftTop) {
    line.end = [
      line.start[0] - Math.abs(endX - startX),
      line.start[1] - Math.abs(endY - startY)
    ]
  }

  /**
   * 移动到目标节点上时，自动吸附到节点边界
   */
  const els = Array.from(document.elementsFromPoint(endX, endY))
    // 匹配 dom 节点上的 id 为数字
    // 并且不是起点节点
    .filter(x =>
      x.id &&
      /^\d+$/.test(x.id) &&
      x.id !== String(line.id) &&
      x.id !== String(line.fromNode.nodeId) &&
      // x.tagName.toLowerCase() !== 'line'
      // 线条有这个属性，需要排出
      !x.getAttribute('line-type')
    )
  // 重置状态
  editorState.hoverNode = undefined
  line.toNode.nodeId = 0
  if (els.length) {
    // 计算处于节点的哪个象限，决定属于哪条边界
    // 从而获取 ratioX, ratioY
    const toNodeId = Number(els[0].id)
    const toNode = editorState.nodes.find(x => x.id === toNodeId)!
    // 赋值 hover
    editorState.hoverNode = toNode
    const toNodeWidth = Math.abs(toNode.end[0] - toNode.start[0])
    const toNodeHeight = Math.abs(toNode.end[1] - toNode.start[1])
    const toNodeCenter = [toNode.start[0] + toNodeWidth / 2, toNode.start[1] + toNodeHeight / 2]
    // 四大象限边界点
    const leftTopQuadrant = [...toNode.start, ...toNodeCenter]
    const rightTopQuadrant = [toNodeCenter[0], toNode.start[1], toNode.end[0], toNodeCenter[1]]
    const leftBottomQuadrant = [toNode.start[0], toNodeCenter[1], toNodeCenter[0], toNode.end[1]]
    const rightBottomQuadrant = [...toNodeCenter, ...toNode.end]
    // 计算点在哪个象限
    const isPointInBox = (point: number[], box: number[]) => point[0] >= box[0] && point[1] >= box[1] && point[0] <= box[2] && point[1] <= box[3]
    const delta = (x1: number, x2: number) => Math.abs(x1 - x2)
    let toEdge: Edge = 'top'
    let ratioX: number = 0
    let ratioY: number = 0
    const nearPoint: number[] = []
    const point = getPointFromCanvas([endX, endY])
    const thresholdDistance = 20
    const isNear = (point: number[], target: number[]) => {
      const x = delta(point[0], target[0])
      const y = delta(point[1], target[1])
      return x < thresholdDistance && y < thresholdDistance
    }
    if (isPointInBox(point, leftTopQuadrant)) {
      // 左上象限
      const top = [leftTopQuadrant[2], leftTopQuadrant[1]]
      const left = [leftTopQuadrant[0], leftTopQuadrant[3]]
      const isNearTop = isNear(point, top)
      const isNearLeft = isNear(point, left)
      if (isNearLeft) {
        toEdge = 'left'
        Array.prototype.push.apply(nearPoint, left)
        ratioX = 0
        ratioY = 0.5
      } else if (isNearTop) {
        toEdge = 'top'
        Array.prototype.push.apply(nearPoint, top)
        ratioX = 0.5
        ratioY = 0
      }
    } else if (isPointInBox(point, rightTopQuadrant)) {
      // 右上象限
      const top = [rightTopQuadrant[0], rightTopQuadrant[1]]
      const right = [rightTopQuadrant[2], rightTopQuadrant[3]]
      const isNearTop = isNear(point, top)
      const isNearRight = isNear(point, right)
      if (isNearRight) {
        toEdge = 'right'
        Array.prototype.push.apply(nearPoint, right)
        ratioY = 0.5
        ratioX = 1
      } else if (isNearTop) {
        toEdge = 'top'
        Array.prototype.push.apply(nearPoint, top)
        ratioX = 0.5
        ratioY = 0
      }
    } else if (isPointInBox(point, leftBottomQuadrant)) {
      // 左下象限
      const left = [leftBottomQuadrant[0], leftBottomQuadrant[1]]
      const bottom = [leftBottomQuadrant[2], leftBottomQuadrant[3]]
      const isNearLeft = isNear(point, left)
      const isNearBottom = isNear(point, bottom)
      if (isNearLeft) {
        toEdge = 'left'
        ratioY = 0.5
        ratioX = 0
        Array.prototype.push.apply(nearPoint, left)
      } else if (isNearBottom) {
        toEdge = 'bottom'
        Array.prototype.push.apply(nearPoint, bottom)
        ratioX = 0.5
        ratioY = 1
      }
    } else if (isPointInBox(point, rightBottomQuadrant)) {
      // 右下象限
      const right = [rightBottomQuadrant[2], rightBottomQuadrant[1]]
      const bottom = [rightBottomQuadrant[0], rightBottomQuadrant[3]]
      const isNearRight = isNear(point, right)
      const isNearBottom = isNear(point, bottom)
      if (isNearRight) {
        toEdge = 'right'
        ratioX = 1
        ratioY = 0.5
        Array.prototype.push.apply(nearPoint, right)
      } else if (isNearBottom) {
        toEdge = 'bottom'
        ratioX = 0.5
        ratioY = 1
        Array.prototype.push.apply(nearPoint, bottom)
      }
    }

    // 挂载 toNode
    if (nearPoint.length) {
      const index = toNode.toLines.findIndex(x => x.id === line.id)
      if (index > -1) {
        toNode.toLines.splice(index, 1, line)
      } else {
        toNode.toLines.push(line)
      }
      line.toNode = {
        nodeId: toNode.id,
        edge: toEdge,
        ratioX,
        ratioY
      }
      // 吸附
      line.end = nearPoint
    }
  }
}

export const handleOperationDotMouseUp = (data: IEventHandlerData) => {
  editorState.hoverNode = undefined
  // 移动距离大于 10 才触发
  if (Math.abs(data.deltaX) < 10 && Math.abs(data.deltaY) < 10) {
    removeCreatedLine()
    return
  }
  // 标记是鼠标移动后
  // 而不是单纯的点击事件
  preventCanvasClick(Math.abs(data.endX - data.startX) > 5 || Math.abs(data.endY - data.startY) > 5)
  const line = currentLine.value!
  if (line.toNode.nodeId > 0) {
    // 目标节点已自动吸附
    return
  }
  lineUpActionPanelData.value = {
    x: data.endX,
    y: data.endY,
    mouseData: data
  }
}

export function removeCreatedLine () {
  const line = editorState.lines.find(x => x.toNode.nodeId === 0)
  lineUpActionPanelData.value = null
  // 撤销创建的线条
  const index = editorState.currentNode?.fromLines.findIndex(x => x.id === line?.id) ?? -1
  if (index > -1) {
    editorState.currentNode?.fromLines.splice(index, 1)
  }
  const lineIndex = editorState.lines.findIndex(x => x.id === line?.id)
  if (lineIndex > -1) {
    editorState.lines.splice(lineIndex, 1)
    currentLine.value = undefined
  }
}

/**
 * 控制线条末端的 action
 */
export const isPreventClickListener = ref(false)
export function preventCanvasClick (ok: boolean = true) {
  isPreventClickListener.value = ok
}
export function preventCanvasClickToggle () {
  preventCanvasClick()
  setTimeout(() => {
    preventCanvasClick(false)
  }, 300)
}
const isCanvasClick = (e: MouseEvent) => getTargetPath(e).some(el => el?.classList?.contains(CANVAS_CLASS))
document.body.addEventListener('click', (e: MouseEvent) => {
  editorState.showListPanel = false
  if (!isCanvasClick(e)) {
    // 只处理画布上的点击事件
    return
  }
  if (isPreventClickListener.value) {
    preventCanvasClick(false)
    return
  }
  // console.log('canvas click: 清空选择状态')
  // 置空多选
  editorState.selectedNodes = []
  // 清空圈选
  if (circleSelect.value) {
    circleSelect.value.start = []
    circleSelect.value.end = []
  }
  const line = editorState.lines.find(x => x.toNode.nodeId === 0)
  if (line?.toNode.nodeId === 0) {
    removeCreatedLine()
  } else {
    setCurrentNode()
    setCurrentLine()
  }
})

document.body.addEventListener('keydown', (e: KeyboardEvent) => {
  // console.log(e)
  const isDelete = e.keyCode === 8
  const isKeyD = e.keyCode === 68
  const metaKey = e.metaKey
  if (isDelete) {
    if (editorState.currentNode) {
      deleteNode(editorState.currentNode)
      e.preventDefault()
    } else if (currentLine.value) {
      deleteLine(currentLine.value)
      e.preventDefault()
    }
  }
  // ctrl + D 复用当前图形
  if (metaKey && isKeyD) {
    if (editorState.currentNode) {
      copyAndCreateNode(editorState.currentNode)
      e.preventDefault()
    }
  }
})

/**
 * 线条末端的 action-panel 点击回调
 * 用来自动创建图形节点
 */
export const handleCreateToNode = (item: LocalListItem) => {
  const line = currentLine.value
  if (line && lineUpActionPanelData.value) {
    const localItemDefaultWidth = (item.end[0] - item.start[0]) * ENLARGE_TIMES_FROM_LOCAL_SIZE
    const localItemDefaultHeight = (item.end[1] - item.start[1]) * ENLARGE_TIMES_FROM_LOCAL_SIZE
    const fromEdge = line.fromNode.edge
    const { x, y, mouseData } = lineUpActionPanelData.value
    const { direction: mouseDirection } = mouseData
    let toEdge: Edge = 'left'
    let ratioX: number = 0
    let ratioY: number = 0
    const nodeStart: number[] = []
    const { isRight, isBottom, isLeft, isTop } = getEdge(fromEdge)
    const lineWidth = Math.abs(line.start[0] - line.end[0])
    const lineHeight = Math.abs(line.start[1] - line.end[1])
    const toLeft = () => {
      toEdge = 'left'
      nodeStart.push(x, y - localItemDefaultHeight / 2)
      ratioX = 0
      ratioY = 0.5
    }
    const toTop = () => {
      toEdge = 'top'
      nodeStart.push(x - localItemDefaultWidth / 2, y)
      ratioX = 0.5
      ratioY = 0
    }
    const toRight = () => {
      toEdge = 'right'
      nodeStart.push(x - localItemDefaultWidth, y - localItemDefaultHeight / 2)
      ratioX = 1
      ratioY = 0.5
    }
    const toBottom = () => {
      toEdge = 'bottom'
      nodeStart.push(x - localItemDefaultWidth / 2, y - localItemDefaultHeight)
      ratioX = 0.5
      ratioY = 1
    }
    if (isRight || isLeft) {
      // 水平方向
      if (lineWidth > lineHeight) {
        // 宽大于高
        isRight ? toLeft() : toRight()
      } else if (mouseDirection.isLeftBottom || mouseDirection.isRightBottom) {
        // 向下
        toTop()
      } else {
        toBottom()
      }
    } else if (isBottom || isTop) {
      // 垂直方向
      if (lineWidth < lineHeight) {
        isBottom ? toTop() : toBottom()
      } else if (mouseDirection.isRightBottom || mouseDirection.isRightTop) {
        toLeft()
      } else {
        toRight()
      }
    }

    const toNode = onDrop({
      endTopLeftX: nodeStart[0],
      endTopLeftY: nodeStart[1]
    } as IEventHandlerData, item)
    toNode.toLines.push(line)
    line.toNode = {
      nodeId: toNode.id,
      edge: toEdge,
      ratioX,
      ratioY
    }

    // 删除面板
    lineUpActionPanelData.value = null
  }
}

let copyNode: NodeRect
let direction: DirectionString
export const handleOperationSizeMouseDown = (
  e: MouseEvent,
  directionString: DirectionString,
  callback: () => void
) => {
  copyNode = JSON.parse(JSON.stringify(editorState.currentNode))
  direction = directionString
  callback()
}

export const handleOperationSizeMouseMove = (evData: IEventHandlerData) => {
  const currentNode = editorState.currentNode as NodeRect
  const isLeftTop = direction === 'leftTop'
  const isRightTop = direction === 'rightTop'
  const isLeftBottom = direction === 'leftBottom'
  const isRightBottom = direction === 'rightBottom'
  let deltaX = evData.endX - evData.startX
  let deltaY = evData.endY - evData.startY

  if (isRightTop) {
    currentNode.start[1] = copyNode.start[1] + deltaY
    currentNode.end[0] = copyNode.end[0] + deltaX
  } else if (isLeftBottom) {
    currentNode.start[0] = copyNode.start[0] + deltaX
    currentNode.end[1] = copyNode.end[1] + deltaY
  } else if (isLeftTop) {
    currentNode.start = [
      copyNode.start[0] + deltaX,
      copyNode.start[1] + deltaY
    ]
  } else if (isRightBottom) {
    currentNode.end = [
      copyNode.end[0] + deltaX,
      copyNode.end[1] + deltaY
    ]
  }

  // 先生成参考线，并自动吸附
  getReferenceLine(copyNode)
  moveNodeLines(currentNode)
}

export function handleOperationSizeMouseUp () {
  editorState.referenceLines = []
  preventCanvasClickToggle()
  onCalCanvasSize()
}
