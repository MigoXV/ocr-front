import type { Handle, Rect } from '../../../shared/types/canvas'
import { rectStyle } from '../utils/geometry'
import { normalizeRect } from '../utils/normalize'

const handles: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

export function SelectionOverlay({
  selectionRect,
  marquee,
  onSelectionPointerDown,
  onRotatePointerDown,
  onHandlePointerDown,
}: {
  selectionRect: Rect | null
  marquee: { x1: number; y1: number; x2: number; y2: number } | undefined
  onSelectionPointerDown: (event: React.PointerEvent) => void
  onRotatePointerDown: (event: React.PointerEvent) => void
  onHandlePointerDown: (event: React.PointerEvent, handle: Handle) => void
}) {
  return (
    <>
      {marquee ? <div className="ed-marquee" style={rectStyle(normalizeRect(marquee))} /> : null}
      {selectionRect ? (
        <div className="ed-selection" style={rectStyle(selectionRect)} onPointerDown={onSelectionPointerDown}>
          <button className="ed-rotate-handle" onPointerDown={onRotatePointerDown} />
          {handles.map((handle) => (
            <button
              key={handle}
              className={`ed-handle ${handle}`}
              onPointerDown={(event) => onHandlePointerDown(event, handle)}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
