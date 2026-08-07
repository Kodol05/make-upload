# K-SORT 다국어 AI 분리배출 교육 웹앱 설계

> **당시 기록이다.** 이 문서는 만들기 전에 정한 것을 적어 둔 것이고, 그 뒤로 바뀐 것이
> 있다. 대표적으로 API가 Cloudflare Worker에서 **Vercel Functions**로, 모델이
> `gemini-3.6-flash`에서 **`gemini-3.5-flash-lite`**로 바뀌었고, 품목 이미지는 품목당
> 3~4장에서 **1장**으로 줄었다. 지금 상태는 [STATUS](../../STATUS.md)와
> [README](../../../README.md)를 보라.
>
> 본문은 고치지 않는다. 무엇을 정하고 시작했는지가 남아 있어야 무엇이 왜 바뀌었는지도
> 설명할 수 있다.

## 1. 제품 정의

K-SORT는 명지전문대 유학생이 한국의 분리배출 원칙을 빠르게 익히고 실제 생활에서 적용하도록 돕는 모바일 우선 웹앱이다. 사용자는 2분 교육 영상으로 핵심 원칙을 배우고, 사진 속 쓰레기를 AI로 인식하고, 16종 과정형 도감과 근거 기반 챗봇으로 처리법을 확인한 뒤 게임으로 복습한다.

핵심 사용자 여정은 다음과 같다.

1. **배우기:** 2분 영상과 4대 원칙으로 분리배출의 기본을 이해한다.
2. **AI Sort Scan:** 이름을 모르는 쓰레기는 사진을 찍어 AI가 도감 후보로 연결한다. 필수 단계가 아닌 선택적 검색 경로다.
3. **과정형 도감:** 16종 품목의 처리 순서·흔한 실수·공식 출처를 이미지와 설명으로 확인하는 K-SORT의 정보 창이다. 카테고리 필터, 텍스트 검색, 스캔 결과 링크 세 가지로 진입한다.
4. **AI에게 묻기:** 검수된 지식 범위에서 추가 질문을 한다.
5. **게임:** 학습한 내용을 게임으로 복습한다.

서비스는 일반적인 한국 생활의 분리배출을 다루며, 첫 화면과 푸터에 `Made for international students at Myongji College`와 팀 `Make Upload`를 표시한다.

### 목표

- 사용자가 5분 안에 핵심 원칙을 이해하고 한 품목의 처리 방법을 찾을 수 있게 한다.
- 한국어·영어·중국어·베트남어 전환을 영상, 웹앱, AI 기능, 게임에 일관되게 적용한다.
- AI 제작 파이프라인과 실시간 AI 기능을 모두 보여 주는 안정적인 해커톤 데모를 완성한다.
- 환경부 등 공식 자료를 근거로 제공하고 지역별 차이가 있는 규칙은 명시한다.

### 제외 범위

- 로그인, 계정, 관리자 페이지, 온라인 리더보드, 사용자 데이터 저장
- 교내 수거함 위치 지도와 명지전문대 전용 배출 규칙
- 벡터 데이터베이스, 별도 검색 인프라, 사용자 사진 보관
- 게임 내부 메커니즘의 상세 설계

## 2. 화면과 상호작용

### 공통 레이아웃

- 흰색 배경에 짙은 녹색과 파란색을 기능 색으로 사용하는 깔끔한 공공 안내 스타일을 적용한다.
- 고정 헤더에는 K-SORT 로고, `배우기 / AI 스캔 / 도감 / AI에게 묻기 / 게임` 메뉴와 언어 선택기를 둔다.
- 전역 언어는 `ko | en | zh | vi`이며 `localStorage`에 저장한다.
- 언어를 변경해도 영상 재생 위치, 열린 품목, 챗봇 화면, 스캔 결과를 유지한다.
- 홈은 세로형 학습 여정인 `#/`, 게임은 `#/game`으로 제공한다. 품목 상세는 홈 위의 접근 가능한 모달 또는 모바일 드로어로 연다.

### 배우기

