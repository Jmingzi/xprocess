<script lang="ts">
import { IPropsPolygon, changeCase, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function PolygonArrowLeft (props: IPropsPolygon) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const x = strokeWidth / 2
  const y = strokeWidth / 2
  const halfY = height / 2 + y
  const arrowBodyWidth = 0.7 * width
  const arrowHeight = 0.3 * height
  const x1 = `${x} ${halfY}`
  const x2 = `${width - arrowBodyWidth} ${y}`
  const x3 = `${width - arrowBodyWidth} ${(height - arrowHeight) / 2}`
  const x4 = `${x + width} ${(height - arrowHeight) / 2}`
  const x5 = `${x + width} ${halfY + arrowHeight / 2}`
  const x6 = `${width - arrowBodyWidth} ${halfY + arrowHeight / 2}`
  const x7 = `${width - arrowBodyWidth} ${y + height}`
  const p = {
    ...props,
    points: `${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ${x6}, ${x7}`
  }
  return h('polygon', clearCustomProps(changeCase(p), ['start', 'end', 'type']))
}
</script>
