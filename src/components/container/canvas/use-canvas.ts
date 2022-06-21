import { h, reactive, SetupContext, toRefs } from 'vue'
// import { state as dragState } from '../state'
import Canvas from './index.vue'
import Moving from './moving-item.vue'
import { useDrag } from '../../../hooks/use-drag'

type CanvasState = {
  rect?: DOMRect;
  isStartInCanvas: boolean;
}

const { moving, movingItemHtml, endTopLeftX, endTopLeftY } = useDrag()
const state = reactive<CanvasState>({
  rect: undefined,
  isStartInCanvas: false
})

function inCanvas (e: MouseEvent) {
  if (!state.rect) return false
  const { left, top, width, height } = state.rect
  return e.clientX >= left && e.clientX <= left + width && e.clientY >= top && e.clientY <= top + height
}

export function useCanvas () {
  return {
    inCanvas,
    Canvas: {
      setup (props: any, ctx: SetupContext) {
        const { slots } = ctx
        return () => {
          const showMovingItem = moving.value && !state.isStartInCanvas
          // console.log('showMovingItem', showMovingItem, moving.value, state.isStartInCanvas)
          return h(Canvas, {
            onMounted (rect: DOMRect) {
              state.rect = rect
            }
          }, {
            default: () => slots.default!(),
            moving: () => showMovingItem && h(Moving, {
              movingItemHtml: movingItemHtml.value,
              x: endTopLeftX.value,
              y: endTopLeftY.value
            })
          })
        }
      }
    },
    ...toRefs(state)
  }
}