- 약 2분 길이의 720p H.264 MP4 한 개를 제공한다.
- Seedance 영상, Typecast 한국어 내레이션, Suno BGM을 사용한다.
- 한국어·영어·중국어·베트남어 WebVTT 자막을 전역 언어에 맞춰 즉시 교체한다.
- 영상은 일반·재활용·음식물·특수폐기물과 `비운다 / 헹군다 / 분리한다 / 섞지 않는다`를 설명한다.
- 영상 로드 실패 시 포스터 이미지와 현재 언어의 텍스트 요약을 표시한다.

### 16종 과정형 도감

과정형 도감은 K-SORT의 **핵심 정보 창**이다. 각 품목의 처리 방법과 흔한 실수, 공식 출처를 한 화면에서 확인할 수 있고, 다른 모든 기능(스캔 결과 링크, 챗봇 답변의 관련 품목, 게임의 오답 팝업과 결과 화면)이 이 도감으로 수렴한다.

도감 품목은 다음 16종으로 고정한다.

1. 투명 페트병
2. 배달용기
3. 컵라면 용기
4. 일회용 컵·뚜껑·빨대
5. 비닐
6. 캔
7. 유리병
8. 종이·상자
9. 음식물
10. 뼈·껍데기
11. 폐건전지
12. 깨진 유리
13. 의류
14. 소형가전
15. 형광등
16. 스티로폼

각 품목은 분류, 다국어 이름과 별칭, 3~4개 처리 단계, 대표 이미지 한 장, 흔한 실수, 지역 확인 필요 여부, 공식 출처를 갖는다. 이미지는 처음에 단계마다 두려 했으나 제작 부담이 커서 **품목당 한 장**으로 줄였고, 도감과 스캔 선택 목록이 함께 쓴다. 이미지에는 글자를 생성하지 않고 단계 번호와 설명을 웹 UI로 겹쳐 표시한다. 이미지는 WebP로 최적화하고 지연 로딩한다.

도감은 텍스트 검색과 `재활용 / 음식물 / 일반 / 특수` 필터를 제공한다. 상세 화면에는 대표 이미지, 처리 순서, 흔한 실수, 지역별 예외 안내, 공식 출처 링크를 표시한다.

### AI Sort Scan

AI Sort Scan은 사용자가 이름을 모르는 쓰레기를 도감으로 손쉽게 연결하기 위한 **선택적 진입점**이다. 이미 품목명을 알고 있다면 도감의 검색·카테고리 필터가 더 빠르다. 스캐너 페이지 상단에는 도감으로 이동하는 명시적 링크와 4개 카테고리(재활용·음식물·일반·특수) 바로가기를 배치해 사진 촬영을 원치 않는 사용자도 즉시 도감을 이용할 수 있게 한다.

- 모바일 카메라 또는 파일 선택으로 사진 한 장을 받는다.
- 브라우저가 긴 변 1280px, 약 1.5MB 이하 JPEG 또는 WebP로 압축한다.
- Gemini가 사진 속 버릴 물건을 최대 5개까지 탐지한다.
- 결과는 원본 사진 위의 번호·색상 박스와 동일한 순서의 텍스트 목록으로 표시한다.
- 결과 카드 또는 박스를 선택하면 연결된 도감 상세가 열린다.
- 확실성이 `medium`, `low`이거나 품목이 `unknown`이면 AI 판단을 정답으로 확정하지 않고 사용자가 도감 후보를 다시 선택하게 한다.
- 화면에는 사진이 Gemini API로 전송되며 K-SORT 서버에는 저장되지 않는다는 개인정보 안내를 표시한다.
- 발표용 샘플 사진은 `라이브 스캔`과 구분되는 `예시 결과 보기`로 제공한다.

### AI 챗봇

- 자유 입력과 추천 질문 칩을 모두 제공한다.
- 현재 전역 언어를 입력 및 답변 언어로 사용한다.
- 16종 도감, 4대 원칙, 검수된 FAQ 20개의 사실만 근거로 답한다.
- 답변 아래에는 연결 품목과 앱이 관리하는 공식 출처 링크를 표시한다.
- 범위 밖 질문은 정중히 거절하고, 불확실하거나 지역별 차이가 큰 규칙은 거주지 지자체 또는 공식 자료 확인을 안내한다.
- API 실패 시 현재 언어의 고정 오류 메시지, 추천 FAQ, 수동 도감 이동 버튼을 표시한다.

