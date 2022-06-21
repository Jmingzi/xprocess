import { reactive } from 'vue'
import { IEventHandlerData } from '../../hooks/use-drag'
import { DEFAULT_PROPS, SvgType, SvgBase, SVG_TYPE } from '../svg-type/base'

type NodeBase = {
  id: number;
  type: SvgType;
  // 起点位置
  position: number[];
} & SvgBase

export type NodeRect = NodeBase & {
  round: number;
  fromLines: NodeLine[],
  toLines: NodeLine[]
}

export type NodeLine = NodeBase & {
  direction: {
    isLeftTop: boolean;
    isRightTop: boolean;
    isRightBottom: boolean;
    isLeftBottom: boolean;
  },
  fromNode: {
    id: number,
    edge: {
      isTop: boolean;
      isRight: boolean;
      isBottom: boolean;
      isLeft: boolean;
    }
  }
}

export type XProcessNode = NodeLine | NodeRect

type LocalListItemRect = Omit<NodeRect, 'id' | 'position' | 'fromLines' | 'toLines'>
type LocalListItemCurve = Omit<NodeLine, 'id' | 'position' | 'direction' | 'fromNode'>
type LocalListItem = LocalListItemRect | LocalListItemCurve
type State = {
  currentNode?: XProcessNode
  localComponentList: LocalListItem[]
  result: XProcessNode[]
}

export const state = reactive<State>({
  currentNode: undefined,
  localComponentList: [
    {
      ...DEFAULT_PROPS,
      type: 'rect-round',
      round: 5,
      fill: '#fff'
    }
    // {
    //   type: 'curve',
    //   ...DEFAULT_PROPS
    // }
  ],
  result: []
})

export function createItem () {
  return {
    id: Date.now()
  }
}

export function onDrop (data: IEventHandlerData, node: LocalListItem) {
  const item = createItem()
  const localItem = state.localComponentList.find(x => x.type === node.type) as LocalListItemRect
  const newItem = {
    ...item,
    ...localItem,
    position: [data.endTopLeftX, data.endTopLeftY],
    fromLines: [],
    toLines: []
  }
  state.result.push(newItem)
  setCurrentNode(newItem.id)
}

/**
 * 在画布上拖拽节点
 */
export function onMoving (data: IEventHandlerData, item: XProcessNode) {
  const { startX, startY, endX, endY, endTopLeftX, endTopLeftY, direction: nodeMoveDirection } = data
  const node = state.result.find(it => it.id === item.id) as NodeRect
  const oldNodePosition = currentNodeCopy.position.slice()
  node.position = [endTopLeftX, endTopLeftY]
  // 移动所有的线条
  node.fromLines.forEach(line => {
    const copyLine = currentNodeCopy.fromLines.find(x => x.id === line.id)!
    const lineRelativePosition = [
      copyLine.position[0] - oldNodePosition[0],
      copyLine.position[1] - oldNodePosition[1]
    ]
    // 修改线条的起点坐标
    line.position = [
      node.position[0] + lineRelativePosition[0],
      node.position[1] + lineRelativePosition[1]
    ]
    // 修改线条的宽度
    // const { isLeftTop, isRightTop, isRightBottom, isLeftBottom } = line.direction
    const lineDirection = line.direction
    // const lineEdge = line.fromNode.edge
    const deltaX = Math.abs(endX - startX)
    const deltaY = Math.abs(endY - startY)
    // const { isLeft, isTop, isRight, isBottom } = line.fromNode.edge
    const isAddWidth = (lineDirection.isRightTop || lineDirection.isRightBottom) &&
        (nodeMoveDirection.isLeftTop || nodeMoveDirection.isLeftBottom)
    const isAddHeight = (lineDirection.isRightBottom || lineDirection.isLeftBottom) &&
        (nodeMoveDirection.isLeftTop || nodeMoveDirection.isRightTop) ||
        (lineDirection.isRightTop || lineDirection.isLeftTop) &&
        (nodeMoveDirection.isLeftBottom || nodeMoveDirection.isRightBottom)
    // console.log('isAddHeight', isAddHeight, copyLine.height, deltaY)

    line.width = Math.abs(copyLine.width + deltaX * (isAddWidth ? 1 : -1))
    line.height = Math.abs(copyLine.height + deltaY * (isAddHeight ? 1 : -1))
    // line.height = copyLine.height - deltaY
    if (lineDirection.isRightTop || lineDirection.isLeftTop) {
      line.position[1] -= deltaY * (isAddHeight ? 1 : -1)
    }
  })
}

let currentNodeCopy: NodeRect
export function setCurrentNode (id: number) {
  state.currentNode = state.result.find(x => x.id === id)
  currentNodeCopy = JSON.parse(JSON.stringify(state.currentNode))
}

export function isMovable (id: number) {
  const node = state.result.find(x => x.id === id)
  return node?.type !== SVG_TYPE.CURVE
}
