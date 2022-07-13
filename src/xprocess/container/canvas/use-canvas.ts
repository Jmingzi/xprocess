import { h, reactive, SetupContext, toRefs, inject, provide, ref, nextTick, watch } from 'vue'
import Canvas from './index.vue'
import Moving from './moving-item.vue'
import { useDrag } from '../../hooks/use-drag'
import { CANVAS_CLASS, CANVAS_PADDING } from '../../constant'
import { state as editorState } from '../../editor/state'

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
const minSize = reactive({
  width: 1050,
  height: 1050
})
const size = ref<{
  width: number,
  height: number
}>({
  width: 0,
  height: 0
})

export function useCanvas () {
  return {
    inCanvasRect,
    inCanvasDOM,
    calCanvasSize,

    Canvas: {
      setup (props: any, ctx: SetupContext) {
        const { slots } = ctx
        // const layout = inject<{ scrollTop: number, scrollLeft: number }>('layout')!
        const layoutSetScroll = inject<(scrollTop?: number, scrollLeft?: number) => void>('layoutSetScroll', () => {})
        provide('page', size)

        watch(() => editorState.nodes.length, () => {
          // 接口返回
          // 设置画布大小
          calCanvasSize()
        })

        return () => {
          const showMovingItem = moving.value && !state.isStartInCanvas
          // console.log('showMovingItem', showMovingItem, moving.value, state.isStartInCanvas)
          return h(Canvas, {
            onMounted (minSizeWidth: number, minSizeHeight: number) {
              // console.log(minSizeWidth, minSizeHeight)
              minSize.width = minSizeWidth
              minSize.height = minSizeHeight
              calCanvasSize()
              // 设置画布滚动条
              nextTick(() => {
                layoutSetScroll()
              })
            },
            onRect (rect: DOMRect) {
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

function inCanvasDOM (e: MouseEvent) {
  return (e as MouseEvent & { path: HTMLElement[] }).path.some(el => el?.classList?.contains(CANVAS_CLASS))
}

function inCanvasRect (e: MouseEvent) {
  if (!state.rect) return false
  const { left, top, width, height } = state.rect
  return e.clientX >= left && e.clientX <= left + width && e.clientY >= top && e.clientY <= top + height
}

function calCanvasSize () {
  let minLeft = 100000
  let maxRight = 0
  let minTop = 100000
  let maxBottom = 0

  editorState.nodes.forEach(node => {
    if (node.start[0] < minLeft) {
      minLeft = node.start[0]
    }
    if (node.end[0] > maxRight) {
      maxRight = node.end[0]
    }
    if (node.start[0] < minTop) {
      minTop = node.start[0]
    }
    if (node.start[1] > maxBottom) {
      maxBottom = node.start[1]
    }
  })
  // todo 画布只能自动增加右下角宽高，如果要自增左上角，则所有元素的坐标都需要重新计算
  const width = maxRight - minLeft + CANVAS_PADDING * 1.5
  const height = maxBottom - minTop + CANVAS_PADDING * 1.5
  // console.log(width, height, minSize.width, minSize.height)
  size.value.width = width < minSize.width ? minSize.width : width
  size.value.height = height < minSize.height ? minSize.height : height
}