### 게임 연결

게임은 같은 React 앱의 `#/game`에서 실행한다. 게임 컴포넌트는 현재 `locale`과 도감 데이터를 받고 완료 시 `{ score, learnedItemIds }`를 반환한다. 게임 내부 규칙과 밸런스는 김현민 팀원의 기획을 따르며, 로그인과 온라인 점수판은 요구하지 않는다.

## 3. 시스템 구조

### 저장소 구성

- `src/`: React 화면, 상태, 컴포넌트, 스타일
- `src/i18n/`: 도감 데이터 바깥의 UI 문자열 4언어 단일 사전
- `shared/`: 프런트와 API가 함께 사용하는 타입, 도감, FAQ, 출처 데이터
- `shared/placeholder.ts`: 검수 전 문안의 자리 표시 헬퍼
- `worker/`: API 본체 — Gemini 호출, 요청 검증, CORS, 제한 처리
- `api/[...path].ts`: Vercel Functions 진입점. `worker/`를 그대로 불러 쓴다
- `public/media/`: 영상, 포스터, 자막
- `public/images/items/`: 품목별 과정 이미지
- `public/images/samples/`: 스캐너 발표용 샘플

프런트는 React + Vite + TypeScript로 구현한다. 라우트가 홈 `#/`와 게임 `#/game` 둘뿐이므로 라우팅 라이브러리 대신 `src/app/useHashRoute.ts`를 직접 구현해 쓴다. Vite의 배포 base는 `/make-upload/`로 설정하고 GitHub Actions로 GitHub Pages에 배포한다. 공개 API 주소는 빌드 변수 `VITE_API_BASE_URL`로 주입한다.

**API는 Vercel Functions에 올린다(`https://make-upload.vercel.app`).** 처음에는 Cloudflare Worker로 배포했으나 Gemini가 `User location is not supported for the API use.`로 거부했다. Google이 보는 것은 사용자 위치가 아니라 서버의 출구 IP이고 Cloudflare 대역이 미지원 지역으로 판정되기 때문이다. smart placement와 AI Gateway 경유 모두 통하지 않아 호스팅을 옮겼다. `worker/`가 표준 `Request`/`Response`만 쓰고 있어서 코드는 거의 그대로 옮겨갔고, Cloudflare 전용 바인딩이던 사용량 제한만 `worker/src/rateLimit.ts`의 메모리 구현으로 대체했다. Vercel은 TypeScript를 번들하지 않고 트랜스파일만 하므로 상대 임포트에 `.js` 확장자를 붙인다.

Gemini 호출은 `POST /v1beta/models/<model>:generateContent`를 사용한다. 무료 한도가 모델마다 따로 잡히지만, `gemini-3.6-flash`는 하루 20회(5 RPM)뿐이라 리허설 세 번이면 바닥난다. 실제로 호출해 보니 `gemini-3.5-flash-lite`(15 RPM · 500 RPD)가 이미지 입력도 받으므로 **챗봇과 스캔 모두 Lite에 두고 500회를 함께 쓴다.** 나누는 것보다 총량은 적지만 한쪽이 먼저 죽는 것보다 안전하다. Zod 스키마 하나에서 `responseSchema`를 파생해 모델이 형식을 지키게 하고, 같은 스키마로 응답을 다시 검증한다. 스택 선택의 근거는 [기술 스택 확정과 구현 설계](2026-08-06-k-sort-stack-decisions.md)에 있다.

### 공유 데이터 타입

```ts
type Locale = 'ko' | 'en' | 'zh' | 'vi';
type LocalizedText = Record<Locale, string>;
type Category = 'recyclable' | 'food' | 'general' | 'special';

interface CatalogStep {
  id: string;
  text: LocalizedText;
}

interface CatalogItem {
  id: string;
  category: Category;
  name: LocalizedText;
  aliases: Record<Locale, string[]>;
  summary: LocalizedText;
  image: string; // '/images/items/<itemId>.webp'. 품목당 한 장. 단계마다 두지 않는다
  imageAlt: LocalizedText;
  steps: CatalogStep[];
  commonMistake: LocalizedText;
  needsLocalCheck: boolean;
  sourceIds: string[];
}

interface GameResult {
  score: number;
  learnedItemIds: string[];
}
```

