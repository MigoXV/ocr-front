import type { CanvasItem, InteractionState, SelectionState, Snapshot } from '../../shared/types/canvas'
import type { EditorCommand } from './editorTypes'

export type EditorAction =
  | { type: 'EDITOR/SET_IMAGE'; payload: { file: File | null; imageUrl: string | null } }
  | { type: 'OCR/START'; payload: { groupId: string } }
  | { type: 'OCR/APPEND_ITEMS'; payload: { items: CanvasItem[]; groupId: string } }
  | { type: 'OCR/FAIL'; payload: { error: string } }
  | { type: 'OCR/FINISH' }
  | { type: 'SELECTION/SET'; payload: SelectionState }
  | { type: 'SELECTION/CLEAR' }
  | { type: 'SELECTION/MARQUEE_UPDATE'; payload: SelectionState['marquee'] }
  | { type: 'INTERACTION/BEGIN'; payload: InteractionState }
  | { type: 'INTERACTION/END' }
  | {
      type: 'ITEMS/APPLY_COMMAND'
      payload: { command: EditorCommand<unknown>; commandPayload: unknown; pushHistory?: boolean }
    }
  | { type: 'HISTORY/PUSH'; payload: Snapshot }
  | { type: 'HISTORY/UNDO' }
  | { type: 'HISTORY/REDO' }
  | { type: 'CLIPBOARD/SET'; payload: CanvasItem[] }
  | { type: 'UI/SET_EDITING'; payload: string | null }
  | { type: 'UI/SET_ERROR'; payload: string }
  | { type: 'UI/OPEN_CONTEXT_MENU'; payload: { x: number; y: number } }
  | { type: 'UI/CLOSE_CONTEXT_MENU' }
  | { type: 'UI/SET_GUIDES'; payload: { axis: 'x' | 'y'; value: number }[] }
  | { type: 'DOCUMENT/SET_ITEMS'; payload: CanvasItem[] }
