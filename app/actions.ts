'use server'

import { revalidatePath } from 'next/cache'

import {
  type ActionResult,
  type Book,
  type BookInput,
  hasErrors,
  validateBookInput,
} from '@/lib/books'
import { createServerClient } from '@/lib/supabase'

// Every export here is a public HTTP endpoint. This app has no auth yet, so the
// validation below is the only thing standing between a caller and the table —
// re-run it server-side even though the form already checked.
//
// Mutations only. Reads live in lib/queries.ts — see the note there.

const GENERIC_ERROR = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'

/** Strip fields to the known shape so a caller can't smuggle extra columns in. */
function sanitize(input: BookInput): BookInput {
  return {
    title: input.title.trim(),
    author: input.author.trim(),
    cover_url: input.cover_url?.trim() || null,
    status: input.status,
    rating: input.rating,
    memo: input.memo?.trim() || null,
    started_at: input.started_at || null,
    finished_at: input.finished_at || null,
  }
}

function fail(context: string, error: unknown): { ok: false; error: string } {
  console.error(`[books] ${context}:`, error)
  return { ok: false, error: GENERIC_ERROR }
}

export async function createBookAction(input: BookInput): Promise<ActionResult<Book>> {
  const clean = sanitize(input)
  const errors = validateBookInput(clean)
  if (hasErrors(errors)) return { ok: false, error: Object.values(errors)[0]! }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from('books').insert(clean).select().single()
    if (error) return fail('create', error)

    revalidatePath('/')
    return { ok: true, data }
  } catch (error) {
    return fail('create', error)
  }
}

export async function updateBookAction(
  id: string,
  input: BookInput,
): Promise<ActionResult<Book>> {
  const clean = sanitize(input)
  const errors = validateBookInput(clean)
  if (hasErrors(errors)) return { ok: false, error: Object.values(errors)[0]! }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('books')
      .update(clean)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail('update', error)
    if (!data) return { ok: false, error: '책을 찾을 수 없습니다.' }

    revalidatePath('/')
    return { ok: true, data }
  } catch (error) {
    return fail('update', error)
  }
}

export async function deleteBookAction(id: string): Promise<ActionResult<null>> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) return fail('delete', error)

    revalidatePath('/')
    return { ok: true, data: null }
  } catch (error) {
    return fail('delete', error)
  }
}
