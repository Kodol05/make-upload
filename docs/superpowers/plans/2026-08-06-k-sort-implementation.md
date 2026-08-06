# K-SORT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 명지전문대 유학생이 네 언어로 한국 분리배출을 학습하고 사진 인식·도감·챗봇·게임으로 복습하는 모바일 우선 웹앱을 완성한다.

**Architecture:** 하나의 React + Vite + TypeScript 앱이 영상, 전역 다국어 상태, 16종 도감, AI Sort Scan, 챗봇, 게임 라우트를 제공한다. 공용 타입과 검수 지식은 `shared/`에서 프런트와 Cloudflare Worker가 함께 사용하며, Worker만 Gemini API 키를 보유한다. 프런트는 GitHub Pages, API는 Cloudflare Worker에 각각 배포한다.

**Tech Stack:** React, Vite, TypeScript, React Router, Zod, Vitest, Testing Library, ESLint, Cloudflare Workers/Wrangler, Gemini Interactions API, GitHub Actions/Pages, 일반 CSS

## Global Constraints

- Node.js 22 이상과 npm 10 이상을 사용하고 생성된 `package-lock.json`을 커밋한다.
- 지원 언어는 정확히 `ko | en | zh | vi`이며 모든 사용자 노출 문자열은 네 언어 값을 가져야 한다.
- 앱 라우팅은 GitHub Pages 호환 `HashRouter`를 사용하고 Vite base는 `/make-upload/`로 고정한다.
- 도감 품목은 설계 문서의 16종으로 고정하며 임의 품목을 추가하지 않는다.
- Gemini 모델은 `gemini-3.6-flash`, 채팅 제한은 세션당 분당 10회, 스캔은 분당 5회다.
- 채팅 입력은 500자, 대화 이력은 최근 6개, 스캔 이미지는 1.5MB, 탐지 물체는 최대 5개다.
- API 키, `.env*`, `.dev.vars*`, 사용자 대화와 사진을 커밋하거나 로그에 남기지 않는다.
- 로그인, 리더보드, 관리자, 사용자 데이터 저장, 교내 수거함 지도는 구현하지 않는다.
- 각 Task는 테스트 실패 확인 → 최소 구현 → 통과 확인 → 커밋 순서를 지킨다.

---

## Target File Map

```text
.
├─ .github/workflows/deploy-pages.yml       # GitHub Pages 자동 배포
├─ public/
│  ├─ images/items/<item-id>/<step>.webp    # 16종 과정 이미지
│  ├─ images/samples/                       # 발표용 스캔 샘플
│  ├─ media/k-sort-guide.mp4                 # 약 2분 메인 영상
│  ├─ media/poster.webp                      # 영상 포스터
│  └─ subtitles/{ko,en,zh,vi}.vtt            # 언어별 자막
├─ shared/
│  ├─ types.ts                              # 프런트/Worker 공용 계약
│  ├─ catalog.ts                            # 16종 검수 콘텐츠
│  ├─ faqs.ts                               # FAQ 20개
│  ├─ sources.ts                            # 공식 출처 URL 단일 관리
│  └─ schemas.ts                            # Zod 요청/응답 스키마
├─ src/
│  ├─ app/App.tsx                           # 라우트와 전역 조립
│  ├─ app/LocaleProvider.tsx                # 언어 상태와 저장
│  ├─ components/                           # Header, SectionHeading, 오류 UI
│  ├─ features/learn/LearnSection.tsx       # 영상과 4대 원칙
│  ├─ features/catalog/                     # 검색, 카드, 상세 모달
│  ├─ features/scanner/                     # 이미지 압축, API, 박스 오버레이
│  ├─ features/chat/                        # 채팅 API와 대화 UI
│  ├─ features/game/                        # 현민 게임과 연결 어댑터
│  ├─ lib/api.ts                            # Worker HTTP 클라이언트
│  ├─ styles/                               # 토큰, 공통, 반응형 스타일
│  ├─ main.tsx
│  └─ test/setup.ts
├─ worker/
│  ├─ src/index.ts                          # 라우팅, CORS, 오류 응답
│  ├─ src/chat.ts                           # 채팅 프롬프트와 Gemini 호출
│  ├─ src/scan.ts                           # 이미지 탐지 프롬프트와 호출
│  ├─ src/gemini.ts                         # Interactions API 공통 fetch
│  ├─ src/security.ts                       # origin/크기/제한 검증
│  └─ test/                                 # Worker 단위 테스트
├─ docs/                                    # 설계, 계획, 프롬프트, 보고서 인수인계
├─ eslint.config.js
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ vitest.config.ts
└─ wrangler.jsonc
```

