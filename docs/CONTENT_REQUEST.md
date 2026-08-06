# 콘텐츠 요청서 — 박재웅

김현민이 개발하면서 필요한 콘텐츠를 정리했다.

**구조는 확정했다.** 아래 형식대로 주면 그대로 들어가며, 나중에 구조가 바뀌어 다시
쓰는 일은 없다. 그래서 **한 품목을 한국어부터 네 언어까지 한 번에 끝내는 방식**을 권한다.
16종을 다 끝낼 필요 없이 완성된 품목부터 보내면 그때그때 반영한다.

관련 문서: [작업 인수인계](HANDOFF.md) · [AI 제작 과정과 프롬프트](AI_PROCESS_AND_PROMPTS.md) · [콘텐츠 체크리스트](CONTENT_CHECKLIST.md)

## 0. 전체 분량

| 묶음 | 한국어 작성 | 번역(×3) | 비고 |
| --- | ---: | ---: | --- |
| 도감 16종 | 98 | 342 | 품목 단위로 완결 |
| FAQ 20개 | 40 | 120 | |
| 출처 5개 제목 | 5 | 15 | URL 5개는 별도 |
| 4대 원칙 설명 | 4 | 12 | |
| 품목 이름 16개 | 완료 | 48 | 한국어는 이미 있음 |
| **재웅 작성 합계** | **147** | **537** | |
| 화면 UI 88개 | 검수만 | 264 | **한국어 초안은 김현민이 작성 완료** |

이미지는 **16장**이다. 자세한 내용은 아래 이미지 절에 있다.

**개발은 어느 것도 기다리지 않는다.** 비어 있는 문안은 화면에 `(임시값)`으로 보이고,
받는 즉시 채운다. 마감 전에 하나라도 남으면 테스트가 배포를 막는다.

## 0-1. 확정된 것과 바꿀 수 있는 것

다시 쓰는 일을 막기 위해 미리 구분해 둔다.

**확정 — 이 형태로 주면 된다**

- 16종의 ID·순서·한국어 이름·분류
- 품목마다 채울 항목: `summary` `steps` `commonMistake` `imageAlt`
- 출처 다섯 묶음의 ID
- FAQ 20개의 ID
- 화면 UI 88개 항목의 구성

**검수 결과에 따라 바꿔도 되는 것 — 알려 주면 코드를 맞춘다**

- 단계 개수 (3개 또는 4개 중에서)
- `needsLocalCheck` 값
- FAQ 주제
- UI 한국어 문구

---

## 1. 도감 16종 — 품목 단위로 완결

### 품목 하나에 필요한 것

| 항목 | 설명 | 길이 목표 |
| --- | --- | --- |
| `summary` | 이 품목을 어떻게 버리는지 한 줄 요약 | 60자 이내 |
| `steps` | 실제 손으로 하는 행동 순서, 3개 또는 4개 | 각 90자 이내 |
| `commonMistake` | 가장 흔한 실수 한 가지 | 80자 이내 |
| `imageAlt` | 이미지를 못 보는 사람에게 읽어 줄 설명 | 40자 이내 |

한국어 이름과 분류는 이미 들어가 있다. **검수 결과 틀렸으면 알려 달라.**

### 16종 목록

단계 수는 구조상 넣어 둔 값이다. 검수 결과 다르면 바꿔도 된다. **3개 또는 4개만 가능하다.**

| ID | 이름 | 분류 | 단계 | 지역 확인 | 출처 |
| --- | --- | --- | ---: | --- | --- |
| `clear-pet` | 투명 페트병 | 재활용 | 4 | | `me-recyclable` |
| `delivery-container` | 배달용기 | 재활용 | 3 | | `me-recyclable` |
| `cup-noodle` | 컵라면 용기 | 재활용 | 3 | | `me-recyclable` |
| `disposable-cup` | 일회용 컵·뚜껑·빨대 | 재활용 | 3 | | `me-recyclable` |
| `vinyl` | 비닐 | 재활용 | 3 | | `me-recyclable` |
| `can` | 캔 | 재활용 | 3 | | `me-recyclable` |
| `glass-bottle` | 유리병 | 재활용 | 4 | | `me-recyclable` |
| `paper-box` | 종이·상자 | 재활용 | 3 | | `me-recyclable` |
| `food-waste` | 음식물 | 음식물 | 3 | | `me-food-waste` |
| `bones-shells` | 뼈·껍데기 | 일반 | 3 | | `me-general-waste`, `me-food-waste` |
| `battery` | 폐건전지 | 특수 | 3 | ✅ | `keco-special-waste`, `local-government` |
| `broken-glass` | 깨진 유리 | 일반 | 3 | ✅ | `me-general-waste`, `local-government` |
| `clothing` | 의류 | 특수 | 3 | | `keco-special-waste` |
| `small-electronics` | 소형가전 | 특수 | 3 | ✅ | `keco-special-waste`, `local-government` |
| `fluorescent-lamp` | 형광등 | 특수 | 3 | ✅ | `keco-special-waste`, `local-government` |
| `styrofoam` | 스티로폼 | 재활용 | 3 | | `me-recyclable` |

