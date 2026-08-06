# K-SORT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 명지전문대 유학생이 네 언어로 한국 분리배출을 학습하고 사진 인식·도감·챗봇·게임으로 복습하는 모바일 우선 웹앱을 완성한다.

**Architecture:** 하나의 React + Vite + TypeScript 앱이 영상, 전역 다국어 상태, 16종 도감, AI Sort Scan, 챗봇, 게임 라우트를 제공한다. 공용 타입과 검수 지식은 `shared/`에서 프런트와 Cloudflare Worker가 함께 사용하며, Worker만 Gemini API 키를 보유한다. 프런트는 GitHub Pages, API는 Cloudflare Worker에 각각 배포한다.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Zod 4, Vitest 4, Testing Library, ESLint 10, Cloudflare Workers/Wrangler 4, Gemini `generateContent`, GitHub Actions/Pages, 일반 CSS

스택 확정 근거와 검증 결과는 [기술 스택 확정과 구현 설계](../specs/2026-08-06-k-sort-stack-decisions.md)에 있다.

## Global Constraints

- Node.js 22 이상과 npm 10 이상을 사용하고 생성된 `package-lock.json`을 커밋한다.
- **TypeScript는 `~6.0.3`으로 고정한다.** npm `latest`인 7.x는 안정적인 프로그래매틱 API가
  없어 typescript-eslint(peer 범위 `>=4.8.4 <6.1.0`)가 지원하지 못하고 `npm run lint`가 실패한다.
- 지원 언어는 정확히 `ko | en | zh | vi`이며 모든 사용자 노출 문자열은 네 언어 값을 가져야 한다.
- 아직 확정되지 않은 문안은 `shared/placeholder.ts`의 자리 표시를 쓴다. 빈 문자열을 넣지 않는다.
- 앱 라우팅은 `src/app/useHashRoute.ts`를 직접 구현해 쓰고 Vite base는 `/make-upload/`로 고정한다.
  라우트는 홈 `#/`와 게임 `#/game` 둘뿐이므로 라우팅 라이브러리를 설치하지 않는다.
- 도감 품목은 설계 문서의 16종으로 고정하며 임의 품목을 추가하지 않는다.
- Gemini 모델은 `gemini-3.6-flash`, 호출은 `:generateContent`, 채팅 제한은 세션당 분당 10회,
  스캔은 분당 5회다.
- 채팅 입력은 500자, 대화 이력은 최근 6개, 스캔 이미지는 1.5MB, 탐지 물체는 최대 5개다.
- Zod는 Worker에서만 쓴다. 프런트는 `shared/schemas.ts`를 가져오지 않는다.
- 도감 이미지가 없어도 처리 순서·흔한 실수·출처는 그대로 읽혀야 한다.
- API 키, `.env*`, `.dev.vars*`, 사용자 대화와 사진을 커밋하거나 로그에 남기지 않는다.
- 로그인, 리더보드, 관리자, 사용자 데이터 저장, 교내 수거함 지도는 구현하지 않는다.
- 각 Task는 테스트 실패 확인 → 최소 구현 → 통과 확인 → 커밋 순서를 지킨다.
- 커밋 메시지는 `type: 한국어로 무엇을 했는지` 형식을 쓴다. 예) `feat: 도감 검색과 카테고리 필터 구현`

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
│  ├─ placeholder.ts                        # 미확정 문안 자리 표시 헬퍼
│  ├─ catalog.ts                            # 16종 검수 콘텐츠
│  ├─ faqs.ts                               # FAQ 20개
│  ├─ sources.ts                            # 공식 출처 URL 단일 관리
│  └─ schemas.ts                            # Zod 요청/응답 스키마 (Worker 전용)
├─ src/
│  ├─ app/App.tsx                           # 라우트와 전역 조립
│  ├─ app/LocaleProvider.tsx                # 언어 상태와 저장
│  ├─ app/useHashRoute.ts                   # 해시 라우팅 (라이브러리 대체)
│  ├─ i18n/strings.ts                       # UI 문자열 4언어 단일 사전
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
│  ├─ src/gemini.ts                         # generateContent 공통 fetch
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

### Task 1: 품질 기반 만들고 첫 배포까지 확인하기

빌드·테스트·린트가 돌고 **실제로 GitHub Pages에 떠 있는** 최소 앱을 만든다.
배포 설정을 마지막까지 미루면 base 경로·Actions 권한 문제가 마감 직전에 터지므로,
잃을 것이 없는 지금 한 번 통과시켜 둔다.

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/test/setup.ts`, `src/app/App.test.tsx`
- Create: `.gitignore`, `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run test:run`, `npm run check`
- Produces: Vite alias `@ -> src`, `@shared -> shared`
- Produces: 배포 URL `https://kodol05.github.io/make-upload/`

- [ ] **Step 1: npm 프로젝트와 의존성 설치**

`typescript`의 버전을 반드시 지정한다. 생략하면 npm `latest`인 7.x가 설치되어
typescript-eslint가 동작하지 못하고 `npm run lint`가 실패한다.

```powershell
npm init -y
npm install react react-dom zod
npm install -D "typescript@~6.0.3" vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals wrangler
npm install -D @types/react @types/react-dom @types/node
```

타입 패키지가 없으면 `tsc -b`가 `TS7016 Could not find a declaration file for module 'react'`로
실패한다. `@types/node`는 설정 파일의 `node:url` import에 필요하다.

