<script lang="ts">
import { RectProps, changeCase, STROKE_WIDTH } from './base'
import { h } from 'vue'

export default function Rect (props: RectProps) {
  const { strokeWidth = STROKE_WIDTH } = props
  const p = {
    ...props,
    rx: props.round,
    ry: props.round,
    x: strokeWidth / 2,
    y: strokeWidth / 2
  }
  delete p.round
  // @ts-ignore
  delete p.type
  return h('rect', changeCase(p))
}
</script>
