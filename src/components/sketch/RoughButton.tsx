import type { ButtonHTMLAttributes } from 'react'
import { RoughBox } from './RoughBox'

interface RoughButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline'
}

// A button drawn as a rough rectangle instead of styled with CSS borders.
// The rectangle redraws itself with a new seed on hover, so the shape
// visibly "resketches" rather than just changing color.
export function RoughButton({ variant = 'outline', className = '', children, ...rest }: RoughButtonProps) {
  return (
    <button
      className={`group cursor-pointer bg-transparent p-0 ${className}`}
      {...rest}
    >
      <RoughBox
        redrawOnHover
        fill={variant === 'solid' ? '#111111' : undefined}
        fillStyle="solid"
        className="px-6 py-3"
      >
        <span
          className={`font-hand text-lg tracking-wide ${
            variant === 'solid' ? 'text-white' : 'text-ink'
          }`}
        >
          {children}
        </span>
      </RoughBox>
    </button>
  )
}
