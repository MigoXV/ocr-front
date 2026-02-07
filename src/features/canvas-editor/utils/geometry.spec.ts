import { describe, expect, it } from 'vitest'
import { getSelectionRect, intersects } from './geometry'

describe('geometry', () => {
  it('normal intersect works', () => {
    expect(intersects({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.5, y: 0.5, w: 1, h: 1 })).toBe(true)
    expect(intersects({ x: 0, y: 0, w: 1, h: 1 }, { x: 1.1, y: 1.1, w: 1, h: 1 })).toBe(false)
  })

  it('computes selection rect', () => {
    const rect = getSelectionRect(
      [
        { id: 'a', type: 'text', x: 0.1, y: 0.2, w: 0.3, h: 0.4, rotation: 0, opacity: 1, zIndex: 1, locked: false },
        { id: 'b', type: 'text', x: 0.6, y: 0.1, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 2, locked: false },
      ],
      ['a', 'b'],
    )
    expect(rect?.x).toBeCloseTo(0.1)
    expect(rect?.y).toBeCloseTo(0.1)
    expect(rect?.w).toBeCloseTo(0.7)
    expect(rect?.h).toBeCloseTo(0.5)
  })
})
