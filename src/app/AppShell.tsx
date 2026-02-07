import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../styles/tokens.css'
import '../styles/layout.css'
import '../styles/editor.css'
import { EditorProvider } from './providers/EditorProvider'
import { useEditorDispatch, useEditorState } from './providers/editorContext'
import { TopToolbar } from '../features/inspector/components/TopToolbar'
import { PropertyPanel } from '../features/inspector/components/PropertyPanel'
import { CanvasStage } from '../features/canvas-editor/components/CanvasStage'
import { ContextMenu } from '../features/canvas-editor/components/ContextMenu'
import { useKeyboardShortcuts } from '../features/canvas-editor/hooks/useKeyboardShortcuts'
import { useCanvasPointer } from '../features/canvas-editor/hooks/useCanvasPointer'
import { resolveTargetIds, uniq } from '../features/canvas-editor/selectors/selection'
import { getSelectionRect, intersects, toNorm } from '../features/canvas-editor/utils/geometry'
import { normalizeRect } from '../features/canvas-editor/utils/normalize'
import { applyMove, applySnapForMove } from '../features/canvas-editor/commands/move'
import { applyResize } from '../features/canvas-editor/commands/resize'
import { applyRotate } from '../features/canvas-editor/commands/rotate'
import { reorderItems } from '../features/canvas-editor/commands/reorder'
import { cloneItemsForClipboard, pasteItems } from '../features/canvas-editor/commands/clipboard'
import { groupItems, maxZ, ungroupItems } from '../features/canvas-editor/commands/group'
import { removeItems } from './store/editorReducer'
import { createId } from '../features/canvas-editor/utils/ids'
import { requestOcrStream } from '../features/ocr-stream/services/ocrClient'
import { consumeSSE } from '../features/ocr-stream/services/sse'
import { createOcrChunkParser } from '../features/ocr-stream/parsers/ocrChunkParser'
import { toCanvasItem } from '../features/ocr-stream/mappers/ocrToCanvasItem'
import { patchDoc, patchRun } from '../features/inspector/mappers/stylePatch'
import { DEFAULT_RUN } from '../shared/types/richText'
import type { CanvasItem, Handle, InteractionState, SelectionState } from '../shared/types/canvas'
import type { RichTextDoc, RichTextRun } from '../shared/types/richText'
import type { EditorState } from './store/editorTypes'

type CommandCtx<T = unknown> = { state: EditorState; payload: T }
type ThemeMode = 'light' | 'dark'
const THEME_KEY = 'ocr-editor-theme'
const DEFAULT_OCR_DOC: RichTextDoc = {
  runs: [{ ...DEFAULT_RUN }],
  align: 'left',
  verticalAlign: 'top',
  padding: { top: 2, right: 2, bottom: 2, left: 2 },
}

