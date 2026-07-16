import { BookShelf } from '@/components/book-shelf'
import { SetupNotice } from '@/components/setup-notice'
import { getBooks } from '@/lib/queries'

// The shelf changes whenever a book is added or edited, so it must not be frozen
// into the build output. Mutations call revalidatePath('/') to refresh this.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const result = await getBooks()

  if (!result.ok) {
    return <SetupNotice error={result.error} />
  }

  return (
    <main className="min-h-screen bg-background">
      <BookShelf initialBooks={result.books} />
    </main>
  )
}
