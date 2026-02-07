import type {
  CanvasItem,
  InteractionState,
  SelectionState,
  Snapshot,
} from '../../shared/types/canvas'
import type { UIState } from '../../shared/types/ui'

export type EditorState = {
  document: {
    items: CanvasItem[]
    backgroundImageUrl: string | null
  }
  selection: SelectionState
  interaction: InteractionState | null
  ui: UIState
  history: {
    past: Snapshot[]
    future: Snapshot[]
  }
  clipboard: CanvasItem[]
}

export type CommandResult = {
  items: CanvasItem[]
  selection?: SelectionState
}

export type CommandContext<T> = {
  state: EditorState
  payload: T
}

export type EditorCommand<T = unknown> = (ctx: CommandContext<T>) => CommandResult
