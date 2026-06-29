interface ProgressBarProps {
  percent: number
  className?: string
}

function fillClass(pct: number): string {
  if (pct >= 100) return 'prog-fill prog-fill--ok'
  if (pct >= 60)  return 'prog-fill prog-fill--gradient'
  if (pct >= 30)  return 'prog-fill prog-fill--warn'
  return 'prog-fill prog-fill--err'
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  return (
    <div className={`prog-track${className ? ` ${className}` : ''}`}>
      <div
        className={fillClass(percent)}
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
