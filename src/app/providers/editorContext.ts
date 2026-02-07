import { createContext, useContext, type Dispatch } from 'react'
import type { EditorAction } from '../store/editorActions'
import type { EditorState } from '../store/editorTypes'

export const EditorStateContext = createContext<EditorState | null>(null)
export const EditorDispatchContext = createContext<Dispatch<EditorAction> | null>(null)

export function useEditorState() {
  const ctx = useContext(EditorStateContext)
  if (!ctx) throw new Error('useEditorState must be used inside EditorProvider')
  return ctx
}

export function useEditorDispatch() {
  const ctx = useContext(EditorDispatchContext)
  if (!ctx) throw new Error('useEditorDispatch must be used inside EditorProvider')
  return ctx
}
