import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MousePointer2, X } from 'lucide-react'

export interface TourStep {
  /** data-tour id to spotlight. Omit for a centered, target-less step (intro/outro). */
  target?: string
  title: string
  body: string
  /** Show a pulsing "tap here" cursor over the target to hint an interaction. */
  hint?: boolean
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function rectOf(id: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${id}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function pad(r: Rect, p = 8): Rect {
  return {
    top: Math.round(r.top - p),
    left: Math.round(r.left - p),
    width: Math.round(r.width + p * 2),
    height: Math.round(r.height + p * 2),
  }
}

/**
 * A generic first-visit walkthrough: spotlights a sequence of elements (marked with
 * `data-tour="…"`) and explains each in a popover. Parent owns open/close state.
 */
export function GuidedTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [spot, setSpot] = useState<Rect | null>(null)
  const spotKeyRef = useRef('')

  const step = steps[i]
  const last = i === steps.length - 1

  // Bring the target into view when the step changes.
  useEffect(() => {
    if (!step.target) return
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [i, step])

  // Keep the spotlight glued to its target every frame (handles smooth-scroll + resize).
  useEffect(() => {
    let raf = 0
    const tick = () => {
      let next: Rect | null = null
      if (step.target) {
        const r = rectOf(step.target)
        if (r) next = pad(r)
      }
      const key = next ? `${next.top},${next.left},${next.width},${next.height}` : ''
      if (key !== spotKeyRef.current) {
        spotKeyRef.current = key
        setSpot(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step])

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, steps.length - 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  // Popover placement: centered for target-less steps, otherwise tucked beside the spotlight.
  const POP_W = 300
  const POP_H = 188
  let popStyle: React.CSSProperties
  if (!spot) {
    popStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: POP_W }
  } else {
    const below = spot.top + spot.height + 14
    const placeBelow = below + POP_H < window.innerHeight
    const top = placeBelow ? below : Math.max(14, spot.top - POP_H - 14)
    let left = spot.left + spot.width / 2 - POP_W / 2
    left = Math.max(14, Math.min(left, window.innerWidth - POP_W - 14))
    popStyle = { left, top, width: POP_W }
  }

  const cursor =
    step.hint && spot
      ? { left: spot.left + spot.width / 2, top: spot.top + spot.height - 10 }
      : null

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Page walkthrough">
      {spot ? (
        <>
          <div className="tour__catch" onClick={(e) => e.stopPropagation()} />
          <div
            className="tour__spot"
            style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          />
        </>
      ) : (
        <div className="tour__catch tour__catch--dim" onClick={(e) => e.stopPropagation()} />
      )}

      {cursor && (
        <MousePointer2
          className="tour__cursor"
          size={22}
          fill="currentColor"
          style={{ left: cursor.left, top: cursor.top }}
        />
      )}

      <div className="tour__pop" style={popStyle}>
        <button className="tour__close" aria-label="Close tour" onClick={onClose}>
          <X size={15} />
        </button>

        <div className="tour__pop-step">
          Step {i + 1} of {steps.length}
        </div>
        <div className="tour__pop-title">{step.title}</div>
        <div className="tour__pop-body">{step.body}</div>

        <div className="tour__pop-foot">
          <div className="tour__dots">
            {steps.map((_, n) => (
              <span key={n} className={`tour__dot${n === i ? ' tour__dot--on' : ''}`} />
            ))}
          </div>

          <div className="tour__btns">
            {i > 0 && (
              <button className="tour__btn" onClick={() => setI((n) => n - 1)}>
                <ChevronLeft size={14} />
                Back
              </button>
            )}
            <button
              className="tour__btn tour__btn--primary"
              onClick={() => (last ? onClose() : setI((n) => n + 1))}
            >
              {last ? 'Got it' : 'Next'}
              {!last && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {!last && (
          <button className="tour__skip" onClick={onClose} style={{ marginTop: 8 }}>
            Skip tour
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Open/close state for a first-visit tour, remembering (per key) that it's been seen.
 * Call `autoStartIfNew()` once the page's data + tour targets are on screen.
 */
export function useGuidedTour(storageKey: string | null) {
  const [open, setOpen] = useState(false)

  const start = useCallback(() => setOpen(true), [])

  const close = useCallback(() => {
    if (storageKey) localStorage.setItem(storageKey, '1')
    setOpen(false)
  }, [storageKey])

  const autoStartIfNew = useCallback(() => {
    if (storageKey && !localStorage.getItem(storageKey)) setOpen(true)
  }, [storageKey])

  return { open, start, close, autoStartIfNew }
}
