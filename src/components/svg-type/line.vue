<script lang="ts">
import { changeCase, IPropsLine, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'
import { getDirection } from '../editor/state'

export default function Line (props: IPropsLine) {
  const {
    strokeWidth = STROKE_WIDTH,
    lineType = 'line',
    start = [],
    end = []
  } = props
  // 曲线
  const isPath = lineType === 'path'
  // start, end 是线条的起点和终点
  // 线条方向
  const { isLeftTop, isLeftBottom, isRightTop, isRightBottom } = getDirection(start, end)
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])

  // 默认起点
  let x = strokeWidth / 2
  let y = strokeWidth / 2
  // 默认终点
  let endX = x + width
  let endY = y + height

  if (isRightTop) {
    [y, endY] = [endY, y]
  } else if (isLeftTop) {
    [x, y, endX, endY] = [endX, endY, x, y]
  } else if (isLeftBottom) {
    [x, endX] = [endX, x]
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
  return [
    h('marker', {
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
    ]),
    h('line', {
      ...changeCase(clearCustomProps(props, ['start', 'end', 'type'])),
      x1: x,
      y1: y,
      x2: endX,
      y2: endY,
      'marker-end': 'url(#triangle)'
    })
  ]
}
</script>
