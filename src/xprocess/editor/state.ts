import { computed, reactive, toRaw, ref, watch } from 'vue'
import minBy from 'lodash/minBy'
import { IEventHandlerData } from '../component/use-drag'
import {
  DEFAULT_PROPS,
  IPropsRect,
  IPropsLine,
  SVG_TYPE,
  IPropsCircle,
  IPropsPolygon,
  IPropsText,
  LOCAL_LIST,
  IFont,
  DEFAULT_FONT
} from '../core/svg/base'
import { Edge, setCurrentLine, preventCanvasClickToggle } from '../core/operator/state'
import { useCanvas } from '../core/container/use-canvas'
import {
  ENLARGE_TIMES_FROM_LOCAL_SIZE,
  ENLARGE_TIMES_FROM_LOCAL_STROKE,
  REFERENCE_ATTACH_RANGE
} from '../constant'
import { calEdgeFromNodes } from '../utils'

const { rect: canvasRect, calCanvasSize } = useCanvas()

type IBase = {
  id: number
  fromLines: NodeLine[]
  toLines: NodeLine[]
  font: IFont
  fontEditable?: boolean
  zIndex: number
}
export type NodeRect = Omit<IPropsRect, 'width' | 'height'> & IBase
export type NodeCircle = Omit<IPropsCircle, 'width' | 'height'> & IBase
export type NodePolygon = Omit<IPropsPolygon, 'width' | 'height'> & IBase
export type NodeText = Omit<IPropsText, 'width' | 'height'> & IBase

