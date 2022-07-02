import { reactive, toRaw, toRefs } from 'vue'

export type IEvents = 'mousedown' | 'mousemove' | 'mouseup'
export type IEventHandlerData = typeof state
export type IEventHandler = (
    data: IEventHandlerData,
    e: MouseEvent,
    wrapperEl: HTMLElement | null,
    state?: { endX: number, endY: number, endTopLeftX: number, endTopLeftY: number, startOffsetTopLeftX: number, startOffsetTopLeftY: number }
) => void
type IEventItem = {
  handler: IEventHandler,
  draggedWrapperEl: HTMLElement
}
type IEventsMap = {
  [k in IEvents]: IEventItem[]
}

const busEvents: IEventsMap = {
  mousedown: [],
  mousemove: [],
  mouseup: []
}

let startTarget: HTMLElement | null = null
const state = reactive({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  deltaX: 0,
  deltaY: 0,
  startOffsetTopLeftX: 0,
  startOffsetTopLeftY: 0,
  endTopLeftX: 0,
  endTopLeftY: 0,
  dragging: false,
  moving: false,
  movingItemHtml: '',
  direction: {
    isLeftTop: false,
    isRightTop: false,
    isRightBottom: false,
    isLeftBottom: false
  }
})

function onMouseDown (
  e: MouseEvent,
  dragWrapperIdentificationCallback?: (el: HTMLElement) => boolean,
  getWrapperHtml?: (el: HTMLElement) => string
) {
  const target = e.target as HTMLElement
  const { left, top } = target.getBoundingClientRect()
  state.startX = e.clientX
  state.startY = e.clientY
  state.startOffsetTopLeftX = e.clientX - left
  state.startOffsetTopLeftY = e.clientY - top
  state.dragging = true
  let wrapperEl: HTMLElement | null = target
  if (dragWrapperIdentificationCallback) {
    wrapperEl = findEl(target, dragWrapperIdentificationCallback)
  }
  if (wrapperEl) {
    startTarget = wrapperEl
    if (getWrapperHtml) {
      state.movingItemHtml = getWrapperHtml(wrapperEl)
    }
  } else {
    startTarget = null
  }
  runEvent('mousedown', e, wrapperEl)
}

function onMouseMove (e: MouseEvent) {
  if (!state.dragging) return
  state.moving = true
  state.endTopLeftX = e.clientX - state.startOffsetTopLeftX
  state.endTopLeftY = e.clientY - state.startOffsetTopLeftY
  state.endX = e.clientX
  state.endY = e.clientY
  state.deltaX = e.clientX - state.startX
  state.deltaY = e.clientY - state.startY
  state.direction = {
    isLeftTop: state.endY - state.startY <= 0 && state.endX - state.startX < 0,
    isRightTop: state.endY - state.startY <= 0 && state.endX - state.startX > 0,
    isRightBottom: state.endY - state.startY > 0 && state.endX - state.startX >= 0,
    isLeftBottom: state.endY - state.startY > 0 && state.endX - state.startX <= 0
  }
  runEvent('mousemove', e, null)
}

function onMouseUp (e: MouseEvent) {
  state.movingItemHtml = ''
  if (!state.dragging) return
  state.dragging = false
  state.moving = false
  runEvent('mouseup', e, null)
}

export function useDrag () {
  return {
    onMouseDown,
    registerCallback,
    ...toRefs(state)
  }
}

function runEvent (
  type: IEvents,
  e: MouseEvent,
  wrapperEl: HTMLElement | null
) {
  if (startTarget === null) return
  busEvents[type].forEach(item => {
    if (findEl(startTarget!, el => el === item.draggedWrapperEl)) {
      item.handler(toRaw(state), e, wrapperEl, state)
    }
  })
}

function findEl (src: EventTarget, callback: (el: HTMLElement) => boolean): HTMLElement | null {
  const el = src as HTMLElement
  if (callback(el)) return el
  const parent = el.parentNode
  if (parent) {
    return findEl(parent, callback)
  }
  return null
}

function registerCallback (type: IEvents, event: IEventItem) {
  // busEvents[type].push(event)
  const evs = busEvents[type]
  const index = evs.findIndex(item => item.draggedWrapperEl === event.draggedWrapperEl)
  if (index === -1) {
    evs.push(event)
  } else {
    evs[index] = event
  }
}

document.addEventListener('mousemove', onMouseMove)
document.addEventListener('mouseup', onMouseUp)
