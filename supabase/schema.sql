-- ─────────────────────────────────────────────────────────────────────────────
-- 나의 독서 노트 — 데이터베이스 스키마
--
-- 적용 방법: Supabase 대시보드 → SQL Editor → 이 파일 전체를 붙여넣고 Run.
-- 이 스크립트는 여러 번 실행해도 안전합니다 (idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ─── books ───────────────────────────────────────────────────────────────────

create table if not exists public.books (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  author      text        not null,
  cover_url   text,
  status      text        not null default 'want_to_read',
  rating      smallint,
  memo        text,
  started_at  date,
  finished_at date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- 애플리케이션(lib/books.ts)의 검증 규칙을 DB 차원에서도 강제합니다.
  -- 앱을 거치지 않은 쓰기(SQL Editor, 마이그레이션 실수 등)로도 데이터가
  -- 깨지지 않도록 하는 마지막 방어선입니다.
  constraint books_title_not_blank  check (length(btrim(title)) > 0),
  constraint books_author_not_blank check (length(btrim(author)) > 0),
  constraint books_status_valid     check (status in ('want_to_read', 'reading', 'finished')),
  constraint books_rating_range     check (rating is null or rating between 1 and 5),
  constraint books_cover_url_scheme check (cover_url is null or cover_url ~* '^https?://.+'),

  -- 완료일은 시작일보다 빠를 수 없습니다.
  constraint books_dates_ordered    check (
    started_at is null or finished_at is null or finished_at >= started_at
  ),

  -- 완료일은 '다 읽음' 상태에서만 존재할 수 있습니다.
  constraint books_finished_at_requires_status check (
    finished_at is null or status = 'finished'
  )
);

-- 목록은 항상 created_at 역순으로 조회하므로 인덱스를 맞춰둡니다.
create index if not exists books_created_at_idx on public.books (created_at desc);

-- 탭 필터링(status별 조회)용.
create index if not exists books_status_idx on public.books (status);

-- ─── updated_at 자동 갱신 ────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row
  execute function public.set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────────────
--
-- RLS를 켜되 정책을 하나도 만들지 않습니다. 이는 의도된 설계입니다.
--
--   • anon / authenticated 키로는 이 테이블에 아무것도 할 수 없습니다.
--     anon 키는 브라우저에 노출되므로, 정책을 열어두면 앱 URL을 아는
--     누구나 남의 기록을 지울 수 있습니다.
--   • 앱은 service_role 키(서버 전용, RLS 우회)를 쓰는 Server Actions을 통해서만
--     이 테이블에 접근합니다. lib/supabase.ts 를 참고하세요.
--
-- 나중에 Supabase Auth로 다중 사용자를 지원하려면:
--   1. alter table public.books add column user_id uuid references auth.users(id);
--   2. 아래 예시 정책의 주석을 해제하고 service_role 대신 anon 키로 전환하세요.

alter table public.books enable row level security;

-- 다중 사용자 전환 시 사용할 정책 예시 (지금은 비활성):
--
-- create policy "본인 책만 조회" on public.books
--   for select using (auth.uid() = user_id);
-- create policy "본인 책만 추가" on public.books
--   for insert with check (auth.uid() = user_id);
-- create policy "본인 책만 수정" on public.books
--   for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "본인 책만 삭제" on public.books
--   for delete using (auth.uid() = user_id);