---

### Task 1: React/TypeScript 품질 기반 만들기

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/test/setup.ts`, `src/app/App.test.tsx`
- Create: `.gitignore`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run test:run`
- Produces: Vite alias `@ -> src`, `@shared -> shared`

- [ ] **Step 1: npm 프로젝트와 의존성 설치**

```powershell
npm init -y
npm install react react-dom react-router-dom zod
npm install -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals wrangler
```

- [ ] **Step 2: package scripts를 정확히 정의**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "npm run lint && npm run test:run && npm run build",
    "worker:dev": "wrangler dev",
    "worker:test": "vitest run worker/test",
    "worker:deploy": "wrangler deploy"
  }
}
```

- [ ] **Step 3: 첫 실패 테스트 작성**

```tsx
// src/app/App.test.tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the K-SORT product name', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'K-SORT' })).toBeInTheDocument();
});
```

- [ ] **Step 4: 실패 확인**

Run: `npm run test:run -- src/app/App.test.tsx`

Expected: `App` 또는 테스트 설정이 없어서 FAIL.

- [ ] **Step 5: 최소 앱과 Vitest 설정 구현**

```tsx
// src/app/App.tsx
export function App() {
  return <main><h1>K-SORT</h1></main>;
}
```

`vitest.config.ts`에서 `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']`를 설정하고 setup 파일에서 `@testing-library/jest-dom/vitest`를 import한다.

- [ ] **Step 6: 전체 품질 명령 통과 확인**

Run: `npm run check`

Expected: lint, test, build 모두 exit code 0.

- [ ] **Step 7: 커밋**

```powershell
git add package.json package-lock.json index.html tsconfig*.json vite.config.ts vitest.config.ts eslint.config.js .gitignore src
git commit -m "chore: scaffold K-SORT web application"
```

---

### Task 2: 공용 타입·출처·콘텐츠 검증 구축

**Files:**
- Create: `shared/types.ts`, `shared/schemas.ts`, `shared/sources.ts`, `shared/catalog.ts`, `shared/faqs.ts`
- Create: `shared/content.test.ts`

**Interfaces:**
- Produces: `Locale`, `CatalogItem`, `GameResult`, `ChatRequest`, `ChatResponse`, `ScanResponse`
- Produces: `catalogItems`, `faqs`, `sources`, `chatResponseSchema`, `scanResponseSchema`

- [ ] **Step 1: 공용 타입 작성**

```ts
export const locales = ['ko', 'en', 'zh', 'vi'] as const;
export type Locale = (typeof locales)[number];
export type LocalizedText = Record<Locale, string>;
export type Category = 'recyclable' | 'food' | 'general' | 'special';
export type ItemId =
  | 'clear-pet' | 'delivery-container' | 'cup-noodle' | 'disposable-cup'
  | 'vinyl' | 'can' | 'glass-bottle' | 'paper-box' | 'food-waste'
  | 'bones-shells' | 'battery' | 'broken-glass' | 'clothing'
  | 'small-electronics' | 'fluorescent-lamp' | 'styrofoam';

export interface CatalogStep {
  id: string;
  image: string;
  text: LocalizedText;
  alt: LocalizedText;
}

export interface CatalogItem {
  id: ItemId;
  category: Category;
  name: LocalizedText;
  aliases: Record<Locale, string[]>;
  summary: LocalizedText;
  steps: CatalogStep[];
  commonMistake: LocalizedText;
  needsLocalCheck: boolean;
  sourceIds: string[];
}

export interface GameResult { score: number; learnedItemIds: ItemId[] }
```

- [ ] **Step 2: 콘텐츠 누락을 재현하는 실패 테스트 작성**

