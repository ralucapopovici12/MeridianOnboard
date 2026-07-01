import { type RefObject, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MousePointer2, X } from 'lucide-react'

type Step =
  | { kind: 'intro'; title: string; body: string }
  | { kind: 'column'; col: string; title: string; body: string }
  | { kind: 'move'; from: string; to: string; title: string; body: string }
  | { kind: 'done'; title: string; body: string }

const STEPS: Step[] = [
  {
    kind: 'intro',
    title: 'Welcome to your board 👋',
    body: "This is where your work lives. Here's a quick 20-second tour of how it flows.",
  },
  {
    kind: 'column',
    col: 'Backlog',
    title: 'Backlog',
    body: 'Everything that might get picked up later waits here — nothing urgent.',
  },
  {
    kind: 'column',
    col: 'Todo',
    title: 'To Do',
    body: 'Tickets you’ll start next. You’ve got two waiting here to begin with.',
  },
  {
    kind: 'column',
    col: 'InProgress',
    title: 'In Progress',
    body: 'What you’re actively working on right now. Keep this short and focused.',
  },
  {
    kind: 'column',
    col: 'InReview',
    title: 'In Review',
    body: 'Finished by you, waiting on a teammate to review it.',
  },
  {
    kind: 'column',
    col: 'Done',
    title: 'Done',
    body: 'Completed work. The satisfying column. 🎉',
  },
  {
    kind: 'move',
    from: 'Todo',
    to: 'InProgress',
    title: 'Moving a ticket',
    body: 'Drag a card to the next column — or use the ◀ ▶ arrows on it. Watch how a To Do moves into In Progress:',
  },
  {
    kind: 'done',
    title: 'You’re all set!',
    body: 'Pick up one of your To Do tickets and move it to In Progress when you start. Have a great first day!',
  },
]

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface View {
  centered: boolean
  spot?: Rect
  ghost?: { top: number; left: number; width: number; dx: number }
}

function rectIn(board: HTMLElement, status: string): Rect | null {
  const el = board.querySelector<HTMLElement>(`[data-tour-col="${status}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/** Smallest rect containing both. */
function union(a: Rect, b: Rect): Rect {
  const left = Math.min(a.left, b.left)
  const top = Math.min(a.top, b.top)
  const right = Math.max(a.left + a.width, b.left + b.width)
  const bottom = Math.max(a.top + a.height, b.top + b.height)
  return { left, top, width: right - left, height: bottom - top }
}

/** Pad and round a rect so the spotlight has a little breathing room (and no sub-pixel jitter). */
function pad(r: Rect, p = 6): Rect {
  return {
    top: Math.round(r.top - p),
    left: Math.round(r.left - p),
    width: Math.round(r.width + p * 2),
    height: Math.round(r.height + p * 2),
  }
}

function viewKey(v: View): string {
  return JSON.stringify(v)
}

export function BoardTour({
  boardRef,
  moveSampleTitle,
  onClose,
}: {
  boardRef: RefObject<HTMLDivElement | null>
  moveSampleTitle: string
  onClose: () => void
}) {
  const [i, setI] = useState(0)
  const [view, setView] = useState<View>({ centered: true })
  const viewKeyRef = useRef('')

  const step = STEPS[i]
  const last = i === STEPS.length - 1

  // Bring the focused column into view when the step changes.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const target =
      step.kind === 'column' ? step.col : step.kind === 'move' ? step.from : null
    if (!target) return
    const el = board.querySelector<HTMLElement>(`[data-tour-col="${target}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [i, step, boardRef])

  // Keep the spotlight glued to its target every frame (handles smooth-scroll + resize).
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const board = boardRef.current
      let next: View = { centered: true }

      if (board && step.kind === 'column') {
        const r = rectIn(board, step.col)
        if (r) next = { centered: false, spot: pad(r) }
      } else if (board && step.kind === 'move') {
        const f = rectIn(board, step.from)
        const t = rectIn(board, step.to)
        if (f && t) {
          next = {
            centered: false,
            spot: pad(union(f, t)),
            ghost: {
              top: Math.round(f.top + 48),
              left: Math.round(f.left + 10),
              width: Math.round(f.width - 20),
              dx: Math.round(t.left - f.left),
            },
          }
        }
      }

      const key = viewKey(next)
      if (key !== viewKeyRef.current) {
        viewKeyRef.current = key
        setView(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step, boardRef])

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, STEPS.length - 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const spot = view.centered ? undefined : view.spot

  // Position the popover: centered for intro/done, otherwise tucked beside the spotlight.
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

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Board walkthrough">
      {/* Click-blocker + dimming */}
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

      {/* Animated demo card for the "move" step */}
      {view.ghost && (
        <div
          className="tour__ghost"
          style={
            {
              top: view.ghost.top,
              left: view.ghost.left,
              width: view.ghost.width,
              ['--tour-dx' as string]: `${view.ghost.dx}px`,
            } as React.CSSProperties
          }
        >
          {moveSampleTitle}
          <MousePointer2 className="tour__ghost-cursor" size={16} fill="currentColor" />
        </div>
      )}

      {/* Popover */}
      <div className="tour__pop" style={popStyle}>
        <button className="tour__close" aria-label="Close tour" onClick={onClose}>
          <X size={15} />
        </button>

        <div className="tour__pop-step">
          Step {i + 1} of {STEPS.length}
        </div>
        <div className="tour__pop-title">{step.title}</div>
        <div className="tour__pop-body">{step.body}</div>

        <div className="tour__pop-foot">
          <div className="tour__dots">
            {STEPS.map((_, n) => (
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
