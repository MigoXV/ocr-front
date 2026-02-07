import type { GuideLine } from '../../../shared/types/canvas'

export function GuidesOverlay({ guides }: { guides: GuideLine[] }) {
  return (
    <>
      {guides.map((guide, index) =>
        guide.axis === 'x' ? (
          <div key={`x-${index}`} className="ed-guide-x" style={{ left: `${guide.value * 100}%` }} />
        ) : (
          <div key={`y-${index}`} className="ed-guide-y" style={{ top: `${guide.value * 100}%` }} />
        ),
      )}
    </>
  )
}
