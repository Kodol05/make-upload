# Seedance 1.5 Pro 장면 프롬프트

## 모델 설정

- 엔드포인트: `fal-ai/bytedance/seedance/v1.5/pro/image-to-video`
- 해상도: `720p`
- 화면비: `16:9`
- 오디오: `false`
- 안전 검사: `true`
- 길이: 4~12초 범위에서 아래 표대로 지정
- 입력: `public/media/preproduction/keyframes`의 독립 시작 프레임

## 공통 프롬프트 앞부분

```text
Friendly non-childish stylized 3D public-information animation for international university students in Korea. Preserve the input frame's exact character identity, face, hairstyle, teal hair clip position, clothing, object count, object materials, environment, lighting, and color palette. Warm morning daylight, believable everyday materials, smooth controlled motion, stable anatomy, clear practical action.
```

## 공통 프롬프트 끝부분

```text
No readable text, new labels, letters, numbers, symbols, recycling icons, logos, brands, watermark, extra person, duplicate object, extra fingers, fused fingers, malformed hands, identity drift, clothing change, disappearing object, changing object material, unsafe waste handling, broken glass, broken fluorescent lamp, spill outside the sink, talking mouth, lip sync, sudden cut, morphing, fast motion, shaky camera, whip pan, fisheye distortion. End on a stable frame and hold briefly.
```

## 생성 클립

| 클립 | 길이 | 카메라 | 동작 프롬프트 | 시작 이미지 |
| --- | ---: | --- | --- | --- |
| S01 | 8초 | 느린 돌리 인 | Mina's eyes move calmly between the four waste objects. Her shoulders show mild uncertainty; she does not touch anything. Dolly in only five percent. End with all four objects separated and empty wall space preserved. | `S01.png` |
| S02 | 8초 | 고정 | The single AA battery rolls slowly about twenty centimeters toward the left mixed group and stops before touching it. Every other object remains perfectly still. No fire, smoke, spark, or alarm. | `S02.png` |
| S03 | 8초 | 약한 수직 안착 | Mina moves her one open hand once from the first zone to the fourth zone at a steady teaching pace. All objects remain fixed. | `S03.png` |
| S04 | 7초 | 고정 | Mina tilts the one bottle over the sink. The small amount of clear liquid pours out completely. She returns the bottle upright and holds the empty bottle still. | `S04.png` |
| S05 | 7초 | 고정 | A gentle narrow water stream begins. Mina rotates the bottle one half-turn under the stream, then holds it upside down to drain as the stream stops. | `S05.png` |
| S06 | 7초 | 고정 | Mina peels the single blue label away from the bottle in one smooth continuous strip. End with the bare bottle on the right and the removed label held separately on the left. | `S06.png` |
| S07 | 7초 | 느린 좌→우 슬라이드 | Mina lowers the one paper box into the empty fourth zone and releases it. The other three material groups never move. | `S07.png` |
| S08a | 6초 | 느린 돌리 인 | Mina compresses the one clear bottle once with both hands. The cap and removed blue label remain stationary on the counter. End holding the compressed bottle still. | `S08.png` |
| S08b | 4초 | 고정 | Starting from the final frame of S08a, Mina picks up the one white cap, screws it onto the compressed bottle with one short turn, then releases it. The blue label remains separate. | S08a 마지막 프레임 |
| S09a | 5초 | 고정 | A gentle narrow water stream begins. Mina performs one short controlled rinse of the stained corner of the square container. Keep the neutral tray dry and stationary. | `S09.png` |
| S09b | 4초 | 고정 | Starting from the final frame of S09a with the faucet off, Mina moves the one container to the neutral tray on the right and releases it away from the clean recycling group. | S09a 마지막 프레임 |
| S10 | 10초 | 아주 느린 돌리 인 | A few droplets finish draining from the strainer into the empty bowl. Mina then tips the strainer once and transfers the rice and soft vegetables into the plain food-waste container. | `S10.png` |
| S11 | 9초 | 고정 | Mina slides the one tray smoothly from the left food-waste side to the right general-waste zone. The two bones and two shells remain on the tray without changing count. | `S11.png` |
| S12a | 4초 | 고정 | Mina picks up exactly the three batteries together from the small tray and places them into the small top opening. The intact lamp and hair dryer remain stationary on the bench. | `S12.png` |
| S12b | 4초 | 고정 | Mina safely lifts the single intact fluorescent tube with two hands, keeps it horizontal, and guides it gently into the long padded middle opening. Batteries and hair dryer remain stationary. | `S12.png` |
| S12c | 4초 | 고정 | Mina picks up the single small hair dryer with its cable still neatly coiled and places it into the broad lower compartment. Batteries and intact lamp remain stationary. | `S12.png` |
| S13 | 9초 | 고정 | Mina moves the one clean bottle forward and places it into the right-side blank bin opening. All left-side mixed objects and right-side separated materials remain fixed. Color contrast is preserved, not animated. | `S13.png` |
| S14 | 9초 | 느린 크레인 백·업 | The four students take two calm steps together from left to right. Near the end, Mina makes one small open-hand gesture toward the blank station while walking. The phone stays below face level with a blank dark screen. | `S14.png` |

## 두 번째 후보 허용

- `S06`: 라벨과 손가락이 합쳐질 위험이 높음
- `S12b`: 긴 형광등이 사라지거나 휘는 위험이 높음

나머지 클립은 첫 결과가 검수에 실패할 때 프롬프트를 고친 뒤 재생성하며, 같은 프롬프트를 습관적으로 여러 번 돌리지 않는다.

## 편집에서 처리할 것

- S02의 경고색과 문구
- S03~S07의 번호와 원칙 문구
- S09의 지역 안내 문구
- S12의 세 내부 컷 연결
- S13의 좌측 채도 감소와 우측 밝기 강화
- S14의 K-SORT 엔드카드와 마지막 1초 홀드
