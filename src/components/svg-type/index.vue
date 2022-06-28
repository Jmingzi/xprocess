<script lang="ts">
import { SVG_TYPE, ISvgType, SvgType } from './base'
import { h } from 'vue'
import Wrapper from './wrapper.vue'
import Rect from './rect.vue'
import Line from './line.vue'

export default function SvgType (props: ISvgType & { type: SvgType }) {
  const { strokeWidth, start, end } = props
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  return h(Wrapper, {
    width,
    height,
    strokeWidth
  }, {
    default: () => {
      switch (props.type) {
        case SVG_TYPE.RECT:
          return h(Rect, props)
        case SVG_TYPE.LINE:
          return h(Line, props)
      }
    }
  })
}
</script>

<style lang="less">
.xprocess__svg {
  // overflow: visible;
}
</style>
