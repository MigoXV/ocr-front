import { describe, expect, it } from 'vitest'
import { applyMove } from './move'
import type { CanvasItem } from '../../../shared/types/canvas'

describe('move command', () => {
  it('moves selected items', () => {
    const items: CanvasItem[] = [
      { id: 'a', type: 'text', x: 0.1, y: 0.2, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 1, locked: false },
      { id: 'b', type: 'text', x: 0.4, y: 0.3, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 2, locked: false },
    ]
    const next = applyMove(items, ['a'], 0.1, -0.1)
    expect(next[0].x).toBeCloseTo(0.2)
    expect(next[0].y).toBeCloseTo(0.1)
    expect(next[1].x).toBeCloseTo(0.4)
  })
})
