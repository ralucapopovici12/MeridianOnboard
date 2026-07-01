import type { CSSProperties, HTMLAttributes, SVGProps } from 'react'

/**
 * MeridianOnboard — brand logo system (SAGE CALM)
 * Concept: stacked modules (modular ERP)
 * Palette + font aligned to the Sage Calm design system (Outfit, forest-sage).
 *
 * Exports:
 *   <LogoMark />  -> just the icon (square, perfect for app icon / avatar)
 *   <Logo />      -> full lockup (mark + wordmark) for headers, sidebars
 *   brand         -> the color tokens
 */

/* ------------------------------------------------------------------ */
/*  Brand tokens (sage)                                                */
/* ------------------------------------------------------------------ */
export const brand = {
  deep: '#3A5C45', // deepest – foundation bar
  primary: '#4F7C5A', // accent – middle bar, links, buttons
  mid: '#638E6D',
  light: '#7DA886', // accent-bright – top bar
  pale: '#A8C4AD', // subtle accents, hovers
  ink: '#283426', // wordmark text (design-system --text)
} as const

export type LogoTone = 'color' | 'mono' | 'inverse'

/* ------------------------------------------------------------------ */
/*  LogoMark — the icon only                                          */
/* ------------------------------------------------------------------ */
export interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, 'title'> {
  /** height & width in px */
  size?: number
  /**
   * color   -> three sage shades
   * mono    -> uses currentColor (inherits text color), good on any bg
   * inverse -> solid white, for use on a colored/dark background
   */
  tone?: LogoTone
  /** accessible label */
  title?: string
}

export function LogoMark({
  size = 32,
  tone = 'color',
  title = 'MeridianOnboard',
  ...rest
}: LogoMarkProps) {
  const fills =
    tone === 'color'
      ? [brand.light, brand.primary, brand.deep]
      : tone === 'inverse'
        ? ['#FFFFFF', '#FFFFFF', '#FFFFFF']
        : ['currentColor', 'currentColor', 'currentColor']

  // stepped opacity gives depth when all bars share one color
  const op = tone === 'color' ? [1, 1, 1] : [0.55, 1, 0.78]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title || undefined}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <rect x="8.5" y="5.5" width="15" height="5" rx="1.6" fill={fills[0]} opacity={op[0]} />
      <rect x="4" y="13.5" width="24" height="5" rx="1.6" fill={fills[1]} opacity={op[1]} />
      <rect x="9.5" y="21.5" width="13" height="5" rx="1.6" fill={fills[2]} opacity={op[2]} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Logo — full lockup (mark + wordmark)                              */
/* ------------------------------------------------------------------ */
export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** icon height in px; text scales with it */
  size?: number
  tone?: LogoTone
  /** set false to render mark only */
  showWordmark?: boolean
  style?: CSSProperties
}

export function Logo({
  size = 28,
  tone = 'color',
  showWordmark = true,
  className,
  style,
  ...rest
}: LogoProps) {
  const textColor =
    tone === 'inverse' ? '#FFFFFF' : tone === 'mono' ? 'currentColor' : brand.ink
  const accentColor =
    tone === 'inverse' ? '#FFFFFF' : tone === 'mono' ? 'currentColor' : brand.primary

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.34,
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      <LogoMark size={size} tone={tone} title="" />
      {showWordmark && (
        <span
          style={{
            fontFamily:
              "Outfit, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            fontSize: size * 0.72,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: textColor,
            whiteSpace: 'nowrap',
          }}
        >
          Meridian
          <span style={{ color: accentColor }}>Onboard</span>
        </span>
      )}
    </span>
  )
}

export default Logo
