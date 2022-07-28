<script lang="ts">
import { IPropsLine, clearCustomProps } from './base'
import { h, inject, Ref } from 'vue'
import { getLineInfo } from './utils/line'

export default function Line (props: IPropsLine) {
  const {
    x,
    y,
    endY,
    endX,
    x1,
    x2,
    isPolyline,
    isStraight,
    isPath,
    lineSegment
  } = getLineInfo(props)

  const currentLine = inject<Ref<{ id: number }>>('currentLine')
  const markerId = `triangle_${props.id}`

  let lineVnode
  let activeCircle
  if (isStraight) {
    lineVnode = h('line', clearCustomProps({
      ...props,
      x1: x,
      y1: y,
      x2: endX,
      y2: endY,
      markerEnd: `url(#${markerId})`
    }))
  } else if (isPolyline) {
    const points = `${x} ${y}, ${x1.join(' ')},${x2.length ? ` ${x2.join(' ')},` : ''} ${endX} ${endY}`
    lineVnode = h('polyline', clearCustomProps({
      ...props,
      fill: 'transparent',
      points,
      markerEnd: `url(#${markerId})`,
      strokeLinejoin: 'round'
    }))
    // 高亮当前连线
    if (currentLine?.value?.id === props.id) {
      // 获取线段的中点
      activeCircle = lineSegment
        .map(([x, y]) => {
          const w = y[0] - x[0]
          const h = y[1] - x[1]
          return [x[0] + w / 2, x[1] + h / 2]
        })
        .map(([cx, cy]) => h('circle', { cx, cy, r: 4, fill: 'rgba(77,143,239,0.7)' }))
    }
  } else if (isPath) {
    lineVnode = h('path', clearCustomProps({
      ...props,
      x,
      y,
      d: `M${x} ${y} C ${x1.join(' ')}, ${x2.join(' ')}, ${endX} ${endY}`
    }))
  }

  const marker = h('marker', {
    id: markerId,
    markerUnits: 'strokeWidth',
    markerWidth: 10,
    markerHeight: 10,
    refX: 9,
    refY: 6,
    orient: 'auto'
  }, [
    h('path', {
      d: 'M0,3 L0,9 L10,6 L0,3',
      fill: props.stroke
    })
  ])

  return [marker, lineVnode, activeCircle]
}
</script>