export type NodeLine = IPropsLine & {
  id: number
  font: IFont
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

type ReferenceLineCol = {
  type: 'col'
  height: number
  left: number
  heightTop: number
  delta: number
  index: number
}
type ReferenceLineRow = {
  type: 'row'
  top: number
  width: number
  widthLeft: number
  delta: number
  index: number
}
type ReferenceLine = ReferenceLineCol | ReferenceLineRow

export type State = {
  filename: string
  currentNode?: XProcessNode
  hoverNode?: XProcessNode
  localComponentList: LocalListItem[]
  nodes: XProcessNode[]
  lines: NodeLine[]
  referenceLines: ReferenceLine[]
  selectedNodes: XProcessNode[]
  showListPanel: boolean
}

export const stateCanvasDataChange = ref(false)
export const state = reactive<State>({
  filename: '',
  currentNode: undefined,
  // 节点的 hover 用 js 实现，因为操作面板放到外层了
  // hover 时需要展示 dot 操作
  hoverNode: undefined,
  referenceLines: [],
  selectedNodes: [],
  localComponentList: LOCAL_LIST.map(x => ({ ...DEFAULT_PROPS, ...x })) as LocalListItem[],
  nodes: [],
  lines: [],
  showListPanel: false
})

export function initState (data: Pick<State, 'nodes' | 'lines' | 'filename'>) {
  state.referenceLines = []
  state.selectedNodes = []
  state.currentNode = undefined
  state.hoverNode = undefined
  stateCanvasDataChange.value = false
  state.nodes = data.nodes.map(node => {
    node.fromLines = node.fromLines.filter(Boolean).map(x => data.lines.find(y => x.id === y.id)!).filter(Boolean)
    node.toLines = node.toLines.filter(Boolean).map(x => data.lines.find(y => x.id === y.id)!).filter(Boolean)
    return node
  })
  state.lines = data.lines
  state.filename = data.filename
  // const stop = watch(() => [state.nodes, state.lines], () => {
  //   stateCanvasDataChange.value = true
  //   stop()
  // }, { deep: true })
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
    ...localItem,
    ...item,
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

  // 计算画布尺寸
  // calCanvasSize()
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
/**
 * 思路：
 * 1. 在节点中匹配当前节点的 6 个边界：x, x1, x2, y, y1, y2
 * 2. 收集符合范围的节点上的线条，及差值
 * 3. 找到最小差值的节点，并显示横向和竖向最接近的线条
 * 4. 吸附当前节点，横向和竖向线条差值最小的那根
 */
export function getReferenceLine (node: XProcessNode, autoAttach: boolean = true, excludeIds: number[] = []) {
  state.referenceLines = []
  const filterIds = [node.id, ...excludeIds]
  const referenceNodes = state.nodes.filter(x => filterIds.every(id => id !== x.id))
  const { rowsY, colsX, width, height } = _getNodePoint(node)
  // 计算当前节点与所有其它节点线条的差值距离
  const resultCols: Array<{ delta: number, lines: ReferenceLine[] }> = []
  const resultRows: Array<{ delta: number, lines: ReferenceLine[] }> = []

  for (const nodeTarget of referenceNodes) {
    const itemPoint = _getNodePoint(nodeTarget)
    const nodeTargetCols = itemPoint.colsX.map(x => {
      // 3根线条最近的那根
      const singleDeltaArr = colsX.map((y, index) => {
        const delta = Math.abs(x - y)
        if (delta < REFERENCE_ATTACH_RANGE) {
          // 距离差值在范围内
          return {
            index,
            delta,
            type: 'col',
            height: Math.max(
              Math.abs(node.start[1] - nodeTarget.end[1]),
              Math.abs(node.end[1] - nodeTarget.start[1])
            ),
            heightTop: Math.min(node.start[1], nodeTarget.start[1]),
            left: x
          }
        }
      }).filter(Boolean)
      if (singleDeltaArr.length) {
        return minBy(singleDeltaArr, 'delta')!
      }
    }).filter(Boolean) as ReferenceLine[]
    if (nodeTargetCols.length) {
      // 收集当前 node 中接近的线与距离
      resultCols.push({ delta: minBy(nodeTargetCols, 'delta')!.delta, lines: nodeTargetCols })
    }

    const nodeTargetRows = itemPoint.rowsY.map(row => {
      // 3根线条最近的那根
      const singleDeltaArr = rowsY.map((y, index) => {
        const delta = Math.abs(row - y)
        if (delta < REFERENCE_ATTACH_RANGE) {
          return {
            index,
            delta,
            type: 'row',
            width: Math.max(
              Math.abs(node.start[0] - nodeTarget.end[0]),
              Math.abs(node.end[0] - nodeTarget.start[0])
            ),
            widthLeft: Math.min(node.start[0], nodeTarget.start[0]),
            top: row
          }
        }
      }).filter(Boolean)
      if (singleDeltaArr.length) {
        return minBy(singleDeltaArr, 'delta')!
      }
    }).filter(Boolean) as ReferenceLine[]
    if (nodeTargetRows.length) {
      resultRows.push({ delta: minBy(nodeTargetRows, 'delta')!.delta, lines: nodeTargetRows })
    }
  }

  if (resultCols.length) {
    const minCol = minBy(resultCols, 'delta')!
    Array.prototype.push.apply(state.referenceLines, minCol.lines)
    if (autoAttach) {
      // 找到最小的差值去吸附
      const minColLine = minBy(minCol.lines, 'delta') as ReferenceLineCol
      const x = minColLine.left
      if (minColLine.index === 0) {
        // 中位线
        node.start[0] = x - width / 2
        node.end[0] = x + width / 2
      } else if (minColLine.index === 1) {
        // 头线
        node.start[0] = x
        node.end[0] = x + width
      } else {
        // 底线
        node.start[0] = x - width
        node.end[0] = x
      }
    }
  }
  if (resultRows.length) {
    const minRow = minBy(resultRows, 'delta')!
    Array.prototype.push.apply(state.referenceLines, minRow.lines)
    // 自动吸附
    if (autoAttach) {
      // 找到最小的差值去吸附
      const minRowLine = minBy(minRow.lines, 'delta') as ReferenceLineRow
      const y = minRowLine.top
      if (minRowLine.index === 0) {
        // 中位线
        node.start[1] = y - height / 2
        node.end[1] = y + height / 2
      } else if (minRowLine.index === 1) {
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
}

let currentNodeCopy: NodeRect | null
export function setCurrentNode (id?: number) {
  if (!id) {
    state.currentNode = undefined
    currentNodeCopy = null
    return
  }
  state.currentNode = state.nodes.find(x => x.id === id)
  if (state.currentNode) {
    currentNodeCopy = JSON.parse(JSON.stringify(state.currentNode))
  } else {
    console.warn(`the id ${id} isn\`t find in nodes`)
  }
}

export function isNodeLine (id: number) {
  const line = state.lines.find(x => x.id === id)
  return line?.type === SVG_TYPE.LINE ||
    !!line?.lineType
}

export function isMovable (id: number) {
  return !isNodeLine(id)
}

export function getDirection (start: number[], end: number[]) {
  const isLeftTop = start[0] >= end[0] && start[1] >= end[1]
  const isLeftBottom = start[0] > end[0] && start[1] < end[1]
  const isRightTop = start[0] < end[0] && start[1] > end[1]
  const isRightBottom = start[0] <= end[0] && start[1] <= end[1]
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
  state.hoverNode = undefined
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
    ...JSON.parse(JSON.stringify(node)),
    ...createItem(),
    font: {
      ...node.font
    },
    fontEditable: false,
    fromLines: [],
    toLines: [],
    start: node.start.map(x => x + 30),
    end: node.end.map(x => x + 30)
  }
  state.nodes.push(newItem)
  setCurrentNode(newItem.id)
}

// export const isMultiSelect = computed(() =>
//   state.currentNode &&
//   state.selectedNodes.length > 1 &&
//   state.selectedNodes.some(x => x.id === state.currentNode!.id)
// )
export const isMultiSelect = computed(() => state.selectedNodes.length > 1)
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
    const originNode = state.nodes.find(x => x.id === copyNode.id)
    if (originNode) {
      alterNodePoint(originNode.start, copyNode.start)
      alterNodePoint(originNode.end, copyNode.end)
      moveNodeLines(originNode)
    }
  })
  // 辅助线
  // 圈选起来生成假的节点
  const { left, top, width, height } = calEdgeFromNodes(state.selectedNodes)
  const virtualNode = { id: -1, start: [left, top], end: [left + width, top + height] }
  getReferenceLine(virtualNode as XProcessNode, false, copySelectedNodes.map(x => x.id))
}

export function handleMultiNodesUp () {
  preventCanvasClickToggle()
  calCanvasSize()
  state.referenceLines = []
}

export const onCalCanvasSize = calCanvasSize
