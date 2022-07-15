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