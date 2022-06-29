<script lang="ts">
import { IPropsPolygon, changeCase, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function Polygon (props: IPropsPolygon) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const x = strokeWidth / 2
  const y = strokeWidth / 2
  const halfX = width / 2 + x
  const halfY = height / 2 + y
  const p = {
    ...props,
    points: `${x} ${halfY}, ${halfX} ${y}, ${x + width} ${halfY}, ${halfX} ${y + height}`
  }
  return h('polygon', clearCustomProps(changeCase(p), ['start', 'end', 'type']))
}
</script>
