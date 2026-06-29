import { useEffect, useRef, useState } from 'react'
import { Check, Pause, Play, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TrainingItem } from '../lib/training'

// A self-contained mock video player. There's no real media yet, so "playback"
// is simulated — but it enforces the spirit of a mandatory video: you can only
// mark it watched once it has played through.
const SIM_SECONDS = 6

export function TrainingModal({
  item,
  alreadyDone,
  onComplete,
  onClose,
}: {
  item: TrainingItem
  alreadyDone: boolean
  onComplete: () => void
  onClose: () => void
}) {
  const [pct, setPct] = useState(alreadyDone ? 100 : 0)
  const [playing, setPlaying] = useState(false)
  const [watched, setWatched] = useState(alreadyDone)
  const timer = useRef<number | null>(null)

  // Advance the simulated playhead while "playing".
  useEffect(() => {
    if (!playing) return
    const step = 100 / (SIM_SECONDS * 10) // tick every 100ms
    timer.current = window.setInterval(() => {
      setPct((p) => {
        const next = p + step
        if (next >= 100) {
          setPlaying(false)
          setWatched(true)
          return 100
        }
        return next
      })
    }, 100)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [playing])

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const elapsed = Math.round((pct / 100) * item.minutes * 60)
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="tplayer-overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="tplayer-card fade-up" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="tplayer-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className="tplayer-screen">
          <button
            type="button"
            className="tplayer-play"
            onClick={() => pct < 100 && setPlaying((v) => !v)}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {watched && pct >= 100 ? <Check size={26} /> : playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <span className="tplayer-screen__title">{item.title}</span>
          <span className="tplayer-screen__badge">Required training · {item.minutes} min</span>
        </div>

        <div className="tplayer-bar">
          <span className="tplayer-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="tplayer-time">
          <span>{mm}:{ss}</span>
          <span>{String(item.minutes).padStart(2, '0')}:00</span>
        </div>

        <p className="tplayer-desc">{item.description}</p>

        <div className="tplayer-actions">
          {item.docId && (
            <Link to={`/resources/${item.docId}`} className="btn-ghost" onClick={onClose}>
              Read the notes
            </Link>
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={!watched}
            onClick={() => {
              onComplete()
              onClose()
            }}
            title={watched ? '' : 'Watch the video to the end first'}
          >
            <Check size={15} />
            {watched ? 'Mark as watched' : 'Watch to the end'}
          </button>
        </div>
      </div>
    </div>
  )
}
