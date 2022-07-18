<script lang="ts">
import { IPropsPolygon, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function PolygonArrowRight (props: IPropsPolygon) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const x = strokeWidth / 2
  const y = strokeWidth / 2
  // const halfX = width / 2 + x
  const halfY = height / 2 + y
  const arrowBodyWidth = 0.5 * width
  const arrowHeight = 0.5 * height
  const x1 = `${x} ${(height - arrowHeight) / 2}`
  const x2 = `${arrowBodyWidth} ${(height - arrowHeight) / 2}`
  const x3 = `${arrowBodyWidth} ${y}`
  const x4 = `${x + width} ${halfY}`
  const x5 = `${arrowBodyWidth} ${y + height}`
  const x6 = `${arrowBodyWidth} ${arrowHeight / 2 + halfY}`
  const x7 = `${x} ${arrowHeight / 2 + halfY}`
  const p = {
    ...props,
    points: `${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ${x6}, ${x7}`
  }
  return h('polygon', clearCustomProps(p))
}
</script>