**지역 확인(✅)은 임시로 켜 둔 것이다.** 폐건전지·형광등·소형가전은 내레이션 초안이
"지역마다 세부 배출 방식이 다를 수 있다"고 적었고, 깨진 유리는 체크리스트가 지역 확인으로
표시했다. 검수해서 맞는지, 다른 품목도 켜야 하는지 알려 달라.

### 조건부 분류는 단계에 녹인다

컵라면 용기·일회용 컵·비닐·스티로폼처럼 `재활용/일반 조건부`였던 품목은 **분류를 `재활용`
하나로 두고, 조건을 마지막 단계나 `commonMistake`에 문장으로 적는다.**

```
steps: [..., "헹궈도 기름때가 남으면 재활용이 어려우므로 종량제봉투에 넣습니다."]
```

분류를 둘로 나누지 않는 이유는 사용자가 "그래서 어디에 버리라는 거지"에서 멈추지 않게
하기 위해서다. 이 방식이 어색하면 알려 달라.

### 사실 검수 방법

[AI 제작 과정과 프롬프트](AI_PROCESS_AND_PROMPTS.md) §4의 조사 프롬프트를 쓰면 된다.
AI가 뽑은 결과를 그대로 쓰지 말고 **URL을 직접 열어 그 문서가 해당 규칙을 실제로
뒷받침하는지 확인**한다. 이 작업에서 AI로 줄일 수 없는 유일한 부분이다.

근거를 못 찾은 규칙은 추측하지 말고 비워 두거나 `needsLocalCheck`를 켠다.

### 전달 형식

한국어와 번역을 **한 파일에 함께** 주면 그대로 들어간다. 완성된 품목만 보내도 된다.

```json
[
  {
    "itemId": "clear-pet",
    "needsLocalCheck": false,
    "sourceIds": ["me-recyclable"],
    "name":    { "en": "Clear PET bottle", "zh": "透明塑料瓶", "vi": "Chai nhựa trong" },
    "aliases": { "en": ["plastic bottle"], "zh": ["塑料瓶"], "vi": ["chai nhựa"] },
    "summary": {
      "ko": "내용물을 비우고 라벨을 떼어 압착해 재활용으로 배출합니다.",
      "en": "...", "zh": "...", "vi": "..."
    },
    "steps": [
      { "ko": "남은 음료를 모두 비웁니다.", "en": "...", "zh": "...", "vi": "..." },
      { "ko": "몸통에 붙은 라벨을 완전히 떼어 냅니다.", "en": "...", "zh": "...", "vi": "..." },
      { "ko": "물로 헹군 뒤 눌러서 부피를 줄입니다.", "en": "...", "zh": "...", "vi": "..." },
      { "ko": "뚜껑을 닫아 투명 페트병 전용 수거함에 넣습니다.", "en": "...", "zh": "...", "vi": "..." }
    ],
    "commonMistake": {
      "ko": "라벨을 붙인 채로 버리면 재활용 과정에서 걸러집니다.",
      "en": "...", "zh": "...", "vi": "..."
    },
    "imageAlt": {
      "ko": "라벨을 뗀 투명 페트병", "en": "...", "zh": "...", "vi": "..."
    }
  }
]
```

`aliases`는 도감 검색에 쓰는 말이다. 한국어는 이미 넣어 두었고 없어도 이름으로 검색된다.
있으면 유학생이 자기 언어로 찾을 수 있다.

