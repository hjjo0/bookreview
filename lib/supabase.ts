import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Book } from '@/lib/books'

// The service role key bypasses RLS, so it must never reach the browser. The
// `server-only` import above turns an accidental client import into a build
// error rather than a leaked credential.

// Mirrors supabase-js's GenericSchema. Views/Functions/Enums/CompositeTypes are
// empty but must be present, or the client resolves every query result to `never`.
export type Database = {
  public: {
    Tables: {
      books: {
        Row: Book
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Book, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `환경변수 ${name} 가 설정되지 않았습니다. .env.example 을 참고해 .env.local 을 만들어주세요.`,
    )
  }
  return value
}

/**
 * Server-side Supabase client. Created per call rather than at module scope so a
 * missing env var surfaces as a caught action error instead of crashing the
 * module graph at import time.
 */
export function createServerClient() {
  return createClient<Database>(
    required('NEXT_PUBLIC_SUPABASE_URL'),
    required('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
