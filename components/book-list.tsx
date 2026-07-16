'use client'

import { BookCard } from '@/components/book-card'
import { type Book } from '@/lib/books'

interface BookListProps {
  books: Book[]
  onBookClick: (book: Book) => void
  /** Distinguishes "no matches" from "nothing here yet". */
  hasQuery?: boolean
}

export function BookList({ books, onBookClick, hasQuery = false }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="w-14 h-14 opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-sm">
          {hasQuery ? '검색 결과가 없습니다' : '아직 기록한 책이 없습니다'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={onBookClick} />
      ))}
    </div>
  )
}
