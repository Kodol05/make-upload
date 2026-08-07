# K-SORT 기술 스택 확정과 구현 설계

> **당시 기록이다.** 이 문서는 만들기 전에 정한 것을 적어 둔 것이고, 그 뒤로 바뀐 것이
> 있다. 대표적으로 API가 Cloudflare Worker에서 **Vercel Functions**로, 모델이
> `gemini-3.6-flash`에서 **`gemini-3.5-flash-lite`**로 바뀌었고, 품목 이미지는 품목당
> 3~4장에서 **1장**으로 줄었다. 지금 상태는 [STATUS](../../STATUS.md)와
> [README](../../../README.md)를 보라.
>
> 본문은 고치지 않는다. 무엇을 정하고 시작했는지가 남아 있어야 무엇이 왜 바뀌었는지도
> 설명할 수 있다.

구현 착수(Task 1) 직전에 기존 설계·구현 계획의 스택 항목을 실제 패키지 상태와 대조해
검증하고, 확정한 결정을 기록한다. 이 문서는
[제품 설계](2026-08-06-k-sort-design.md)와
[구현 계획](../plans/2026-08-06-k-sort-implementation.md)을 보완하며,
두 문서와 어긋나는 항목은 §9에 정리한다.

작성: 2026-08-06 · 김현민

## 1. 사실 검증 결과

구현 계획에 적힌 외부 의존 항목을 공식 문서와 npm 레지스트리로 확인했다.

| 항목 | 계획 내용 | 검증 결과 |
| --- | --- | --- |
| Gemini 모델 | `gemini-3.6-flash` | 실재. 2026-07-21 정식 출시 |
| Gemini 엔드포인트 | `/v1beta/interactions` | 실재하나 K-SORT에는 과함 (§3) |
| Cloudflare rate limit | `ratelimits` + `namespace_id` | 형식 정확. Wrangler 4.36 이상 필요 |
| 구조화 출력 | Zod 재검증 | `responseSchema`로 모델 단계에서도 강제 가능 (§4) |
| TypeScript | 버전 미지정 | **미지정 시 lint가 깨진다** (§2) |

확인 시점의 최신 버전은 다음과 같다.

```
react 19.2.8   vite 8.2.0     vitest 4.1.10   zod 4.4.3
eslint 10.8.0  wrangler 4.119.0   typescript 7.0.2   typescript-eslint 8.66.0
@vitejs/plugin-react 6.0.5   @testing-library/react 16.3.2   jsdom 30.0.1
```

로컬 개발 환경은 Node v24.16.0, npm 11.13.0이다. Node 24는 현재 Active LTS이며
구현 계획의 "Node 22 이상" 조건을 만족한다.

## 2. TypeScript 버전 고정

**`typescript@~6.0.3`을 명시적으로 설치한다.**

TypeScript 7.0은 컴파일러를 Go로 재작성한 판으로 2026-07-08에 정식 출시되어
npm `latest` 태그를 차지하고 있다. 그러나 7.0에는 안정적인 프로그래매틱 API가 없어
typescript-eslint를 비롯한 도구가 아직 사용하지 못한다. typescript-eslint 8.66.0이
선언한 peer 범위는 `typescript >=4.8.4 <6.1.0`이다.

따라서 구현 계획 Task 1의 설치 명령을 그대로 실행하면 TypeScript 7.0.2가 설치되고
`npm run lint`가 실패한다. `npm run check`가 lint·test·build를 함께 돌리므로
품질 검증 전체가 막힌다.

안정적인 프로그래매틱 API는 TypeScript 7.1에 포함될 예정이다. 그때 typescript-eslint가
지원 범위를 넓히면 상향한다.

## 3. Gemini 호출 방식

