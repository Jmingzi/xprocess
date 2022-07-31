// import { IProcessState } from '../xprocess'

export const formatTime = (id: number) => {
  const d = new Date(id)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

export const download = (name: string, url: string) => {
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.xs`
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    a.remove()
  })
}
export const selectFile: () => Promise<File> = () => new Promise((resolve, reject) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xs'
  document.body.appendChild(input)
  input.click()
  input.onchange = (ev: Event) => {
    const target = ev.target as HTMLInputElement
    if (target.files?.length) {
      resolve(target.files[0])
    } else {
      reject()
    }
    input.remove()
  }
})

export const onCopy = async (str: string) => {
  await navigator.clipboard.writeText(str)
}

// export function calCanvasNodesEdge (data: IProcessState) {
//   // 获取节点边界
//   let left = 0
//   let right = 0
//   let top = 0
//   let bottom = 0
//   data.nodes.forEach((node, i) => {
//     if (i === 0) {
//       left = node.start[0]
//       top = node.start[1]
//       right = node.end[0]
//       bottom = node.end[1]
//     } else {
//       if (node.start[0] < left) {
//         left = node.start[0]
//       }
//       if (node.start[1] < top) {
//         top = node.start[1]
//       }
//       if (node.end[0] > right) {
//         right = node.end[0]
//       }
//       if (node.end[1] > bottom) {
//         bottom = node.end[1]
//       }
//     }
//   })
//   return {
//     left,
//     bottom,
//     top,
//     right,
//     width: right - left,
//     height: bottom - top
//   }
// }
