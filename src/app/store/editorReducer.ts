import type { CanvasItem } from '../../shared/types/canvas'
import { deepClone } from '../../shared/utils/deepClone'
import { recomputeGroups } from '../../features/canvas-editor/selectors/groups'
import type { EditorAction } from './editorActions'
import type { EditorState } from './editorTypes'

function snapshotFrom(state: EditorState) {
  return {
    items: deepClone(state.document.items),
    selection: deepClone(state.selection),
  }
}

function removeItems(items: CanvasItem[], ids: string[]) {
  const idSet = new Set(ids)
  return items
    .filter((item) => !idSet.has(item.id))
    .map((item) => {
      if (item.type !== 'group') return item
      return { ...item, childIds: (item.childIds || []).filter((id) => !idSet.has(id)) }
    })
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'EDITOR/SET_IMAGE': {
      return {
        ...state,
        document: {
          items: [],
          backgroundImageUrl: action.payload.imageUrl,
        },
        selection: { selectedIds: [] },
        history: { past: [], future: [] },
        ui: {
          ...state.ui,
          error: '',
          ocrBatch: { groupId: null, newIds: [], count: 0 },
        },
      }
    }
    case 'OCR/START': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoadingOCR: true,
          error: '',
          ocrBatch: { groupId: action.payload.groupId, newIds: [], count: 0 },
        },
      }
    }
    case 'OCR/APPEND_ITEMS': {
      const nextItems = recomputeGroups([...state.document.items, ...action.payload.items])
      return {
        ...state,
        document: {
          ...state.document,
          items: nextItems,
        },
        ui: {
          ...state.ui,
          ocrBatch: {
            ...state.ui.ocrBatch,
            newIds: [...state.ui.ocrBatch.newIds, ...action.payload.items.map((i) => i.id)],
            count: state.ui.ocrBatch.count + action.payload.items.length,
          },
        },
      }
    }
    case 'OCR/FAIL': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoadingOCR: false,
          error: action.payload.error,
        },
      }
    }
    case 'OCR/FINISH': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoadingOCR: false,
        },
      }
    }
    case 'SELECTION/SET': {
      return {
        ...state,
        selection: action.payload,
      }
    }
    case 'SELECTION/CLEAR': {
      return {
        ...state,
        selection: { selectedIds: [] },
      }
    }
    case 'SELECTION/MARQUEE_UPDATE': {
      return {
        ...state,
        selection: {
          ...state.selection,
          marquee: action.payload,
        },
      }
    }
    case 'INTERACTION/BEGIN': {
      return {
        ...state,
        interaction: action.payload,
      }
    }
    case 'INTERACTION/END': {
      return {
        ...state,
        interaction: null,
      }
    }
    case 'ITEMS/APPLY_COMMAND': {
      const { command, commandPayload, pushHistory = true } = action.payload
      const currentSnapshot = snapshotFrom(state)
      const result = command({ state, payload: commandPayload })
      const nextItems = recomputeGroups(result.items)
      return {
        ...state,
        document: {
          ...state.document,
          items: nextItems,
        },
        selection: result.selection || state.selection,
        history: pushHistory
          ? {
              past: [...state.history.past, currentSnapshot],
              future: [],
            }
          : state.history,
      }
    }
    case 'HISTORY/PUSH': {
      return {
        ...state,
        history: {
          past: [...state.history.past, action.payload],
          future: [],
        },
      }
    }
    case 'HISTORY/UNDO': {
      if (!state.history.past.length) return state
      const prev = state.history.past[state.history.past.length - 1]
      return {
        ...state,
        document: {
          ...state.document,
          items: deepClone(prev.items),
        },
        selection: deepClone(prev.selection),
        history: {
          past: state.history.past.slice(0, -1),
          future: [snapshotFrom(state), ...state.history.future],
        },
      }
    }
    case 'HISTORY/REDO': {
      if (!state.history.future.length) return state
      const next = state.history.future[0]
      return {
        ...state,
        document: {
          ...state.document,
          items: deepClone(next.items),
        },
        selection: deepClone(next.selection),
        history: {
          past: [...state.history.past, snapshotFrom(state)],
          future: state.history.future.slice(1),
        },
      }
    }
    case 'CLIPBOARD/SET': {
      return {
        ...state,
        clipboard: deepClone(action.payload),
      }
    }
    case 'UI/SET_EDITING': {
      return {
        ...state,
        ui: {
          ...state.ui,
          editingId: action.payload,
        },
      }
    }
    case 'UI/SET_ERROR': {
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      }
    }
    case 'UI/OPEN_CONTEXT_MENU': {
      return {
        ...state,
        ui: {
          ...state.ui,
          contextMenu: { ...action.payload, visible: true },
        },
      }
    }
    case 'UI/CLOSE_CONTEXT_MENU': {
      return {
        ...state,
        ui: {
          ...state.ui,
          contextMenu: { ...state.ui.contextMenu, visible: false },
        },
      }
    }
    case 'UI/SET_GUIDES': {
      return {
        ...state,
        ui: {
          ...state.ui,
          guides: action.payload,
        },
      }
    }
    case 'DOCUMENT/SET_ITEMS': {
      return {
        ...state,
        document: {
          ...state.document,
          items: recomputeGroups(action.payload),
        },
      }
    }
    default: {
      return state
    }
  }
}

export { removeItems }