**Interactions API 대신 `generateContent`를 사용한다.**

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent
```

Interactions API는 상태를 유지하는 대화, 에이전트, 도구 호출, 실행 중 개입 같은
기능을 제공한다. K-SORT는 이 중 어느 것도 쓰지 않는다.

- 대화 이력은 브라우저 메모리에 최근 6개만 유지하고 서버에 저장하지 않는다
- 도구 호출과 에이전트를 사용하지 않는다
- 사용자 사진과 대화 원문을 저장하지 않는 것이 제품 원칙이다

반면 응답 구조는 Interactions 쪽이 더 복잡하다. `generateContent`는
`candidates[0].content.parts[0].text` 한 곳에서 결과를 꺼내지만, Interactions는
`steps` 배열을 순회해 모델 출력을 찾아야 한다. Interactions API는 2026년 5월에
스키마를 바꾸는 변경이 있었고 이전 스키마는 6월 8일에 제거되어, 참고 자료가
두 형태로 섞여 있는 점도 24시간 일정에서는 부담이다.

## 4. Zod 스키마 단일화

Zod 스키마를 한 번만 정의하고 두 곳에 쓴다.

1. `z.toJSONSchema()`로 JSON Schema를 파생해 `responseSchema`로 전달한다.
   모델이 형식을 지키도록 생성 단계에서 강제한다.
2. 같은 스키마의 `parse()`로 응답을 다시 검증한다. 모델이 형식을 어기거나
   등록되지 않은 ID를 반환하면 Worker가 차단한다.

챗봇과 스캐너가 공용 함수 하나를 쓴다.

```ts
// worker/src/gemini.ts
export async function callGemini<T>(opts: {
  systemInstruction: string;
  parts: Part[];          // 텍스트 또는 inlineData 이미지
  schema: z.ZodType<T>;
  timeoutMs: number;
}): Promise<T>;
```

`chat.ts`와 `scan.ts`는 각각 시스템 프롬프트와 Zod 스키마만 넘긴다. 스캐너는
이미지를 `parts`에 `inlineData`로 담으므로 별도 경로가 필요 없다.

**대비할 위험:** `z.toJSONSchema()`가 만드는 JSON Schema에는 Gemini가 받는
OpenAPI 부분집합에 없는 키(`$schema`, `additionalProperties` 등)가 섞일 수 있다.
Task 6에서 실제 호출로 확인하고, 맞지 않으면 불필요한 키를 걸러내는
`toGeminiSchema()` 어댑터를 한 겹 넣는다. Zod 스키마가 단일 출처라는 구조는 유지된다.

## 5. 의존성 확정

### 실행 의존성

| 패키지 | 실행 위치 | 브라우저 번들 포함 |
| --- | --- | --- |
| `react` `react-dom` | 브라우저 | 포함 |
| `zod` | Cloudflare Worker | 미포함 |

`zod`는 `shared/schemas.ts`에서만 쓰고 이 파일은 Worker만 가져온다. 프런트가 가져오는
것은 타입 선언인 `shared/types.ts`, 데이터인 `shared/catalog.ts`·`faqs.ts`·`sources.ts`,
그리고 Zod에 의존하지 않는 `shared/placeholder.ts`뿐이므로 Zod는 브라우저 번들에
들어가지 않는다. Worker가 이미 응답을 검증하고 예상 밖의 값은 기능별 오류 경계가
처리하므로 프런트에서 다시 검증하지 않는다.

### 개발 의존성

```
typescript@~6.0.3   vite   @vitejs/plugin-react
vitest   jsdom   @testing-library/react   @testing-library/jest-dom   @testing-library/user-event
eslint   @eslint/js   typescript-eslint   eslint-plugin-react-hooks   globals
wrangler
```

`@vitejs/plugin-react`가 선언한 `@rolldown/plugin-babel`과
`babel-plugin-react-compiler`는 선택 peer이므로 설치하지 않는다.

### 라우팅에서 제거

**`react-router-dom`을 사용하지 않는다.** 제품 설계의 라우트는 홈 `#/`와 게임 `#/game`
둘뿐이고 품목 상세는 라우트가 아니라 모달이다. 라우트 두 개를 위해 라이브러리를
넣는 대신 `src/app/useHashRoute.ts`에 훅 하나를 직접 둔다.

