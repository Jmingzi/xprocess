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

const { rect: canvasRect, calCanvasSize } = useCanvas()

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
  // ????????? hover ??? js ??????????????????????????????????????????
  // hover ??????????????? dot ??????
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
    node.fromLines = node.fromLines.filter(Boolean).map(x => data.lines.find(y => x.id === y.id)!)
    node.toLines = node.toLines.filter(Boolean).map(x => data.lines.find(y => x.id === y.id)!)
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
    // ??????????????????
    t.status = 1
  }
  // ????????????
  state.selectedNodes = []
  state.nodes.push(newItem)
  setCurrentNode(newItem.id)

  // ??????????????????
  // calCanvasSize()
  return newItem
}

/**
 * ????????????????????????
 */
export const canvasNodeMoving = ref(false)
export function onMoving (data: IEventHandlerData, item: XProcessNode) {
  const { endTopLeftX, endTopLeftY } = data
  const node = state.nodes.find(it => it.id === item.id) as NodeRect
  const width = Math.abs(node.end[0] - node.start[0])
  const height = Math.abs(node.end[1] - node.start[1])
  node.start = getPointFromCanvas([endTopLeftX, endTopLeftY])
  node.end = getPointFromCanvas([endTopLeftX + width, endTopLeftY + height])
  // ????????????????????????????????????
  getReferenceLine(node)
  // ?????????????????????
  moveNodeLines(node)
}

export function moveNodeLines (node: XProcessNode) {
  const width = Math.abs(node.end[0] - node.start[0])
  const height = Math.abs(node.end[1] - node.start[1])
  node.fromLines.forEach(line => {
    // ???????????????????????????
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
 * 1. ??????????????????????????????
 * 2. ?????????????????????
 * ?????????????????????????????????????????? 6 ????????????x, x1, x2, y, y1, y2
 */
export function getReferenceLine (node: XProcessNode) {
  const broadPx = REFERENCE_ATTACH_RANGE
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
  // ????????????????????????????????????????????????????????????
  const resultCols: ReferenceLine[] = []
  const resultRows: ReferenceLine[] = []
  state.nodes.filter(x => x.id !== node.id).map(item => {
    const itemPoint = _getNodePoint(item)
    itemPoint.colsX.forEach(x => {
      colsX.forEach((y, index) => {
        resultCols.push({
          index,
          delta: Math.abs(x - y),
          type: 'col',
          height: Math.max(
            Math.abs(node.start[1] - item.end[1]),
            Math.abs(node.end[1] - item.start[1])
          ),
          heightTop: Math.min(node.start[1], item.start[1]),
          left: x
        })
      })
    })
    itemPoint.rowsY.forEach(x => {
      rowsY.forEach((y, index) => {
        resultRows.push({
          index,
          delta: Math.abs(x - y),
          type: 'row',
          width: Math.max(
            Math.abs(node.start[0] - item.end[0]),
            Math.abs(node.end[0] - item.start[0])
          ),
          widthLeft: Math.min(node.start[0], item.start[0]),
          top: x
        })
      })
    })
  })
  // ?????????????????????
  const minCol = minBy(resultCols, 'delta') as ReferenceLineCol
  if (minCol && minCol.delta < broadPx) {
    state.referenceLines.push(minCol)
    // ??????
    const x = minCol.left
    if (minCol.index === 0) {
      // ?????????
      node.start[0] = x - width / 2
      node.end[0] = x + width / 2
    } else if (minCol.index === 1) {
      // ??????
      node.start[0] = x
      node.end[0] = x + width
    } else {
      // ??????
      node.start[0] = x - width
      node.end[0] = x
    }
  }
  const minRow = minBy(resultRows, 'delta') as ReferenceLineRow
  if (minRow && minRow.delta < broadPx) {
    state.referenceLines.push(minRow)
    // ????????????
    const y = minRow.top
    if (minRow.index === 0) {
      // ?????????
      node.start[1] = y - height / 2
      node.end[1] = y + height / 2
    } else if (minRow.index === 1) {
      // ??????
      node.start[1] = y
      node.end[1] = y + height
    } else {
      // ??????
      node.start[1] = y - height
      node.end[1] = y
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
  // ??????????????????
  const lineIds: number[] = [
    ...node.fromLines.map(x => x.id),
    ...node.toLines.map(x => x.id)
  ]
  lineIds.forEach(removeLine)
  // ????????????
  removeNode(node.id)
  setCurrentNode()
  state.hoverNode = undefined
}

export function deleteLine (line: NodeLine) {
  removeLine(line.id)
  // ????????????????????????
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
  // ????????????????????????????????????????????????
  let nextCurrentNodeId = id
  if (metaKey) {
    const existIndex = state.selectedNodes.findIndex(x => x.id === id)
    if (existIndex > -1) {
      // ????????????
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
  // ????????????????????????????????? click ??????
  // ????????????
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
}

export function handleMultiNodesUp () {
  preventCanvasClickToggle()
  calCanvasSize()
}

export const onCalCanvasSize = calCanvasSize