```ts
import { describe, expect, it } from 'vitest';
import { catalogItems } from './catalog';
import { faqs } from './faqs';
import { locales } from './types';
import { sources } from './sources';

describe('shared content', () => {
  it('contains exactly the approved 16 items', () => {
    expect(catalogItems).toHaveLength(16);
    expect(new Set(catalogItems.map((item) => item.id)).size).toBe(16);
  });

  it('contains 20 FAQs', () => expect(faqs).toHaveLength(20));

  it('has every locale, 3-4 steps, and valid source IDs', () => {
    for (const item of catalogItems) {
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
      expect(item.steps.length).toBeLessThanOrEqual(4);
      for (const locale of locales) {
        expect(item.name[locale].trim()).not.toBe('');
        expect(item.summary[locale].trim()).not.toBe('');
        expect(item.commonMistake[locale].trim()).not.toBe('');
      }
      for (const sourceId of item.sourceIds) expect(sources[sourceId]).toBeDefined();
    }
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm run test:run -- shared/content.test.ts`

Expected: 콘텐츠 모듈이 없거나 개수가 맞지 않아 FAIL.

- [ ] **Step 4: 출처와 16개 콘텐츠 골격 작성**

`catalogItems`의 ID는 위 `ItemId` 순서와 정확히 일치시킨다. 실제 네 언어 문안은 `docs/AI_PROCESS_AND_PROMPTS.md`의 번역 프롬프트로 생성한 뒤 박재웅이 검수한 값만 커밋한다. 이미지 경로는 `/images/items/<item-id>/<step-id>.webp` 형식으로 고정한다.

- [ ] **Step 5: Zod 계약 작성**

```ts
export const chatResponseSchema = z.object({
  answer: z.string().min(1).max(1200),
  matchedItemIds: z.array(itemIdSchema).max(5),
  sourceIds: z.array(z.string()).max(8),
  status: z.enum(['answered', 'needs_local_check', 'out_of_scope']),
});

export const scanResponseSchema = z.object({
  objects: z.array(z.object({
    box: z.tuple([z.number().min(0).max(1000), z.number().min(0).max(1000), z.number().min(0).max(1000), z.number().min(0).max(1000)]),
    itemId: z.union([itemIdSchema, z.literal('unknown')]),
    label: z.string().min(1).max(80),
    certainty: z.enum(['high', 'medium', 'low']),
    reason: z.string().min(1).max(240),
  })).max(5),
});
```

- [ ] **Step 6: 콘텐츠 검사 통과**

Run: `npm run test:run -- shared/content.test.ts`

Expected: 모든 테스트 PASS.

- [ ] **Step 7: 커밋**

```powershell
git add shared
git commit -m "feat: add validated multilingual recycling knowledge"
```

---

### Task 3: 전역 언어 상태·라우팅·공공 안내 셸

