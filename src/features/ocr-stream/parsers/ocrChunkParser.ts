import type { OCRStreamItem } from '../../../shared/types/ocr'

export function createOcrChunkParser() {
  let buffer = ''
  let cursor = 0
  let started = false
  let depth = 0
  let inString = false
  let escaping = false
  let objectStart = -1

  return (chunk: string): OCRStreamItem[] => {
    const output: OCRStreamItem[] = []
    buffer += chunk

    while (cursor < buffer.length) {
      const ch = buffer[cursor]

      if (!started) {
        if (ch === '[') started = true
        cursor += 1
        continue
      }

      if (inString) {
        if (escaping) escaping = false
        else if (ch === '\\') escaping = true
        else if (ch === '"') inString = false
        cursor += 1
        continue
      }

      if (ch === '"') {
        inString = true
        cursor += 1
        continue
      }

      if (ch === '{') {
        if (depth === 0) objectStart = cursor
        depth += 1
      } else if (ch === '}') {
        depth -= 1
        if (depth === 0 && objectStart >= 0) {
          const raw = buffer.slice(objectStart, cursor + 1)
          try {
            output.push(JSON.parse(raw) as OCRStreamItem)
          } catch {
            // Drop malformed segment.
          }
          objectStart = -1
        }
      }

      cursor += 1
    }

    if (cursor > 8000 && depth === 0) {
      buffer = buffer.slice(cursor)
      cursor = 0
    }

    return output
  }
}
