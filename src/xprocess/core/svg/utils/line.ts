import { getDirection, getEdge } from '../../../editor/state'
import { IPropsLine } from '../base'

export function getLineInfo (lineProps: IPropsLine): {
  x: number
  y: number
  endX: number
  endY: number
  x1: number[]
  x2: number[]
  isPolyline: boolean
  isPath: boolean
  isStraight: boolean
  lineSegment: number[][][]
} {
  const {
    strokeWidth = 0,
    lineType = 'line',
    start = [],
    end = [],
    fromNode,
    toNode
  } = lineProps

  const isStraight = lineType === 'line'
  const isPath = lineType === 'path'
  const isPolyline = lineType === 'polyline'
  // start, end 是线条矩形的左上角和右下角
  // 线条方向
  const { isLeftTop, isLeftBottom, isRightTop, isRightBottom } = getDirection(start, end)
  // 宽高
  let width = Math.abs(start[0] - end[0])
  let height = Math.abs(start[1] - end[1])

  // 折叠宽度和高度
  if (width < 5) {
    width = 0
  }
  if (height < 5) {
    height = 0
  }

  // 默认起点
  let x = strokeWidth / 2
  let y = strokeWidth / 2
  // 默认终点
  let endX = x + width
  let endY = y + height
  // 线条转折、控制点
  const x1 = []
  const x2 = []
  // 线段
  const lineSegment: number[][][] = []

  const fromEdge = getEdge(fromNode.edge)
  const toEdge = toNode.nodeId > 0 ? getEdge(toNode.edge) : null
  // todo 折线起点和终点都在同一条方向边
  // const bothTop = fromEdge.isTop && toEdge?.isTop
  // const bothBottom = fromEdge.isBottom && toEdge?.isBottom
  // if (isPolyline) {
  //   if (bothTop || bothBottom) {
  //     // 需要增加高度
  //     height += 40
  //     endY += bothBottom ? 40 : -40
  //   }
  // }

  if (isRightTop) {
    [y, endY] = [endY, y]
  } else if (isLeftTop) {
    [x, y, endX, endY] = [endX, endY, x, y]
  } else if (isLeftBottom) {
    [x, endX] = [endX, x]
  }

  if (isPolyline) {
    if (fromEdge.isLeft || fromEdge.isRight) {
      // 水平方向
      if (
        (!toEdge && (width > height)) ||
        (toEdge?.isLeft || toEdge?.isRight)
      ) {
        // 横着的矩形
        // 需要 2 个拐点
        if (fromEdge.isRight) {
          x1.push(x + width / 2, y)
          x2.push(x + width / 2, endY)
        } else {
          x1.push(x - width / 2, y)
          x2.push(x - width / 2, endY)
        }
      } else {
        // 竖着的矩形
        // 只需要 1 个
        x1.push(endY, y)
      }
    } else if (fromEdge.isTop || fromEdge.isBottom) {
      // 垂直方向
      if (
        (!toEdge && width < height) ||
        (toEdge?.isTop || toEdge?.isBottom)
      ) {
        // if (bothTop || bothBottom) {
        //   // 终点不是右下角
        //   x1 = `${x} ${y + height},`
        //   x2 = `${x + width} ${endY}`
        //   endY += bothBottom ? -40 : 40
        // } else
        if (fromEdge.isBottom) {
          x1.push(x, y + height / 2)
          x2.push(endX, y + height / 2)
        } else {
          x1.push(x, y - height / 2)
          x2.push(endX, y - height / 2)
        }
      } else {
        x1.push(x, endY)
      }
    }
    // 计算线段
    lineSegment.push([[x, y], x1])
    if (x2.length) {
      lineSegment.push(
        [x1, x2],
        [x2, [endX, endY]]
      )
    } else {
      lineSegment.push([x1, [endX, endY]])
    }
  } else if (isPath) {
    const getDefaultControl = (): number[] => [x + width / 2, y, x + width / 2, y + height]
    // 默认的线条控制点
    let [
      startControlX,
      startControlY,
      endControlX,
      endControlY
    ] = getDefaultControl()

    x1.push(startControlX, startControlY)
    x2.push(endControlX, endControlY)
  } else {
    lineSegment.push([[x, y], [endX, endY]])
  }

  return {
    x,
    y,
    endX,
    endY,
    x1,
    x2,
    isStraight,
    isPath,
    isPolyline,
    lineSegment
  }
}

export const onSegment = (x1: number[], x2: number[], x: number[]) => {
  // console.log(x1, x2, x)
  const range = 5
  const p1 = { x: x1[0], y: x1[1] }
  const p2 = { x: x2[0], y: x2[1] }
  const q = { x: x[0], y: x[1] }
  const horizontal = p1.y - p2.y === 0
  const vertical = p1.x - p2.x === 0
  if (horizontal) {
    const isLeftRight = p2.x > p1.x
    return (isLeftRight ? q.x >= p1.x && p2.x >= q.x : q.x >= p2.x && q.x <= p1.x) &&
      Math.abs(p2.y - q.y) <= range
  }
  if (vertical) {
    const isTopBottom = p2.y > p1.y
    return (isTopBottom ? q.y >= p1.y && p2.y >= q.y : q.y >= p2.y && q.y <=p1.y) &&
      Math.abs(p2.x - q.x) <= range
  }
}
