import type { Snapshot } from '../../../shared/types/canvas'

export function pushSnapshot(past: Snapshot[], snapshot: Snapshot) {
  return [...past, snapshot]
}
