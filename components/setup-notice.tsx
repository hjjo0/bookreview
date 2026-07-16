import { type ReactNode } from 'react'

/**
 * Shown when the shelf can't be loaded — almost always a fresh clone with no
 * Supabase credentials yet. This is the first screen a new contributor sees when
 * something is wrong, so it points at the fix rather than just naming the fault.
 */
export function SetupNotice({ error }: { error: string }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            책장을 불러오지 못했습니다
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Supabase에 연결하지 못했습니다. 대부분 설정이 아직 끝나지 않았을 때 나타납니다.
          </p>
        </header>

        <pre className="text-xs bg-muted text-muted-foreground rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
          {error}
        </pre>

        <ol className="flex flex-col gap-3 text-sm text-foreground">
          <Step n={1}>
            <Code>supabase.com/dashboard</Code> 에서 프로젝트를 만듭니다.
          </Step>
          <Step n={2}>
            SQL Editor에서 <Code>supabase/schema.sql</Code> 을 실행합니다.
          </Step>
          <Step n={3}>
            <Code>cp .env.example .env.local</Code> 후, Project Settings → API 에서
            <Code>NEXT_PUBLIC_SUPABASE_URL</Code> 과 <Code>SUPABASE_SERVICE_ROLE_KEY</Code> 를
            채웁니다.
          </Step>
          <Step n={4}>개발 서버를 재시작합니다.</Step>
        </ol>

        <p className="text-xs text-muted-foreground">
          자세한 내용은 저장소의 <Code>README.md</Code> 를 참고하세요.
        </p>
      </div>
    </main>
  )
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium tabular-nums">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="text-xs bg-muted px-1.5 py-0.5 rounded mx-0.5 break-all">{children}</code>
  )
}
