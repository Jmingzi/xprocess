<script lang="ts">
import { IPropsPolygon, changeCase, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function PolygonArrowBottom (props: IPropsPolygon) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const x = strokeWidth / 2
  const y = strokeWidth / 2
  const halfX = width / 2 + x
  const arrowBodyWidth = 0.3 * width
  const arrowBodyHeight = 0.7 * height
  const x1 = `${halfX - (arrowBodyWidth / 2)} ${y}`
  const x2 = `${halfX + (arrowBodyWidth / 2)} ${y}`
  const x3 = `${halfX + (arrowBodyWidth / 2)} ${y + arrowBodyHeight}`
  const x4 = `${x + width} ${y + arrowBodyHeight}`
  const x5 = `${halfX} ${y + height}`
  const x6 = `${x} ${y + arrowBodyHeight}`
  const x7 = `${halfX - arrowBodyWidth / 2} ${y + arrowBodyHeight}`
  const p = {
    ...props,
    points: `${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ${x6}, ${x7}`
  }
  return h('polygon', clearCustomProps(changeCase(p), ['start', 'end', 'type']))
}
</script>