설치 후 실제 버전을 확인한다.

```powershell
npm ls typescript
```

Expected: `typescript@6.0.x`이고 typescript-eslint 아래도 같은 버전으로 dedupe된다.
7.x가 보이면 `npm install -D "typescript@~6.0.3"`을 다시 실행한다.

`npm audit`이 `undici` 관련 경고를 내지만 `jsdom`(테스트 환경)과
`wrangler → miniflare`(로컬 개발 시뮬레이터)를 통해 들어온 것이라 배포되는 코드에는 없다.
`npm audit --omit=dev`가 0건인지로 확인한다. npm이 제안하는 자동 수정은 wrangler를
크게 낮추므로 실행하지 않는다.

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

설정에서 두 곳이 걸린다.

- **eslint**: `eslint-plugin-react-hooks`의 flat config는
  `reactHooks.configs.flat['recommended-latest']`에 있다.
  `reactHooks.configs['recommended-latest']`는 eslintrc 형식이라 eslint 10이
  `A config object has a "plugins" key defined as an array of strings`로 거부한다.
- **tsconfig**: TypeScript 6는 `baseUrl`을 폐기 예고해 `TS5101`을 낸다.
  `baseUrl`을 쓰지 말고 `paths` 값을 `"./src/*"`처럼 `./`로 시작하는 상대 경로로 적는다.
  `baseUrl` 없이 비상대 경로를 쓰면 `TS5090`이 난다.

- [ ] **Step 6: Vite base 경로 설정**

GitHub Pages는 `https://kodol05.github.io/make-upload/` 하위에서 서비스되므로 base가 필요하다.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: '/make-upload/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
});
```

- [ ] **Step 7: 전체 품질 명령 통과 확인**

Run: `npm run check`

Expected: lint, test, build 모두 exit code 0.

`npm run lint`가 typescript 관련 오류로 실패하면 Step 1의 버전 확인으로 돌아간다.

- [ ] **Step 8: GitHub Pages 배포 workflow 작성**

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`VITE_API_BASE_URL`은 Worker를 만들기 전이라 비어 있다. 이 시점의 앱은 API를 호출하지
않으므로 문제되지 않는다. 값은 Task 11에서 채운다.

- [ ] **Step 9: 커밋과 PR**

```powershell
git add package.json package-lock.json index.html tsconfig*.json vite.config.ts vitest.config.ts eslint.config.js .gitignore src .github
git commit -m "chore: 웹앱 기반 구성과 Pages 배포 workflow 추가"
git push -u origin feat/k-sort-mvp
gh pr create --title "chore: 웹앱 기반 구성과 Pages 배포 workflow 추가" --body "React/Vite/TypeScript 기반과 GitHub Pages 배포를 함께 구성했다."
```

- [ ] **Step 10: Pages 활성화 후 배포 확인**

GitHub 저장소 Settings → Pages → Source를 `GitHub Actions`로 선택한다.
PR을 main에 병합하면 workflow가 실행된다.

```powershell
gh run watch
```

Expected: workflow 성공. `https://kodol05.github.io/make-upload/`에서 `K-SORT` 제목이 보인다.

실패하면 지금 고친다. 흔한 원인은 Pages Source가 `GitHub Actions`가 아닌 경우,
`permissions` 블록 누락, base 경로 불일치로 자산이 404가 되는 경우다.
이후 배포는 main에 병합될 때 자동으로 실행되므로 매번 확인할 필요는 없다.

---

### Task 2: 공용 타입·출처·콘텐츠 검증 구축

박재웅의 사실 검수와 번역이 끝나야 나오는 문안 192개(16종 × 4언어 × 3필드)를 기다리지
않고 진행한다. 미확정 문안은 자리 표시로 채우고, 콘텐츠 검사를 세 층으로 나눠
구조는 지금부터 강제하되 완성도는 진행률로만 본다.

**Files:**
- Create: `shared/types.ts`, `shared/placeholder.ts`, `shared/schemas.ts`, `shared/sources.ts`, `shared/catalog.ts`, `shared/faqs.ts`
- Create: `shared/content.test.ts`, `shared/placeholder.test.ts`, `shared/content-progress.test.ts`

**Interfaces:**
- Produces: `Locale`, `LocalizedText`, `Category`, `ItemId`, `CatalogStep`, `CatalogItem`, `GameResult`, `ChatRequest`, `ChatResponse`, `ScanResponse`
- Produces: `catalogItems`, `faqs`, `sources`, `chatResponseSchema`, `scanResponseSchema`
- Produces: `Source { title: LocalizedText; url: string }`
- Produces: `TODO`, `todo(itemId, field, locale)`, `isTodo(value)`, `localized(itemId, field, values)`, `findTodos(value)`, `countTodos(value)`

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

- [ ] **Step 2: 자리 표시 헬퍼 실패 테스트 작성**

