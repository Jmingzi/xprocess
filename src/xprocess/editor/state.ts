import { computed, reactive, toRaw, ref } from 'vue'
import { IEventHandlerData } from '../hooks/use-drag'
import {
  DEFAULT_PROPS,
  IPropsRect,
  IPropsLine,
  SVG_TYPE,
  IPropsCircle,
  DEFAULT_SIZE,
  IPropsPolygon,
  IPropsText
} from '../svg-type/base'
import { Edge, setCurrentLine, preventCanvasClickToggle } from '../operation/state'
import { useCanvas } from '../container/canvas/use-canvas'
import {
  ENLARGE_TIMES_FROM_LOCAL_SIZE,
  ENLARGE_TIMES_FROM_LOCAL_STROKE,
  DEFAULT_FILENAME
} from '../constant'

const { rect: canvasRect } = useCanvas()

type IBase = {
  id: number
  fromLines: NodeLine[]
  toLines: NodeLine[]
  font?: IFont
  fontEditable?: boolean
  zIndex: number
}
export type NodeRect = Omit<IPropsRect, 'width' | 'height'> & IBase
export type NodeCircle = Omit<IPropsCircle, 'width' | 'height'> & IBase
export type NodePolygon = Omit<IPropsPolygon, 'width' | 'height'> & IBase
export type NodeText = Omit<IPropsText, 'width' | 'height'> & IBase

export type IFont = {
  content: string
  fontSize: number
  bold: boolean
  italics: boolean
  underline: boolean
  color: string
  horizontalAlign: 'left' | 'center' | 'right'
}

export type NodeLine = IPropsLine & {
  id: number
  font?: IFont
  fontEditable?: boolean
  zIndex: number
}

export type XProcessNode = NodeRect | NodeCircle | NodePolygon

type ILocalBase<T> = Omit<T, 'id' | 'fromLines' | 'toLines' | 'zIndex'>
type LocalListItemRect = ILocalBase<NodeRect>
type LocalListItemCircle = ILocalBase<NodeCircle>
type LocalListItemPolygon = ILocalBase<NodePolygon>
type LocalListItemText = ILocalBase<NodeText>
export type LocalListItem = LocalListItemRect | LocalListItemCircle | LocalListItemPolygon | LocalListItemText

export const DEFAULT_FONT: IFont = {
  content: '',
  fontSize: 12,
  italics: false,
  bold: false,
  underline: false,
  color: '#333333',
  horizontalAlign: 'center'
}

type ReferenceLine = {
  nodeId: number
  type: 'col' | 'row'
  left: number
  top: number
  width?: number
  height?: number
  distance?: number
}

export type State = {
  filename: string
  currentNode?: XProcessNode
  localComponentList: LocalListItem[]
  nodes: XProcessNode[]
  lines: NodeLine[],
  referenceLines: ReferenceLine[],
  selectedNodes: XProcessNode[]
}

export const state = reactive<State>({
  filename: '',
  currentNode: undefined,
  referenceLines: [],
  selectedNodes: [],
  localComponentList: [
    {
      ...DEFAULT_PROPS,
      type: 'rect',
      round: 5,
      end: DEFAULT_SIZE.rect
    },
    {
      ...DEFAULT_PROPS,
      type: 'circle',
      end: DEFAULT_SIZE.circle
    },
    {
      ...DEFAULT_PROPS,
      type: 'polygon',
      end: DEFAULT_SIZE.polygon
    },
    {
      ...DEFAULT_PROPS,
      type: 'text',
      end: DEFAULT_SIZE.text,
      strokeWidth: 0,
      status: 0,
      fill: 'transparent',
      fontEditable: true,
      font: {
        ...DEFAULT_FONT,
        content: '文本'
      }
    },
    {
      ...DEFAULT_PROPS,
      type: 'polygon-arrow-left',
      end: DEFAULT_SIZE.polygon
    },
    {
      ...DEFAULT_PROPS,
      type: 'polygon-arrow-right',
      end: DEFAULT_SIZE.polygon
    },
    {
      ...DEFAULT_PROPS,
      type: 'polygon-arrow-top',
      end: DEFAULT_SIZE.polygon.slice().reverse()
    },
    {
      ...DEFAULT_PROPS,
      type: 'polygon-arrow-bottom',
      end: DEFAULT_SIZE.polygon.slice().reverse()
    }
  ],
  nodes: [],
  lines: []
})

export function initState (data: Pick<State, 'nodes' | 'lines' | 'filename'>) {
  state.referenceLines = []
  state.selectedNodes = []
  state.currentNode = undefined
  state.nodes = data.nodes
  state.lines = data.lines
  state.filename = data.filename
}

export function getStateRaw () {
  return toRaw(state)
}

export function createItem () {
  return {
    id: Date.now(),
    font: { ...DEFAULT_FONT },
    zIndex: state.nodes.length + state.lines.length
  }
}

export function getPointFromCanvasX (x: number) {
  return x - canvasRect!.value!.left
}

