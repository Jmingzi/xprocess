import Index from './index.vue'
import { h, provide, reactive, SetupContext, ref } from 'vue'
import { CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP, CANVAS_PADDING } from '../../constant'

const el = ref()
const baseScrollLeft = CANVAS_PADDING - CANVAS_MARGIN_LEFT
const baseScrollTop = CANVAS_PADDING - CANVAS_MARGIN_TOP
const state = reactive({
  scrollLeft: baseScrollLeft,
  scrollTop: baseScrollTop
})
const handleScroll = () => {
  const box = el.value!
  state.scrollTop = box.scrollTop
  state.scrollLeft = box.scrollLeft
}
const setScroll = (top?: number, left?: number, isFromBase?: boolean) => {
  const box = el.value
  let scrollTop
  let scrollLeft

  if (isFromBase) {
    scrollTop = top !== undefined ? top + baseScrollTop : top
    scrollLeft = left !== undefined ? left + baseScrollLeft : left
  }

  if (scrollTop === undefined) {
    scrollTop = baseScrollTop
  }
  if (scrollLeft === undefined) {
    scrollLeft = baseScrollLeft
  }

  if (box) {
    box.scrollTop = scrollTop
    box.scrollLeft = scrollLeft
  }
}

export function useLayout () {
  return {
    layoutSetScroll: setScroll,
    Layout: {
      props: {
      },
      setup (props: unknown, context: SetupContext) {
        provide('layout', state)
        provide('layoutSetScroll', setScroll)
        // console.log(props)
        return () => {
          // @ts-ignore
          return h(Index, {
            onScroll: handleScroll,
            onMounted (dom: HTMLElement) {
              el.value = dom
            }
          }, context.slots)
        }
      }
    }
  }
}