```ts
// 현재 해시 경로를 반환한다. 해시가 없으면 '/'로 본다.
export function useHashRoute(): string;
```

링크는 `<a href="#/game">`을 그대로 쓴다. 테스트는 `window.location.hash`를 바꾸고
`hashchange` 이벤트를 보내면 된다.

## 6. 콘텐츠 자리 표시

구현 계획 Task 2의 콘텐츠 검사는 16종 × 4언어 × 3필드, 즉 192개 문자열이 모두
채워져야 통과한다. 이 문안은 박재웅의 사실 검수와 번역 검수를 거쳐 나오므로,
그대로 두면 Task 2에서 개발이 멈추고 이후 Task가 모두 대기한다.

자리 표시 문자열로 이 의존을 끊는다.

```ts
// shared/placeholder.ts
export const TODO = '__TODO__';

/** 아직 채우지 못한 자리를 만든다. 예: __TODO__:clear-pet.summary.vi */
export function todo(itemId: string, field: string, locale: Locale): string;

/** 자리 표시 문자열인지 확인한다. */
export function isTodo(value: string): boolean;

/** 주어진 언어만 채우고 나머지는 자리 표시로 메운다. */
export function localized(
  itemId: string,
  field: string,
  values: Partial<LocalizedText>,
): LocalizedText;
```

카탈로그 항목은 아는 값만 적는다. 번역이 오면 객체에 키만 더하므로 구조를 바꿀 일이 없다.

```ts
name:    localized('clear-pet', 'name', { ko: '투명 페트병' }),
summary: localized('clear-pet', 'summary', {}),
```

검사는 세 층으로 나눈다. 테스트 주도 순서는 그대로 지키면서 콘텐츠 대기를 없앤다.

| 층 | 파일 | 언제 통과해야 하나 |
| --- | --- | --- |
| 구조 | `shared/content.test.ts` | Task 2부터 항상 |
| 진행률 | `shared/content-progress.test.ts` | 항상 통과. 남은 자리 수를 출력만 한다 |
| 릴리스 게이트 | 같은 파일의 `it.skip` | 마감 전 `.skip`을 떼고 자리 표시 0개를 확인 |

자리 표시는 화면에 `__TODO__:clear-pet.summary.vi` 형태로 그대로 보이므로 눈에 띈다.
`git grep __TODO__` 한 번으로 남은 항목을 모두 찾을 수 있다.

## 7. UI 문자열 다국어

도감·FAQ 데이터 바깥의 화면 문자열은 `src/i18n/strings.ts` 한 파일에 모은다.
분량은 60~100개 정도로 추정되며 이 역시 네 언어 값을 갖는다.

```ts
export const ui = {
  nav:     { catalog: { ko: '도감', en: 'Catalog', zh: '图鉴', vi: 'Danh mục' } },
  scanner: { privacy: { ko: '사진은 저장되지 않아요', /* ... */ } },
} as const;
```

사용은 구현 계획이 정한 `t(LocalizedText)` 시그니처를 그대로 따른다. 한 파일에 모으면
박재웅이 번역할 때 파일 하나만 보면 되고, 모든 잎 노드가 네 언어 값을 갖는지
재귀 검사로 강제할 수 있다. 아직 못 채운 값에는 §6의 자리 표시를 쓴다.

이 분량은 콘텐츠·에셋 체크리스트에 항목이 없으므로 추가해야 한다(§9).

## 8. 이미지 없이도 동작하는 도감

도감 이미지는 16종 × 3~4단계로 48~64장이 필요하며 제작 시간이 크게 든다.
제작 범위는 개발을 진행하며 판단하기로 했다. 그동안 화면이 깨지지 않도록
이미지를 선택 요소로 다룬다.

