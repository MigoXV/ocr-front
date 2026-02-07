import type { CanvasItem } from '../../../shared/types/canvas'
import { deepClone } from '../../../shared/utils/deepClone'
import { createId } from '../utils/ids'
import { maxZ } from './group'

export function cloneItemsForClipboard(items: CanvasItem[], ids: string[]) {
  const idSet = new Set(ids)
  return deepClone(items.filter((item) => idSet.has(item.id) && item.type === 'text'))
}

export function pasteItems(items: CanvasItem[], source: CanvasItem[]) {
  const z = maxZ(items)
  const pasted = source.map((item, idx) => ({
    ...item,
    id: createId('item'),
    x: item.x + 0.02,
    y: item.y + 0.02,
    zIndex: z + idx + 1,
    parentId: undefined,
  }))
  return { items: pasted, ids: pasted.map((i) => i.id) }
}