```ts
// shared/placeholder.test.ts
import { describe, expect, it } from 'vitest';
import { countTodos, findTodos, isTodo, localized, todo } from './placeholder';

describe('placeholder', () => {
  it('makes a traceable marker for a missing string', () => {
    expect(todo('clear-pet', 'summary', 'vi')).toBe('__TODO__:clear-pet.summary.vi');
  });

  it('keeps given values and fills the rest', () => {
    const result = localized('clear-pet', 'name', { ko: '투명 페트병' });
    expect(result.ko).toBe('투명 페트병');
    expect(isTodo(result.ko)).toBe(false);
    expect(isTodo(result.vi)).toBe(true);
  });

  it('finds markers nested in objects and arrays', () => {
    const value = { a: 'done', b: [{ c: todo('can', 'summary', 'en') }] };
    expect(findTodos(value)).toEqual(['__TODO__:can.summary.en']);
    expect(countTodos(value)).toBe(1);
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm run test:run -- shared/placeholder.test.ts`

Expected: `shared/placeholder` 모듈이 없어서 FAIL.

- [ ] **Step 4: 자리 표시 헬퍼 구현**

```ts
// shared/placeholder.ts
import type { Locale, LocalizedText } from './types';

export const TODO = '__TODO__';

/** 아직 채우지 못한 문안의 자리를 만든다. */
export function todo(itemId: string, field: string, locale: Locale): string {
  return `${TODO}:${itemId}.${field}.${locale}`;
}

/** 자리 표시 문자열인지 확인한다. */
export function isTodo(value: string): boolean {
  return value.startsWith(TODO);
}

/** 주어진 언어만 채우고 나머지 언어는 자리 표시로 메운다. */
export function localized(
  itemId: string,
  field: string,
  values: Partial<LocalizedText>,
): LocalizedText {
  return {
    ko: values.ko ?? todo(itemId, field, 'ko'),
    en: values.en ?? todo(itemId, field, 'en'),
    zh: values.zh ?? todo(itemId, field, 'zh'),
    vi: values.vi ?? todo(itemId, field, 'vi'),
  };
}

/** 중첩된 값 안에 남아 있는 자리 표시를 모두 찾는다. */
export function findTodos(value: unknown): string[] {
  if (typeof value === 'string') return isTodo(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(findTodos);
  if (value && typeof value === 'object') return Object.values(value).flatMap(findTodos);
  return [];
}

/** 남아 있는 자리 표시의 개수를 센다. */
export function countTodos(value: unknown): number {
  return findTodos(value).length;
}
```

Run: `npm run test:run -- shared/placeholder.test.ts`

Expected: PASS.

- [ ] **Step 5: 콘텐츠 구조 실패 테스트 작성**

이 검사는 콘텐츠 완성도가 아니라 **구조**를 본다. 자리 표시도 빈 문자열이 아니므로
검수 전에도 통과한다.

```ts
// shared/content.test.ts
import { describe, expect, it } from 'vitest';
import { catalogItems } from './catalog';
import { faqs } from './faqs';
import { locales } from './types';
import { sources } from './sources';

describe('shared content structure', () => {
  it('contains exactly the approved 16 items', () => {
    expect(catalogItems).toHaveLength(16);
    expect(new Set(catalogItems.map((item) => item.id)).size).toBe(16);
  });

  it('contains 20 FAQs', () => expect(faqs).toHaveLength(20));

  it('gives every item 3-4 steps and registered source IDs', () => {
    for (const item of catalogItems) {
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
      expect(item.steps.length).toBeLessThanOrEqual(4);
      for (const sourceId of item.sourceIds) expect(sources[sourceId]).toBeDefined();
    }
  });

  it('gives every locale a non-empty string', () => {
    for (const item of catalogItems) {
      for (const locale of locales) {
        expect(item.name[locale].trim()).not.toBe('');
        expect(item.summary[locale].trim()).not.toBe('');
        expect(item.commonMistake[locale].trim()).not.toBe('');
      }
    }
  });

  it('points every step image at the agreed path', () => {
    for (const item of catalogItems) {
      for (const step of item.steps) {
        expect(step.image).toBe(`/images/items/${item.id}/${step.id}.webp`);
      }
    }
  });
});
```

- [ ] **Step 6: 실패 확인**

Run: `npm run test:run -- shared/content.test.ts`

Expected: 콘텐츠 모듈이 없어서 FAIL.

- [ ] **Step 7: 출처와 16종 콘텐츠 골격 작성**

`catalogItems`의 ID와 순서를 Step 1의 `ItemId`와 정확히 일치시킨다.
아는 문안만 적고 나머지는 `localized()`가 자리 표시로 메운다. 박재웅의 검수가 끝난
문안이 오면 객체에 키만 더하므로 구조를 다시 손댈 일이 없다.

```ts
// shared/catalog.ts
import { localized } from './placeholder';
import type { CatalogItem } from './types';

export const catalogItems: CatalogItem[] = [
  {
    id: 'clear-pet',
    category: 'recyclable',
    name: localized('clear-pet', 'name', { ko: '투명 페트병' }),
    aliases: { ko: ['페트병', '생수병'], en: [], zh: [], vi: [] },
    summary: localized('clear-pet', 'summary', {}),
    steps: [
      { id: '01', image: '/images/items/clear-pet/01.webp',
        text: localized('clear-pet', 'step01', {}),
        alt: localized('clear-pet', 'step01alt', {}) },
      { id: '02', image: '/images/items/clear-pet/02.webp',
        text: localized('clear-pet', 'step02', {}),
        alt: localized('clear-pet', 'step02alt', {}) },
      { id: '03', image: '/images/items/clear-pet/03.webp',
        text: localized('clear-pet', 'step03', {}),
        alt: localized('clear-pet', 'step03alt', {}) },
      { id: '04', image: '/images/items/clear-pet/04.webp',
        text: localized('clear-pet', 'step04', {}),
        alt: localized('clear-pet', 'step04alt', {}) },
    ],
    commonMistake: localized('clear-pet', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-separate-discharge'],
  },
  // 나머지 15종도 같은 형태로 작성한다.
];
```

