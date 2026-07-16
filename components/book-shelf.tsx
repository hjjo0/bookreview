'use client'

import { useEffect, useMemo, useState } from 'react'

import { BookDetailModal } from '@/components/book-detail-modal'
import { BookFormModal } from '@/components/book-form-modal'
import { BookList } from '@/components/book-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createBookAction,
  deleteBookAction,
  updateBookAction,
} from '@/app/actions'
import {
  type Book,
  type BookInput,
  type BookStatus,
  STATUS_LABELS,
} from '@/lib/books'

type TabValue = 'all' | BookStatus

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'want_to_read', label: STATUS_LABELS.want_to_read },
  { value: 'reading', label: STATUS_LABELS.reading },
  { value: 'finished', label: STATUS_LABELS.finished },
]

interface BookShelfProps {
  initialBooks: Book[]
}

export function BookShelf({ initialBooks }: BookShelfProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [formOpen, setFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Actions call revalidatePath('/'), which re-renders the page with fresh rows.
  // Without this, `books` would keep serving the snapshot taken on first mount.
  useEffect(() => {
    setBooks(initialBooks)
  }, [initialBooks])

  // ── Filtered books ─────────────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter((b) => {
      const matchesTab = activeTab === 'all' || b.status === activeTab
      const matchesSearch =
        !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [books, activeTab, search])

  // ── Counts per tab ──────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const c: Record<TabValue, number> = {
      all: books.length,
      want_to_read: 0,
      reading: 0,
      finished: 0,
    }
    books.forEach((b) => c[b.status]++)
    return c
  }, [books])

  // ── Action handlers ─────────────────────────────────────────────────────────
  // These return an error string (or null) so the form modal can stay open and
  // show the message instead of closing over a failed save.

  async function handleAddBook(data: BookInput): Promise<string | null> {
    const result = await createBookAction(data)
    if (!result.ok) return result.error

    setBooks((prev) => [result.data, ...prev])
    return null
  }

  async function handleEditBook(data: BookInput): Promise<string | null> {
    if (!editingBook) return '수정할 책을 찾을 수 없습니다.'

    const result = await updateBookAction(editingBook.id, data)
    if (!result.ok) return result.error

    const updated = result.data
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setDetailBook((prev) => (prev?.id === updated.id ? updated : prev))
    return null
  }

  async function handleDeleteBook(book: Book) {
    setDeleting(true)
    setError(null)
    try {
      const result = await deleteBookAction(book.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setBooks((prev) => prev.filter((b) => b.id !== book.id))
      setDetailOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  function openDetail(book: Book) {
    setDetailBook(book)
    setDetailOpen(true)
  }

  function openEdit(book: Book) {
    setEditingBook(book)
    setDetailOpen(false)
    setFormOpen(true)
  }

  function openAdd() {
    setEditingBook(null)
    setFormOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
            나의 독서 노트
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.finished}권 완독 · {counts.reading}권 읽는 중 · {counts.want_to_read}권 읽고 싶은
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0 gap-1.5">
          <PlusIcon className="w-4 h-4" />책 추가
        </Button>
      </header>

      {/* ── Tabs + Search ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-muted h-auto p-1 flex-wrap gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                  {counts[tab.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="search"
            placeholder="제목 또는 저자 검색"
            aria-label="제목 또는 저자 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* ── Book Grid ──────────────────────────────────────────────────────── */}
      <BookList books={filteredBooks} onBookClick={openDetail} hasQuery={!!search.trim()} />

      {/* ── Floating Add Button (mobile) ───────────────────────────────────── */}
      <button
        onClick={openAdd}
        aria-label="책 추가"
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <BookDetailModal
        book={detailBook}
        open={detailOpen}
        deleting={deleting}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onDelete={handleDeleteBook}
      />

      <BookFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingBook(null)
        }}
        onSubmit={editingBook ? handleEditBook : handleAddBook}
        initialData={editingBook}
      />

      {/* ── Error toast ────────────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-destructive text-white rounded-xl px-5 py-3 shadow-lg text-sm"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="opacity-70 hover:opacity-100 transition-opacity font-medium"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
