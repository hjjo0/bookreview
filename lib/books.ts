// ─── Types ───────────────────────────────────────────────────────────────────
// This module is imported by both server and client components, so it must stay
// free of any Supabase / server-only imports.

// A type alias rather than an interface on purpose: supabase-js constrains table
// rows to Record<string, unknown>, and only aliases get an implicit index
// signature. As an interface this silently resolves every query to `never`.
export type Book = {
  id: string
  title: string
  author: string
  cover_url: string | null
  status: 'want_to_read' | 'reading' | 'finished'
  rating: number | null // 1~5
  memo: string | null
  started_at: string | null // YYYY-MM-DD
  finished_at: string | null // YYYY-MM-DD
  created_at: string
  updated_at: string
}

export type BookStatus = Book['status']

/** The user-editable subset of a book. Server assigns the rest. */
export type BookInput = Omit<Book, 'id' | 'created_at' | 'updated_at'>

export const STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: '읽고 싶은',
  reading: '읽는 중',
  finished: '다 읽음',
}

export const BOOK_STATUSES = Object.keys(STATUS_LABELS) as BookStatus[]

/** Tailwind classes for the status badge. Shared by the card and the detail modal. */
export const STATUS_BADGE_STYLES: Record<BookStatus, string> = {
  want_to_read: 'bg-secondary text-secondary-foreground border-border',
  reading: 'bg-amber-100 text-amber-800 border-amber-200',
  finished: 'bg-green-100 text-green-800 border-green-200',
}

// ─── Result type ──────────────────────────────────────────────────────────────
// Server Actions return this instead of throwing, so the UI can render a message
// rather than tripping an error boundary on a transient network failure.

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

// ─── Validation ───────────────────────────────────────────────────────────────
// Run on the client for instant feedback and again in the Server Action, which is
// the boundary that actually has to hold.

export type BookErrors = Partial<Record<keyof BookInput, string>>

export function validateBookInput(input: BookInput): BookErrors {
  const errors: BookErrors = {}

  if (!input.title.trim()) errors.title = '제목을 입력해주세요'
  if (!input.author.trim()) errors.author = '저자를 입력해주세요'

  if (input.cover_url && !/^https?:\/\/.+/i.test(input.cover_url)) {
    errors.cover_url = 'http:// 또는 https:// 로 시작하는 주소를 입력해주세요'
  }

  if (input.rating !== null && (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)) {
    errors.rating = '별점은 1~5 사이여야 합니다'
  }

  if (input.started_at && input.finished_at && input.finished_at < input.started_at) {
    errors.finished_at = '완료일은 시작일보다 빠를 수 없습니다'
  }

  if (input.status !== 'finished' && input.finished_at) {
    errors.finished_at = '완료일은 "다 읽음" 상태에서만 기록할 수 있습니다'
  }

  return errors
}

export function hasErrors(errors: BookErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Today as YYYY-MM-DD in the user's local timezone (not UTC). */
export function today(): string {
  const now = new Date()
  const offsetMs = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
}

/**
 * Format a YYYY-MM-DD date for display.
 *
 * new Date('2024-10-01') parses as UTC midnight, which formats as the *previous*
 * day for any viewer west of UTC — 2024년 9월 30일 in Los Angeles. These are
 * calendar dates with no time or zone attached, so build them as local dates and
 * let them mean the same day everywhere.
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'

  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return '—'

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
