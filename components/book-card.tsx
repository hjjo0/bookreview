'use client'

import { BookCover } from '@/components/book-cover'
import { StarRating } from '@/components/star-rating'
import { Badge } from '@/components/ui/badge'
import { type Book, STATUS_BADGE_STYLES, STATUS_LABELS } from '@/lib/books'
import { cn } from '@/lib/utils'

interface BookCardProps {
  book: Book
  onClick: (book: Book) => void
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(book)}
      onKeyDown={(e) => {
        // role="button" has to answer to Space as well as Enter, and Space must
        // not scroll the page while the card is focused.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(book)
        }
      }}
      className={cn(
        'group bg-card rounded-xl border border-border overflow-hidden cursor-pointer',
        'shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'flex flex-col',
      )}
      aria-label={`${book.title} - ${book.author}`}
    >
      {/* Cover */}
      <div className="relative bg-muted aspect-[2/3] overflow-hidden">
        <BookCover
          book={book}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          imageClassName="transition-transform duration-300 group-hover:scale-105"
          showTitle
        />

        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className={cn('text-xs font-medium border', STATUS_BADGE_STYLES[book.status])}
          >
            {STATUS_LABELS[book.status]}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-serif text-sm font-semibold text-foreground leading-snug line-clamp-2 text-balance">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        {book.rating !== null && (
          <div className="mt-auto pt-1.5">
            <StarRating value={book.rating} readonly size="sm" />
          </div>
        )}
      </div>
    </article>
  )
}
