import { reactive } from 'vue'
import { IEventHandlerData } from '../../hooks/use-drag'
import {
  DEFAULT_PROPS,
  IPropsRect,
  IPropsLine,
  SVG_TYPE,
  IPropsCircle,
  DEFAULT_SIZE,
  IPropsPolygon, IPropsText
} from '../svg-type/base'
import { Edge, setCurrentLine } from '../operation/state'
import { useCanvas } from '../container/canvas/use-canvas'

const { rect: canvasRect } = useCanvas()

type IBase = {
  id: number
  fromLines: NodeLine[]
  toLines: NodeLine[]
  font?: IFont
  fontEditable?: boolean
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

type NodeLineAttach = {
  nodeId: number,
  edge: 'top' | 'right' | 'bottom' | 'left'
  ratioX: number
  ratioY: number
}
export type NodeLine = IPropsLine & {
  id: number
  fromNode: NodeLineAttach
  toNode: NodeLineAttach
  font?: IFont
  fontEditable?: boolean
}

export type XProcessNode = NodeRect | NodeCircle | NodePolygon

type ILocalBase<T> = Omit<T, 'id' | 'fromLines' | 'toLines'>
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

type State = {
  currentNode?: XProcessNode
  localComponentList: LocalListItem[]
  nodes: XProcessNode[]
  lines: NodeLine[]
}

export const state = reactive<State>({
  currentNode: undefined,
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
      fontEditable: true,
      font: {
        ...DEFAULT_FONT,
        content: '文本'
      }
    }
  ],
  nodes: [],
  lines: []
})

export function createItem () {
  return {
    id: Date.now()
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
      data.endTopLeftX + localItem.end[0],
      data.endTopLeftY + localItem.end[1]
    ]),
    fromLines: [],
    toLines: []
  }
  if (node.type === SVG_TYPE.TEXT) {
    (newItem as NodeText).status = 1
  }
  state.nodes.push(newItem)
  setCurrentNode(newItem.id)
  return newItem
}

/**
 * 在画布上拖拽节点
 */
export function onMoving (data: IEventHandlerData, item: XProcessNode) {
  const { endTopLeftX, endTopLeftY } = data
  const node = state.nodes.find(it => it.id === item.id) as NodeRect
  const width = Math.abs(node.end[0] - node.start[0])
  const height = Math.abs(node.end[1] - node.start[1])
  node.start = getPointFromCanvas([endTopLeftX, endTopLeftY])
  node.end = getPointFromCanvas([endTopLeftX + width, endTopLeftY + height])
  // 移动所有的线条
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
