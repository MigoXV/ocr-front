import { describe, expect, it } from 'vitest'
import { applyRotate } from './rotate'
import type { CanvasItem } from '../../../shared/types/canvas'

describe('rotate command', () => {
  it('updates rotation value', () => {
    const items: CanvasItem[] = [
      { id: 'a', type: 'text', x: 0.1, y: 0.1, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 1, locked: false },
    ]
    const rect = { width: 1000, height: 1000 } as DOMRect
    const next = applyRotate(items, ['a'], { x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, Math.PI / 2, rect)
    expect(next[0].rotation).toBeCloseTo(90)
  })
})
