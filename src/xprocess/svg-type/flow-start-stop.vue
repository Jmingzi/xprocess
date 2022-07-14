<script lang="ts">
import { IPropsRect } from './base'
import { h } from 'vue'
import Rect from './rect.vue'

export default function FlowStartStop (props: IPropsRect) {
  const { start, end } = props
  const height = Math.abs(start[1] - end[1])
  const round = height / 2
  return h(Rect, { ...props, round })
}
</script>
