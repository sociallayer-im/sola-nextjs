import debounce from 'lodash/debounce'
export type ScrollDirect = 'up' | 'down'

export function onScroll (func: (direct: ScrollDirect, currentY: number, lastY: number) => unknown): () => void {
  let lastPosition = window.scrollY

  const handle = () => {
    const detal = window.scrollY - lastPosition
    const direct: ScrollDirect = detal > 0 ? 'down' : 'up'
    func(direct, window.scrollY, lastPosition)
    lastPosition = window.scrollY
  }

  window.addEventListener('scroll', handle)
  return () => window.removeEventListener('scroll', handle)
}

export function onReachBottom (func: () => unknown, offset = 0, toDebounce = 0, init = false) {
  let handle = (direct: ScrollDirect) => {
    if (direct !== 'down') return
    if (document.body.clientHeight - (window.scrollY + window.innerHeight) <= offset) {
      func()
    }
  }

  if (toDebounce) {
    handle = debounce(handle, toDebounce)
  }

  if (init) {
    handle('down')
  }

  return onScroll(handle)
}
