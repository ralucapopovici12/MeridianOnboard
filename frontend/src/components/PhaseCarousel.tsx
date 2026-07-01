import { Rocket, BookOpen, Users, BarChart2, CheckSquare, Shield, Star, Zap } from 'lucide-react'
import type { PhaseGroup } from '../api/types'

const PHASE_ICONS = [Rocket, BookOpen, Users, BarChart2, CheckSquare, Shield, Star, Zap]
const ICON_COLORS: Array<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'> = [
  'primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'primary', 'secondary',
]

interface PhaseCarouselProps {
  groups: PhaseGroup[]
}

export function PhaseCarousel({ groups }: PhaseCarouselProps) {
  if (groups.length === 0) return null

  return (
    <div className="snap-carousel fade-in">
      {groups.map((group, i) => {
        const Icon  = PHASE_ICONS[i % PHASE_ICONS.length]
        const color = ICON_COLORS[i % ICON_COLORS.length]
        const pct   = group.total === 0 ? 0 : Math.round((100 * group.completed) / group.total)
        const done  = group.completed === group.total && group.total > 0

        return (
          <div
            key={group.phase}
            className={`phase-card anim-slide-up${done ? ' phase-card--active' : ''}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="phase-card__head">
              <div className={`icon-wrapper icon-wrapper--${color}`}>
                <Icon size={15} />
              </div>
              <div className="phase-card__meta">
                <div className="phase-card__eyebrow">Phase {String(i + 1).padStart(2, '0')}</div>
                <div className="phase-card__title">{group.label}</div>
              </div>
            </div>

            <div className="phase-card__bar">
              <div
                className={`phase-card__bar-fill${done ? ' phase-card__bar-fill--done' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="phase-card__foot">
              <span className="phase-card__pct">{pct}%</span>
              <span className="phase-card__count">{group.completed}/{group.total}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
