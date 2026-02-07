import type { CanvasItem, Rect } from '../../../shared/types/canvas'

export function applyRotate(items: CanvasItem[], ids: string[], box: Rect, deltaRad: number, rect: DOMRect) {
  const idSet = new Set(ids)
  const cx = (box.x + box.w / 2) * rect.width
  const cy = (box.y + box.h / 2) * rect.height

  return items.map((item) => {
    if (!idSet.has(item.id) || item.type !== 'text') return item

    const icx = (item.x + item.w / 2) * rect.width
    const icy = (item.y + item.h / 2) * rect.height
    const dx = icx - cx
    const dy = icy - cy
    const nx = dx * Math.cos(deltaRad) - dy * Math.sin(deltaRad)
    const ny = dx * Math.sin(deltaRad) + dy * Math.cos(deltaRad)

    const ncx = (cx + nx) / rect.width
    const ncy = (cy + ny) / rect.height

    return {
      ...item,
      x: ncx - item.w / 2,
      y: ncy - item.h / 2,
      rotation: item.rotation + (deltaRad * 180) / Math.PI,
    }
  })
}
