import { describe, expect, it } from 'vitest'
import { applyResize } from './resize'
import type { CanvasItem } from '../../../shared/types/canvas'

describe('resize command', () => {
  it('resizes using se handle', () => {
    const items: CanvasItem[] = [
      { id: 'a', type: 'text', x: 0.1, y: 0.1, w: 0.2, h: 0.2, rotation: 0, opacity: 1, zIndex: 1, locked: false },
    ]
    const rect = { width: 1000, height: 1000 } as DOMRect
    const next = applyResize(items, ['a'], { x: 0.1, y: 0.1, w: 0.2, h: 0.2 }, 'se', 0.1, 0.1, false, rect)
    expect(next[0].w).toBeGreaterThan(0.2)
    expect(next[0].h).toBeGreaterThan(0.2)
  })
})
