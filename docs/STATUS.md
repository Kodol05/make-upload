# STATUS — 지금 진실

> 이 파일은 **덮어쓰기**로 유지된다. 세션 종료 시 갱신.
> 현재는 김현민 개발 진행 상황만 추적한다.

**마지막 갱신**: 2026-08-06 · 현민

## 현재 단계

- **큰 마일스톤**: Task 1 완료. 앱이 GitHub Pages에서 동작한다.
- **배포 URL**: <https://kodol05.github.io/make-upload/>
- **진행 중 Task**: 없음 (Task 2 대기)
- **Blocker**: 없음

## 지금 · 다음

| 지금 | 다음 |
|------|------|
| Task 1 완료 (기반 + 배포) | Task 2: 공용 타입·자리 표시·콘텐츠 골격 |

## 확정된 환경

```
node 24.16.0 · npm 11.13.0
react 19.2.8 · vite 8.2.0 · typescript 6.0.3 · zod 4.4.3
vitest 4.1.10 · eslint 10.8.0 · wrangler 4.119.0
```

`npm run check` (lint + test + build) 통과 상태. main에 병합하면 Pages로 자동 배포된다.

## 인터페이스 계약 (병렬 작업용)

현재 확정된 것은 없다. 첫 계약은 Task 2의 `shared/types.ts`다.
아래 이름을 미리 못 박아 두었으니 Task 2에서 이대로 만든다.

```ts
// shared/types.ts
Locale = 'ko' | 'en' | 'zh' | 'vi'
LocalizedText = Record<Locale, string>
Category = 'recyclable' | 'food' | 'general' | 'special'
ItemId = 16종 고정 문자열 유니온
CatalogItem { id, category, name, aliases, summary, steps, commonMistake, needsLocalCheck, sourceIds }

// shared/placeholder.ts
todo(itemId, field, locale) → '__TODO__:clear-pet.summary.vi'
localized(itemId, field, values) → LocalizedText  // 빠진 언어를 자리 표시로 메움
findTodos(value) / countTodos(value)
```

## 다음 액션 (우선순위)

1. Task 2: `shared/types.ts`, `placeholder.ts`, `catalog.ts` 골격
2. Task 3: 언어 상태, `useHashRoute`, `src/i18n/strings.ts`

## 최근 결정 · 변경

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
