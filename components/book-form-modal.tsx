'use client'

import { useEffect, useState } from 'react'

import { StarRating } from '@/components/star-rating'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BOOK_STATUSES,
  type Book,
  type BookErrors,
  type BookInput,
  type BookStatus,
  STATUS_LABELS,
  hasErrors,
  today,
  validateBookInput,
} from '@/lib/books'
import { cn } from '@/lib/utils'

interface BookFormData {
  title: string
  author: string
  cover_url: string
  status: BookStatus
  rating: number | null
  memo: string
  started_at: string
  finished_at: string
}

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  /** Resolves to an error message, or null on success. */
  onSubmit: (data: BookInput) => Promise<string | null>
  initialData?: Book | null
}

const DEFAULT_FORM: BookFormData = {
  title: '',
  author: '',
  cover_url: '',
  status: 'want_to_read',
  rating: null,
  memo: '',
  started_at: '',
  finished_at: '',
}

function toFormData(book: Book): BookFormData {
  return {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url ?? '',
    status: book.status,
    rating: book.rating,
    memo: book.memo ?? '',
    started_at: book.started_at ?? '',
    finished_at: book.finished_at ?? '',
  }
}

function toBookInput(form: BookFormData): BookInput {
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    cover_url: form.cover_url.trim() || null,
    status: form.status,
    rating: form.rating,
    memo: form.memo.trim() || null,
    started_at: form.started_at || null,
    finished_at: form.finished_at || null,
  }
}

function LabelText({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground flex items-center gap-1">
      {children}
      {required && (
        <span className="text-destructive text-xs" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

export function BookFormModal({ open, onClose, onSubmit, initialData }: BookFormModalProps) {
  const [form, setForm] = useState<BookFormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<BookErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEditing = !!initialData

  useEffect(() => {
    if (open) {
      setForm(initialData ? toFormData(initialData) : DEFAULT_FORM)
      setErrors({})
      setSubmitError(null)
    }
  }, [open, initialData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const input = toBookInput(form)
    const nextErrors = validateBookInput(input)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setLoading(true)
    setSubmitError(null)
    try {
      const error = await onSubmit(input)
      if (error) {
        // Keep the dialog open so the user's typing survives a failed save.
        setSubmitError(error)
        return
      }
      onClose()
    } catch {
      setSubmitError('저장에 실패했습니다. 네트워크 상태를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  function setField<K extends keyof BookFormData>(key: K, value: BookFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  /**
   * Keep dates in step with status so the two can't contradict each other:
   * reaching "다 읽음" stamps today, and leaving it clears the completion date
   * (which the schema rejects for non-finished books anyway).
   */
  function handleStatusChange(status: BookStatus) {
    setForm((prev) => {
      const next = { ...prev, status }

      if (status === 'reading' && !prev.started_at) {
        next.started_at = today()
      }
      if (status === 'finished') {
        if (!prev.started_at) next.started_at = today()
        if (!prev.finished_at) next.finished_at = today()
      } else {
        next.finished_at = ''
      }
      return next
    })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* sm:max-w-lg overrides the base dialog's sm:max-w-sm — see book-detail-modal. */}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            {isEditing ? '책 수정' : '책 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 py-2">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <LabelText htmlFor="book-title" required>
                제목
              </LabelText>
              <Input
                id="book-title"
                placeholder="책 제목"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                aria-invalid={!!errors.title}
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <LabelText htmlFor="book-author" required>
                저자
              </LabelText>
              <Input
                id="book-author"
                placeholder="저자명"
                value={form.author}
                onChange={(e) => setField('author', e.target.value)}
                aria-invalid={!!errors.author}
                className={cn(errors.author && 'border-destructive')}
              />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>

            {/* Cover URL */}
            <div className="flex flex-col gap-1.5">
              <LabelText htmlFor="book-cover">표지 이미지 URL</LabelText>
              <Input
                id="book-cover"
                placeholder="https://..."
                value={form.cover_url}
                onChange={(e) => setField('cover_url', e.target.value)}
                type="url"
                inputMode="url"
                aria-invalid={!!errors.cover_url}
                className={cn(errors.cover_url && 'border-destructive')}
              />
              {errors.cover_url && <p className="text-xs text-destructive">{errors.cover_url}</p>}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <LabelText>독서 상태</LabelText>
              <Select value={form.status} onValueChange={(v) => handleStatusChange(v as BookStatus)}>
                <SelectTrigger className="w-full" aria-label="독서 상태">
                  <SelectValue>{STATUS_LABELS[form.status]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BOOK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <LabelText htmlFor="book-started">시작일</LabelText>
                <Input
                  id="book-started"
                  type="date"
                  max={today()}
                  value={form.started_at}
                  onChange={(e) => setField('started_at', e.target.value)}
                  aria-invalid={!!errors.started_at}
                  className={cn('text-sm', errors.started_at && 'border-destructive')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <LabelText htmlFor="book-finished">완료일</LabelText>
                <Input
                  id="book-finished"
                  type="date"
                  min={form.started_at || undefined}
                  value={form.finished_at}
                  onChange={(e) => setField('finished_at', e.target.value)}
                  disabled={form.status !== 'finished'}
                  aria-invalid={!!errors.finished_at}
                  className={cn(
                    'text-sm',
                    errors.finished_at && 'border-destructive',
                    form.status !== 'finished' && 'opacity-50',
                  )}
                />
              </div>
            </div>
            {errors.started_at && <p className="text-xs text-destructive">{errors.started_at}</p>}
            {errors.finished_at && <p className="text-xs text-destructive">{errors.finished_at}</p>}
            {form.status !== 'finished' && (
              <p className="text-xs text-muted-foreground -mt-2">
                완료일은 상태를 &lsquo;{STATUS_LABELS.finished}&rsquo;으로 바꾸면 입력할 수 있습니다.
              </p>
            )}

            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <LabelText>별점</LabelText>
              <div className="flex items-center gap-3">
                <StarRating
                  value={form.rating}
                  onChange={(v) => setField('rating', v === form.rating ? null : v)}
                  size="lg"
                />
                {form.rating !== null && (
                  <button
                    type="button"
                    onClick={() => setField('rating', null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            {/* Memo */}
            <div className="flex flex-col gap-1.5">
              <LabelText htmlFor="book-memo">메모 / 감상</LabelText>
              <Textarea
                id="book-memo"
                placeholder="이 책에 대한 감상을 자유롭게 적어보세요..."
                value={form.memo}
                onChange={(e) => setField('memo', e.target.value)}
                rows={5}
                className="resize-y leading-relaxed"
              />
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : isEditing ? '수정 완료' : '추가하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