export function getPointFromCanvasY (y: number) {
  return y - canvasRect!.value!.top
}

export function getPointFromCanvas (point: number[]) {
  return [getPointFromCanvasX(point[0]), getPointFromCanvasY(point[1])]
}

export function onDrop (data: IEventHandlerData, node: LocalListItem) {
  const item = createItem()
  const localItem = state.localComponentList.find(x => x.type === node.type) as LocalListItemRect
  const newItem: XProcessNode = {
    ...item,
    ...localItem,
    start: getPointFromCanvas([data.endTopLeftX, data.endTopLeftY]),
    end: getPointFromCanvas([
      data.endTopLeftX + localItem.end[0] * ENLARGE_TIMES_FROM_LOCAL_SIZE,
      data.endTopLeftY + localItem.end[1] * ENLARGE_TIMES_FROM_LOCAL_SIZE
    ]),
    fromLines: [],
    toLines: [],
    strokeWidth: (localItem.strokeWidth ?? 0) * ENLARGE_TIMES_FROM_LOCAL_STROKE
  }
  if (node.type === SVG_TYPE.TEXT) {
    const t = (newItem as NodeText)
    // 隐藏字体图标
    t.status = 1
  }
  // 置空多选
  state.selectedNodes = []
  state.nodes.push(newItem)
  setCurrentNode(newItem.id)
  return newItem
}

/**
 * 在画布上拖拽节点
 */
export const canvasNodeMoving = ref(false)
export function onMoving (data: IEventHandlerData, item: XProcessNode) {
  const { endTopLeftX, endTopLeftY } = data
  const node = state.nodes.find(it => it.id === item.id) as NodeRect
  const width = Math.abs(node.end[0] - node.start[0])
  const height = Math.abs(node.end[1] - node.start[1])
  node.start = getPointFromCanvas([endTopLeftX, endTopLeftY])
  node.end = getPointFromCanvas([endTopLeftX + width, endTopLeftY + height])
  // 先生成参考线，并自动吸附
  getReferenceLine(node)
  // 移动所有的线条
  moveNodeLines(node)
}

export function moveNodeLines (node: XProcessNode) {
  const width = Math.abs(node.end[0] - node.start[0])
  const height = Math.abs(node.end[1] - node.start[1])
  node.fromLines.forEach(line => {
    // 修改线条的起点坐标
    line.start = [
      node.start[0] + line.fromNode.ratioX * width,
      node.start[1] + line.fromNode.ratioY * height
    ]
  })
  node.toLines.forEach(line => {
    line.end = [
      node.start[0] + line.toNode.ratioX * width,
      node.start[1] + line.toNode.ratioY * height
    ]
  })
}

/**
 * 1. 计算当前节点的参考线
 * 2. 自动吸附参考线
 * 思路：在节点中匹配当前节点的 6 个边界：x, x1, x2, y, y1, y2
 */
export function getReferenceLine (node: XProcessNode) {
  const broadPx = 5
  state.referenceLines = []
  const _getNodePoint = (node: XProcessNode) => {
    const { start, end } = node
    const width = Math.abs(end[0] - start[0])
    const height = Math.abs(end[1] - start[1])
    return {
      rowsY: [start[1] + height / 2, start[1], end[1]],
      colsX: [start[0] + width / 2, start[0], end[0]],
      width,
      height
    }
  }
  const { rowsY, colsX, width, height } = _getNodePoint(node)
  state.nodes.filter(x => x.id !== node.id).map(item => {
    const itemPoint = _getNodePoint(item)
    itemPoint.colsX.forEach(x => {
      const colsXIndex = colsX.findIndex(colX => x <= colX + broadPx && x >= colX - broadPx)
      if (colsXIndex > -1) {
        // 同一节点去重，不应该出现多条对齐线
        if (!state.referenceLines.some(x => x.nodeId === item.id && x.type === 'col')) {
          // 自动吸附
          if (colsXIndex === 0) {
            // 中位线
            node.start[0] = x - width / 2
            node.end[0] = x + width / 2
          } else if (colsXIndex === 1) {
            // 头线
            node.start[0] = x
            node.end[0] = x + width
          } else {
            // 底线
            node.start[0] = x - width
            node.end[0] = x
          }
          state.referenceLines.push({
            nodeId: item.id,
            type: 'col',
            top: 0,
            left: x
          })
        }
      }
    })
    itemPoint.rowsY.forEach(y => {
      const rowsYIndex = rowsY.findIndex(rowY => y <= rowY + broadPx && y >= rowY - broadPx)
      if (rowsYIndex > -1) {
        // 同一节点去重，不应该出现多条对齐线
        if (!state.referenceLines.some(x => x.nodeId === item.id && x.type === 'row')) {
          state.referenceLines.push({
            nodeId: item.id,
            type: 'row',
            top: y,
            left: 0
          })
          // 自动吸附
          if (rowsYIndex === 0) {
            // 中位线
            node.start[1] = y - height / 2
            node.end[1] = y + height / 2
          } else if (rowsYIndex === 1) {
            // 头线
            node.start[1] = y
            node.end[1] = y + height
          } else {
            // 底线
            node.start[1] = y - height
            node.end[1] = y
          }
        }
      }
    })
  })
}

