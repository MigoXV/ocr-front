import type { EditorState } from './editorTypes'

export const editorInitialState: EditorState = {
  document: {
    items: [],
    backgroundImageUrl: null,
  },
  selection: {
    selectedIds: [],
  },
  interaction: null,
  ui: {
    isLoadingOCR: false,
    error: '',
    editingId: null,
    contextMenu: { x: 0, y: 0, visible: false },
    guides: [],
    ocrBatch: { groupId: null, newIds: [], count: 0 },
  },
  history: {
    past: [],
    future: [],
  },
  clipboard: [],
}
