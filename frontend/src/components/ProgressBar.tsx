interface ProgressBarProps {
  percent: number
  className?: string
}

/** Colour shifts from amber to emerald as a new hire nears completion. */
function barColor(percent: number): string {
  if (percent >= 100) return 'bg-emerald-500'
  if (percent >= 60) return 'bg-teal-500'
  if (percent >= 30) return 'bg-amber-500'
  return 'bg-rose-400'
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`h-2 w-full rounded-full bg-slate-200 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${barColor(percent)}`}
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
