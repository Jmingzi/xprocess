<script lang="ts">
import { h, SetupContext, VNodeChild } from 'vue'
import { STROKE_WIDTH } from './base'

export default function SvgWrapper (props: {
  width: number,
  height: number,
  strokeWidth: number
}, context: SetupContext) {
  const { strokeWidth = STROKE_WIDTH, width, height } = props
  return h('svg', {
    class: 'xprocess__svg',
    width: width + strokeWidth,
    height: height + strokeWidth,
    xmlns: 'http://www.w3.org/2000/svg'
  }, {
    default: context.slots.default
  })
}
</script>

<style lang="less">
svg {
  overflow: visible;
}
</style>



