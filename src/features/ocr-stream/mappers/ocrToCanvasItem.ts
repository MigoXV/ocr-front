import type { CanvasItem } from '../../../shared/types/canvas'
import type { OCRDet, OCRStreamItem } from '../../../shared/types/ocr'
import type { RichTextDoc, RichTextRun } from '../../../shared/types/richText'
import { DEFAULT_RUN } from '../../../shared/types/richText'
import { clamp } from '../../../shared/utils/clamp'
import { createId } from '../../canvas-editor/utils/ids'

const MIN_NORM_SIZE = 0.008
const DET_SCALE = 999
const DEFAULT_DOC_STYLE: Omit<RichTextDoc, 'runs'> = {
  align: 'left',
  verticalAlign: 'top',
  padding: { top: 2, right: 2, bottom: 2, left: 2 },
}

export type OCRTextStylePreset = {
  run: RichTextRun
  doc: Omit<RichTextDoc, 'runs'>
  opacity: number
}

function extractXYXY(det: OCRDet): [number, number, number, number] | null {
  if (!Array.isArray(det)) return null
  if (det.length === 4 && det.every((v) => typeof v === 'number')) {
    const [x1, y1, x2, y2] = det
    return [Number(x1), Number(y1), Number(x2), Number(y2)]
  }

  for (const node of det as unknown[]) {
    if (Array.isArray(node) && node.length === 4 && node.every((v) => typeof v === 'number')) {
      const [x1, y1, x2, y2] = node
      return [Number(x1), Number(y1), Number(x2), Number(y2)]
    }
  }

  return null
}

function toNormalized(v: number, sourceMax: number) {
  return clamp(v / sourceMax, -1, 2)
}

export function toCanvasItem(
  raw: OCRStreamItem,
  zIndex: number,
  parentId?: string,
  stylePreset?: OCRTextStylePreset,
): CanvasItem | null {
  const box = extractXYXY(raw.det)
  if (!box) return null
  const [a, b, c, d] = box
  const sourceMax = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)) <= 1.5 ? 1 : DET_SCALE
  const x1 = Math.min(a, c)
  const y1 = Math.min(b, d)
  const x2 = Math.max(a, c)
  const y2 = Math.max(b, d)
  const docStyle = stylePreset?.doc || DEFAULT_DOC_STYLE
  const runStyle = stylePreset?.run || DEFAULT_RUN

  return {
    id: createId('item'),
    type: 'text',
    x: toNormalized(x1, sourceMax),
    y: toNormalized(y1, sourceMax),
    w: Math.max(MIN_NORM_SIZE, (x2 - x1) / sourceMax),
    h: Math.max(MIN_NORM_SIZE, (y2 - y1) / sourceMax),
    rotation: 0,
    opacity: stylePreset?.opacity ?? 1,
    zIndex,
    locked: false,
    parentId,
    text: {
      ...docStyle,
      runs: [{ ...runStyle, text: raw.ref }],
    },
  }
}
