# 캐릭터 시트 생성 프롬프트

## 공통 사용법

- 미나 시트를 먼저 생성하고 이후 모든 미나 이미지에서 참조 이미지로 사용한다.
- 시트 내부에는 이름, 번호, 설명, 화살표를 생성하지 않는다. 설명은 이 문서에서만 관리한다.
- 흰색에 가까운 웜 아이보리 스튜디오 배경과 동일 조명을 유지한다.

## 1. 미나 마스터 시트

```text
Create a single polished character reference sheet for an educational short film.

Friendly non-childish stylized 3D public-information animation for international university students in Korea. Clean rounded forms with believable fabric and hair textures, warm soft studio daylight, gentle contact shadows, warm ivory seamless background, deep teal and clean blue accents, calm optimistic mood, uncluttered professional animation-model-sheet composition.

The same character appears consistently across the entire sheet: Mina, a 22-year-old international university student, warm medium skin tone, dark-brown chin-length bob haircut, a small deep-teal hair clip on the LEFT side of her fringe, softly rounded face, dark-brown eyes, cream pullover hoodie under a short forest-green jacket, navy straight-leg pants, simple white sneakers, teal reusable tote bag. Average build and height, natural upright posture.

Show six non-overlapping full-body views with generous spacing: front neutral, left profile, rear view, three-quarter front with a mildly uncertain expression, three-quarter front concentrating, and three-quarter front with a restrained confident smile. Along the bottom, show four isolated clean hand-and-prop studies at larger scale: open relaxed hand, safely holding a clear plastic bottle around its middle, pinching and peeling a plain blue bottle label, and placing a plain AA battery into a small slot. Keep anatomy simple and correct. Match her proportions, face, hair length, hair clip position, clothing colors, and shoes in every view.

No readable text, letters, numbers, labels, captions, arrows, logos, brands, watermark, flags, school emblem, duplicate limbs, overlapping figures, extra fingers, fused fingers, malformed hands, different hairstyle, hair clip on the right side, missing hair clip, different clothes, talking mouth, photorealistic skin, childish chibi proportions, dramatic pose, complex background.

Wide landscape reference board, 16:9, high resolution, even soft lighting, clean animation production quality.
```

검수 키: 왼쪽 틸 헤어클립, 턱선 보브컷, 크림 후드·숲색 재킷·네이비 바지·흰 신발, 동일한 얼굴과 체형.

## 2. 보조 출연자 마스터 시트

```text
Create a single polished supporting-cast reference sheet for the same educational short film.

Friendly non-childish stylized 3D public-information animation for international university students in Korea. Clean rounded forms with believable fabric and hair textures, warm soft studio daylight, gentle contact shadows, warm ivory seamless background, calm optimistic mood, professional animation-model-sheet composition.

Show three distinct university students as a diverse international friend group, each in a neutral front full-body pose and a relaxed three-quarter full-body pose. Student A has a deep skin tone, short natural curly hair, coral sweatshirt, charcoal pants, and neutral sneakers. Student B has a light skin tone, long straight black hair, mustard cardigan, cream trousers, and neutral sneakers. Student C has a medium skin tone, short wavy hair, clean-blue zip hoodie, denim trousers, and neutral sneakers. All are 20 to 24 years old, average realistic proportions, friendly attentive expressions, and visually secondary to the protagonist. Preserve each person's identity and clothes between their two views. Separate all six figures with ample empty space.

No protagonist Mina, no teal hair clip, no readable text, letters, numbers, labels, captions, logos, brands, watermark, flags, national costumes, school emblem, stereotypes, duplicate person, overlapping bodies, extra limbs, extra fingers, malformed hands, talking mouths, photorealistic skin, childish chibi proportions, complex background.

Wide landscape reference board, 16:9, high resolution, even soft lighting, clean animation production quality.
```

검수 키: 세 인물이 명확히 구분되고 같은 인물의 두 포즈가 의상과 얼굴을 유지하며, 국적 고정관념이 없어야 한다.

## 채택 결과 기록

- 미나 시트: `public/media/preproduction/character-sheet-mina.png`
- 보조 출연자 시트: `public/media/preproduction/character-sheet-supporting-cast.png`
- 미나는 모든 후속 스토리보드에서 채택 시트의 정면 화면 기준 왼쪽 헤어클립과 고정 의상을 사용한다.
- 손 동작이 불명확한 경우 영상 프롬프트에서는 손과 오브젝트만 보이는 클로즈업으로 단순화한다.
