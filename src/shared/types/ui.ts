import type { ContextMenuState, GuideLine } from './canvas'

export type UIState = {
  isLoadingOCR: boolean
  error: string
  editingId: string | null
  contextMenu: ContextMenuState
  guides: GuideLine[]
  ocrBatch: { groupId: string | null; newIds: string[]; count: number }
}
