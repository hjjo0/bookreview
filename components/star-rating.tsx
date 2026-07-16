'use client'

import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | null
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
} as const

function Star({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(className, filled ? 'text-star' : 'text-star-empty')}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const sizeClass = SIZE_CLASSES[size]

  // A read-only rating is a value, not a control. As disabled buttons it was
  // announced as five separate unavailable controls; one img role reads it as
  // the single fact it is.
  if (readonly) {
    return (
      <div
        className={cn('flex items-center gap-0.5', className)}
        role="img"
        aria-label={value === null ? '별점 없음' : `5점 만점에 ${value}점`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} filled={value !== null && star <= value} className={sizeClass} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)} role="group" aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`${star}점`}
            aria-pressed={filled}
            className="transition-transform hover:scale-110 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star filled={filled} className={sizeClass} />
          </button>
        )
      })}
    </div>
  )
}
