import { useState } from 'react'
import { BookOpen, Check, PlayCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TRAINING, type TrainingItem, useTrainingProgress } from '../lib/training'
import { TrainingModal } from './TrainingModal'

export function TrainingSection({ employeeId }: { employeeId: number }) {
  const { done, complete, toggle } = useTrainingProgress(employeeId)
  const [active, setActive] = useState<TrainingItem | null>(null)

  const total = TRAINING.length
  const completed = TRAINING.filter((t) => done.has(t.id)).length
  const allDone = completed === total

  return (
    <div className="task-section anim-slide-up" data-tour="ob-training" style={{ marginBottom: 32 }}>
      <div className="task-section__label">
        <span>
          <ShieldCheck size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
          Required training
        </span>
        <span
          style={{
            textTransform: 'none',
            letterSpacing: 0,
            fontSize: 11,
            fontWeight: 600,
            color: allDone ? 'var(--ok)' : 'var(--warn)',
          }}
        >
          {allDone ? 'All complete' : `${completed} of ${total} complete`}
        </span>
      </div>

      <div className="training-list">
        {TRAINING.map((item) => {
          const isDone = done.has(item.id)
          const isVideo = item.type === 'video'
          return (
            <div key={item.id} className={`training-card${isDone ? ' training-card--done' : ''}`}>
              <button
                type="button"
                className="training-card__media"
                onClick={() => isVideo && setActive(item)}
                aria-label={isVideo ? `Watch ${item.title}` : undefined}
                {...(!isVideo ? { tabIndex: -1 } : {})}
              >
                {isVideo ? <PlayCircle size={22} /> : <BookOpen size={20} />}
                <span className="training-card__dur">{item.minutes} min</span>
              </button>

              <div className="training-card__body">
                <div className="training-card__title-row">
                  <span className="training-card__title">{item.title}</span>
                  {item.mandatory && <span className="training-card__req">Required</span>}
                </div>
                <p className="training-card__desc">{item.description}</p>
                <div className="training-card__actions">
                  {isVideo ? (
                    <button
                      type="button"
                      className="training-card__link"
                      onClick={() => setActive(item)}
                    >
                      {isDone ? 'Watch again' : 'Watch now'}
                    </button>
                  ) : (
                    <Link
                      to={`/resources/${item.docId}`}
                      className="training-card__link"
                      onClick={() => complete(item.id)}
                    >
                      {isDone ? 'Read again' : 'Read & acknowledge'}
                    </Link>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={`training-card__check${isDone ? ' training-card__check--on' : ''}`}
                onClick={() => toggle(item.id)}
                aria-pressed={isDone}
                title={isDone ? 'Mark as not done' : 'Mark as done'}
              >
                {isDone && <Check size={13} strokeWidth={3} />}
              </button>
            </div>
          )
        })}
      </div>

      {active && (
        <TrainingModal
          item={active}
          alreadyDone={done.has(active.id)}
          onComplete={() => complete(active.id)}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}