**한국어만 먼저 주고 번역을 나중에 줘도 된다.** 다만 한국어를 확정한 뒤 번역하는 편이
번역을 두 번 하지 않는 길이다.

---

## 2. 출처 5개

각각의 **실제 주소와 문서 제목**이 필요하다.

| ID | 무엇 |
| --- | --- |
| `me-recyclable` | 재활용품 분리배출 기준 |
| `me-food-waste` | 음식물류 폐기물 기준 |
| `me-general-waste` | 종량제·일반쓰레기 기준 |
| `keco-special-waste` | 폐건전지·형광등·소형가전 등 |
| `local-government` | 지자체 확인 안내 |

```json
{
  "me-recyclable": {
    "url": "https://직접-열어-확인한-주소",
    "title": { "ko": "환경부 재활용품 분리배출 가이드라인", "en": "...", "zh": "...", "vi": "..." }
  }
}
```

**URL만은 자리 표시를 쓰지 않는다.** 잘못된 주소는 없는 것보다 나쁘므로, 확인 전까지는
빈 값으로 두고 화면에서 링크를 아예 만들지 않는다.

묶음을 더 쪼개야 하거나 이 분류가 안 맞으면 알려 달라.

---

## 3. FAQ 20개

챗봇이 답할 수 있는 범위를 정하는 지식이다. 여기 없는 질문은 챗봇이 정중히 거절한다.

주제는 16종을 한 번씩 다루도록 배치해 두었다. **더 중요한 질문이 있으면 바꿔도 된다.**

| ID | 주제 | 연결 품목 |
| --- | --- | --- |
| `faq-plastic-cap` | 플라스틱 뚜껑 | 투명 페트병, 유리병 |
| `faq-pet-label` | 페트병 라벨 | 투명 페트병 |
| `faq-oily-paper` | 기름 묻은 종이 | 종이·상자 |
| `faq-dirty-delivery-container` | 씻기 어려운 배달용기 | 배달용기 |
| `faq-cup-noodle-soup` | 국물이 남은 컵라면 용기 | 컵라면 용기 |
| `faq-paper-cup` | 종이컵 | 일회용 컵 |
| `faq-straw` | 빨대 | 일회용 컵 |
| `faq-dirty-vinyl` | 오염된 비닐 | 비닐 |
| `faq-can-crush` | 캔을 찌그러뜨려야 하나 | 캔 |
| `faq-glass-bottle-cap` | 유리병 뚜껑 | 유리병 |
| `faq-box-tape` | 상자에 붙은 테이프·송장 | 종이·상자 |
| `faq-food-or-general` | 음식물인가 일반쓰레기인가 | 음식물, 뼈·껍데기 |
| `faq-bones` | 뼈 | 뼈·껍데기 |
| `faq-eggshell` | 달걀 껍데기 | 뼈·껍데기, 음식물 |
| `faq-dirty-styrofoam` | 오염된 스티로폼 | 스티로폼 |
| `faq-battery-where` | 폐건전지는 어디에 | 폐건전지 |
| `faq-broken-glass-safety` | 깨진 유리를 안전하게 | 깨진 유리 |
| `faq-clothing-bin` | 의류수거함 | 의류 |
| `faq-small-appliance-where` | 소형가전은 어디에 | 소형가전 |
| `faq-lamp-where` | 형광등은 어디에 | 형광등 |

```json
[
  {
    "faqId": "faq-cup-noodle-soup",
    "sourceIds": ["me-recyclable"],
    "question": { "ko": "컵라면 용기에 국물이 남았으면 어떻게 버려요?", "en": "...", "zh": "...", "vi": "..." },
    "answer":   { "ko": "국물을 따라 버리고 물로 한 번 헹굽니다. ...", "en": "...", "zh": "...", "vi": "..." }
  }
]
```

| 항목 | 길이 목표 |
| --- | --- |
| `question` | 40자 이내, 실제로 물어볼 법한 말투 |
| `answer` | 5문장 이내, 분류와 행동을 함께 |

**답변에는 반드시 근거 출처를 지정한다.** 챗봇이 답변 아래 출처 링크를 보여 준다.

---

## 4. 4대 원칙 설명

영상 아래 카드 네 개에 들어간다. 이름은 설계 문서가 정한 값이라 그대로 두고,
**설명 한 줄씩만** 채우면 된다.

