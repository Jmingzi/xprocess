<script lang="ts">
import { h, SetupContext, VNodeChild } from 'vue'
import { STROKE_WIDTH, SvgType } from './base'
// import { isNodeLine } from '../views/state'

export default function SvgWrapper (props: {
  width: number,
  height: number,
  strokeWidth: number,
  type: SvgType
}, context: SetupContext) {
  const { strokeWidth = STROKE_WIDTH, width, height, type } = props
  return h('svg', {
    class: `xprocess__svg ${type}`,
    width: width + strokeWidth,
    height: height + strokeWidth,
    xmlns: 'http://www.w3.org/2000/svg'
  }, {
    default: context.slots.default
  })
}
</script>

<style lang="less">
.xprocess__svg {
  overflow: visible;
  &:not(.line) {
    cursor: move;
  }
}
</style>



