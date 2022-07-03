<script lang="ts">
import { SVG_TYPE, ISvgType, SvgType } from './base'
import { h } from 'vue'
import Wrapper from './wrapper.vue'
import Rect from './rect.vue'
import Line from './line.vue'
import Circle from './circle.vue'
import Polygon from './polygon.vue'
import PolygonArrowRight from './polygon-arrow-right.vue'
import PolygonArrowLeft from './polygon-arrow-left.vue'
import PolygonArrowTop from './polygon-arrow-top.vue'
import PolygonArrowBottom from './polygon-arrow-bottom.vue'
import Text from './text.vue'

export default function SvgType (props: ISvgType & { type: SvgType }) {
  const { strokeWidth, start, end, type } = props
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  return h(Wrapper, {
    width,
    height,
    strokeWidth,
    type
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
        case SVG_TYPE.POLYGON_ARROW_RIGHT:
          return h(PolygonArrowRight, props)
        case SVG_TYPE.POLYGON_ARROW_LEFT:
          return h(PolygonArrowLeft, props)
        case SVG_TYPE.POLYGON_ARROW_TOP:
          return h(PolygonArrowTop, props)
        case SVG_TYPE.POLYGON_ARROW_BOTTOM:
          return h(PolygonArrowBottom, props)
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
