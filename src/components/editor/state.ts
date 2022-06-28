import { reactive } from 'vue'
import { IEventHandlerData } from '../../hooks/use-drag'
import { DEFAULT_PROPS, IPropsRect, IPropsLine, SVG_TYPE } from '../svg-type/base'
import { Edge } from '../operation/state'

export type NodeRect = Omit<IPropsRect, 'width' | 'height'> & {
  id: number
  fromLines: NodeLine[]
  toLines: NodeLine[]
  font?: IFont
  fontEditable?: boolean
}

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
}

export type XProcessNode = NodeRect

type LocalListItemRect = Omit<NodeRect, 'id' | 'fromLines' | 'toLines'>
// type LocalListItemCurve = Omit<NodeLine, 'id' | 'position' | 'direction' | 'fromNode'>
export type LocalListItem = LocalListItemRect
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
      fill: '#ffffff'
    }
  ],
  nodes: [],
  lines: []
})

export const DEFAULT_FONT: IFont = {
  content: '',
  fontSize: 13,
  italics: false,
  bold: false,
  underline: false,
  color: '#333333',
  horizontalAlign: 'center'
}

export function createItem () {
  return {
    id: Date.now()
  }
}

export function onDrop (data: IEventHandlerData, node: LocalListItem) {
  const item = createItem()
  const localItem = state.localComponentList.find(x => x.type === node.type) as LocalListItemRect
  const newItem: NodeRect = {
    ...item,
    ...localItem,
    start: [data.endTopLeftX, data.endTopLeftY],
    end: [data.endTopLeftX + 100, data.endTopLeftY + 50],
    fromLines: [],
    toLines: []
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
  node.start = [endTopLeftX, endTopLeftY]
  node.end = [endTopLeftX + width, endTopLeftY + height]
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

let currentNodeCopy: NodeRect
export function setCurrentNode (id: number) {
  state.currentNode = state.nodes.find(x => x.id === id)
  currentNodeCopy = JSON.parse(JSON.stringify(state.currentNode))
}

export function isMovable (id: number) {
  const node = state.nodes.find(x => x.id === id)
  return node?.type !== SVG_TYPE.CURVE
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
