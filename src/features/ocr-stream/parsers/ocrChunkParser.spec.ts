import { describe, expect, it } from 'vitest'
import { createOcrChunkParser } from './ocrChunkParser'

describe('ocr chunk parser', () => {
  it('parses fragmented json objects', () => {
    const parse = createOcrChunkParser()
    const out1 = parse('[{"ref":"a","det":[1,2,3,4]}')
    expect(out1).toHaveLength(1)
    const out2 = parse(',{"ref":"b","det":[5,6,7,8]}]')
    expect(out2).toHaveLength(1)
    expect(out1[0].ref).toBe('a')
    expect(out2[0].ref).toBe('b')
  })
})
