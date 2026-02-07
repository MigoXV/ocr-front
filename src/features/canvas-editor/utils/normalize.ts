import type { Rect } from '../../../shared/types/canvas'

export function normalizeRect(raw: { x1: number; y1: number; x2: number; y2: number }): Rect {
  const x = Math.min(raw.x1, raw.x2)
  const y = Math.min(raw.y1, raw.y2)
  return {
    x,
    y,
    w: Math.abs(raw.x2 - raw.x1),
    h: Math.abs(raw.y2 - raw.y1),
  }
}
