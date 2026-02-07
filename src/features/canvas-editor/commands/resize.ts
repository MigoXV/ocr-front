import type { CanvasItem, Handle, Rect } from '../../../shared/types/canvas'

export const MIN_NORM_SIZE = 0.008

export function applyResize(
  items: CanvasItem[],
  ids: string[],
  box: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  keepRatio: boolean,
  rect: DOMRect,
) {
  const minW = Math.max(MIN_NORM_SIZE, 8 / rect.width)
  const minH = Math.max(MIN_NORM_SIZE, 8 / rect.height)

  let left = box.x
  let right = box.x + box.w
  let top = box.y
  let bottom = box.y + box.h

  if (handle.includes('e')) right += dx
  if (handle.includes('w')) left += dx
  if (handle.includes('s')) bottom += dy
  if (handle.includes('n')) top += dy

  if (keepRatio && ['ne', 'nw', 'se', 'sw'].includes(handle)) {
    const ratio = box.w / box.h
    const w = Math.max(minW, Math.abs(right - left))
    const h = Math.max(minH, w / ratio)
    if (handle.includes('w')) left = right - w
    else right = left + w
    if (handle.includes('n')) top = bottom - h
    else bottom = top + h
  }

  if (right - left < minW) {
    if (handle.includes('w')) left = right - minW
    else right = left + minW
  }

  if (bottom - top < minH) {
    if (handle.includes('n')) top = bottom - minH
    else bottom = top + minH
  }

  const nextBox = { x: left, y: top, w: right - left, h: bottom - top }
  const scaleX = nextBox.w / box.w
  const scaleY = nextBox.h / box.h
  const idSet = new Set(ids)

  return items.map((item) => {
    if (!idSet.has(item.id) || item.type !== 'text') return item
    const rx = (item.x - box.x) / box.w
    const ry = (item.y - box.y) / box.h
    return {
      ...item,
      x: nextBox.x + rx * nextBox.w,
      y: nextBox.y + ry * nextBox.h,
      w: Math.max(minW, item.w * scaleX),
      h: Math.max(minH, item.h * scaleY),
    }
  })
}
