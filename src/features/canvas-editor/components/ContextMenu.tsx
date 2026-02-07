export function ContextMenu({
  visible,
  x,
  y,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onGroup,
  onUngroup,
  onFront,
  onBack,
}: {
  visible: boolean
  x: number
  y: number
  onDelete: () => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onGroup: () => void
  onUngroup: () => void
  onFront: () => void
  onBack: () => void
}) {
  if (!visible) return null

  return (
    <ul className="ed-context" style={{ left: x, top: y }}>
      <li><button onClick={onDelete}>删除</button></li>
      <li><button onClick={onCopy}>复制</button></li>
      <li><button onClick={onCut}>剪切</button></li>
      <li><button onClick={onPaste}>粘贴</button></li>
      <li><button onClick={onGroup}>编组</button></li>
      <li><button onClick={onUngroup}>解组</button></li>
      <li><button onClick={onFront}>置顶</button></li>
      <li><button onClick={onBack}>置底</button></li>
    </ul>
  )
}
