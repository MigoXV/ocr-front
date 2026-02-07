import { describe, expect, it } from 'vitest'
import { alignItems } from './align'
import type { CanvasItem } from '../../../shared/types/canvas'

describe('align command', () => {
  it('left aligns to anchor', () => {
    const items: CanvasItem[] = [
      { id: 'a', type: 'text', x: 0.2, y: 0.2, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 1, locked: false },
      { id: 'b', type: 'text', x: 0.6, y: 0.3, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 2, locked: false },
    ]
    const next = alignItems(items, ['a', 'b'], 'a', 'left')
    expect(next[1].x).toBeCloseTo(0.2)
  })
})
