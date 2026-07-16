'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { type Book } from '@/lib/books'
import { cn } from '@/lib/utils'

interface BookCoverProps {
  book: Pick<Book, 'title' | 'cover_url'>
  sizes: string
  /** Size of the placeholder book icon, e.g. "w-10 h-10". */
  iconClassName?: string
  /** Show the title under the placeholder icon when there is no cover. */
  showTitle?: boolean
  imageClassName?: string
}

/**
 * Book cover with a placeholder fallback. cover_url is free-form user input, so a
 * dead link is expected rather than exceptional — falling back keeps a broken
 * image icon off the shelf.
 */
export function BookCover({
  book,
  sizes,
  iconClassName = 'w-10 h-10',
  showTitle = false,
  imageClassName,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false)

  // A new URL deserves a fresh attempt; without this, editing a broken cover into
  // a working one would keep showing the placeholder.
  useEffect(() => {
    setFailed(false)
  }, [book.cover_url])

  if (book.cover_url && !failed) {
    return (
      <Image
        src={book.cover_url}
        alt={`${book.title} 표지`}
        fill
        sizes={sizes}
        className={cn('object-cover', imageClassName)}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn('text-muted-foreground/50', iconClassName)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      {showTitle && (
        <span className="text-xs text-muted-foreground text-center font-sans leading-relaxed line-clamp-3">
          {book.title}
        </span>
      )}
    </div>
  )
}
