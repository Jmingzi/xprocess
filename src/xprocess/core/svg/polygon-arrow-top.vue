<script lang="ts">
import { IPropsPolygon, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function PolygonArrowTop (props: IPropsPolygon) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const x = strokeWidth / 2
  const y = strokeWidth / 2
  const halfX = width / 2 + x
  // const halfY = height / 2 + y
  const arrowBodyWidth = 0.5 * width
  const arrowBodyHeight = 0.5 * height
  const x1 = `${halfX} ${y}`
  const x2 = `${x + width} ${y + (height - arrowBodyHeight)}`
  const x3 = `${halfX + (arrowBodyWidth / 2)} ${y + (height - arrowBodyHeight)}`
  const x4 = `${halfX + (arrowBodyWidth / 2)} ${y + height}`
  const x5 = `${halfX - (arrowBodyWidth / 2)} ${y + height}`
  const x6 = `${halfX - (arrowBodyWidth / 2)} ${y + (height - arrowBodyHeight)}`
  const x7 = `${x} ${y + (height - arrowBodyHeight)}`
  const p = {
    ...props,
    points: `${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ${x6}, ${x7}`
  }
  return h('polygon', clearCustomProps(p))
}
</script>
