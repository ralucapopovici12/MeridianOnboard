// A soft "painted" backdrop that sits under every page: slowly drifting colour
// washes in the brand palette plus a faint dot grid for texture. Purely
// decorative (aria-hidden, pointer-events: none) and motion is disabled under
// prefers-reduced-motion.
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient__blob ambient__blob--1" />
      <span className="ambient__blob ambient__blob--2" />
      <span className="ambient__blob ambient__blob--3" />
      <span className="ambient__grid" />
    </div>
  )
}
