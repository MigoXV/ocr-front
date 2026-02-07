import type { CanvasItem, Rect } from '../../../shared/types/canvas'
import { clamp } from '../../../shared/utils/clamp'

export function rectStyle(rect: Rect) {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
  }
}

export function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function toNorm(rect: DOMRect, clientX: number, clientY: number) {
  return {
    x: clamp(clientX - rect.left, 0, rect.width) / rect.width,
    y: clamp(clientY - rect.top, 0, rect.height) / rect.height,
  }
}

export function getSelectionRect(items: CanvasItem[], ids: string[]): Rect | null {
  const targets = items.filter((item) => ids.includes(item.id) && item.type === 'text')
  if (!targets.length) return null
  const x1 = Math.min(...targets.map((i) => i.x))
  const y1 = Math.min(...targets.map((i) => i.y))
  const x2 = Math.max(...targets.map((i) => i.x + i.w))
  const y2 = Math.max(...targets.map((i) => i.y + i.h))
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}
