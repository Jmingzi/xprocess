<script lang="ts">
import { IPropsCircle, changeCase, clearCustomProps, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function Circle (props: IPropsCircle) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const cx = width / 2 + strokeWidth / 2
  const cy = height / 2 + strokeWidth / 2
  const p = {
    ...props,
    cx: cx,
    cy: cy,
    rx: cx,
    ry: cy
  }
  return h('ellipse', clearCustomProps(changeCase(p), ['start', 'end', 'radius', 'type']))
}
</script>
