import { h, reactive, SetupContext, toRefs, watchEffect, inject } from 'vue'
import Canvas from './index.vue'
import Moving from './moving-item.vue'
import { useDrag } from '../../../hooks/use-drag'

type IRect = {
  width: number
  height: number
  left: number
  top: number
}

type CanvasState = {
  rect?: IRect;
  originRect?: IRect;
  isStartInCanvas: boolean;
}

const { moving, movingItemHtml, endTopLeftX, endTopLeftY } = useDrag()
const state = reactive<CanvasState>({
  rect: undefined,
  originRect: undefined,
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
        const layout = inject<{ scrollTop: number, scrollLeft: number }>('layout')
        watchEffect(() => {
          if (state.rect && state.originRect && layout) {
            state.rect.left = state.originRect.left - layout.scrollLeft
            state.rect.top = state.originRect.top - layout.scrollTop
          }
        })
        return () => {
          const showMovingItem = moving.value && !state.isStartInCanvas
          // console.log('showMovingItem', showMovingItem, moving.value, state.isStartInCanvas)
          return h(Canvas, {
            onMounted (rect: DOMRect) {
              state.rect = rect.toJSON()
              state.originRect = rect.toJSON()
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
