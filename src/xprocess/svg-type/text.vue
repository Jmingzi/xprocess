<script lang="ts">
import { IPropsText, changeCase, clearCustomProps } from './base'
import { h } from 'vue'
import icon from './image/text.png'

export default function Text (props: IPropsText) {
  const { start, end, status } = props
  // 宽高
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  const p = {
    ...props,
    width,
    height,
    rx: 0,
    ry: 0,
    x: 0,
    y: 0
  }
  return [
    h('rect', clearCustomProps(changeCase(p), ['start', 'end', 'status', 'type'])),
    status === 0 ? h('image', {
      'xlink:href': icon,
      width: width * 0.7,
      x: 12
    }) : null
  ]
}
</script>
