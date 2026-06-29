import { useEffect, useState } from 'react'
import { initials } from '../lib/format'

interface AvatarProps {
  name: string
  /** Portrait photo URL. Falls back to initials if missing or it fails to load. */
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

// A person's photo (same face everywhere, keyed by email on the backend),
// with a neutral initials fallback so the UI never breaks on a missing image.
export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  const base = `avatar inline-flex items-center justify-center rounded-full font-semibold shrink-0 overflow-hidden ${SIZES[size]}`

  if (src && !failed) {
    return (
      <img
        className={base}
        src={src}
        alt={name}
        title={name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <span className={base} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