**출처 URL만은 자리 표시를 쓰지 않는다.** 잘못된 URL은 없는 것보다 나쁘고, 설계 문서는
출처를 앱이 관리하는 실제 주소로만 연결하도록 정하고 있다. 검수 전 출처는 `url`을
빈 문자열로 두고, 도감 UI는 빈 URL이면 링크를 렌더링하지 않는다.

```ts
// shared/sources.ts
import { localized } from './placeholder';
import type { LocalizedText } from './types';

export interface Source {
  title: LocalizedText;
  /** 박재웅이 직접 열어 확인한 주소만 채운다. 미확인 상태는 빈 문자열로 둔다. */
  url: string;
}

export const sources: Record<string, Source> = {
  'me-separate-discharge': {
    title: localized('me-separate-discharge', 'title', { ko: '환경부 재활용품 분리배출 안내' }),
    url: '',
  },
};
```

- [ ] **Step 8: Zod 계약 작성**

`shared/schemas.ts`는 Worker만 가져온다. 프런트가 이 파일을 import하면 Zod가
브라우저 번들에 들어가므로 하지 않는다.

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

- [ ] **Step 9: 진행률과 릴리스 게이트 테스트 작성**

진행률 검사는 실패시키지 않고 남은 분량만 보고한다. 릴리스 게이트는 `.skip`으로 두고
콘텐츠 검수가 끝나면 떼어 배포 전에 반드시 통과시킨다.

```ts
// shared/content-progress.test.ts
import { describe, expect, it } from 'vitest';
import { catalogItems } from './catalog';
import { faqs } from './faqs';
import { sources } from './sources';
import { countTodos, findTodos } from './placeholder';

describe('content progress', () => {
  it('reports how much content is still missing', () => {
    const remaining = countTodos(catalogItems) + countTodos(faqs) + countTodos(sources);
    console.log(`[content] 남은 자리 표시 ${remaining}개`);
    expect(Number.isInteger(remaining)).toBe(true);
  });

  // 콘텐츠 검수가 끝나면 .skip을 떼고 Task 12에서 반드시 통과시킨다.
  it.skip('has no placeholder left before release', () => {
    expect(findTodos(catalogItems)).toEqual([]);
    expect(findTodos(faqs)).toEqual([]);
    expect(findTodos(sources)).toEqual([]);
  });

  // 출처 URL은 자리 표시를 쓰지 않으므로 별도로 확인한다.
  it.skip('has a verified URL for every source', () => {
    for (const [id, source] of Object.entries(sources)) {
      expect(source.url, `source ${id}`).toMatch(/^https:\/\//);
    }
  });
});
```

- [ ] **Step 10: 전체 검사 통과 확인**

Run: `npm run test:run -- shared`

Expected: `placeholder.test.ts`, `content.test.ts`, `content-progress.test.ts` 모두 PASS.
진행률 로그에 남은 자리 표시 개수가 출력된다.

- [ ] **Step 11: 커밋**

```powershell
git add shared
git commit -m "feat: 공용 타입과 16종 콘텐츠 골격, 자리 표시 헬퍼 추가"
```

---

### Task 3: 전역 언어 상태·라우팅·공공 안내 셸

**Files:**
- Create: `src/app/LocaleProvider.tsx`, `src/app/useLocale.ts`, `src/app/useHashRoute.ts`, `src/components/AppHeader.tsx`, `src/components/AppFooter.tsx`
- Create: `src/i18n/strings.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/app/App.tsx`, `src/main.tsx`
- Test: `src/app/LocaleProvider.test.tsx`, `src/app/useHashRoute.test.tsx`, `src/i18n/strings.test.ts`, `src/components/AppHeader.test.tsx`

**Interfaces:**
- Produces: `useLocale(): { locale: Locale; setLocale(next: Locale): void; t(text: LocalizedText): string }`
- Produces: `useHashRoute(): string` — 현재 해시 경로. 해시가 없으면 `'/'`
- Produces: `ui` — UI 문자열 4언어 사전 (`src/i18n/strings.ts`)
- Consumes: `Locale`, `LocalizedText` from `@shared/types`
- Consumes: `localized`, `findTodos` from `@shared/placeholder`

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

- [ ] **Step 4: 해시 라우팅 실패 테스트 작성**

```tsx
// src/app/useHashRoute.test.tsx
import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useHashRoute } from './useHashRoute';

/** 해시를 바꾸고 브라우저와 같은 이벤트를 발생시킨다. */
function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

it('treats an empty hash as the home route', () => {
  window.location.hash = '';
  const { result } = renderHook(() => useHashRoute());
  expect(result.current).toBe('/');
});

it('follows hash changes', () => {
  const { result } = renderHook(() => useHashRoute());
  act(() => goTo('#/game'));
  expect(result.current).toBe('/game');
});
```

- [ ] **Step 5: 실패 확인**

Run: `npm run test:run -- src/app/useHashRoute.test.tsx`

Expected: `useHashRoute` 모듈이 없어 FAIL.

