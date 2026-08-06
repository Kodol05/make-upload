# Suno 2분 BGM 생성 명세

## 설정

- Custom Mode 사용
- Instrumental 토글 켜기
- 목표 생성 길이: 약 2분 5초; 편집에서 앞뒤 핸들을 잘라 정확히 2분 사용
- 목표 템포: 100 BPM
- 보컬과 발화는 완전히 제외

## Style 필드

```text
Clean optimistic eco-technology instrumental for a two-minute university public-information film, friendly contemporary corporate-electronic groove, approximately 100 BPM, warm marimba, light plucked synth, soft brushed percussion, subtle acoustic guitar harmonics, rounded bass, airy pads, bright but unobtrusive production, generous space for Korean narration. Begin sparse and curious for eight seconds, add a restrained caution pulse for the next eight seconds, settle into a clear four-beat teaching motif for the four recycling principles, gently broaden during the item examples, briefly simplify for special-waste safety, then lift into a warm hopeful resolved cadence for the final eighteen seconds. Smooth transitions, no dramatic drop, no cinematic boom.
```

## Lyrics 필드

Instrumental 모드에서도 구간 의도를 강화하기 위해 구조 태그만 입력한다.

```text
[Instrumental]
[Intro] [Low Energy] [Curious] 0:00-0:08
[Building Energy] [Restrained] 0:08-0:16
[Instrumental] [Steady Rhythm] 0:16-0:52
[Instrumental] [Warm Educational Groove] 0:52-1:30
[Quiet Arrangement] [Safety Focus] 1:30-1:42
[Gradual Swell] [Hopeful] 1:42-1:51
[Outro] [Warm Resolved Cadence] 1:51-2:05
[End]
```

## Exclude Styles 필드

```text
vocals, spoken word, chanting, choir, rap, children voices, dramatic trailer, cinematic boom, heavy drums, aggressive EDM, dubstep drop, dark tension, horror, melancholic piano, jazz solo, busy lead melody, lo-fi hiss, vinyl crackle, environmental sound effects
```

## 선택 기준

세 버전을 생성한다는 전제의 우선순위다.

1. 한국어 내레이션을 가리지 않는 중역대 여백
2. 16초 지점에서 네 가지 원칙으로 자연스럽게 전환되는 리듬
3. 90초 지점에서 과장 없이 단순해지는 안전 구간
4. 111초부터 밝아지며 120초에 자연스럽게 끝낼 수 있는 종지
5. 합성 보컬, 박수, 효과음처럼 들리는 우발 요소가 없음

가장 좋은 한 버전만 채택하고, 다른 버전의 일부를 이어 붙이지 않는다. 스타일 드리프트와 박자 불연속을 줄이기 위해서다.
