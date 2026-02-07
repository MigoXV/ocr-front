import { useMemo, useReducer } from 'react'
import { editorInitialState } from '../store/editorInitialState'
import { editorReducer } from '../store/editorReducer'
import { EditorDispatchContext, EditorStateContext } from './editorContext'

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, editorInitialState)
  const stateValue = useMemo(() => state, [state])
  return (
    <EditorDispatchContext.Provider value={dispatch}>
      <EditorStateContext.Provider value={stateValue}>{children}</EditorStateContext.Provider>
    </EditorDispatchContext.Provider>
  )
}
