<script lang="ts">
import { SVG_TYPE, ISvgType, SvgType } from './base'
import { h } from 'vue'
import Wrapper from './wrapper.vue'
import Rect from './rect.vue'
import Line from './line.vue'
import Circle from './circle.vue'
import Polygon from './polygon.vue'
import Text from './text.vue'

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
        case SVG_TYPE.CIRCLE:
          return h(Circle, props)
        case SVG_TYPE.POLYGON:
          return h(Polygon, props)
        case SVG_TYPE.TEXT:
          return h(Text, props)
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
