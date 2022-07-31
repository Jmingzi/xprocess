import { XProcessNode } from './editor/state'

export const getTargetPath = (e: MouseEvent) => {
  const ev = e as MouseEvent & { path: HTMLElement[] }
  if (ev.path) {
    return ev.path
  }
  const path = []
  let currentElem: HTMLElement | null = ev.target as HTMLElement
  while (currentElem) {
    path.push(currentElem)
    currentElem = currentElem.parentElement
  }
  return path
}

export function calEdgeFromNodes (nodes: XProcessNode[]) {
  // 获取节点边界
  let left = 0
  let right = 0
  let top = 0
  let bottom = 0
  nodes.forEach((node, i) => {
    if (i === 0) {
      left = node.start[0]
      top = node.start[1]
      right = node.end[0]
      bottom = node.end[1]
    } else {
      if (node.start[0] < left) {
        left = node.start[0]
      }
      if (node.start[1] < top) {
        top = node.start[1]
      }
      if (node.end[0] > right) {
        right = node.end[0]
      }
      if (node.end[1] > bottom) {
        bottom = node.end[1]
      }
    }
  })
  return {
    left,
    bottom,
    top,
    right,
    width: right - left,
    height: bottom - top
  }
}