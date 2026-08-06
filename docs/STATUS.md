# STATUS — 지금 진실

> 이 파일은 **덮어쓰기**로 유지된다. 세션 종료 시 갱신.
> 현재는 김현민 개발 진행 상황만 추적한다.

**마지막 갱신**: 2026-08-06 · 현민

## 현재 단계

- **큰 마일스톤**: Task 3 완료. 네 언어 전환과 해시 라우팅이 도는 앱 껍데기가 배포되어 있다.
- **배포 URL**: <https://kodol05.github.io/make-upload/>
- **진행 중 Task**: 없음 (Task 4 대기)
- **Blocker**: 없음. 콘텐츠 미검수 상태에서도 개발이 진행된다.

## 지금 · 다음

| 지금 | 다음 |
|------|------|
| Task 3 완료 (언어·라우팅·셸) | Task 4: 교육 영상과 4대 원칙 |

Task 4는 영상 파일과 자막이 필요하다. 아직 없으므로 영상 오류 대체 UI를 먼저 만들고
파일이 도착하면 연결한다. 필요한 파일명은 아래와 같다.

```
public/media/k-sort-guide.mp4    public/media/poster.webp
public/subtitles/{ko,en,zh,vi}.vtt
```

## 콘텐츠 진행률

```
자리 표시 756개 남음 · 출처 URL 0/5개 확인됨
```

`npm run test:run -- shared/content-progress.test.ts`를 돌리면 현재 수치가 나온다.
남은 항목은 `git grep "__TODO__" -- shared`로 확인한다.

| 묶음 | 남은 개수 |
|------|---:|
| 품목 이름·요약·흔한 실수 | 176 |
| 처리 단계 설명·대체 텍스트 | 400 |
| FAQ 질문·답변 | 160 |
| 출처 제목 | 20 |

그 외에 출처 URL 5개와 FAQ 20개의 `sourceIds`가 비어 있다.

## 확정된 환경

```
node 24.16.0 · npm 11.13.0
react 19.2.8 · vite 8.2.0 · typescript 6.0.3 · zod 4.4.3
vitest 4.1.10 · eslint 10.8.0 · wrangler 4.119.0
```

`npm run check` (lint + test + build) 통과 상태. main에 병합하면 Pages로 자동 배포된다.

## 인터페이스 계약 (병렬 작업용)

**확정됨.** 아래 이름과 형태는 Task 3 이후가 의존하므로 바꿀 때 여기를 먼저 고친다.

```ts
// shared/types.ts
locales / itemIds / categories        // as const 배열. 순회와 Zod enum에 함께 쓴다
Locale = 'ko' | 'en' | 'zh' | 'vi'
LocalizedText = Record<Locale, string>
Category = 'recyclable' | 'food' | 'general' | 'special'
ItemId = 16종 고정 유니온
CatalogStep  { id, image, text, alt }
CatalogItem  { id, category, name, aliases, summary, steps, commonMistake, needsLocalCheck, sourceIds }
Faq          { id, question, answer, relatedItemIds, sourceIds }
Source       { title, url }           // url이 빈 문자열이면 UI가 링크를 만들지 않는다
GameResult   { score, learnedItemIds }
ChatRequest / ChatResponse / ScanObject / ScanResponse

// shared/placeholder.ts
todo(itemId, field, locale)        → '__TODO__:clear-pet.summary.vi'
localized(itemId, field, values)   → LocalizedText   // 빠진 언어를 자리 표시로 메움
isTodo(value) / findTodos(value) / countTodos(value)

// shared/schemas.ts  ← Worker만 import한다. 프런트가 가져오면 Zod가 번들에 들어간다
chatRequestSchema / chatResponseSchema / scanResponseSchema
localeSchema / itemIdSchema
```

```ts
// src/app  ← Task 3에서 확정
useLocale()      → { locale, setLocale, t }   // t(LocalizedText) → string
useHashRoute()   → string                     // '/' 또는 '/game'
LocaleProvider   // localStorage 키는 'k-sort-locale'
                 // context는 localeContext.ts에 따로 둔다 (Fast Refresh)

// src/i18n/strings.ts  ← 화면 문자열은 전부 여기에 더한다
ui.nav.{learn,scan,catalog,chat,game}
ui.common.{language,close,retry,skipToContent}
ui.home.intro / ui.game.{title,backToHome}
```

Task 5의 도감 검색은 `aliases`를 쓴다. 현재 한국어 별칭만 채워져 있고
영어·중국어·베트남어 배열은 비어 있으므로, 그 언어의 별칭 검색 테스트는
번역이 도착한 뒤에 켠다.

`HomeRoute`와 `GameRoute`는 `src/app/App.tsx` 안의 최소 구현이다.
Task 4가 영상 섹션을, Task 9가 실제 게임을 각각 여기에 붙인다.

## 다음 액션 (우선순위)

1. Task 4: 영상과 4대 원칙 (에셋 없이 대체 UI부터)
2. Task 5: 16종 도감 검색·필터·상세

## 최근 결정 · 변경

- 2026-08-06 · Task 3 완료. 언어 전환·해시 라우팅·UI 문자열 사전 (PR #9)
- 2026-08-06 · Task 2 완료. 자리 표시로 콘텐츠 대기 없이 개발 가능 (PR #7)
- 2026-08-06 · Task 1 완료. Pages 배포까지 확인 (PR #5)
- 2026-08-06 · 스택 결정을 구현 계획·설계에 반영 (PR #4)
- 2026-08-06 · 기술 스택 확정: TypeScript 6 고정, generateContent, 해시 라우팅 직접 구현 (PR #3)
- 2026-08-06 · CLAUDE.md/STATUS.md/worklog.md 3종 세트 도입 (PR #2)
- 2026-08-06 · AI Sort Scan을 선택적 진입점, 도감을 K-SORT 정보 창으로 성격 재정의 (PR #1)

## Task 1에서 실제로 막혔던 것

다음 사람이 같은 곳에서 시간을 쓰지 않도록 남긴다.

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| eslint가 설정을 거부 | `reactHooks.configs['recommended-latest']`는 eslintrc 형식 | flat config는 `configs.flat['recommended-latest']` |
| `TS5101 baseUrl deprecated` | TypeScript 6가 `baseUrl` 폐기 예고 | `baseUrl` 제거 + `paths`를 `./` 상대 경로로 |
| React 타입을 못 찾음 | 설치 명령에 타입 패키지 누락 | `@types/react` `@types/react-dom` `@types/node` 추가 |
