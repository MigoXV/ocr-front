import { describe, expect, it } from 'vitest'
import { editorInitialState } from './editorInitialState'
import { editorReducer } from './editorReducer'
import type { CanvasItem } from '../../shared/types/canvas'

describe('editor reducer', () => {
  it('appends OCR items', () => {
    const state = editorReducer(editorInitialState, {
      type: 'OCR/APPEND_ITEMS',
      payload: {
        groupId: 'g1',
        items: [
          {
            id: 'i1',
            type: 'text',
            x: 0,
            y: 0,
            w: 0.1,
            h: 0.1,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            locked: false,
          },
        ],
      },
    })
    expect(state.document.items).toHaveLength(1)
    expect(state.ui.ocrBatch.count).toBe(1)
  })

  it('undo/redo works', () => {
    const item: CanvasItem = {
      id: 'i1',
      type: 'text',
      x: 0,
      y: 0,
      w: 0.1,
      h: 0.1,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      locked: false,
    }
    const withHistory = {
      ...editorInitialState,
      document: {
        ...editorInitialState.document,
        items: [item],
      },
      history: {
        past: [{ items: [], selection: { selectedIds: [] } }],
        future: [],
      },
    }

    const undone = editorReducer(withHistory, { type: 'HISTORY/UNDO' })
    expect(undone.document.items).toHaveLength(0)
    const redone = editorReducer(undone, { type: 'HISTORY/REDO' })
    expect(redone.document.items).toHaveLength(1)
  })
})
