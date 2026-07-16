'use client'

import { useEffect, useState } from 'react'

import { BookCover } from '@/components/book-cover'
import { StarRating } from '@/components/star-rating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Book, STATUS_BADGE_STYLES, STATUS_LABELS } from '@/lib/books'

interface BookDetailModalProps {
  book: Book | null
  open: boolean
  deleting?: boolean
  onClose: () => void
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BookDetailModal({
  book,
  open,
  deleting = false,
  onClose,
  onEdit,
  onDelete,
}: BookDetailModalProps) {
  // The confirmation lives inside the dialog. A previous version rendered it as a
  // page-level toast, where the dialog's backdrop (fixed inset-0, same z-50, but
  // portaled later in the DOM) covered it and swallowed the click.
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!open) setConfirmingDelete(false)
  }, [open])

  if (!book) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Cover panel */}
          <div className="sm:w-48 flex-shrink-0 bg-muted relative min-h-[200px] sm:min-h-full rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none overflow-hidden">
            <BookCover book={book} sizes="(max-width: 640px) 100vw, 192px" iconClassName="w-14 h-14" />
          </div>

          {/* Content panel */}
          <div className="flex flex-col gap-4 p-6 flex-1">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle className="font-serif text-xl leading-snug text-foreground text-balance pr-2">
                  {book.title}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-xs shrink-0 border ${STATUS_BADGE_STYLES[book.status]}`}
                >
                  {STATUS_LABELS[book.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </DialogHeader>

            {/* Rating */}
            {book.rating !== null && <StarRating value={book.rating} readonly size="md" />}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  시작일
                </span>
                <span className="text-foreground">{formatDate(book.started_at)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  완료일
                </span>
                <span className="text-foreground">{formatDate(book.finished_at)}</span>
              </div>
            </div>

            {/* Memo */}
            {book.memo && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  메모 / 감상
                </h4>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted rounded-lg p-3">
                  {book.memo}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-2">
              {confirmingDelete ? (
                <div
                  role="alert"
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
                >
                  <span className="text-sm text-foreground flex-1">
                    「{book.title}」을(를) 삭제할까요? 되돌릴 수 없습니다.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleting}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    disabled={deleting}
                    onClick={() => onDelete(book)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleting ? '삭제 중...' : '삭제'}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(book)}
                    className="flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                    삭제
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
