<script lang="ts">
import { changeCase, CurveProps } from './base'
import { h } from 'vue'

export default function Curve (props: CurveProps) {
  const {
    strokeWidth = 2,
    direction = {},
    width,
    height
  } = props
  let x = strokeWidth / 2
  let y = strokeWidth / 2
  const { isLeftTop, isRightTop, isRightBottom, isLeftBottom } = direction
  // 默认的线条终点
  let endX = x + width
  let endY = y + height
  const getDefaultControl = (): number[] => [x + width / 2, y, x + width / 2, y + height]
  // 默认的线条控制点
  let [
    startControlX,
    startControlY,
    endControlX,
    endControlY
  ] = getDefaultControl()
  if (isRightTop) {
    // 改变起点为左下角，终点为右上角
    [endY, y, endControlY, startControlY] = [y, endY, startControlY, endControlY]
  }

  const result = {
    ...props,
    x,
    y,
    d: `M${x} ${y} C ${startControlX} ${startControlY}, ${endControlX} ${endControlY}, ${endX} ${endY}`
  }
  delete result.direction
  // @ts-ignore
  delete result.type
  return h('path', changeCase(result))
}
</script>
