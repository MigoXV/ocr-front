import { useLayoutEffect, useRef, useState } from 'react'
import type { CanvasItem as CanvasItemType } from '../../../shared/types/canvas'

function fitsBox(el: HTMLDivElement, size: number) {
  el.style.fontSize = `${size}px`
  return el.scrollWidth <= el.clientWidth + 0.5 && el.scrollHeight <= el.clientHeight + 0.5
}

export function CanvasItem({
  item,
  autoFitText,
  selected,
  isEditing,
  onPointerDown,
  onContextMenu,
  onDoubleClick,
  onBlur,
}: {
  item: CanvasItemType
  autoFitText: boolean
  selected: boolean
  isEditing: boolean
  onPointerDown: (event: React.PointerEvent) => void
  onContextMenu: (event: React.MouseEvent) => void
  onDoubleClick: () => void
  onBlur: (event: React.FocusEvent<HTMLDivElement>) => void
}) {
  const textRef = useRef<HTMLDivElement | null>(null)
  const [fitFontSize, setFitFontSize] = useState<number | null>(null)
  const text = item.type === 'text' ? item.text : undefined
  const run = text?.runs[0]

  useLayoutEffect(() => {
    if (!text || !run) return
    if (!autoFitText || isEditing) {
      setFitFontSize(null)
      return
    }

    const el = textRef.current
    if (!el || el.clientWidth < 1 || el.clientHeight < 1) return

    const prev = el.style.fontSize
    const minSize = 6
    const maxSize = Math.max(48, Math.ceil(run.fontSize))
    let lo = minSize
    let hi = maxSize
    let best = minSize

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (fitsBox(el, mid)) {
        best = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    el.style.fontSize = prev
    setFitFontSize(best)
  }, [
    autoFitText,
    isEditing,
    item.h,
    item.w,
    text,
    text?.align,
    text?.padding.bottom,
    text?.padding.left,
    text?.padding.right,
    text?.padding.top,
    run?.fontFamily,
    run?.fontStyle,
    run?.fontWeight,
    run?.letterSpacing,
    run?.lineHeight,
    run?.text,
  ])

  if (!text || !run) return null

  const resolvedFontSize = autoFitText && !isEditing ? fitFontSize || run.fontSize : run.fontSize

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
        ref={textRef}
        className={`ed-item-text ${isEditing ? 'is-editing' : ''}`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={onDoubleClick}
        onBlur={onBlur}
        style={{
          textAlign: text.align,
          fontFamily: run.fontFamily,
          fontSize: `${resolvedFontSize}px`,
          fontWeight: run.fontWeight,
          fontStyle: run.fontStyle,
          color: run.color,
          letterSpacing: `${run.letterSpacing}px`,
          lineHeight: run.lineHeight,
          textDecoration: run.textDecoration,
          WebkitTextStrokeColor: run.strokeColor,
          WebkitTextStrokeWidth: `${run.strokeWidth}px`,
          textShadow: run.shadow,
          padding: `${text.padding.top}px ${text.padding.right}px ${text.padding.bottom}px ${text.padding.left}px`,
        }}
      >
        {run.text}
      </div>
    </article>
  )
}