let currentNodeCopy: NodeRect | null
export function setCurrentNode (id?: number) {
  if (!id) {
    state.currentNode = undefined
    currentNodeCopy = null
    return
  }
  state.currentNode = state.nodes.find(x => x.id === id)
  currentNodeCopy = JSON.parse(JSON.stringify(state.currentNode))
}

export function isNodeLine (id: number) {
  const node = state.nodes.find(x => x.id === id)
  return node?.type === SVG_TYPE.CURVE
}

export function isMovable (id: number) {
  return !isNodeLine(id)
}

export function getDirection (start: number[], end: number[]) {
  const isLeftTop = start[0] > end[0] && start[1] > end[1]
  const isLeftBottom = start[0] > end[0] && start[1] < end[1]
  const isRightTop = start[0] < end[0] && start[1] > end[1]
  const isRightBottom = start[0] < end[0] && start[1] < end[1]
  return {
    isLeftTop,
    isRightBottom,
    isLeftBottom,
    isRightTop
  }
}

export function getEdge (edge: Edge) {
  const isTop = edge === 'top'
  const isBottom = edge === 'bottom'
  const isLeft = edge === 'left'
  const isRight = edge === 'right'
  return {
    isTop,
    isBottom,
    isRight,
    isLeft
  }
}

function removeNode (id: number) {
  state.nodes.splice(state.nodes.findIndex(x => x.id === id), 1)
}

function removeNodeLines (id: number, lineId: number, field: 'fromLines' | 'toLines') {
  const node = state.nodes.find(x => x.id === id)
  if (node) {
    node[field].splice(node[field].findIndex(x => x.id === lineId), 1)
  }
}

function removeLine (id: number) {
  state.lines.splice(state.lines.findIndex(x => x.id === id), 1)
}

export function deleteNode (node: XProcessNode) {
  // 删除相关线条
  const lineIds: number[] = [
    ...node.fromLines.map(x => x.id),
    ...node.toLines.map(x => x.id)
  ]
  lineIds.forEach(removeLine)
  // 删除节点
  removeNode(node.id)
  setCurrentNode()
}

export function deleteLine (line: NodeLine) {
  removeLine(line.id)
  // 删除节点中的依赖
  removeNodeLines(line.fromNode.nodeId, line.id, 'fromLines')
  removeNodeLines(line.toNode.nodeId, line.id, 'toLines')
  setCurrentLine()
}

export function copyAndCreateNode (node: XProcessNode) {
  const newItem = {
    ...node,
    ...createItem(),
    font: node.font,
    fontEditable: false,
    fromLines: [],
    toLines: [],
    start: node.start.map(x => x + 30),
    end: node.end.map(x => x + 30)
  }
  state.nodes.push(newItem)
  setCurrentNode(newItem.id)
}

export const isMultiSelect = computed(() =>
  state.currentNode &&
  state.selectedNodes.length > 1 &&
  state.selectedNodes.some(x => x.id === state.currentNode!.id)
)
export function selectNode (id: number, metaKey: boolean) {
  const node = state.nodes.find(x => x.id === id)!
  // 取消多选时，需要重新设置当前节点
  let nextCurrentNodeId = id
  if (metaKey) {
    const existIndex = state.selectedNodes.findIndex(x => x.id === id)
    if (existIndex > -1) {
      // 取消多选
      state.selectedNodes.splice(existIndex, 1)
      nextCurrentNodeId = state.selectedNodes[0].id
    } else {
      if (state.currentNode && state.selectedNodes.every(x => x.id !== state.currentNode!.id)) {
        state.selectedNodes.push(state.currentNode)
      }
      state.selectedNodes.push(node)
    }
  } else {
    state.selectedNodes = [node]
  }
  // 在点击多选时，也会触发 click 事件
  // 需要阻止
  preventCanvasClickToggle()
  return nextCurrentNodeId
}

export function handleMultiNodesMove (copySelectedNodes: XProcessNode[], delta: number[]) {
  const alterNodePoint = (originNodePoint: number[], copyNodePoint: number[]) => {
    originNodePoint[0] = copyNodePoint[0] + delta[0]
    originNodePoint[1] = copyNodePoint[1] + delta[1]
  }
  copySelectedNodes.forEach(copyNode => {
    const originNode = state.selectedNodes.find(x => x.id === copyNode.id)
    if (originNode) {
      alterNodePoint(originNode.start, copyNode.start)
      alterNodePoint(originNode.end, copyNode.end)
      moveNodeLines(originNode)
    }
  })
}

export function handleMultiNodesUp () {
  preventCanvasClickToggle()
}