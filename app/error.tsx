'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

/**
 * Backstop for unexpected client-side errors. Supabase connection failures do
 * not land here — the page renders <SetupNotice /> for those, because a Server
 * Component that throws during SSR never produces a payload for this boundary
 * to attach to.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center flex flex-col items-center gap-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          문제가 발생했습니다
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          예기치 못한 오류로 화면을 표시하지 못했습니다. 다시 시도해도 같은 문제가 계속되면
          브라우저 콘솔의 오류 내용을 확인해주세요.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">오류 ID: {error.digest}</p>
        )}
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </main>
  )
}
