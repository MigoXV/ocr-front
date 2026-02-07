import type { CanvasItem } from '../../../shared/types/canvas'
import { deepClone } from '../../../shared/utils/deepClone'

export function recomputeGroups(items: CanvasItem[]) {
  const next = deepClone(items)
  for (const group of next.filter((i) => i.type === 'group')) {
    const children = next.filter((i) => i.parentId === group.id && i.type === 'text')
    group.childIds = children.map((c) => c.id)
    if (!children.length) continue
    const x1 = Math.min(...children.map((c) => c.x))
    const y1 = Math.min(...children.map((c) => c.y))
    const x2 = Math.max(...children.map((c) => c.x + c.w))
    const y2 = Math.max(...children.map((c) => c.y + c.h))
    group.x = x1
    group.y = y1
    group.w = x2 - x1
    group.h = y2 - y1
  }
  return next
}