- [ ] **Step 6: 해시 라우팅 구현**

라우트가 홈과 게임 둘뿐이므로 라우팅 라이브러리를 쓰지 않는다.

```ts
// src/app/useHashRoute.ts
import { useEffect, useState } from 'react';

/** window.location.hash에서 앞의 # 을 떼어낸다. 비어 있으면 홈 경로로 본다. */
function readRoute(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

/** 현재 해시 경로를 반환하고 해시가 바뀌면 다시 렌더링한다. */
export function useHashRoute(): string {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
```

Run: `npm run test:run -- src/app/useHashRoute.test.tsx`

Expected: PASS.

- [ ] **Step 7: UI 문자열 사전 실패 테스트 작성**

도감·FAQ 데이터 바깥의 화면 문자열을 한 파일에 모으고, 모든 항목이 네 언어 값을
갖는지 재귀로 검사한다.

```ts
// src/i18n/strings.test.ts
import { describe, expect, it } from 'vitest';
import { locales } from '@shared/types';
import { ui } from './strings';

/** 사전을 훑어 네 언어 값을 담은 잎 노드를 경로와 함께 모은다. */
function collectLeaves(
  node: unknown,
  path: string[] = [],
): Array<[string, Record<string, unknown>]> {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return [];
  const entries = Object.entries(node as Record<string, unknown>);
  const isLeaf = entries.length > 0 && entries.every(([, v]) => typeof v === 'string');
  if (isLeaf) return [[path.join('.'), node as Record<string, unknown>]];
  return entries.flatMap(([key, value]) => collectLeaves(value, [...path, key]));
}

describe('ui strings', () => {
  it('gives every entry all four locales', () => {
    const leaves = collectLeaves(ui);
    expect(leaves.length).toBeGreaterThan(0);
    for (const [path, value] of leaves) {
      for (const locale of locales) {
        expect(typeof value[locale], `${path}.${locale}`).toBe('string');
        expect(String(value[locale]).trim(), `${path}.${locale}`).not.toBe('');
      }
    }
  });
});
```

- [ ] **Step 8: UI 문자열 사전 구현**

아는 문안만 적고 나머지 언어는 `localized()`가 자리 표시로 메운다. 화면에는
`__TODO__:ui.nav.learn.en` 형태로 그대로 보이므로 빠진 번역이 눈에 띈다.

```ts
// src/i18n/strings.ts
import { localized } from '@shared/placeholder';

export const ui = {
  nav: {
    learn:   localized('ui', 'nav.learn', { ko: '배우기' }),
    scan:    localized('ui', 'nav.scan', { ko: 'AI 스캔' }),
    catalog: localized('ui', 'nav.catalog', { ko: '도감' }),
    chat:    localized('ui', 'nav.chat', { ko: 'AI에게 묻기' }),
    game:    localized('ui', 'nav.game', { ko: '게임' }),
  },
  common: {
    language: localized('ui', 'common.language', { ko: '언어' }),
    close:    localized('ui', 'common.close', { ko: '닫기' }),
    retry:    localized('ui', 'common.retry', { ko: '다시 시도' }),
  },
};
```

이후 Task에서 화면을 만들 때 필요한 문자열을 이 사전에 계속 더한다.

Run: `npm run test:run -- src/i18n/strings.test.ts`

Expected: PASS.

- [ ] **Step 9: 헤더와 라우트 조립**

`App.tsx`가 `useHashRoute()`로 화면을 고른다. `#/`에는 학습 여정, `#/game`에는 게임
화면을 둔다.

```tsx
// src/app/App.tsx
export function App() {
  const route = useHashRoute();
  return (
    <>
      <AppHeader />
      <main>{route === '/game' ? <GamePage /> : <HomePage />}</main>
      <AppFooter />
    </>
  );
}
```

헤더 링크는 `<a href="#/game">` 형태를 그대로 쓴다. 섹션 이동은 anchor를 사용하고,
360px에서는 메뉴를 가로 스크롤 대신 접히는 메뉴로 제공한다.

- [ ] **Step 10: 스타일 토큰 구현**

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

- [ ] **Step 11: 테스트와 모바일 렌더 확인**

Run: `npm run test:run -- src/app src/i18n src/components`

Expected: PASS.

- [ ] **Step 12: 커밋**

```powershell
git add src/app src/i18n src/components src/styles src/main.tsx
git commit -m "feat: 전역 언어 상태와 해시 라우팅, UI 문자열 사전 구현"
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

- [ ] **Step 4: 이미지 없이도 정보가 읽히는지 실패 테스트 작성**

이미지 48~64장은 제작 시간이 크게 들어 범위를 개발 중에 판단한다. 그동안 화면이
깨지지 않도록 이미지를 선택 요소로 다룬다.

```tsx
// src/features/catalog/CatalogDialog.test.tsx
it('shows step text and number when the image fails to load', () => {
  render(<CatalogDialog item={catalogItems[0]} onClose={() => {}} />);
  const image = screen.getAllByRole('img')[0];
  fireEvent.error(image);

  // 이미지가 사라져도 단계 번호와 설명은 그대로 읽힌다.
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByTestId('step-01-text')).toBeInTheDocument();
});

