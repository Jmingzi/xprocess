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
