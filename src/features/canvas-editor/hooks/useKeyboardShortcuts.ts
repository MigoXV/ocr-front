import { useEffect } from 'react'

type Shortcuts = {
  editing: boolean
  onDelete: () => void
  onSelectAll: () => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onGroup: () => void
  onUngroup: () => void
  onForward: () => void
  onBackward: () => void
  onEscapeEditing: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shortcuts.editing) {
        if (event.key === 'Escape') shortcuts.onEscapeEditing()
        return
      }

      const mod = event.ctrlKey || event.metaKey

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        shortcuts.onDelete()
        return
      }

      if (mod && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        shortcuts.onSelectAll()
        return
      }

      if (mod && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        shortcuts.onUndo()
        return
      }

      if (mod && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault()
        shortcuts.onRedo()
        return
      }

      if (mod && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        shortcuts.onCopy()
        return
      }

      if (mod && event.key.toLowerCase() === 'x') {
        event.preventDefault()
        shortcuts.onCut()
        return
      }

      if (mod && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        shortcuts.onPaste()
        return
      }

      if (mod && event.key.toLowerCase() === 'g' && !event.shiftKey) {
        event.preventDefault()
        shortcuts.onGroup()
        return
      }

      if (mod && event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        shortcuts.onUngroup()
        return
      }

      if (mod && event.key === ']') {
        event.preventDefault()
        shortcuts.onForward()
        return
      }

      if (mod && event.key === '[') {
        event.preventDefault()
        shortcuts.onBackward()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
