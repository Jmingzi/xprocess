import { ref } from 'vue'
import { createItem, NodeLine, NodeRect, state as editorState } from '../editor/state'
import { DEFAULT_PROPS, SVG_TYPE } from '../svg-type/base'
import { IEventHandlerData } from '../../hooks/use-drag'

export type Edge = 'top' | 'right' | 'bottom' | 'left'
export type DirectionString = 'leftTop' | 'rightTop' | 'rightBottom' | 'leftBottom'

const currentLine = ref<NodeLine>()

export const handleOperationDotMouseDown = (
  e: MouseEvent,
  nodeId: number,
  edgeString: Edge,
  callback: (e: MouseEvent) => void
) => {
  callback(e)
  // 创建线条
  const node = editorState.result.find(x => x.id === nodeId) as NodeRect
  let x = e.clientX
  let y = e.clientY
  const isTop = edgeString === 'top'
  const isBottom = edgeString === 'bottom'
  const isLeft = edgeString === 'left'
  const isRight = edgeString === 'right'
  // 自动吸附节点边界
  if (isTop || isBottom) {
    y = isTop ? node.position[1] : (node.position[1] + node.height)
  } else {
    x = isLeft ? node.position[0] : (node.position[0] + node.width)
  }
  currentLine.value = {
    ...createItem(),
    ...DEFAULT_PROPS,
    type: SVG_TYPE.CURVE,
    width: 0,
    height: 0,
    position: [x, y],
    direction: {
      isLeftBottom: false,
      isRightTop: false,
      isLeftTop: false,
      isRightBottom: false,
    },
    fromNode: {
      id: nodeId!,
      edge: {
        isTop,
        isBottom,
        isLeft,
        isRight
      }
    }
  }
  // 为节点添加线条依赖
  node.fromLines.push(currentLine.value)
  editorState.result.push(currentLine.value)
}

export const handleOperationDotMouseMove = (evData: IEventHandlerData) => {
  const { startX, startY, endX, endY } = evData
  // 根据2点计算线条大小和位置
  const isRightTop = endY < startY && endX > startX
  const isRightBottom = endY > startY && endX > startX
  const isLeftTop = endY < startY && endX < startX
  const isLeftBottom = endY > startY && endX < startX
  const data = {
    direction: {
      isLeftBottom,
      isRightTop,
      isLeftTop,
      isRightBottom
    },
    position: [startX, startY],
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  }
  // 修改外部容器绝对定位的位置
  if (isRightTop) {
    data.position[1] = endY
  }
  Object.assign(currentLine.value!, data)
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
  // const isRightBottom = direction === 'rightBottom'
  let deltaX = evData.endX - evData.startX
  let deltaY = evData.endY - evData.startY

  // 更改节点坐标
  const changeY = () => {
    currentNode.position[1] = copyNode.position[1] + deltaY
    deltaY = -deltaY
  }
  const changeX = () => {
    currentNode.position[0] = copyNode.position[0] + deltaX
    deltaX = -deltaX
  }
  if (isRightTop) {
    changeY()
  } else if (isLeftBottom) {
    changeX()
  } else if (isLeftTop) {
    changeX()
    changeY()
  }
  currentNode.width = copyNode.width + deltaX
  currentNode.height = copyNode.height + deltaY

  // 移动线条
  currentNode.fromLines.forEach(line => {
    const oldLine = copyNode.fromLines.find(x => x.id === line.id)!
    const oldLineRelativeHeight = line.direction.isRightTop || line.direction.isLeftTop ? oldLine.height : 0
    const oldLineRelativeWidth = 0
    const oldLinePositionY = oldLine.position[1] + oldLineRelativeHeight
    const oldLinePositionX = oldLine.position[0] + oldLineRelativeWidth

    const ratioY = (oldLinePositionY - copyNode.position[1]) / copyNode.height
    const ratioX = (oldLinePositionX - copyNode.position[0]) / copyNode.width

    line.position[1] = currentNode.position[1] + currentNode.height * ratioY - oldLineRelativeHeight
    line.position[0] = currentNode.position[0] + currentNode.width * ratioX - oldLineRelativeWidth
  })
}