모든 출처 URL은 `Source` 데이터에만 저장한다. Gemini 응답에는 자유 형식 URL을 허용하지 않고 등록된 `sourceIds`만 받는다.

### `POST /api/chat`

요청 JSON:

```ts
interface ChatRequest {
  locale: Locale;
  message: string; // 1~500자
  history: Array<{ role: 'user' | 'assistant'; content: string }>; // 최근 6개
  contextItemId?: string;
  sessionId: string;
}
```

응답 JSON:

```ts
interface ChatResponse {
  answer: string;
  matchedItemIds: string[];
  sourceIds: string[];
  status: 'answered' | 'needs_local_check' | 'out_of_scope';
}
```

서버는 검수 지식을 시스템 지시로 제공하고 Gemini의 구조화 JSON 출력을 서버에서 다시 검증한다. 채팅은 세션별 분당 10회로 제한하고 10초 후 중단한다.

### `POST /api/scan`

요청은 JSON이며 `locale`, `sessionId`, `image`를 포함한다. `image`는 `{ mimeType, data }` 형태이고 `data`는 `data:` 접두사가 없는 base64다. 허용 형식은 JPEG, PNG, WebP이고 최대 크기는 1.5MB다.

`multipart/form-data` 대신 base64를 쓰는 이유는 서버가 인코딩 비용을 지지 않게 하기 위해서다. 원래는 무료 Cloudflare Workers의 요청당 CPU 10ms 제약을 피하려던 결정이었고, Vercel로 옮긴 뒤에는 그 제약이 없지만 서버가 할 일이 적은 쪽이 나으므로 그대로 둔다. 브라우저는 네이티브 API로 처리하므로 부담이 없고, 서버는 받은 문자열을 그대로 Gemini의 `inlineData`에 넘기기만 한다. 크기 검사도 디코딩 없이 base64 길이로 어림해 모델을 부르기 전에 막는다.

스캔 화면은 두 가지로 쓴다. 무엇인지 모르면 사진을 찍어 AI에게 묻고, 이미 아는 품목이면 등록된 16종에서 골라 도감으로 바로 들어간다. 두 번째 길은 AI를 부르지 않으며, 목록에 쓰는 이미지는 도감 대표 이미지를 그대로 재사용한다.

응답 JSON:

```ts
interface ScanResponse {
  objects: Array<{
    box: [number, number, number, number]; // [yMin, xMin, yMax, xMax], 0~1000
    itemId: CatalogItem['id'] | 'unknown';
    label: string;
    certainty: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}
```

서버는 결과를 최대 5개로 자르고 좌표, enum, 품목 ID를 검증한다. 스캔은 세션별 분당 5회로 제한하고 15초 후 중단한다.

### API 보안과 개인정보

- `GEMINI_API_KEY`는 Vercel 환경 변수로만 저장한다.
- 로컬 `.dev.vars*`, `.env*`, `.vercel`은 Git에서 제외한다.
- 운영 CORS origin은 `https://kodol05.github.io`, 개발 origin은 `http://localhost:5173`으로 제한한다.
- 사용량 제한을 채팅과 스캔에 따로 적용한다. 메모리 기반이라 함수 인스턴스별로 세므로 전역 상한이 아니라 남용 완화 장치로 본다.
- 프롬프트, 대화, 이미지 본문을 로그에 남기지 않는다.
- 사람의 얼굴이나 개인정보를 설명하지 말고 쓰레기 품목만 탐지하도록 지시한다.
- API 오류, 타임아웃, 잘못된 구조의 모델 응답은 표준 오류 응답으로 변환한다.

## 4. 접근성 및 오류 처리