- 단계 이미지는 로드 실패 시 번호 배지와 단계 설명 텍스트 카드로 대체한다
- 도감 카드는 대표 이미지가 없으면 카테고리 색과 품목명으로 렌더링한다
- 이미지가 한 장도 없어도 처리 순서·흔한 실수·지역 확인 안내·공식 출처는 모두 읽힌다

이는 제품 설계 §4의 "한 기능의 오류가 나머지 기능을 막지 않는다"를 이미지 자산으로
확장한 것이다. Learn·Catalog·Scanner·Chat·Game은 각각 독립된 오류 경계 안에 둔다.

## 9. 기존 문서에 반영할 변경

| 대상 | 위치 | 변경 |
| --- | --- | --- |
| 제품 설계 | §3 Worker | Gemini 호출을 `generateContent`로 |
| 제품 설계 | §3 저장소 구성 | `src/i18n/`, `shared/placeholder.ts` 추가 |
| 구현 계획 | Task 1 | `typescript@~6.0.3` 고정, `react-router-dom` 제거 |
| 구현 계획 | Task 1 이후 | 배포 확인 Task 신설 (§10) |
| 구현 계획 | Task 2 | 자리 표시 도입, 콘텐츠 검사 3층 분리 |
| 구현 계획 | Task 3 | `useHashRoute`로 라우팅, `src/i18n/strings.ts` 신설 |
| 구현 계획 | Task 5 | 이미지 없을 때의 대체 렌더링 |
| 구현 계획 | Task 6 | `generateContent` 호출과 `toGeminiSchema` 대비 |
| 구현 계획 | Task 11 | 프런트 배포가 앞으로 옮겨간 만큼 축소 |
| 콘텐츠 체크리스트 | 전체 | UI 문자열 60~100개 항목 추가 |

## 10. 배포 순서

구현 계획 Task 11을 둘로 나눈다.

1. **Task 1 직후:** GitHub Pages workflow와 Vite base 경로만 설정하고 빈 앱을 배포한다.
   base 경로, Actions 권한, Pages 설정 문제를 잃을 것이 없는 시점에 확인한다.
2. **기존 Task 11 자리:** Worker secret 등록과 배포, 운영 환경 통합 확인을 진행한다.

이후 배포는 main 브랜치에 병합될 때 자동으로 실행된다. 기능 개발은 브랜치에서
진행하므로 배포 실행 자체가 잦지 않으며, 결과 확인은 필요할 때만 한다.

## 11. 확정한 사항 요약

| 항목 | 결정 |
| --- | --- |
| TypeScript | `~6.0.3` 고정. 7.x는 typescript-eslint 미지원 |
| Gemini | `:generateContent` |
| 구조화 출력 | Zod 스키마 하나에서 `responseSchema` 파생 + 응답 재검증 |
| 라우팅 | `useHashRoute` 직접 구현. `react-router-dom` 제외 |
| Zod 배치 | Worker 전용. 브라우저 번들 미포함 |
| 스타일 | 일반 CSS + `tokens.css` (구현 계획 원안 유지) |
| 코딩 AI | Claude Code 단독 |
| 테스트 | 구현 계획의 테스트 주도 순서를 모두 유지 |
| 콘텐츠 | `__TODO__` 자리 표시로 개발과 검수를 분리 |
| UI 문자열 | `src/i18n/strings.ts` 단일 사전 |
| 도감 이미지 | 제작 범위는 추후 판단. 없어도 동작하게 구현 |
| 첫 배포 | Task 1 직후 |

## 12. 아직 정하지 않은 것

- 게임 내부 설계. 학습 도구 성격과 "처리 과정이 필요한 품목은 퀴즈를 통과해야
  배출할 수 있다"는 골격까지 정했고 세부는 별도로 진행한다.
- 도감 단계 이미지의 제작 범위와 우선순위.
- `z.toJSONSchema()` 출력이 Gemini 스키마와 맞는지 여부. Task 6에서 확인한다.
