import { avatarColor, initials } from '../lib/format'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${avatarColor(name)} ${SIZES[size]}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
