<script lang="ts">
import {
  SVG_TYPE,
  ISvgType,
  IPropsRect,
  IPropsLine,
  IPropsCircle,
  IPropsPolygon,
  IPropsText
} from './base'
import { h, FunctionalComponent } from 'vue'
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
import FlowStartStop from './flow-start-stop.vue'

export default function SvgType (props: ISvgType) {
  const { strokeWidth, start, end, type } = props
  const width = Math.abs(start[0] - end[0])
  const height = Math.abs(start[1] - end[1])
  return h(Wrapper as FunctionalComponent, {
    width,
    height,
    strokeWidth,
    type
  }, {
    default: () => {
      switch (props.type) {
        case SVG_TYPE.RECT:
        case SVG_TYPE.FLOW_RECT:
          return h<IPropsRect>(Rect, props as IPropsRect)
        case SVG_TYPE.LINE:
          return h<IPropsLine>(Line, props as IPropsLine)
        case SVG_TYPE.CIRCLE:
          return h<IPropsCircle>(Circle, props as IPropsCircle)
        case SVG_TYPE.POLYGON:
          return h<IPropsPolygon>(Polygon, props as IPropsPolygon)
        case SVG_TYPE.TEXT:
          return h<IPropsText>(Text, props as IPropsText)
        case SVG_TYPE.POLYGON_ARROW_RIGHT:
          return h<IPropsPolygon>(PolygonArrowRight, props as IPropsPolygon)
        case SVG_TYPE.POLYGON_ARROW_LEFT:
          return h<IPropsPolygon>(PolygonArrowLeft, props as IPropsPolygon)
        case SVG_TYPE.POLYGON_ARROW_TOP:
          return h<IPropsPolygon>(PolygonArrowTop, props as IPropsPolygon)
        case SVG_TYPE.POLYGON_ARROW_BOTTOM:
          return h<IPropsPolygon>(PolygonArrowBottom, props as IPropsPolygon)
        case SVG_TYPE.FLOW_START_STOP:
          return h<IPropsRect>(FlowStartStop, props as IPropsRect)
      }
    }
  })
}
</script>

<style lang="less">
.xprocess__svg {
}
</style>