| 키 | 이름 | 필요한 것 |
| --- | --- | --- |
| `empty` | 비운다 | 40자 이내 설명 |
| `rinse` | 헹군다 | 40자 이내 설명 |
| `separate` | 분리한다 | 40자 이내 설명 |
| `dontMix` | 섞지 않는다 | 40자 이내 설명 |

---

## 5. 화면 UI 88개 — 검수와 번역만

메뉴, 버튼, 안내 문구, 오류 메시지 같은 화면 자체의 문자열이다.
**한국어 초안은 김현민이 이미 다 넣어 두었다.**

아직 만들지 않은 화면(도감·스캐너·챗봇·게임)의 문구까지 미리 적어 두었다.
화면을 만들면서 조금씩 늘리면 번역을 여러 번 나눠 해야 하기 때문이다.

파일 하나만 보면 된다.

```
src/i18n/strings.ts
```

| 묶음 | 개수 | 내용 |
| --- | ---: | --- |
| `nav` | 5 | 메뉴 |
| `common` | 6 | 닫기, 다시 시도, 언어 등 |
| `category` | 5 | 전체·재활용·음식물·일반·특수 |
| `home` | 1 | 첫 화면 소개 |
| `learn` | 5 + 원칙 8 | 영상 화면 |
| `catalog` | 14 | 검색·필터·상세 모달 |
| `scanner` | 17 | 사진 찍기·분석·확실성·개인정보 안내 |
| `chat` | 11 | 질문·추천·출처·범위 밖 |
| `game` | 8 | 시작·점수·결과·복습 |
| `error` | 6 | 네트워크·제한·시간 초과 |

| 항목 종류 | 길이 목표 |
| --- | --- |
| 버튼 | 18자 이내 |
| 카드 제목 | 28자 이내 |
| 안내 문장 | 90자 이내 |

**해야 할 일 두 가지**

1. 한국어 문구가 어색하거나 유학생이 이해하기 어려우면 고쳐 달라
2. 영어·중국어 간체·베트남어로 번역

구현하면서 문구가 어색해 한국어를 고치더라도 항목 자체는 늘거나 줄지 않는다.

### 미리 봐야 할 문구 하나

무료 등급 Gemini API는 **Google이 제출된 이미지를 서비스 개선에 사용할 수 있고
사람 검토자가 볼 수 있다.** 사용자에게 정확히 알려야 해서 이렇게 적었다.

```
사진은 Google Gemini로 전송되어 분석되며 K-SORT 서버에는 저장하지 않습니다.
무료 등급을 사용하므로 Google의 서비스 개선에 활용될 수 있으니
개인정보가 담긴 사진은 올리지 마세요.
```

길지만 줄이면 사실이 빠진다. 유료 등급으로 바꾸면 가운데 문장을 뺀다.

---

## 6. 이미지 16장

**품목당 대표 이미지 한 장씩.** 단계별 이미지는 만들지 않는다.

한 장이 두 곳에 쓰인다.

1. 도감 카드와 상세 화면
2. 스캔 화면에서 "사진 찍기 귀찮을 때 골라서 들어가기"

원래 계획은 단계별 50장이었으나, 이미지가 없어도 처리 순서와 흔한 실수가 온전히
읽히도록 화면을 만들어 두어 16장으로 줄였다.

### 도구는 나노바나나

원래 계획의 GPT Image에서 바꿨다. 편집 기반이라 16장의 톤을 맞추기 쉽고,
Gemini와 같은 계정·API를 쓰므로 보고서에서 제작과 판별을 한 계열로 설명할 수 있다.

### 프롬프트

앞부분은 16장 모두 그대로 두고 마지막 두 줄만 바꾼다.

```text
Create one icon-style product image for a Korean public recycling guide.

Visual style: clean contemporary public-information illustration, bright white
background, realistic but simplified 3D object, soft studio lighting, accurate
material texture, calm green and blue accent colors, single object centered with
generous empty space, eye-level camera, 1:1 square frame.

Show one clean everyday object clearly enough that an international student can
recognize it at a glance in a small thumbnail. Do not include any letters, words,
numbers, captions, logos, watermarks, recycling symbols with text, flags, hands,
people, or disposal bins.

Object: [ITEM]
Avoid: [COMMON_VISUAL_ERROR]
```