it('hides the source link when the URL is not verified yet', () => {
  render(<CatalogDialog item={catalogItems[0]} onClose={() => {}} />);
  // sources의 url이 빈 문자열이면 링크를 만들지 않는다.
  expect(screen.queryByRole('link', { name: /환경부/ })).not.toBeInTheDocument();
});
```

- [ ] **Step 5: 카드 그리드와 상세 모달 테스트 작성 및 실패 확인**

검색 결과 수, 필터 버튼의 `aria-pressed`, 카드 선택 후 품목명·3~4개 단계·공식 출처가 표시되는지 검증한다. Escape로 닫히고 트리거에 포커스가 돌아오는지도 검증한다.

Run: `npm run test:run -- src/features/catalog`

Expected: 컴포넌트가 없어 FAIL.

- [ ] **Step 6: UI 최소 구현**

카드는 대표 단계 이미지, 이름, 카테고리, 짧은 요약을 표시한다. 상세는 모든 단계 이미지,
설명, 흔한 실수, 지역 확인 배너, 출처 링크를 표시한다.

이미지가 없을 때의 동작을 함께 구현한다.

- 단계 이미지는 `onError`로 숨기고 번호 배지와 설명 텍스트 카드만 남긴다
- 도감 카드는 대표 이미지가 없으면 카테고리 색과 품목명으로 렌더링한다
- `sources[id].url`이 빈 문자열이면 링크 대신 출처 제목만 표시한다

이미지가 한 장도 없어도 처리 순서·흔한 실수·지역 확인 안내는 모두 읽혀야 한다.

- [ ] **Step 7: 테스트 통과 확인**

Run: `npm run test:run -- src/features/catalog`

Expected: 검색·필터·모달·이미지 대체 테스트 모두 PASS.

- [ ] **Step 8: 커밋**

```powershell
git add src/features/catalog
git commit -m "feat: 도감 검색·필터·상세 모달과 이미지 대체 표시 구현"
```

- [ ] **Step 9: 이미지 에셋 적용 (범위는 진행 상황에 따라 판단)**

`docs/AI_PROCESS_AND_PROMPTS.md`의 스타일 고정 프롬프트로 각 품목의 3~4단계를 생성하고
WebP로 최적화한다. 같은 품목의 단계들은 첫 결과를 참조 이미지로 써서 물체 색·형태·
조명을 맞춘다. 원본 생성 파일은 저장소 용량을 키우지 않도록 별도 보관하고 웹 최적화본만
커밋한다.

발표 시연 경로에 실제로 등장하는 품목을 먼저 만든다
(`docs/REPORT_AND_PPT_HANDOFF.md` §11 기준: 투명 페트병, 캔, 컵라면 용기).
남은 품목은 시간이 허락하는 만큼 채우고, 없는 동안에도 Step 6의 대체 표시로 동작한다.

```powershell
git add public/images/items
git commit -m "feat: 도감 과정 이미지 추가"
```

---

### Task 6: Worker 공통 보안·Gemini 클라이언트

**Files:**
- Create: `wrangler.jsonc`, `worker/src/env.ts`, `worker/src/security.ts`, `worker/src/gemini.ts`, `worker/src/index.ts`
- Create: `worker/test/security.test.ts`, `worker/test/index.test.ts`, `worker/test/gemini.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `callGemini<T>(opts: { apiKey: string; systemInstruction: string; parts: GeminiPart[]; schema: z.ZodType<T>; timeoutMs: number }): Promise<T>`
- Produces: `type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } }`
- Produces: `toGeminiSchema(schema: z.ZodType<unknown>): Record<string, unknown>`
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

- [ ] **Step 4: Gemini 공통 호출 구현**

Zod 스키마 하나를 두 곳에 쓴다. `responseSchema`로 넘겨 모델이 형식을 지키게 하고,
같은 스키마의 `parse()`로 응답을 다시 검증한다. 챗봇과 스캐너가 이 함수를 함께 쓴다.

```ts
// worker/src/gemini.ts
import { z } from 'zod';

const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/** Zod 스키마를 Gemini가 받는 JSON Schema로 바꾼다. */
export function toGeminiSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
  return stripUnsupported(z.toJSONSchema(schema));
}

/** Gemini가 지원하지 않는 JSON Schema 키를 재귀적으로 걷어낸다. */
function stripUnsupported(node: unknown): Record<string, unknown> {
  if (Array.isArray(node)) return node.map(stripUnsupported) as never;
  if (!node || typeof node !== 'object') return node as never;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === '$schema' || key === 'additionalProperties' || key === '$ref') continue;
    out[key] = typeof value === 'object' && value !== null ? stripUnsupported(value) : value;
  }
  return out;
}

/** 구조화된 JSON 응답을 요구하고 Zod로 검증해 반환한다. */
export async function callGemini<T>(opts: {
  apiKey: string;
  systemInstruction: string;
  parts: GeminiPart[];
  schema: z.ZodType<T>;
  timeoutMs: number;
}): Promise<T> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'x-goog-api-key': opts.apiKey, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(opts.timeoutMs),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.systemInstruction }] },
      contents: [{ role: 'user', parts: opts.parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(opts.schema),
      },
    }),
  });

  if (!response.ok) throw new Error(`gemini_http_${response.status}`);

  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('gemini_empty_response');

  return opts.schema.parse(JSON.parse(text));
}
```

프롬프트, 요청 본문, 모델 응답 본문은 로그에 출력하지 않는다.

- [ ] **Step 5: 스키마 변환 실패 테스트 작성**

