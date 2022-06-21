<script lang="ts">
import { SVG_TYPE, ISvgType, SvgType } from './base'
import { h } from 'vue'
import Wrapper from './wrapper.vue'
import Rect from './rect.vue'
import Curve from './curve.vue'

export default function SvgType (props: ISvgType & { type: SvgType }) {
  // console.log(props)
  const { strokeWidth, width, height } = props
  // @ts-ignore
  return h(Wrapper, {
    width,
    height,
    strokeWidth
  }, {
    default: () => {
      switch (props.type) {
        case SVG_TYPE.RECT_ROUND:
          return h(Rect, props)
        case SVG_TYPE.CURVE:
          return h(Curve, props)
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
