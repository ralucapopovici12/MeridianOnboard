import {
  Rocket, BookOpen, Users, BarChart2,
  CheckSquare, Shield, Star, Zap,
} from 'lucide-react'
import type { PhaseGroup } from '../api/types'

const PHASE_ICONS = [Rocket, BookOpen, Users, BarChart2, CheckSquare, Shield, Star, Zap]
const PHASE_COLORS: Array<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'> = [
  'primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'primary', 'secondary',
]

interface PhaseCarouselProps {
  groups: PhaseGroup[]
}

export function PhaseCarousel({ groups }: PhaseCarouselProps) {
  if (groups.length === 0) return null

  return (
    <div className="snap-carousel anim-fade-in">
      {groups.map((group, i) => {
        const Icon    = PHASE_ICONS[i % PHASE_ICONS.length]
        const color   = PHASE_COLORS[i % PHASE_COLORS.length]
        const pct     = group.total === 0 ? 0 : Math.round((100 * group.completed) / group.total)
        const done    = group.completed === group.total && group.total > 0

        return (
          <div
            key={group.phase}
            className={`phase-card anim-slide-up${done ? ' phase-card--active' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
              <div className={`icon-wrapper icon-wrapper--${color}`}>
                <Icon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--fg-subtle)',
                  marginBottom: '0.1rem',
                }}>
                  Phase {i + 1}
                </div>
                <div style={{
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 600,
                  color: 'var(--fg-base)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {group.label}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-muted)',
              overflow: 'hidden',
              marginBottom: 'var(--sp-2)',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 'var(--radius-full)',
                width: `${pct}%`,
                background: done
                  ? 'var(--color-success)'
                  : `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
                transition: 'width 0.6s var(--ease-out)',
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--fs-xs)',
              color: 'var(--fg-muted)',
            }}>
              <span>{pct}% complete</span>
              <span>{group.completed}/{group.total} tasks</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