`z.toJSONSchema()`의 출력이 Gemini가 받는 형태와 맞는지 확인한다.

```ts
// worker/test/gemini.test.ts
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { toGeminiSchema } from '../src/gemini';

describe('toGeminiSchema', () => {
  it('drops keys Gemini does not accept', () => {
    const schema = z.object({ answer: z.string(), count: z.number() });
    const json = JSON.stringify(toGeminiSchema(schema));
    expect(json).not.toContain('$schema');
    expect(json).not.toContain('additionalProperties');
  });

  it('keeps the property shape', () => {
    const result = toGeminiSchema(z.object({ answer: z.string() }));
    expect(result.type).toBe('object');
    expect(result.properties).toMatchObject({ answer: { type: 'string' } });
  });
});
```

- [ ] **Step 6: 실제 호출로 스키마 호환 확인**

`.dev.vars`에 실제 키를 넣고 Worker를 띄운 뒤 한 번 호출해 본다.

```powershell
npm run worker:dev
```

Expected: 구조화된 JSON이 돌아오고 Zod 검증을 통과한다.

`400 INVALID_ARGUMENT`가 나면 응답 본문의 오류 메시지에서 문제가 되는 키 이름을 찾아
`stripUnsupported`의 제외 목록에 추가한다. Zod 스키마가 단일 출처라는 구조는 그대로 둔다.

- [ ] **Step 7: CORS·오류 테스트 통과**

Run: `npm run worker:test`

Expected: PASS.

- [ ] **Step 8: 커밋**

```powershell
git add wrangler.jsonc worker .gitignore
git commit -m "feat: Worker 보안 검증과 Gemini 공통 호출 구현"
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
- Consumes: `callGemini` from `worker/src/gemini.ts` (Task 6)

- [ ] **Step 1: Worker 채팅 계약 실패 테스트 작성**

500자를 넘는 입력은 400, 7개 history는 마지막 6개만 사용, 범위 밖 모델 응답은 `out_of_scope`, 등록되지 않은 source ID는 제거되는지 검증한다.

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- worker/test/chat.test.ts`

Expected: route가 없어 FAIL.

- [ ] **Step 3: 시스템 프롬프트와 구조화 출력 구현**

`docs/AI_PROCESS_AND_PROMPTS.md`의 `Gemini 챗봇 시스템 프롬프트`를 그대로 코드 상수로 옮긴다. 전체 검수 지식을 compact JSON으로 제공하고 모델 응답의 item/source ID를 허용 목록과 교차 검증한다.

Task 6의 공통 함수를 그대로 쓴다.

```ts
// worker/src/chat.ts
const answer = await callGemini({
  apiKey: env.GEMINI_API_KEY,
  systemInstruction: CHAT_SYSTEM_PROMPT,
  parts: [{ text: buildChatInput(request, approvedKnowledge) }],
  schema: chatResponseSchema,
  timeoutMs: 10_000,
});
```

`callGemini`가 이미 Zod로 검증하므로, 여기서는 허용 목록에 없는 item/source ID를
걸러내는 교차 검증만 추가한다. 자리 표시(`__TODO__`)가 남은 문안은 검수 지식에서
제외해 모델이 인용하지 않게 한다.

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
- Consumes: `callGemini`, `GeminiPart` from `worker/src/gemini.ts` (Task 6)

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

이미지는 Task 6의 `GeminiPart` 중 `inlineData` 형태로 넘긴다. 텍스트 호출과 같은 함수를 쓴다.

```ts
// worker/src/scan.ts
const detected = await callGemini({
  apiKey: env.GEMINI_API_KEY,
  systemInstruction: SCAN_SYSTEM_PROMPT,
  parts: [
    { text: buildScanInput(locale, approvedItemIds) },
    { inlineData: { mimeType: file.type, data: base64Image } },
  ],
  schema: scanResponseSchema,
  timeoutMs: 15_000,
});
```

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

### Task 11: Worker 배포와 운영 환경 연결

프런트의 GitHub Pages 배포는 Task 1에서 이미 동작한다. 여기서는 Worker를 올리고
운영 주소끼리 연결해 실제 AI 기능이 배포본에서 도는지 확인한다.

**Files:**
- Modify: `README.md`, `wrangler.jsonc`
- Test: `vite.config.test.ts`

**Interfaces:**
- Consumes: GitHub repository variable `VITE_API_BASE_URL`
- Consumes: `https://kodol05.github.io/make-upload/` (Task 1에서 만든 배포)
- Produces: Cloudflare Worker 운영 URL

- [ ] **Step 1: 배포 base 회귀 테스트 작성**

Task 1에서 맞춰 둔 base 경로가 나중에 깨지지 않도록 잠근다.

```ts
// vite.config.test.ts
import { describe, expect, it } from 'vitest';
import config from './vite.config';

describe('vite config', () => {
  it('serves from the GitHub Pages subpath', () => {
    expect(config.base).toBe('/make-upload/');
  });
});
```

Run: `npm run test:run -- vite.config.test.ts`

Expected: PASS.

- [ ] **Step 2: Worker secret 설정과 배포**

```powershell
npx wrangler secret put GEMINI_API_KEY
npm run worker:deploy
```

API 키 값은 문서, 스크린샷, shell history에 복사하지 않는다.

- [ ] **Step 3: 운영 주소 연결**

