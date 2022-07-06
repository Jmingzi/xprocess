<script lang="ts">
import { changeCase, IPropsLine, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'
import { getDirection, getEdge } from '../editor/state'

export default function Line (props: IPropsLine) {
  const {
    strokeWidth = STROKE_WIDTH,
    lineType = 'line',
    start = [],
    end = [],
    fromNode,
    toNode
  } = props
  const isStraight = lineType === 'line'
  const isPath = lineType === 'path'
  const isPolyline = lineType === 'polyline'
  // start, end 是线条矩形的左上角和右下角
  // 线条方向
  const { isLeftTop, isLeftBottom, isRightTop, isRightBottom } = getDirection(start, end)
  // 宽高
  let width = Math.abs(start[0] - end[0])
  let height = Math.abs(start[1] - end[1])

  // 默认起点
  let x = strokeWidth / 2
  let y = strokeWidth / 2
  // 默认终点
  let endX = x + width
  let endY = y + height

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

  let lineVnode
  if (isStraight) {
    lineVnode = h('line', {
      ...changeCase(clearCustomProps(props, ['start', 'end', 'type'])),
      x1: x,
      y1: y,
      x2: endX,
      y2: endY,
      'marker-end': 'url(#triangle)'
    })
  }

  if (isPolyline) {
    let x1 = ''
    let x2 = ''
    if (fromEdge.isLeft || fromEdge.isRight) {
      // 水平方向
      if (
        (!toEdge && (width > height)) ||
        (toEdge?.isLeft || toEdge?.isRight)
      ) {
        // 横着的矩形
        // 需要 2 个拐点
        if (fromEdge.isRight) {
          x1 = `${x + width / 2} ${y},`
          x2 = `${x + width / 2} ${endY},`
        } else {
          x1 = `${x - width / 2} ${y},`
          x2 = `${x - width / 2} ${endY},`
        }
      } else {
        // 竖着的矩形
        // 只需要 1 个
        x1 = `${endX} ${y},`
        x2 = ''
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
          x1 = `${x} ${y + height / 2},`
          x2 = `${endX} ${y + height / 2}`
        } else {
          x1 = `${x} ${y - height / 2},`
          x2 = `${endX} ${y - height / 2}`
        }
      } else {
        x1 = `${x} ${endY},`
        x2 = ''
      }
    }

    const points = `${x} ${y}, ${x1 + x2} ${endX} ${endY}`
    const p = {
      ...clearCustomProps(props, ['start', 'end', 'type']),
      fill: 'transparent',
      points,
      markerEnd: 'url(#triangle)',
      strokeLinejoin: 'round'
    }
    lineVnode = h('polyline', changeCase(p))
  }

  if (isPath) {
    const getDefaultControl = (): number[] => [x + width / 2, y, x + width / 2, y + height]
    // 默认的线条控制点
    let [
      startControlX,
      startControlY,
      endControlX,
      endControlY
    ] = getDefaultControl()

    const result = {
      ...props,
      x,
      y,
      d: `M${x} ${y} C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${endX} ${endY}`
    }
    return h('path', changeCase(result))
  }

  const marker = h('marker', {
    id: 'triangle',
    markerUnits: 'strokeWidth',
    markerWidth: 10,
    markerHeight: 10,
    refX: 9,
    refY: 6,
    orient: 'auto'
  }, [
    h('path', {
      d: 'M0,3 L0,9 L10,6 L0,3',
      style: `fill: ${props.stroke}`
    })
  ])
  return [marker, lineVnode]
}
</script>
