import type { CanvasItem, GuideLine } from '../../../shared/types/canvas'

const SNAP_PX = 6

export function applyMove(items: CanvasItem[], ids: string[], dx: number, dy: number) {
  const idSet = new Set(ids)
  return items.map((item) => {
    if (!idSet.has(item.id) || item.type !== 'text') return item
    return { ...item, x: item.x + dx, y: item.y + dy }
  })
}

export function applySnapForMove(
  moved: CanvasItem[],
  base: CanvasItem[],
  targetIds: string[],
  rect: DOMRect,
  getSelectionRect: (items: CanvasItem[], ids: string[]) => { x: number; y: number; w: number; h: number } | null,
) {
  const targetRect = getSelectionRect(moved, targetIds)
  if (!targetRect) return { items: moved, guides: [] as GuideLine[] }

  const staticItems = base.filter((i) => i.type === 'text' && !targetIds.includes(i.id))
  const xLines = [0, 0.5, 1, ...staticItems.flatMap((i) => [i.x, i.x + i.w / 2, i.x + i.w])]
  const yLines = [0, 0.5, 1, ...staticItems.flatMap((i) => [i.y, i.y + i.h / 2, i.y + i.h])]

  const thresholdX = SNAP_PX / rect.width
  const thresholdY = SNAP_PX / rect.height

  const tx = [targetRect.x, targetRect.x + targetRect.w / 2, targetRect.x + targetRect.w]
  const ty = [targetRect.y, targetRect.y + targetRect.h / 2, targetRect.y + targetRect.h]

  let bestDx = 0
  let bestDy = 0
  let gx: number | null = null
  let gy: number | null = null
  let minX = thresholdX
  let minY = thresholdY

  for (const line of xLines) {
    for (const t of tx) {
      const d = line - t
      if (Math.abs(d) <= minX) {
        minX = Math.abs(d)
        bestDx = d
        gx = line
      }
    }
  }

  for (const line of yLines) {
    for (const t of ty) {
      const d = line - t
      if (Math.abs(d) <= minY) {
        minY = Math.abs(d)
        bestDy = d
        gy = line
      }
    }
  }

  const adjusted = applyMove(moved, targetIds, bestDx, bestDy)
  const guides: GuideLine[] = []
  if (gx !== null) guides.push({ axis: 'x', value: gx })
  if (gy !== null) guides.push({ axis: 'y', value: gy })
  return { items: adjusted, guides }
}