function EditorScreen() {
  const state = useEditorState()
  const dispatch = useEditorDispatch()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [ocrDefaultDoc, setOcrDefaultDoc] = useState<RichTextDoc>(DEFAULT_OCR_DOC)
  const [ocrDefaultOpacity, setOcrDefaultOpacity] = useState(1)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const activeObjectUrlRef = useRef<string | null>(null)

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL?.trim() || '/api', [])
  const items = state.document.items
  const selection = state.selection
  const selectedTargetIds = resolveTargetIds(items, selection.selectedIds)
  const selectionRect = getSelectionRect(items, selectedTargetIds)
  const activeItem = items.find((i) => i.id === selection.activeId)

  const closeContextMenu = useCallback(() => {
    dispatch({ type: 'UI/CLOSE_CONTEXT_MENU' })
  }, [dispatch])

  useEffect(() => {
    window.addEventListener('click', closeContextMenu)
    return () => window.removeEventListener('click', closeContextMenu)
  }, [closeContextMenu])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (localStorage.getItem(THEME_KEY)) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const applyCommand = useCallback(
    (
      command: (ctx: CommandCtx) => { items: CanvasItem[]; selection?: SelectionState },
      payload: unknown,
      pushHistory = true,
    ) => {
      dispatch({
        type: 'ITEMS/APPLY_COMMAND',
        payload: {
          command,
          commandPayload: payload,
          pushHistory,
        },
      })
    },
    [dispatch],
  )

  const setSelection = useCallback(
    (next: SelectionState) => {
      dispatch({ type: 'SELECTION/SET', payload: next })
    },
    [dispatch],
  )

  const onUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current)
      }

      const imageUrl = URL.createObjectURL(file)
      activeObjectUrlRef.current = imageUrl
      setImageFile(file)
      dispatch({ type: 'EDITOR/SET_IMAGE', payload: { file, imageUrl } })
    },
    [dispatch],
  )

  const startOCR = useCallback(async () => {
    if (!imageFile) return
    const groupId = createId('ocr-group')

    applyCommand(
      ({ state: localState }: CommandCtx) => ({
        items: localState.document.items.filter(
          (item) => !(item.id.startsWith('ocr-group-') || item.parentId?.startsWith('ocr-group-')),
        ),
        selection: { selectedIds: [] },
      }),
      {},
      false,
    )

    dispatch({ type: 'OCR/START', payload: { groupId } })

    applyCommand(
      ({ state }: CommandCtx) => ({
        items: [
          ...state.document.items,
          {
            id: groupId,
            type: 'group',
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            rotation: 0,
            opacity: 1,
            zIndex: maxZ(state.document.items) + 1,
            locked: false,
            childIds: [],
          },
        ],
      }),
      {},
      false,
    )

    try {
      const imageDataUrl = await fileToDataUrl(imageFile)
      const body = await requestOcrStream(apiBase, imageDataUrl)
      const parser = createOcrChunkParser()
      let runningZ = maxZ(state.document.items) + 1

      await consumeSSE(body, (delta) => {
        const rawItems = parser(delta)
        if (!rawItems.length) return

        const nextItems: CanvasItem[] = []
        for (const raw of rawItems) {
          const mapped = toCanvasItem(raw, runningZ, groupId, {
            run: ocrDefaultDoc.runs[0],
            doc: {
              align: ocrDefaultDoc.align,
              verticalAlign: ocrDefaultDoc.verticalAlign,
              padding: ocrDefaultDoc.padding,
            },
            opacity: ocrDefaultOpacity,
          })
          if (mapped) {
            nextItems.push(mapped)
            runningZ += 1
          }
        }

        if (nextItems.length) {
          dispatch({ type: 'OCR/APPEND_ITEMS', payload: { items: nextItems, groupId } })
        }
      })

      dispatch({ type: 'OCR/FINISH' })
    } catch (error) {
      dispatch({
        type: 'OCR/FAIL',
        payload: { error: error instanceof Error ? error.message : 'OCR failed' },
      })
    }
  }, [apiBase, applyCommand, dispatch, imageFile, ocrDefaultDoc, ocrDefaultOpacity, state.document.items])

  const removeSelected = useCallback(() => {
    if (!selectedTargetIds.length) return
    applyCommand(
      ({ state }: CommandCtx) => ({
        items: removeItems(state.document.items, selectedTargetIds),
        selection: { selectedIds: [] },
      }),
      {},
    )
  }, [applyCommand, selectedTargetIds])

  const onCopy = useCallback(() => {
    dispatch({ type: 'CLIPBOARD/SET', payload: cloneItemsForClipboard(items, selectedTargetIds) })
  }, [dispatch, items, selectedTargetIds])

  const onCut = useCallback(() => {
    dispatch({ type: 'CLIPBOARD/SET', payload: cloneItemsForClipboard(items, selectedTargetIds) })
    removeSelected()
  }, [dispatch, items, removeSelected, selectedTargetIds])

  const onPaste = useCallback(() => {
    if (!state.clipboard.length) return
    applyCommand(
      ({ state: localState }: CommandCtx) => {
        const pasted = pasteItems(localState.document.items, localState.clipboard)
        return {
          items: [...localState.document.items, ...pasted.items],
          selection: {
            selectedIds: pasted.ids,
            activeId: pasted.ids.at(-1),
          },
        }
      },
      {},
    )
  }, [applyCommand, state.clipboard.length])

  const groupSelection = useCallback(() => {
    if (selection.selectedIds.length < 2) return
    const rect = getSelectionRect(items, selection.selectedIds)
    if (!rect) return
    applyCommand(
      ({ state: localState }: CommandCtx) => {
        const grouped = groupItems(localState.document.items, selection.selectedIds, rect)
        return {
          items: grouped.items,
          selection: { selectedIds: [grouped.groupId], activeId: grouped.groupId },
        }
      },
      {},
    )
  }, [applyCommand, items, selection.selectedIds])

  const ungroupSelection = useCallback(() => {
    const groupIds = selection.selectedIds.filter((id) => items.find((i) => i.id === id && i.type === 'group'))
    if (!groupIds.length) return
    applyCommand(
      ({ state: localState }: CommandCtx) => ({
        items: ungroupItems(localState.document.items, groupIds),
        selection: { selectedIds: [] },
      }),
      {},
    )
  }, [applyCommand, items, selection.selectedIds])

  const onReorder = useCallback(
    (mode: 'front' | 'back' | 'forward' | 'backward') => {
      if (!selectedTargetIds.length) return
      applyCommand(
        ({ state: localState }: CommandCtx) => ({
          items: reorderItems(localState.document.items, selectedTargetIds, mode),
        }),
        {},
      )
    },
    [applyCommand, selectedTargetIds],
  )

  const onPatchRun = useCallback(
    (patch: Partial<RichTextRun>) => {
      if (!activeItem || activeItem.type !== 'text' || !activeItem.text) {
        setOcrDefaultDoc((prev) => ({
          ...prev,
          runs: prev.runs.map((run, idx) => (idx === 0 ? patchRun(run, patch) : run)),
        }))
        return
      }
      applyCommand(
        ({ state: localState }: CommandCtx) => ({
          items: localState.document.items.map((item: CanvasItem) => {
            if (item.id !== activeItem.id || item.type !== 'text' || !item.text) return item
            return {
              ...item,
              text: {
                ...item.text,
                runs: item.text.runs.map((run, idx) => (idx === 0 ? patchRun(run, patch) : run)),
              },
            }
          }),
        }),
        {},
        false,
      )
    },
    [activeItem, applyCommand],
  )

  const onPatchDoc = useCallback(
    (patch: Partial<RichTextDoc>) => {
      if (!activeItem || activeItem.type !== 'text' || !activeItem.text) {
        setOcrDefaultDoc((prev) => patchDoc(prev, patch))
        return
      }
      applyCommand(
        ({ state: localState }: CommandCtx) => ({
          items: localState.document.items.map((item: CanvasItem) => {
            if (item.id !== activeItem.id || item.type !== 'text' || !item.text) return item
            return { ...item, text: patchDoc(item.text, patch) }
          }),
        }),
        {},
        false,
      )
    },
    [activeItem, applyCommand],
  )

  const onOpacity = useCallback(
    (value: number) => {
      if (!activeItem || activeItem.type !== 'text' || !activeItem.text) {
        setOcrDefaultOpacity(value)
        return
      }
      applyCommand(
        ({ state: localState }: CommandCtx) => ({
          items: localState.document.items.map((item: CanvasItem) => (item.id === activeItem.id ? { ...item, opacity: value } : item)),
        }),
        {},
        false,
      )
    },
    [activeItem, applyCommand],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent, interaction: InteractionState) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()

      if (interaction.type === 'marquee') {
        const start = toNorm(rect, interaction.startX, interaction.startY)
        const current = toNorm(rect, event.clientX, event.clientY)
        dispatch({
          type: 'SELECTION/MARQUEE_UPDATE',
          payload: { x1: start.x, y1: start.y, x2: current.x, y2: current.y },
        })
        return
      }

      if (interaction.type === 'move') {
        const dx = (event.clientX - interaction.startX) / rect.width
        const dy = (event.clientY - interaction.startY) / rect.height
        const moved = applyMove(interaction.baseItems, interaction.targetIds, dx, dy)
        const snapped = applySnapForMove(moved, interaction.baseItems, interaction.targetIds, rect, getSelectionRect)
        dispatch({ type: 'DOCUMENT/SET_ITEMS', payload: snapped.items })
        dispatch({ type: 'UI/SET_GUIDES', payload: snapped.guides })
        return
      }

      if (interaction.type === 'resize') {
        const dx = (event.clientX - interaction.startX) / rect.width
        const dy = (event.clientY - interaction.startY) / rect.height
        const resized = applyResize(
          interaction.baseItems,
          interaction.targetIds,
          interaction.box,
          interaction.handle,
          dx,
          dy,
          interaction.keepRatio || event.shiftKey,
          rect,
        )
        dispatch({ type: 'DOCUMENT/SET_ITEMS', payload: resized })
        return
      }

      if (interaction.type === 'rotate') {
        const centerPx = {
          x: rect.left + (interaction.box.x + interaction.box.w / 2) * rect.width,
          y: rect.top + (interaction.box.y + interaction.box.h / 2) * rect.height,
        }
        const angle = Math.atan2(event.clientY - centerPx.y, event.clientX - centerPx.x)
        let delta = angle - interaction.startAngle
        if (interaction.snap || event.shiftKey) {
          const step = Math.PI / 12
          delta = Math.round(delta / step) * step
        }
        const rotated = applyRotate(interaction.baseItems, interaction.targetIds, interaction.box, delta, rect)
        dispatch({ type: 'DOCUMENT/SET_ITEMS', payload: rotated })
      }
    },
    [dispatch],
  )

  const onPointerUp = useCallback(
    (interaction: InteractionState) => {
      if (interaction.type === 'marquee') {
        const marquee = state.selection.marquee
        if (marquee) {
          const hit = items
            .filter((item) => item.type === 'text')
            .filter((item) => intersects(normalizeRect(marquee), { x: item.x, y: item.y, w: item.w, h: item.h }))
            .map((item) => item.id)

          const selectedIds = interaction.additive ? uniq([...state.selection.selectedIds, ...hit]) : hit
          setSelection({ selectedIds, activeId: selectedIds.at(-1) })
        }
      } else {
        dispatch({
          type: 'HISTORY/PUSH',
          payload: { items: interaction.baseItems, selection: interaction.baseSelection },
        })
      }

      dispatch({ type: 'INTERACTION/END' })
      dispatch({ type: 'SELECTION/MARQUEE_UPDATE', payload: undefined })
      dispatch({ type: 'UI/SET_GUIDES', payload: [] })
    },
    [dispatch, items, setSelection, state.selection],
  )

  useCanvasPointer({
    interaction: state.interaction,
    onPointerMove,
    onPointerUp,
  })

  useKeyboardShortcuts({
    editing: Boolean(state.ui.editingId),
    onDelete: removeSelected,
    onSelectAll: () => {
      const all = items.filter((i) => i.type === 'text').map((i) => i.id)
      setSelection({ selectedIds: all, activeId: all.at(-1) })
    },
    onUndo: () => dispatch({ type: 'HISTORY/UNDO' }),
    onRedo: () => dispatch({ type: 'HISTORY/REDO' }),
    onCopy,
    onCut,
    onPaste,
    onGroup: groupSelection,
    onUngroup: ungroupSelection,
    onForward: () => onReorder('forward'),
    onBackward: () => onReorder('backward'),
    onEscapeEditing: () => dispatch({ type: 'UI/SET_EDITING', payload: null }),
  })

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) return
    setSelection(event.shiftKey ? state.selection : { selectedIds: [] })
    dispatch({
      type: 'INTERACTION/BEGIN',
      payload: {
        type: 'marquee',
        startX: event.clientX,
        startY: event.clientY,
        additive: event.shiftKey,
      },
    })
  }

  const onItemPointerDown = (event: React.PointerEvent, itemId: string) => {
    if (event.button !== 0 || state.ui.editingId) return
    event.stopPropagation()

    const alreadySelected = selection.selectedIds.includes(itemId)
    const nextSelected = event.shiftKey
      ? alreadySelected
        ? selection.selectedIds.filter((id) => id !== itemId)
        : [...selection.selectedIds, itemId]
      : alreadySelected
        ? selection.selectedIds
        : [itemId]

    const updatedSelection = {
      selectedIds: nextSelected,
      activeId: nextSelected.at(-1),
    }
    setSelection(updatedSelection)

    let baseItems = items
    let targetIds = resolveTargetIds(items, nextSelected)

    if (event.altKey) {
      const clones = cloneItemsForClipboard(items, targetIds)
      const pasted = pasteItems(items, clones)
      baseItems = [...items, ...pasted.items]
      dispatch({ type: 'DOCUMENT/SET_ITEMS', payload: baseItems })
      targetIds = pasted.ids
      setSelection({ selectedIds: targetIds, activeId: targetIds.at(-1) })
    }

    dispatch({
      type: 'INTERACTION/BEGIN',
      payload: {
        type: 'move',
        startX: event.clientX,
        startY: event.clientY,
        baseItems,
        baseSelection: updatedSelection,
        targetIds,
      },
    })
  }

  const onSelectionPointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).tagName === 'BUTTON') return
    dispatch({
      type: 'INTERACTION/BEGIN',
      payload: {
        type: 'move',
        startX: event.clientX,
        startY: event.clientY,
        baseItems: items,
        baseSelection: selection,
        targetIds: selectedTargetIds,
      },
    })
  }

  const onHandlePointerDown = (event: React.PointerEvent, handle: Handle) => {
    event.stopPropagation()
    if (!selectionRect) return
    dispatch({
      type: 'INTERACTION/BEGIN',
      payload: {
        type: 'resize',
        handle,
        startX: event.clientX,
        startY: event.clientY,
        box: selectionRect,
        baseItems: items,
        baseSelection: selection,
        targetIds: selectedTargetIds,
        keepRatio: event.shiftKey,
      },
    })
  }

  const onRotatePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation()
    if (!selectionRect || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const center = {
      x: rect.left + (selectionRect.x + selectionRect.w / 2) * rect.width,
      y: rect.top + (selectionRect.y + selectionRect.h / 2) * rect.height,
    }
    const startAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x)

    dispatch({
      type: 'INTERACTION/BEGIN',
      payload: {
        type: 'rotate',
        startAngle,
        box: selectionRect,
        baseItems: items,
        baseSelection: selection,
        targetIds: selectedTargetIds,
        snap: event.shiftKey,
      },
    })
  }

  return (
    <main className="ed-root">
      <TopToolbar
        theme={theme}
        isLoading={state.ui.isLoadingOCR}
        canUndo={state.history.past.length > 0}
        canRedo={state.history.future.length > 0}
        canGroup={selection.selectedIds.length > 1}
        onUpload={onUpload}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onStartOcr={startOCR}
        onUndo={() => dispatch({ type: 'HISTORY/UNDO' })}
        onRedo={() => dispatch({ type: 'HISTORY/REDO' })}
        onGroup={groupSelection}
      />

      {state.ui.error ? <div className="ed-error">{state.ui.error}</div> : null}

      <section className="ed-workspace">
        <CanvasStage
          canvasRef={canvasRef}
          backgroundImageUrl={state.document.backgroundImageUrl}
          items={items}
          selectedIds={selection.selectedIds}
          editingId={state.ui.editingId}
          guides={state.ui.guides}
          selectionRect={selectionRect}
          marquee={selection.marquee}
          onCanvasPointerDown={onCanvasPointerDown}
          onCanvasContextMenu={(event) => {
            event.preventDefault()
            dispatch({ type: 'UI/OPEN_CONTEXT_MENU', payload: { x: event.clientX, y: event.clientY } })
          }}
          onItemPointerDown={onItemPointerDown}
          onItemContextMenu={(event, id) => {
            event.preventDefault()
            if (!selection.selectedIds.includes(id)) {
              setSelection({ selectedIds: [id], activeId: id })
            }
            dispatch({ type: 'UI/OPEN_CONTEXT_MENU', payload: { x: event.clientX, y: event.clientY } })
          }}
          onItemDoubleClick={(itemId) => dispatch({ type: 'UI/SET_EDITING', payload: itemId })}
          onItemBlur={(event, itemId) => {
            const text = event.currentTarget.textContent || ''
            dispatch({ type: 'UI/SET_EDITING', payload: null })
            applyCommand(
              ({ state: localState }: CommandCtx) => ({
                items: localState.document.items.map((item: CanvasItem) => {
                  if (item.id !== itemId || item.type !== 'text' || !item.text) return item
                  return {
                    ...item,
                    text: {
                      ...item.text,
                      runs: [{ ...item.text.runs[0], text }],
                    },
                  }
                }),
              }),
              {},
            )
          }}
          onSelectionPointerDown={onSelectionPointerDown}
          onRotatePointerDown={onRotatePointerDown}
          onHandlePointerDown={onHandlePointerDown}
        />

        <PropertyPanel
          active={activeItem}
          defaultDoc={ocrDefaultDoc}
          defaultOpacity={ocrDefaultOpacity}
          onPatchRun={onPatchRun}
          onPatchDoc={onPatchDoc}
          onOpacity={onOpacity}
        />
      </section>

      {state.ui.ocrBatch.count > 0 ? (
        <div className="ed-ocr-tip">
          OCR 新增 {state.ui.ocrBatch.count} 条结果
          <button
            onClick={() => {
              const valid = state.ui.ocrBatch.newIds.filter((id) => items.some((item) => item.id === id))
              setSelection({ selectedIds: valid, activeId: valid.at(-1) })
            }}
          >
            选中新增
          </button>
        </div>
      ) : null}

      <ContextMenu
        visible={state.ui.contextMenu.visible}
        x={state.ui.contextMenu.x}
        y={state.ui.contextMenu.y}
        onDelete={removeSelected}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
        onGroup={groupSelection}
        onUngroup={ungroupSelection}
        onFront={() => onReorder('front')}
        onBack={() => onReorder('back')}
      />
    </main>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Read image failed'))
    reader.readAsDataURL(file)
  })
}

export function AppShell() {
  return (
    <EditorProvider>
      <EditorScreen />
    </EditorProvider>
  )
}
