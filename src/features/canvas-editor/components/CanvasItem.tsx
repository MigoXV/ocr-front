import type { CanvasItem as CanvasItemType } from '../../../shared/types/canvas'

export function CanvasItem({
  item,
  selected,
  isEditing,
  onPointerDown,
  onContextMenu,
  onDoubleClick,
  onBlur,
}: {
  item: CanvasItemType
  selected: boolean
  isEditing: boolean
  onPointerDown: (event: React.PointerEvent) => void
  onContextMenu: (event: React.MouseEvent) => void
  onDoubleClick: () => void
  onBlur: (event: React.FocusEvent<HTMLDivElement>) => void
}) {
  if (item.type !== 'text' || !item.text) return null
  const run = item.text.runs[0]

  return (
    <article
      className={`ed-item ${selected ? 'is-selected' : ''}`}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.w * 100}%`,
        height: `${item.h * 100}%`,
        transform: `rotate(${item.rotation}deg)`,
        opacity: item.opacity,
        zIndex: item.zIndex,
      }}
      onPointerDown={onPointerDown}
      onContextMenu={onContextMenu}
    >
      <div
        className={`ed-item-text ${isEditing ? 'is-editing' : ''}`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={onDoubleClick}
        onBlur={onBlur}
        style={{
          textAlign: item.text.align,
          fontFamily: run.fontFamily,
          fontSize: `${run.fontSize}px`,
          fontWeight: run.fontWeight,
          fontStyle: run.fontStyle,
          color: run.color,
          letterSpacing: `${run.letterSpacing}px`,
          lineHeight: run.lineHeight,
          textDecoration: run.textDecoration,
          WebkitTextStrokeColor: run.strokeColor,
          WebkitTextStrokeWidth: `${run.strokeWidth}px`,
          textShadow: run.shadow,
          padding: `${item.text.padding.top}px ${item.text.padding.right}px ${item.text.padding.bottom}px ${item.text.padding.left}px`,
        }}
      >
        {run.text}
      </div>
    </article>
  )
}
