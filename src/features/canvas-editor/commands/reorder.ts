import type { CanvasItem } from '../../../shared/types/canvas'
import { clamp } from '../../../shared/utils/clamp'

export function reorderItems(items: CanvasItem[], ids: string[], mode: 'front' | 'back' | 'forward' | 'backward') {
  const sorted = [...items].sort((a, b) => a.zIndex - b.zIndex)
  const idSet = new Set(ids)

  const selected = sorted.filter((i) => idSet.has(i.id))
  const unselected = sorted.filter((i) => !idSet.has(i.id))

  let merged: CanvasItem[] = sorted
  if (mode === 'front') merged = [...unselected, ...selected]
  if (mode === 'back') merged = [...selected, ...unselected]

  if (mode === 'forward' || mode === 'backward') {
    merged = [...sorted]
    const delta = mode === 'forward' ? 1 : -1
    for (const id of ids) {
      const idx = merged.findIndex((it) => it.id === id)
      const ni = clamp(idx + delta, 0, merged.length - 1)
      const temp = merged[idx]
      merged[idx] = merged[ni]
      merged[ni] = temp
    }
  }

  return merged.map((item, idx) => ({ ...item, zIndex: idx + 1 }))
}