| ID | `[ITEM]` | `[COMMON_VISUAL_ERROR]` |
| --- | --- | --- |
| `clear-pet` | a clean transparent PET water bottle with the label removed | printed brand text, colored plastic |
| `delivery-container` | a clean black plastic food delivery container with a clear lid | food residue, restaurant logos |
| `cup-noodle` | an empty instant noodle cup container | visible noodles or soup |
| `disposable-cup` | a disposable cup with its lid and a straw beside it | cafe logos, liquid inside |
| `vinyl` | a clean folded plastic bag | printed shop names |
| `can` | a clean aluminum beverage can | brand markings, crushed shape |
| `glass-bottle` | a clean transparent glass bottle with the cap removed | labels, colored liquid |
| `paper-box` | a flattened cardboard box | tape, shipping labels, printed text |
| `food-waste` | vegetable and fruit food scraps in a small container | packaging, bones or shells |
| `bones-shells` | chicken bones and clam shells together | meat still attached, blood |
| `battery` | two used AA batteries | brand names, leaking fluid |
| `broken-glass` | broken glass pieces wrapped in newspaper | readable newspaper text, bare sharp edges |
| `clothing` | neatly folded used clothes | brand tags, damaged fabric |
| `small-electronics` | a small hair dryer and a used earphone set | brand logos, tangled cables |
| `fluorescent-lamp` | a straight fluorescent tube lamp | broken glass, printed markings |
| `styrofoam` | a clean white styrofoam packaging block | tape, food stains, printed text |

### 파일 규격

```
public/images/items/clear-pet.webp
public/images/items/delivery-container.webp
...
```

- 파일명은 위 표의 **ID와 정확히 같게**, 확장자는 `.webp`
- 정사각형, 긴 변 800px 정도, 한 장 200KB 이하
- **글자를 넣지 않는다.** 설명은 앱이 네 언어로 겹쳐 표시한다
- 원본 생성 파일은 저장소 용량이 커지므로 따로 보관하고 최적화본만 전달

첫 장을 마음에 들게 만든 뒤 **그 결과를 참조 이미지로 넣고 나머지 15장을 생성**한다.
배경 밝기·조명·물체 크기가 다르면 카드 그리드에서 어색해 보인다.

---

## 7. 영상·자막·음성

변경 없이 [작업 인수인계](HANDOFF.md) §4와
[AI 제작 과정과 프롬프트](AI_PROCESS_AND_PROMPTS.md) §7~9를 따르면 된다.

파일은 아래 경로와 이름으로 주면 코드 수정 없이 바로 붙는다.

```
public/media/k-sort-guide.mp4     약 2분, 720p H.264
public/media/poster.webp          영상 포스터
public/subtitles/{ko,en,zh,vi}.vtt
```

현재 배포본은 영상이 없어 대체 화면이 보이는 상태다. 파일만 넣으면 자동으로 재생된다.

---

## 8. 전달 방법과 순서

편한 대로 하면 된다.

1. JSON 파일이나 메시지로 김현민에게 직접 전달
2. 저장소에 `content/` 폴더를 만들어 브랜치로 올리기

**한 번에 다 줄 필요 없다.** 페트병 하나만 끝나도 보내면 반영한다.

권하는 순서:

1. **투명 페트병 · 캔 · 컵라면 용기** — 발표 시연에 실제로 등장하는 세 종
2. 출처 5개 URL — 이게 있어야 도감 링크가 살아난다
3. 나머지 13종
4. FAQ 20개
5. 화면 UI 88개 검수와 번역
6. 이미지 16장 (위 순서와 병행 가능)

### 남은 분량 확인

```powershell
npm run test:run -- shared/content-progress.test.ts
```

```
[content] 자리 표시 620개 남음 · 출처 URL 0/5개 확인됨
```

### 번역 검수

[AI 제작 과정과 프롬프트](AI_PROCESS_AND_PROMPTS.md) §5의 번역 프롬프트를 쓰고,
**역번역으로 분류와 행동 순서가 바뀌지 않았는지** 확인한다.

베트남어는 한국어보다 30~50% 길어지는 경우가 많다. 배포본을
<https://kodol05.github.io/make-upload/> 에서 휴대폰으로 열면 넘치는지 바로 보인다.
아직 번역이 없는 자리는 `한국어 (임시값)` 형태로 보이므로 한국어 길이로 미리 판단할 수 있다.