**Files:**
- Create: `src/app/LocaleProvider.tsx`, `src/app/useLocale.ts`, `src/components/AppHeader.tsx`, `src/components/AppFooter.tsx`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/app/App.tsx`, `src/main.tsx`
- Test: `src/app/LocaleProvider.test.tsx`, `src/components/AppHeader.test.tsx`

**Interfaces:**
- Produces: `useLocale(): { locale, setLocale, t }`
- Consumes: `Locale`, `LocalizedText` from `@shared/types`

- [ ] **Step 1: 언어 저장 실패 테스트 작성**

```tsx
it('persists the selected language', async () => {
  render(<LocaleProvider><LanguageProbe /></LocaleProvider>);
  await userEvent.selectOptions(screen.getByLabelText('Language'), 'vi');
  expect(localStorage.getItem('k-sort-locale')).toBe('vi');
  expect(screen.getByTestId('locale')).toHaveTextContent('vi');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/app/LocaleProvider.test.tsx`

Expected: provider가 없어 FAIL.

- [ ] **Step 3: LocaleProvider 최소 구현**

브라우저 저장값이 네 언어 중 하나면 사용하고, 아니면 브라우저 언어가 지원될 때 해당 언어, 그 외에는 `ko`를 사용한다. `t(LocalizedText)`는 현재 언어 문자열을 반환한다.

- [ ] **Step 4: HashRouter와 헤더 구현**

`#/`에는 학습 여정, `#/game`에는 게임 화면을 둔다. 헤더 링크는 섹션 anchor와 게임 라우트를 사용하고 360px에서는 메뉴를 가로 스크롤 대신 접히는 메뉴로 제공한다.

- [ ] **Step 5: 스타일 토큰 구현**

```css
:root {
  --color-primary: #0b6b4f;
  --color-primary-strong: #07523e;
  --color-accent: #1769aa;
  --color-bg: #f7faf8;
  --color-surface: #ffffff;
  --color-text: #14231d;
  --color-muted: #5d6d65;
  --color-border: #d7e2dc;
  --radius-card: 18px;
  --shadow-card: 0 12px 30px rgb(20 35 29 / 8%);
}
```

- [ ] **Step 6: 테스트와 모바일 렌더 확인**

Run: `npm run test:run -- src/app/LocaleProvider.test.tsx src/components/AppHeader.test.tsx`

Expected: PASS.

- [ ] **Step 7: 커밋**

```powershell
git add src/app src/components src/styles src/main.tsx
git commit -m "feat: add multilingual application shell"
```

---

### Task 4: 교육 영상과 4대 원칙

**Files:**
- Create: `src/features/learn/LearnSection.tsx`, `src/features/learn/LearnSection.test.tsx`
- Add: `public/media/k-sort-guide.mp4`, `public/media/poster.webp`, `public/subtitles/{ko,en,zh,vi}.vtt`

**Interfaces:**
- Consumes: `useLocale()`
- Produces: `LearnSection`

- [ ] **Step 1: 자막 전환 시 재생 위치 보존 테스트 작성**

테스트용 video element의 `currentTime`을 42로 설정하고 언어를 변경한 뒤, 다시 로드된 track의 `src`가 바뀌고 `currentTime`이 42인지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/features/learn/LearnSection.test.tsx`

Expected: 컴포넌트가 없어 FAIL.

- [ ] **Step 3: 영상 컴포넌트 구현**

`<video controls preload="metadata" poster="...">`와 현재 언어의 `<track kind="subtitles" default>` 하나를 렌더링한다. 언어 변경 직전 재생 위치와 재생 여부를 저장하고 track 교체 후 복구한다.

- [ ] **Step 4: 영상 오류 대체 UI와 4대 원칙 구현**

오류 상태에서는 포스터, 현재 언어 요약, `비운다 / 헹군다 / 분리한다 / 섞지 않는다` 카드 네 개를 표시한다.

- [ ] **Step 5: 테스트 및 접근성 검사**

Run: `npm run test:run -- src/features/learn/LearnSection.test.tsx`

Expected: 자막, 오류 대체, 제목 접근성 테스트 PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/features/learn public/media public/subtitles
git commit -m "feat: add multilingual recycling lesson"
```

---

### Task 5: 16종 검색·필터·상세 도감

**Files:**
- Create: `src/features/catalog/CatalogSection.tsx`, `CatalogCard.tsx`, `CatalogDialog.tsx`, `catalogSearch.ts`
- Test: `src/features/catalog/catalogSearch.test.ts`, `CatalogSection.test.tsx`, `CatalogDialog.test.tsx`
- Add: `public/images/items/<item-id>/*.webp`

**Interfaces:**
- Produces: `findCatalogItems(query: string, category: Category | 'all', locale: Locale): CatalogItem[]`
- Produces: `openCatalogItem(itemId: ItemId)` callback used by Scanner and Chat

- [ ] **Step 1: 다국어 별칭 검색 실패 테스트 작성**

```ts
it('finds an item by a Vietnamese alias', () => {
  expect(findCatalogItems('chai nhựa', 'all', 'vi').map((item) => item.id))
    .toContain('clear-pet');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/features/catalog/catalogSearch.test.ts`

Expected: 검색 함수가 없어 FAIL.

- [ ] **Step 3: 검색과 카테고리 필터 구현**

검색어는 trim 후 현재 언어 이름·별칭과 대소문자 구분 없이 비교한다. 빈 검색어는 선택 카테고리의 모든 항목을 반환한다.

- [ ] **Step 4: 카드 그리드와 상세 모달 테스트 작성 및 실패 확인**

검색 결과 수, 필터 버튼의 `aria-pressed`, 카드 선택 후 품목명·3~4개 단계·공식 출처가 표시되는지 검증한다. Escape로 닫히고 트리거에 포커스가 돌아오는지도 검증한다.

- [ ] **Step 5: UI 최소 구현**

카드는 대표 단계 이미지, 이름, 카테고리, 짧은 요약을 표시한다. 상세는 모든 단계 이미지, 설명, 흔한 실수, 지역 확인 배너, 출처 링크를 표시한다.

- [ ] **Step 6: 이미지 에셋 적용**

`docs/AI_PROCESS_AND_PROMPTS.md`의 스타일 고정 프롬프트로 각 품목의 3~4단계를 생성하고 WebP로 최적화한다. 원본 생성 파일은 GitHub 용량을 키우지 않도록 별도 보관하고 웹 최적화본만 커밋한다.

- [ ] **Step 7: 테스트 통과 및 커밋**

Run: `npm run test:run -- src/features/catalog`

```powershell
git add src/features/catalog public/images/items
git commit -m "feat: add visual recycling catalog"
```

---

### Task 6: Worker 공통 보안·Gemini 클라이언트

**Files:**
- Create: `wrangler.jsonc`, `worker/src/env.ts`, `worker/src/security.ts`, `worker/src/gemini.ts`, `worker/src/index.ts`
- Create: `worker/test/security.test.ts`, `worker/test/index.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `callGemini(input, responseSchema, timeoutMs)`
- Produces: `corsHeaders(origin)`, `validateOrigin(request, env)`, 표준 JSON 오류 응답
- Consumes: `GEMINI_API_KEY`, `ALLOWED_ORIGIN`, `CHAT_RATE_LIMITER`, `SCAN_RATE_LIMITER`

- [ ] **Step 1: CORS와 secret 누락 실패 테스트 작성**

허용 origin은 성공, 다른 origin은 403, `OPTIONS`는 204, Gemini secret이 없으면 503 JSON 오류를 반환하는 테스트를 작성한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run worker:test`

Expected: Worker 모듈이 없어 FAIL.

- [ ] **Step 3: wrangler 설정 작성**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "k-sort-api",
  "main": "worker/src/index.ts",
  "compatibility_date": "2026-08-06",
  "vars": { "ALLOWED_ORIGIN": "https://kodol05.github.io" },
  "ratelimits": [
    { "name": "CHAT_RATE_LIMITER", "namespace_id": "1001", "simple": { "limit": 10, "period": 60 } },
    { "name": "SCAN_RATE_LIMITER", "namespace_id": "1002", "simple": { "limit": 5, "period": 60 } }
  ]
}
```

- [ ] **Step 4: Gemini REST 공통 호출 구현**

`https://generativelanguage.googleapis.com/v1beta/interactions`에 `x-goog-api-key` 헤더로 요청한다. `AbortSignal.timeout(timeoutMs)`를 사용하며 응답 JSON을 Zod로 검증한다. 프롬프트와 원본 요청 본문은 로그에 출력하지 않는다.

- [ ] **Step 5: CORS·오류 테스트 통과**

Run: `npm run worker:test`

Expected: PASS.

- [ ] **Step 6: 커밋**

```powershell
git add wrangler.jsonc worker .gitignore
git commit -m "feat: add secure Gemini worker foundation"
```

---

### Task 7: 근거 기반 다국어 챗봇 API와 UI

**Files:**
- Create: `worker/src/chat.ts`, `worker/test/chat.test.ts`
- Create: `src/lib/api.ts`, `src/features/chat/chatApi.ts`, `ChatSection.tsx`, `ChatSection.test.tsx`

**Interfaces:**
- Produces: `POST /api/chat`
- Produces: `sendChat(request: ChatRequest): Promise<ChatResponse>`
- Consumes: `catalogItems`, `faqs`, `sources`, `chatResponseSchema`

- [ ] **Step 1: Worker 채팅 계약 실패 테스트 작성**

500자를 넘는 입력은 400, 7개 history는 마지막 6개만 사용, 범위 밖 모델 응답은 `out_of_scope`, 등록되지 않은 source ID는 제거되는지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- worker/test/chat.test.ts`

Expected: route가 없어 FAIL.

- [ ] **Step 3: 시스템 프롬프트와 구조화 출력 구현**

`docs/AI_PROCESS_AND_PROMPTS.md`의 `Gemini 챗봇 시스템 프롬프트`를 그대로 코드 상수로 옮긴다. 전체 검수 지식을 compact JSON으로 제공하고 모델 응답의 item/source ID를 허용 목록과 교차 검증한다.

- [ ] **Step 4: 프런트 챗봇 실패 테스트 작성**

현재 언어의 추천 질문, 사용자 메시지, 로딩 상태, 성공 답변과 출처, 429/timeout 오류 시 고정 FAQ와 도감 링크를 검증한다.

- [ ] **Step 5: 실패 확인 후 UI 구현**

대화 이력은 컴포넌트 메모리에만 유지한다. 새로고침 후 복원하지 않는다. `contextItemId`는 사용자가 도감 상세에서 `AI에게 질문`을 선택했을 때만 포함한다.

- [ ] **Step 6: Worker와 UI 테스트 통과**

Run: `npm run test:run -- worker/test/chat.test.ts src/features/chat/ChatSection.test.tsx`

Expected: PASS.

- [ ] **Step 7: 커밋**

```powershell
git add worker/src/chat.ts worker/test/chat.test.ts src/lib src/features/chat
git commit -m "feat: add grounded multilingual recycling assistant"
```

---

### Task 8: AI Sort Scan API·이미지 압축·박스 오버레이

**Files:**
- Create: `worker/src/scan.ts`, `worker/test/scan.test.ts`
- Create: `src/features/scanner/compressImage.ts`, `scannerApi.ts`, `boxGeometry.ts`, `ScannerSection.tsx`
- Test: `src/features/scanner/*.test.tsx`, `src/features/scanner/*.test.ts`
- Add: `public/images/samples/*`

**Interfaces:**
- Produces: `POST /api/scan`
- Produces: `compressImage(file): Promise<File>`
- Produces: `toCssBox(box): { top, left, width, height }`
- Produces: `scanImage(file, locale, sessionId): Promise<ScanResponse>`

- [ ] **Step 1: 압축과 좌표 실패 테스트 작성**

1280px보다 큰 이미지는 긴 변 1280px 이하, JPEG/WebP 출력은 1.5MB 이하가 되는지 검증한다. `[100, 200, 600, 800]`은 `{top:10%, left:20%, width:60%, height:50%}`로 변환되는지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/features/scanner`

Expected: 함수가 없어 FAIL.

- [ ] **Step 3: 브라우저 압축과 좌표 함수 구현**

Canvas에 EXIF 방향이 적용된 이미지를 그린 뒤 JPEG quality를 0.82에서 시작해 크기가 초과하면 0.1씩 낮추되 0.55 아래로 내리지 않는다. 그래도 1.5MB를 넘으면 사용자에게 더 작은 이미지를 선택하도록 안내한다.

- [ ] **Step 4: Worker 스캔 계약 실패 테스트 작성**

지원하지 않는 MIME, 1.5MB 초과, 물체 6개 모델 응답, 범위 밖 item ID, 역전된 좌표, Gemini timeout을 검증한다.

- [ ] **Step 5: 스캔 Worker 구현**

`docs/AI_PROCESS_AND_PROMPTS.md`의 스캐너 프롬프트와 구조화 스키마를 사용한다. 모델 결과를 5개로 제한하고 잘못된 item ID는 `unknown`, 잘못된 좌표 항목은 제거한다.

- [ ] **Step 6: ScannerSection 테스트 작성 및 구현**

`<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment">`를 사용한다. 이미지 위 박스와 번호를 렌더링하고 동일한 결과 목록을 제공한다. `medium`, `low`, `unknown`은 도감 후보 선택 UI를 연다.

- [ ] **Step 7: 테스트 통과 및 커밋**

Run: `npm run test:run -- worker/test/scan.test.ts src/features/scanner`

```powershell
git add worker/src/scan.ts worker/test/scan.test.ts src/features/scanner public/images/samples
git commit -m "feat: add AI multi-object waste scanner"
```

---

### Task 9: 게임 연결 계약과 현민 게임 통합

**Files:**
- Create: `src/features/game/GameContract.ts`, `src/features/game/GamePage.tsx`, `src/features/game/GamePage.test.tsx`
- Create/Modify: `src/features/game/GameExperience.tsx` (김현민 게임 구현 진입점)
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `locale: Locale`, `items: CatalogItem[]`
- Produces: `onComplete(result: GameResult): void`

- [ ] **Step 1: 연결 계약 테스트 작성**

테스트 더블 게임이 `{score: 80, learnedItemIds: ['clear-pet']}`를 반환하면 GamePage가 현재 언어의 점수와 해당 품목 복습 링크를 표시하는지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/features/game/GamePage.test.tsx`

Expected: GamePage가 없어 FAIL.

- [ ] **Step 3: GamePage 어댑터 구현**

GamePage는 게임 내부 상태를 알지 않고 `locale`, `catalogItems`, `onComplete`만 전달한다. 완료 결과에서 존재하지 않는 item ID는 버린다.

- [ ] **Step 4: 김현민 게임 연결**

김현민이 설계한 실제 게임을 `GameExperience.tsx`의 default export로 연결한다. 게임 내 모든 사용자 노출 문자열은 전달받은 locale에 대응하고 완료 시 정확한 `GameResult`를 한 번 반환해야 한다.

- [ ] **Step 5: 통합 테스트와 커밋**

Run: `npm run test:run -- src/features/game/GamePage.test.tsx`

```powershell
git add src/features/game src/app/App.tsx
git commit -m "feat: integrate recycling learning game"
```

---

### Task 10: 반응형 통합·접근성·오류 격리

**Files:**
- Modify: `src/app/App.tsx`, `src/styles/*`, 각 feature 컴포넌트
- Create: `src/components/FeatureErrorBoundary.tsx`, `src/components/FeatureErrorBoundary.test.tsx`
- Create: `src/app/App.integration.test.tsx`

**Interfaces:**
- Produces: 전체 학습 여정과 기능별 독립 오류 경계

- [ ] **Step 1: 통합 실패 테스트 작성**

언어를 `vi`로 변경한 뒤 학습 제목, 도감 품목, 스캔 결과, 챗봇 추천 질문, 게임 링크가 모두 베트남어인지 검증한다. 스캐너가 throw해도 도감과 채팅이 남는지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- src/app/App.integration.test.tsx`

Expected: 통합되지 않아 FAIL.

- [ ] **Step 3: 기능별 ErrorBoundary와 전역 조립 구현**

Learn, Scanner, Catalog, Chat, Game 각 영역을 독립 오류 경계로 감싼다. 오류 대체 문구와 다음 사용 가능한 행동을 현재 언어로 제공한다.

- [ ] **Step 4: 접근성 동작 구현**

Skip link, 명확한 heading 순서, focus-visible, 모달 focus trap, Escape 닫기, 최소 44px 터치 영역, 색상 외 텍스트 표시를 적용한다.

- [ ] **Step 5: 통합 테스트 통과**

Run: `npm run test:run -- src/app/App.integration.test.tsx`

Expected: PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src
git commit -m "feat: complete accessible K-SORT learning journey"
```

---

### Task 11: GitHub Pages와 Worker 배포 자동화

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `vite.config.ts`, `README.md`, `wrangler.jsonc`

**Interfaces:**
- Consumes: GitHub repository variable `VITE_API_BASE_URL`
- Produces: `https://kodol05.github.io/make-upload/`
- Produces: Cloudflare Worker API URL

- [ ] **Step 1: 배포 base 회귀 테스트 작성**

`vite.config.ts`가 production에서 `/make-upload/` base를 사용하는지 config 테스트 또는 빌드 결과의 asset 경로 검사로 검증한다.

- [ ] **Step 2: GitHub Pages workflow 작성**

workflow는 checkout → Node 22 setup/cache → `npm ci` → `npm run check` → `npm run build` → Pages artifact upload → deploy 순서로 작성한다. `VITE_API_BASE_URL`은 repository variable에서 주입한다.

- [ ] **Step 3: Worker secret 설정과 배포**

```powershell
npx wrangler secret put GEMINI_API_KEY
npm run worker:deploy
```

Worker URL을 GitHub repository variable `VITE_API_BASE_URL`에 저장한다. API 키 값은 문서, 스크린샷, shell history에 복사하지 않는다.

- [ ] **Step 4: GitHub Pages 활성화와 main push**

GitHub Settings → Pages → Source를 `GitHub Actions`로 선택한다. main push 후 Actions가 성공하는지 확인한다.

- [ ] **Step 5: 운영 smoke test**

배포 URL에서 네 언어 전환, 영상 metadata 로드, 도감 상세, 실제 채팅 1회, 실제 스캔 1회, 게임 진입을 확인한다. 개발자 도구에서 Gemini 키가 노출되지 않는지 검색한다.

- [ ] **Step 6: 커밋**

```powershell
git add .github vite.config.ts README.md wrangler.jsonc
git commit -m "ci: deploy K-SORT to GitHub Pages"
```

---

### Task 12: 최종 검증·증거 수집·발표 동결

**Files:**
- Modify: `docs/REPORT_AND_PPT_HANDOFF.md`, `README.md`
- Add: `docs/evidence/README.md`와 선택한 압축 스크린샷

**Interfaces:**
- Produces: 보고서/PPT용 검증 증거와 재현 가능한 릴리스 상태

- [ ] **Step 1: 전체 자동 검증**

Run: `npm run check`

Expected: lint, 모든 테스트, production build PASS.

- [ ] **Step 2: 고정 시나리오 수동 검증**

단일 품목 사진 5장, 다중 품목 사진 2장, 모호한 사진 1장과 FAQ 20개 × 4언어를 검증한다. 결과는 `docs/REPORT_AND_PPT_HANDOFF.md`의 검증표에 날짜와 성공/실패로 기록한다.

- [ ] **Step 3: 360px·데스크톱 화면 캡처**

홈, 영상, AI 스캔 박스, 도감 단계, 챗봇 출처, 게임 결과, 언어 전환 전후 화면을 캡처한다. 개인정보와 API 키가 보이는 화면은 저장하지 않는다.

- [ ] **Step 4: 5분 발표 3회 리허설**

각 리허설에서 총 시간, API 응답 시간, 실패 지점을 기록한다. 발표용 샘플 사진과 질문은 마지막 성공 리허설 후 변경하지 않는다.

- [ ] **Step 5: 최종 secret 검색**

Run: `git grep -n -I -E "AIza|GEMINI_API_KEY=|api[_-]?key['\"]?\s*[:=]\s*['\"][^'\"]+"`

Expected: 실제 키 값 0건. 환경변수 이름과 문서 설명만 허용.

- [ ] **Step 6: 릴리스 커밋과 태그**

```powershell
git add README.md docs
git commit -m "docs: finalize K-SORT hackathon handoff"
git tag -a hackathon-demo-v1 -m "K-SORT hackathon demo v1"
git push origin main --tags
```

---

## Completion Definition

- `npm run check`가 통과한다.
- GitHub Pages에서 360px와 데스크톱 모두 전체 여정을 완료한다.
- 전역 언어 선택이 영상 자막, 앱, 도감, AI 응답, 게임에 적용된다.
- 16개 품목에 3~4개 과정 이미지와 검수된 네 언어 콘텐츠가 있다.
- Worker는 허용 origin, 입력 크기, rate limit, timeout, Zod 응답 검증을 적용한다.
- Gemini 키와 사용자 입력이 저장소·브라우저 번들·로그에 없다.
- 고정 데모 스캔과 질문이 리허설 3회에서 연속 성공한다.
- 보고서와 PPT 담당자가 `docs/REPORT_AND_PPT_HANDOFF.md`와 `docs/AI_PROCESS_AND_PROMPTS.md`만으로 제작 과정과 AI 사용 근거를 재구성할 수 있다.
