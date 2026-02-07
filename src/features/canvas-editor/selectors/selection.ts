import type { CanvasItem } from '../../../shared/types/canvas'

export function uniq<T>(arr: T[]) {
  return [...new Set(arr)]
}

export function resolveTargetIds(items: CanvasItem[], selected: string[]) {
  const map = new Map(items.map((it) => [it.id, it]))
  const resolved: string[] = []

  const visit = (id: string) => {
    const item = map.get(id)
    if (!item) return
    if (item.type === 'group') {
      for (const childId of item.childIds || []) visit(childId)
      return
    }
    resolved.push(id)
  }

  for (const id of selected) visit(id)
  return uniq(resolved)
}
