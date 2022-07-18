<script lang="ts">
import { IPropsRect, STROKE_WIDTH, clearCustomProps } from './base'
import { h } from 'vue'

export default function Rect (props: IPropsRect) {
  const { strokeWidth = STROKE_WIDTH, start, end } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const p = {
    ...props,
    width,
    height,
    rx: props.round,
    ry: props.round,
    x: strokeWidth / 2,
    y: strokeWidth / 2
  }
  return h('rect', clearCustomProps(p))
}
</script>
