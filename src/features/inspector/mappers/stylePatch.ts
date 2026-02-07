import type { RichTextDoc, RichTextRun } from '../../../shared/types/richText'

export function patchRun(run: RichTextRun, patch: Partial<RichTextRun>): RichTextRun {
  return { ...run, ...patch }
}

export function patchDoc(doc: RichTextDoc, patch: Partial<RichTextDoc>): RichTextDoc {
  return { ...doc, ...patch }
}
