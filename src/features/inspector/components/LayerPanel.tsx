import type { CanvasItem } from '../../../shared/types/canvas'

export function LayerPanel({
  items,
  selectedIds,
  onSelect,
}: {
  items: CanvasItem[]
  selectedIds: string[]
  onSelect: (id: string) => void
}) {
  return (
    <aside className="ed-panel">
      <div className="ed-panel-title">图层</div>
      <div className="ed-layer-list">
        {[...items]
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((item) => (
            <button
              key={item.id}
              className={`ed-layer-item ${selectedIds.includes(item.id) ? 'is-active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              {item.type === 'group' ? '组' : '文本'} · {item.id.slice(0, 8)}
            </button>
          ))}
      </div>
    </aside>
  )
}