출력된 Worker URL을 GitHub repository variable `VITE_API_BASE_URL`에 저장한다.

```powershell
gh variable set VITE_API_BASE_URL --body "https://k-sort-api.<계정>.workers.dev"
```

`wrangler.jsonc`의 `ALLOWED_ORIGIN`이 `https://kodol05.github.io`인지 확인한다.

- [ ] **Step 4: 변수 적용을 위한 재배포**

`VITE_API_BASE_URL`은 빌드 시점에 주입되므로 변수를 넣은 뒤 한 번 더 배포해야 한다.

```powershell
gh workflow run deploy-pages.yml
gh run watch
```

Expected: workflow 성공.

- [ ] **Step 5: 운영 smoke test**

배포 URL에서 네 언어 전환, 영상 metadata 로드, 도감 상세, 실제 채팅 1회, 실제 스캔 1회,
게임 진입을 확인한다. 개발자 도구 Network 탭에서 요청이 Worker 주소로 가는지,
Gemini 키가 번들과 응답 어디에도 없는지 검색한다.

CORS 오류가 나면 `ALLOWED_ORIGIN`과 실제 Pages origin이 정확히 같은지 확인한다.

- [ ] **Step 6: 커밋**

```powershell
git add README.md wrangler.jsonc vite.config.test.ts
git commit -m "ci: Worker 배포와 운영 주소 연결"
```

---

### Task 12: 최종 검증·증거 수집·발표 동결

**Files:**
- Modify: `docs/REPORT_AND_PPT_HANDOFF.md`, `README.md`
- Add: `docs/evidence/README.md`와 선택한 압축 스크린샷

**Interfaces:**
- Produces: 보고서/PPT용 검증 증거와 재현 가능한 릴리스 상태

- [ ] **Step 1: 자리 표시 릴리스 게이트 켜기**

`shared/content-progress.test.ts`의 두 `it.skip`에서 `.skip`을 떼어 활성화한다.

```ts
it('has no placeholder left before release', () => { /* ... */ });
it('has a verified URL for every source', () => { /* ... */ });
```

Run: `npm run test:run -- shared/content-progress.test.ts`

Expected: PASS. 실패하면 출력된 자리 표시 목록을 박재웅에게 전달해 문안을 받는다.
남은 항목은 다음 명령으로도 확인할 수 있다.

```powershell
git grep -n "__TODO__" -- shared src
```

`src/i18n/strings.ts`의 UI 문자열에도 자리 표시가 남아 있지 않은지 함께 확인한다.

- [ ] **Step 2: 전체 자동 검증**

Run: `npm run check`

Expected: lint, 모든 테스트, production build PASS.

- [ ] **Step 3: 고정 시나리오 수동 검증**

단일 품목 사진 5장, 다중 품목 사진 2장, 모호한 사진 1장과 FAQ 20개 × 4언어를 검증한다. 결과는 `docs/REPORT_AND_PPT_HANDOFF.md`의 검증표에 날짜와 성공/실패로 기록한다.

- [ ] **Step 4: 360px·데스크톱 화면 캡처**

홈, 영상, AI 스캔 박스, 도감 단계, 챗봇 출처, 게임 결과, 언어 전환 전후 화면을 캡처한다. 개인정보와 API 키가 보이는 화면은 저장하지 않는다.

- [ ] **Step 5: 5분 발표 3회 리허설**

각 리허설에서 총 시간, API 응답 시간, 실패 지점을 기록한다. 발표용 샘플 사진과 질문은 마지막 성공 리허설 후 변경하지 않는다.

- [ ] **Step 6: 최종 secret 검색**

Run: `git grep -n -I -E "AIza|GEMINI_API_KEY=|api[_-]?key['\"]?\s*[:=]\s*['\"][^'\"]+"`

Expected: 실제 키 값 0건. 환경변수 이름과 문서 설명만 허용.

- [ ] **Step 7: 릴리스 커밋과 태그**

```powershell
git add README.md docs
git commit -m "docs: 해커톤 제출본 문서 정리"
git tag -a hackathon-demo-v1 -m "K-SORT hackathon demo v1"
git push origin main --tags
```

---

## Completion Definition

- `npm run check`가 통과한다.
- `git grep "__TODO__" -- shared src`가 아무것도 찾지 못한다. 모든 출처 URL이 `https://`로 시작한다.
- GitHub Pages에서 360px와 데스크톱 모두 전체 여정을 완료한다.
- 전역 언어 선택이 영상 자막, 앱, 도감, AI 응답, 게임에 적용된다.
- 16개 품목에 검수된 네 언어 콘텐츠가 있다. 과정 이미지가 없는 품목도 처리 순서·흔한 실수·
  출처가 온전히 읽힌다.
- Worker는 허용 origin, 입력 크기, rate limit, timeout, Zod 응답 검증을 적용한다.
- Gemini 키와 사용자 입력이 저장소·브라우저 번들·로그에 없다.
- 브라우저 번들에 Zod가 포함되지 않는다.
- 고정 데모 스캔과 질문이 리허설 3회에서 연속 성공한다.
- 보고서와 PPT 담당자가 `docs/REPORT_AND_PPT_HANDOFF.md`와 `docs/AI_PROCESS_AND_PROMPTS.md`만으로 제작 과정과 AI 사용 근거를 재구성할 수 있다.
