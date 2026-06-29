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

        const fillStyle: React.CSSProperties = {
          height: '100%',
          borderRadius: 9999,
          width: `${pct}%`,
          background: done
            ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
            : 'linear-gradient(90deg, #6B3FFF, #9B7FFF)',
          transition: 'width 0.6s var(--ease)',
        }

        return (
          <div
            key={group.phase}
            className={`phase-card anim-slide-up${done ? ' phase-card--active' : ''}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className={`icon-wrapper icon-wrapper--${color}`}>
                <Icon size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', marginBottom: 1 }}>
                  Phase {i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {group.label}
                </div>
              </div>
            </div>

            <div style={{ height: 3, borderRadius: 9999, background: 'rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 8 }}>
              <div style={fillStyle} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 600 }}>{pct}%</span>
              <span style={{ color: 'var(--text-subtle)' }}>{group.completed}/{group.total} tasks</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
