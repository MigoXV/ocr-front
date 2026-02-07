import type { CanvasItem, Rect } from '../../../shared/types/canvas'
import { createId } from '../utils/ids'

export function maxZ(items: CanvasItem[]) {
  return items.reduce((max, i) => Math.max(max, i.zIndex), 0)
}

export function groupItems(items: CanvasItem[], ids: string[], rect: Rect) {
  const groupId = createId('group')
  const next = items.map((item) => (ids.includes(item.id) ? { ...item, parentId: groupId } : item))
  next.push({
    id: groupId,
    type: 'group',
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    rotation: 0,
    opacity: 1,
    zIndex: maxZ(next) + 1,
    locked: false,
    childIds: [...ids],
  })
  return { items: next, groupId }
}

export function ungroupItems(items: CanvasItem[], groupIds: string[]) {
  const children = new Set<string>()
  const keep = items.filter((item) => {
    if (groupIds.includes(item.id) && item.type === 'group') {
      for (const childId of item.childIds || []) children.add(childId)
      return false
    }
    return true
  })

  return keep.map((item) => (children.has(item.id) ? { ...item, parentId: undefined } : item))
}
