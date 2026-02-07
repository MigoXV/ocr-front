import { CanvasItem } from './CanvasItem'
import { GuidesOverlay } from './GuidesOverlay'
import { SelectionOverlay } from './SelectionOverlay'
import type { CanvasItem as CanvasItemType, Handle, Rect } from '../../../shared/types/canvas'

export function CanvasStage({
  canvasRef,
  backgroundImageUrl,
  autoFitText,
  items,
  selectedIds,
  editingId,
  guides,
  selectionRect,
  marquee,
  onCanvasPointerDown,
  onCanvasContextMenu,
  onItemPointerDown,
  onItemContextMenu,
  onItemDoubleClick,
  onItemBlur,
  onSelectionPointerDown,
  onRotatePointerDown,
  onHandlePointerDown,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>
  backgroundImageUrl: string | null
  autoFitText: boolean
  items: CanvasItemType[]
  selectedIds: string[]
  editingId: string | null
  guides: { axis: 'x' | 'y'; value: number }[]
  selectionRect: Rect | null
  marquee: { x1: number; y1: number; x2: number; y2: number } | undefined
  onCanvasPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onCanvasContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
  onItemPointerDown: (event: React.PointerEvent, itemId: string) => void
  onItemContextMenu: (event: React.MouseEvent, itemId: string) => void
  onItemDoubleClick: (itemId: string) => void
  onItemBlur: (event: React.FocusEvent<HTMLDivElement>, itemId: string) => void
  onSelectionPointerDown: (event: React.PointerEvent) => void
  onRotatePointerDown: (event: React.PointerEvent) => void
  onHandlePointerDown: (event: React.PointerEvent, handle: Handle) => void
}) {
  return (
    <div className="ed-canvas-wrap" onContextMenu={onCanvasContextMenu}>
      <div
        ref={canvasRef}
        className={`ed-canvas ${backgroundImageUrl ? 'has-image' : ''}`}
        onPointerDown={onCanvasPointerDown}
      >
        {backgroundImageUrl ? (
          <img src={backgroundImageUrl} alt="uploaded" className="ed-canvas-image" />
        ) : (
          <div className="ed-canvas-empty">请先上传图片</div>
        )}

        <div className="ed-overlay">
          {items
            .filter((item) => item.type === 'text')
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) => (
              <CanvasItem
                key={item.id}
                item={item}
                autoFitText={autoFitText}
                selected={selectedIds.includes(item.id)}
                isEditing={editingId === item.id}
                onPointerDown={(event) => onItemPointerDown(event, item.id)}
                onContextMenu={(event) => onItemContextMenu(event, item.id)}
                onDoubleClick={() => onItemDoubleClick(item.id)}
                onBlur={(event) => onItemBlur(event, item.id)}
              />
            ))}

          <SelectionOverlay
            selectionRect={selectionRect}
            marquee={marquee}
            onSelectionPointerDown={onSelectionPointerDown}
            onRotatePointerDown={onRotatePointerDown}
            onHandlePointerDown={onHandlePointerDown}
          />

          <GuidesOverlay guides={guides} />
        </div>
      </div>
    </div>
  )
}