- 모든 조작은 키보드로 가능해야 하며 모달은 포커스 이동과 Escape 닫기를 지원한다.
- 모든 과정 이미지와 스캔 결과에는 현재 언어의 대체 텍스트 또는 목록 표현을 제공한다.
- 색상만으로 분류하지 않고 텍스트와 아이콘을 함께 사용한다.
- 360px 폭에서 가로 스크롤 없이 핵심 여정을 완료할 수 있어야 한다.
- 영상, 챗봇, 스캐너, 게임은 서로 독립적으로 실패할 수 있어야 하며 한 기능의 오류가 나머지 기능을 막지 않는다.
- 네트워크 장애 시 영상 요약, 수동 도감, 고정 FAQ, 스캐너 예시 결과를 사용할 수 있다.

## 5. 검증 및 완료 기준

### 자동 검증

- TypeScript 타입 검사, ESLint, Vite 프로덕션 빌드
- 16개 품목과 FAQ 20개에 네 언어 값이 모두 존재하는지 검사
- 모든 과정 이미지 경로와 `sourceIds`의 유효성 검사
- 언어 상태와 번역 선택 로직 테스트
- API 요청 검증, CORS, 오류 매핑, 구조화 응답 파서 테스트
- 클라이언트 이미지 압축과 스캔 좌표 변환 테스트

### 수동 및 통합 검증

- 4개 언어 전환 시 영상 자막, 전체 UI, 도감, 챗봇, 스캐너, 게임 UI가 함께 전환되는지 확인한다.
- 언어 전환 후 영상 재생 위치와 열린 품목이 유지되는지 확인한다.
- 단일 품목 고정 사진 5장, 다중 품목 사진 2장, 모호한 사진 1장으로 스캐너를 검증한다.
- FAQ 20개를 4개 언어로 확인하고 범위 밖·지역별 차이·API 실패 시나리오를 검증한다.
- 데스크톱 Chrome과 360px 모바일 뷰에서 전체 사용자 여정을 완료한다.
- GitHub Pages 배포본과 Vercel 운영 주소(`https://make-upload.vercel.app`)에서 실제 채팅과 스캔을 각 1회 이상 확인한다.
- 저장소와 브라우저 번들에 API 키가 없는지 검색한다.

## 6. 역할과 24시간 일정

### 역할

- **박재웅:** 기획, 공식 정보와 번역 검수, Seedance 영상, Typecast 내레이션, Suno BGM, 자막, 발표 자료와 발표
- **김현민:** React 웹앱, 품목 이미지 에셋, Vercel API, Gemini 챗봇과 AI Sort Scan, 게임
- **공동:** 통합 QA, 모바일 확인, 배포 확인, 발표 리허설

### 일정

1. 0~2시간: 콘텐츠 스키마, 16종 원문, 화면 골격, 영상 콘티, 게임 연결 규격
2. 2~10시간: 영상·음성·음악·번역과 앱·도감·API·과정 이미지 병렬 제작
3. 10~17시간: 미디어 통합, 챗봇·스캐너 연결, 게임 통합
4. 17~21시간: 다국어·모바일·오류 처리 검증 및 배포
5. 21~24시간: 기능 동결, 발표 자료 완성, 전체 시연 3회

## 7. 5분 발표 흐름

- 문제와 유학생 관점: 35초
- 영상 하이라이트와 4대 원칙: 40초
- AI Sort Scan, 과정형 도감, 언어 전환: 70초
- 다국어 근거 기반 챗봇: 35초
- 게임: 30초
- Seedance, Typecast, Suno, GPT Image, Gemini, AI 코딩 제작 파이프라인: 40초
- 공익성, 확장성, 팀 소개: 30초

2분 영상 전체는 웹앱에서 제공하되 발표에서는 약 30초 하이라이트만 사용한다. 대표 시연 장면은 언어를 영어 또는 베트남어로 바꾼 직후 스캔 박스, 도감 단계, 챗봇 답변이 모두 같은 언어로 전환되는 순간이다.

## 8. 전제 조건

- 팀은 Gemini API 키와 Vercel 계정, Seedance, Typecast, Suno, GPT Image 사용 권한을 보유한다.
- 실제 분리배출 내용은 환경부와 공공기관 자료를 기준으로 검수한다.
- 지역마다 배출 방식이 달라질 수 있는 품목에는 지자체 확인 안내를 표시한다.
- 게임 상세 규칙은 김현민 팀원의 별도 기획으로 구현하되 이 문서의 연결 규격을 지킨다.
