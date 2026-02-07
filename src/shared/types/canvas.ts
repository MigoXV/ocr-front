import type { RichTextDoc } from './richText'

export type CanvasItem = {
  id: string
  type: 'text' | 'group'
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  zIndex: number
  locked: boolean
  parentId?: string
  childIds?: string[]
  text?: RichTextDoc
}

export type Rect = { x: number; y: number; w: number; h: number }

export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export type GuideLine = { axis: 'x' | 'y'; value: number }

export type SelectionState = {
  selectedIds: string[]
  activeId?: string
  marquee?: { x1: number; y1: number; x2: number; y2: number }
}

export type Snapshot = {
  items: CanvasItem[]
  selection: SelectionState
}

export type InteractionState =
  | {
      type: 'marquee'
      startX: number
      startY: number
      additive: boolean
    }
  | {
      type: 'move'
      startX: number
      startY: number
      baseItems: CanvasItem[]
      baseSelection: SelectionState
      targetIds: string[]
    }
  | {
      type: 'resize'
      handle: Handle
      startX: number
      startY: number
      box: Rect
      baseItems: CanvasItem[]
      baseSelection: SelectionState
      targetIds: string[]
      keepRatio: boolean
    }
  | {
      type: 'rotate'
      startAngle: number
      box: Rect
      baseItems: CanvasItem[]
      baseSelection: SelectionState
      targetIds: string[]
      snap: boolean
    }

export type ContextMenuState = {
  x: number
  y: number
  visible: boolean
}
