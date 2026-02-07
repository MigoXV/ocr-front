import type { CanvasItem, Rect } from '../../../shared/types/canvas'

export type AlignMode =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'h-center'
  | 'v-center'
  | 'h-distribute'
  | 'v-distribute'

export function alignItems(items: CanvasItem[], ids: string[], anchorId: string, mode: AlignMode) {
  const idSet = new Set(ids)
  const anchor = items.find((i) => i.id === anchorId)
  if (!anchor) return items

  const selected = items.filter((i) => idSet.has(i.id) && i.type === 'text')
  if (selected.length < 2) return items

  if (mode === 'h-distribute') {
    const sorted = [...selected].sort((a, b) => a.x - b.x)
    const left = sorted[0].x
    const right = sorted[sorted.length - 1].x + sorted[sorted.length - 1].w
    const sumW = sorted.reduce((sum, i) => sum + i.w, 0)
    const gap = (right - left - sumW) / (sorted.length - 1 || 1)
    let cursor = left
    const map = new Map<string, Rect>()
    for (const item of sorted) {
      map.set(item.id, { x: cursor, y: item.y, w: item.w, h: item.h })
      cursor += item.w + gap
    }
    return items.map((item) => {
      const result = map.get(item.id)
      return result ? { ...item, ...result } : item
    })
  }

  if (mode === 'v-distribute') {
    const sorted = [...selected].sort((a, b) => a.y - b.y)
    const top = sorted[0].y
    const bottom = sorted[sorted.length - 1].y + sorted[sorted.length - 1].h
    const sumH = sorted.reduce((sum, i) => sum + i.h, 0)
    const gap = (bottom - top - sumH) / (sorted.length - 1 || 1)
    let cursor = top
    const map = new Map<string, Rect>()
    for (const item of sorted) {
      map.set(item.id, { x: item.x, y: cursor, w: item.w, h: item.h })
      cursor += item.h + gap
    }
    return items.map((item) => {
      const result = map.get(item.id)
      return result ? { ...item, ...result } : item
    })
  }

  return items.map((item) => {
    if (!idSet.has(item.id) || item.type !== 'text' || item.id === anchorId) return item
    if (mode === 'left') return { ...item, x: anchor.x }
    if (mode === 'right') return { ...item, x: anchor.x + anchor.w - item.w }
    if (mode === 'top') return { ...item, y: anchor.y }
    if (mode === 'bottom') return { ...item, y: anchor.y + anchor.h - item.h }
    if (mode === 'h-center') return { ...item, x: anchor.x + anchor.w / 2 - item.w / 2 }
    if (mode === 'v-center') return { ...item, y: anchor.y + anchor.h / 2 - item.h / 2 }
    return item
  })
}
