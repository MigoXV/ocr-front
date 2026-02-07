import type { CanvasItem } from '../../../shared/types/canvas'
import type { RichTextDoc, RichTextRun } from '../../../shared/types/richText'

const FONT_FAMILY_OPTIONS = [
  'Noto Sans SC',
  'PingFang SC',
  'Microsoft YaHei',
  'Source Han Sans SC',
  'Arial',
  'Times New Roman',
  'Courier New',
]

export function PropertyPanel({
  active,
  defaultDoc,
  defaultOpacity,
  onPatchRun,
  onPatchDoc,
  onOpacity,
}: {
  active?: CanvasItem
  defaultDoc: RichTextDoc
  defaultOpacity: number
  onPatchRun: (patch: Partial<RichTextRun>) => void
  onPatchDoc: (patch: Partial<RichTextDoc>) => void
  onOpacity: (value: number) => void
}) {
  const activeText = active && active.type === 'text' && active.text ? active : null
  const doc: RichTextDoc = activeText?.text || defaultDoc
  const run = doc.runs[0]
  const opacity = activeText ? activeText.opacity : defaultOpacity

  return (
    <aside className="ed-panel">
      <div className="ed-panel-title">属性</div>
      {!activeText ? <div className="ed-muted">当前编辑 OCR 默认样式</div> : null}
      <div className="ed-props">
        <label>字体
          <select value={run.fontFamily} onChange={(e) => onPatchRun({ fontFamily: e.target.value })}>
            {!FONT_FAMILY_OPTIONS.includes(run.fontFamily) ? <option value={run.fontFamily}>{run.fontFamily}</option> : null}
            {FONT_FAMILY_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
        <label>字号<input type="number" value={run.fontSize} onChange={(e) => onPatchRun({ fontSize: Number(e.target.value) || 1 })} /></label>
        <label>字重<input type="number" min={100} max={900} step={100} value={run.fontWeight} onChange={(e) => onPatchRun({ fontWeight: Number(e.target.value) || 400 })} /></label>
        <label>颜色<input type="color" value={run.color} onChange={(e) => onPatchRun({ color: e.target.value })} /></label>
        <label>字距<input type="number" step={0.1} value={run.letterSpacing} onChange={(e) => onPatchRun({ letterSpacing: Number(e.target.value) || 0 })} /></label>
        <label>行高<input type="number" step={0.1} value={run.lineHeight} onChange={(e) => onPatchRun({ lineHeight: Number(e.target.value) || 1 })} /></label>
        <label>描边色<input type="color" value={run.strokeColor} onChange={(e) => onPatchRun({ strokeColor: e.target.value })} /></label>
        <label>描边宽<input type="number" min={0} step={0.5} value={run.strokeWidth} onChange={(e) => onPatchRun({ strokeWidth: Number(e.target.value) || 0 })} /></label>
        <label>阴影<input value={run.shadow} onChange={(e) => onPatchRun({ shadow: e.target.value })} /></label>
        <label>对齐
          <select value={doc.align} onChange={(e) => onPatchDoc({ align: e.target.value as RichTextDoc['align'] })}>
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
            <option value="justify">justify</option>
          </select>
        </label>
        <label>透明度
          <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => onOpacity(Number(e.target.value))} />
        </label>
      </div>
    </aside>
  )
}
