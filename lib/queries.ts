import 'server-only'

import { type Book } from '@/lib/books'
import { createServerClient } from '@/lib/supabase'

// Reads live here rather than in app/actions.ts on purpose: everything exported
// from a 'use server' file becomes a public RPC endpoint, and the shelf read
// doesn't need to be one — the server component calls this directly.

export type ShelfResult =
  | { ok: true; books: Book[] }
  | { ok: false; error: string }

/**
 * Load the shelf, reporting failure as a value rather than an exception.
 *
 * Throwing here would take the whole request down: a Server Component that
 * throws during SSR produces no RSC payload, so there is nothing to hydrate and
 * app/error.tsx (a client boundary) never gets to run — the user just sees
 * Next's blank 500. Returning the failure lets the page render a real
 * explanation, which is the difference between "misconfigured" and "broken".
 */
export async function getBooks(): Promise<ShelfResult> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[books] read:', error)
      // An empty shelf would read as "you have no books" rather than
      // "we couldn't load them", so this stays an explicit error state.
      return { ok: false, error: `책 목록을 불러오지 못했습니다: ${error.message}` }
    }
    return { ok: true, books: data ?? [] }
  } catch (error) {
    console.error('[books] read:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}
