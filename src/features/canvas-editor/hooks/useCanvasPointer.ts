import { useEffect } from 'react'
import type { InteractionState } from '../../../shared/types/canvas'

export function useCanvasPointer({
  interaction,
  onPointerMove,
  onPointerUp,
}: {
  interaction: InteractionState | null
  onPointerMove: (event: PointerEvent, interaction: InteractionState) => void
  onPointerUp: (interaction: InteractionState) => void
}) {
  useEffect(() => {
    if (!interaction) return

    const handleMove = (event: PointerEvent) => onPointerMove(event, interaction)
    const handleUp = () => onPointerUp(interaction)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [interaction, onPointerMove, onPointerUp])
}
