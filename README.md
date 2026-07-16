# [나의 독서 노트](https://bookreview-sandy.vercel.app/)


읽은 책을 기록하고, 별점을 매기고, 감상을 남기는 개인 독서 노트입니다.

- **읽고 싶은 / 읽는 중 / 다 읽음** 3단계로 책을 분류합니다.
- 제목·저자 검색, 별점(1~5), 자유 형식 메모, 시작일·완료일을 기록합니다.
- Next.js App Router + Supabase(PostgreSQL)로 만들어졌습니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Server Actions) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4, shadcn/ui, base-ui |
| 데이터베이스 | Supabase (PostgreSQL) |

---

## 시작하기

### 사전 준비

- Node.js 20 이상
- pnpm (`corepack enable pnpm`)
- Supabase 계정 ([supabase.com](https://supabase.com) — 무료 플랜으로 충분합니다)

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Supabase 프로젝트 만들기

1. [supabase.com/dashboard](https://supabase.com/dashboard) 에서 **New project** 를 클릭합니다.
2. 프로젝트 이름과 데이터베이스 비밀번호를 정합니다.
   비밀번호는 이 앱에서 직접 쓰지 않지만, 잃어버리면 복구가 번거로우니 저장해두세요.
3. 리전은 가까운 곳(예: Northeast Asia (Seoul))을 고르면 응답이 빠릅니다.
4. 프로비저닝에 1~2분 걸립니다.

### 3. 테이블 만들기

1. 대시보드 왼쪽 메뉴에서 **SQL Editor** 를 엽니다.
2. [`supabase/schema.sql`](./supabase/schema.sql) 파일 내용을 **전체 복사해서 붙여넣고 Run** 합니다.
3. 왼쪽 **Table Editor** 에 `books` 테이블이 생겼는지 확인합니다.

빈 화면 대신 예시 데이터를 보고 싶다면 [`supabase/seed.sql`](./supabase/seed.sql) 도 같은 방식으로 실행하세요 (선택 사항).

### 4. 환경변수 설정

1. 대시보드 → **Project Settings** → **API** 로 이동합니다.
2. 템플릿을 복사합니다.

   ```bash
   cp .env.example .env.local
   ```

3. `.env.local` 을 열어 두 값을 채웁니다.

   | 변수 | 대시보드에서 찾을 위치 |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** |
   | `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys** → `service_role` (`Reveal` 클릭) |

> [!WARNING]
> `service_role` 키는 RLS를 우회하는 **관리자 권한 키**입니다. GitHub에 커밋하거나 공유하지 마세요.
> 변수명 앞에 `NEXT_PUBLIC_` 을 붙이면 브라우저 번들에 그대로 노출되니 절대 붙이지 마세요.
> `.env.local` 은 `.gitignore` 에 등록되어 있습니다.
> 키가 유출됐다면 대시보드에서 즉시 재발급(rotate)하세요.

### 5. 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 을 엽니다.

---

## 보안 설계: 왜 service_role 키인가

Supabase를 붙이는 방법은 크게 두 가지입니다.

**① anon 키로 브라우저에서 직접 접근** — 흔한 방식이지만, 이 앱에는 **로그인이 없습니다.**
anon 키는 브라우저에 노출되는 것이 전제이므로, 인증 없이 RLS 정책을 열어두면
앱 URL을 아는 누구나 아무 책이나 읽고 지울 수 있습니다.

**② service_role 키로 서버에서만 접근 (이 앱의 선택)**

- `supabase/schema.sql` 은 RLS를 켜되 **정책을 하나도 만들지 않습니다.**
  따라서 anon 키로는 `books` 테이블에 아무것도 할 수 없습니다.
- 모든 읽기·쓰기는 [`app/actions.ts`](./app/actions.ts) 의 Server Actions을 거칩니다.
- `service_role` 키는 [`lib/supabase.ts`](./lib/supabase.ts) 에서만 쓰이며,
  이 파일은 `import 'server-only'` 로 봉인되어 있습니다.
  클라이언트 컴포넌트에서 실수로 import하면 **런타임이 아니라 빌드가 실패**하므로,
  키가 조용히 유출되는 경로가 막힙니다.

### 알아두어야 할 한계

**이 앱에는 아직 인증이 없습니다.** 위 설계는 데이터베이스 자격증명을 보호하지만,
**앱 자체를 보호하지는 않습니다.** Server Actions은 공개 HTTP 엔드포인트이므로,
배포된 URL에 접근할 수 있는 사람은 누구나 책을 추가·수정·삭제할 수 있습니다.
① 방식과의 차이는 공격 표면의 크기입니다 — 임의 SQL 질의가 아니라
앱이 허용한 검증된 동작만 가능합니다.

따라서 **공개 URL로 배포한다면 Supabase Auth를 먼저 붙이는 것을 권장합니다.**
로컬에서만 쓰거나 접근이 제한된 배포라면 지금 상태로도 괜찮습니다.
전환 방법은 `supabase/schema.sql` 하단의 주석 처리된 정책 예시를 참고하세요.

---

## 데이터 모델

`books` 테이블 하나로 구성됩니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | 기본키, 자동 생성 |
| `title` | `text` | 제목 (필수, 공백 불가) |
| `author` | `text` | 저자 (필수, 공백 불가) |
| `cover_url` | `text` | 표지 이미지 주소 (`http(s)://` 만 허용) |
| `status` | `text` | `want_to_read` \| `reading` \| `finished` |
| `rating` | `smallint` | 1~5, 없으면 `null` |
| `memo` | `text` | 자유 형식 감상 |
| `started_at` | `date` | 읽기 시작일 |
| `finished_at` | `date` | 완독일 — `status = 'finished'` 일 때만 존재 가능 |
| `created_at` | `timestamptz` | 생성 시각 (목록 정렬 기준) |
| `updated_at` | `timestamptz` | 트리거로 자동 갱신 |

검증 규칙은 [`lib/books.ts`](./lib/books.ts) 의 `validateBookInput()` 과
`schema.sql` 의 `check` 제약 **양쪽에** 있습니다. 앱에서는 즉각적인 피드백을 주기 위해,
DB에서는 앱을 우회한 쓰기로도 데이터가 깨지지 않게 하기 위해서입니다.

## 프로젝트 구조

```
app/
  actions.ts          Server Actions — 모든 DB 접근이 여기를 지납니다
  page.tsx            책장 페이지 (서버 컴포넌트)
  error.tsx           DB 연결 실패 시 안내 화면
components/
  book-shelf.tsx      상태 컨테이너 (필터·검색·모달)
  book-card.tsx       그리드 카드
  book-cover.tsx      표지 + 로드 실패 폴백
  book-form-modal.tsx 추가/수정 폼
  book-detail-modal.tsx 상세 + 삭제 확인
  star-rating.tsx     별점
  ui/                 shadcn/ui 컴포넌트
lib/
  books.ts            타입 · 라벨 · 검증 (서버/클라이언트 공용, 순수)
  supabase.ts         서버 전용 Supabase 클라이언트
supabase/
  schema.sql          테이블 · 제약 · 인덱스 · RLS
  seed.sql            샘플 데이터 (선택)
```

## 스크립트

```bash
pnpm dev        # 개발 서버
pnpm build      # 프로덕션 빌드 (타입 에러 시 실패)
pnpm start      # 프로덕션 서버
pnpm typecheck  # 타입 검사만
```

## 배포 (Vercel)

1. 이 저장소를 Vercel에 import 합니다.
2. **Settings → Environment Variables** 에 `NEXT_PUBLIC_SUPABASE_URL` 과
   `SUPABASE_SERVICE_ROLE_KEY` 를 등록합니다. (`.env.local` 은 배포되지 않습니다.)
3. 배포합니다.

공개 URL로 배포한다면 위의 **알아두어야 할 한계** 를 먼저 읽어보세요.

## 앞으로 할 일

- [ ] **Supabase Auth 연동** — 다중 사용자 지원 및 공개 배포의 전제 조건
- [ ] 책 검색 API(알라딘·카카오) 연동 — 표지 URL 수동 입력 제거
- [ ] 통계 대시보드 (월별 완독 수, 별점 분포)
- [ ] 다크 모드 (`globals.css` 에 `dark` variant는 선언되어 있으나 팔레트가 없음)
- [ ] 태그 / 장르 분류
