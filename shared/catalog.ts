import { localized } from './placeholder.js';
import type { CatalogItem, CatalogStep, ItemId } from './types.js';

/**
 * 품목별 처리 단계를 만든다.
 *
 * 단계는 3개 또는 4개만 쓴다. 손에 들고 따라 할 수 있는 크기여야 해서 그 이상은 쪼갠
 * 만큼 오히려 안 읽힌다. 한국어 문안은 환경부 「재활용품 분리배출 가이드라인」과
 * 생활폐기물 분리배출 누리집(분리배출.kr)을 근거로 채웠고, 나머지 언어는 번역 대기다.
 */
function steps(itemId: ItemId, texts: string[]): CatalogStep[] {
  return texts.map((ko, index) => {
    const id = String(index + 1).padStart(2, '0');
    return { id, text: localized(itemId, `step${id}`, { ko }) };
  });
}

/**
 * 품목 대표 이미지 경로와 대체 텍스트를 만든다.
 *
 * 이미지는 품목당 한 장이며 도감 카드·상세 화면과 스캔 화면의 선택 목록이 같은
 * 파일을 쓴다. 파일이 없어도 처리 순서와 흔한 실수는 그대로 읽혀야 한다.
 */
function image(itemId: ItemId, alt: string) {
  return {
    image: `/images/items/${itemId}.webp`,
    imageAlt: localized(itemId, 'imageAlt', { ko: alt }),
  };
}

/** 별칭이 아직 없는 언어는 빈 배열로 둔다. 검색은 이름으로도 동작한다. */
function aliases(ko: string[]): CatalogItem['aliases'] {
  return { ko, en: [], zh: [], vi: [] };
}

/**
 * 도감 16종.
 *
 * `id`와 순서는 `types.ts`의 `itemIds`와 정확히 일치해야 한다.
 *
 * 조건부 분류였던 품목(컵라면 용기·일회용 컵·비닐·스티로폼)은 분류를 하나로 두고
 * 조건을 단계 문장이나 흔한 실수에 적는다. 사용자가 "그래서 어디에 버리라는 거지"에서
 * 멈추지 않게 하기 위해서다.
 *
 * 문안 근거:
 * - 환경부 「재활용품 분리배출 가이드라인」(재활용법 제12조의3·제13조 근거)
 * - 생활폐기물 분리배출 누리집 품목사전 <https://분리배출.kr>
 * 지역마다 다를 수 있는 품목은 `needsLocalCheck`로 표시하고 화면이 확인 안내를 띄운다.
 */
export const catalogItems: CatalogItem[] = [
  {
    id: 'clear-pet',
    category: 'recyclable',
    name: localized('clear-pet', 'name', { ko: '투명 페트병' }),
    aliases: aliases(['페트병', '생수병', '음료수병']),
    summary: localized('clear-pet', 'summary', {
      ko: '생수나 음료가 담겨 있던 무색 페트병입니다. 라벨만 떼어 따로 모으면 옷이나 새 페트병의 원료가 됩니다.',
    }),
    ...image('clear-pet', '라벨을 떼고 납작하게 누른 투명 페트병. 뚜껑은 닫혀 있습니다.'),
    steps: steps('clear-pet', [
      '남은 음료를 비우고 안쪽을 물로 한 번 헹굽니다.',
      '몸통을 감싼 비닐 라벨을 뜯어냅니다. 절취선이 있으면 그 선을 따라 당기면 쉽게 떨어집니다.',
      '발로 밟아 납작하게 눌러 부피를 줄입니다.',
      '뚜껑을 닫은 채로 투명 페트병 전용 수거함에 넣습니다. 전용함이 없으면 플라스틱류에 넣습니다.',
    ]),
    commonMistake: localized('clear-pet', 'commonMistake', {
      ko: '뚜껑을 반드시 떼야 한다고 알고 있는 사람이 많은데, 투명 페트병은 닫아서 버리는 것이 맞습니다. 재활용 과정에서 물에 뜨는 뚜껑과 가라앉는 몸통이 저절로 갈라지기 때문입니다. 대신 라벨은 꼭 떼야 하고, 색이 들어간 병은 투명 페트병이 아니라 플라스틱류로 갑니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'delivery-container',
    category: 'recyclable',
    name: localized('delivery-container', 'name', { ko: '배달용기' }),
    aliases: aliases(['배달 용기', '플라스틱 용기']),
    summary: localized('delivery-container', 'summary', {
      ko: '배달 음식이 담겨 오는 플라스틱 용기입니다. 기름과 양념을 씻어냈는지가 재활용 여부를 가릅니다.',
    }),
    ...image('delivery-container', '물로 헹군 배달 플라스틱 용기와 뚜껑이 나란히 놓여 있습니다.'),
    steps: steps('delivery-container', [
      '남은 음식을 음식물 쓰레기로 먼저 덜어냅니다.',
      '설거지하듯 물로 헹굽니다. 기름기가 심하면 세제를 조금 써도 됩니다.',
      '뚜껑과 몸통을 포개어 플라스틱류로 내놓습니다.',
    ]),
    commonMistake: localized('delivery-container', 'commonMistake', {
      ko: '양념이 밴 용기를 그대로 내놓으면 재활용되지 않고 결국 소각됩니다. 씻어도 색이 지워지지 않을 만큼 배어 있다면 종량제 봉투에 넣는 편이 낫습니다. 용기에 붙은 비닐 뚜껑은 떼어 비닐류로 보냅니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'cup-noodle',
    category: 'recyclable',
    name: localized('cup-noodle', 'name', { ko: '컵라면 용기' }),
    aliases: aliases(['컵라면', '사발면']),
    summary: localized('cup-noodle', 'summary', {
      ko: '컵라면 용기는 종이와 스티로폼 두 종류가 있습니다. 어느 쪽이든 국물 자국을 씻어내야 재활용됩니다.',
    }),
    ...image('cup-noodle', '국물을 비우고 헹군 컵라면 용기와 떼어낸 비닐 뚜껑입니다.'),
    steps: steps('cup-noodle', [
      '남은 국물과 면을 음식물 쓰레기로 버립니다.',
      '용기 안쪽을 물로 헹굽니다. 기름이 잘 지워지지 않으면 하루쯤 말려도 좋습니다.',
      '스티로폼 용기는 스티로폼으로, 종이 용기는 종이류로 나눠 내놓습니다.',
    ]),
    commonMistake: localized('cup-noodle', 'commonMistake', {
      ko: '국물이 밴 채로 버리면 같이 모인 재활용품까지 못 쓰게 만듭니다. 씻기 어려울 정도면 종량제 봉투가 맞습니다. 뚜껑의 비닐 부분은 따로 떼서 비닐류로 보내세요.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'disposable-cup',
    category: 'recyclable',
    name: localized('disposable-cup', 'name', { ko: '일회용 컵·뚜껑·빨대' }),
    aliases: aliases(['일회용컵', '테이크아웃컵', '빨대']),
    summary: localized('disposable-cup', 'summary', {
      ko: '카페에서 받은 컵은 부분마다 재질이 달라 가는 곳도 다릅니다. 컵과 뚜껑, 빨대를 나누는 것이 먼저입니다.',
    }),
    ...image('disposable-cup', '컵에서 뚜껑과 빨대를 뽑아 따로 놓은 일회용 컵입니다.'),
    steps: steps('disposable-cup', [
      '남은 음료와 얼음을 비우고 컵 안을 물로 헹굽니다.',
      '뚜껑과 빨대를 컵에서 뽑아 분리합니다.',
      '종이컵은 종이류, 플라스틱 컵과 뚜껑, 빨대는 플라스틱류로 보냅니다.',
    ]),
    commonMistake: localized('disposable-cup', 'commonMistake', {
      ko: '뚜껑과 빨대를 컵에 꽂은 채로 버리는 경우가 가장 많습니다. 이렇게 나오면 선별장에서 일일이 뜯어야 해서 대부분 그냥 버려집니다. 커피가 진하게 밴 종이컵은 종이류가 아니라 종량제 봉투로 가야 합니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'vinyl',
    category: 'recyclable',
    name: localized('vinyl', 'name', { ko: '비닐' }),
    aliases: aliases(['비닐봉투', '비닐봉지', '봉지']),
    summary: localized('vinyl', 'summary', {
      ko: '과자 봉지, 라면 봉지, 비닐봉투처럼 얇고 잘 구겨지는 포장재입니다. 재활용 표시가 없어도 비닐류로 모읍니다.',
    }),
    ...image('vinyl', '한 봉투에 모아 담은 과자 봉지와 비닐봉투입니다.'),
    steps: steps('vinyl', [
      '안에 남은 부스러기나 소스를 털어냅니다.',
      '기름이나 양념이 묻었으면 물로 씻어 말립니다.',
      '흩날리지 않게 봉투 하나에 모아 담아서 내놓습니다.',
    ]),
    commonMistake: localized('vinyl', 'commonMistake', {
      ko: '씻어도 기름이 남는 봉지는 비닐류에 넣지 말고 종량제 봉투로 보내세요. 낱장으로 내놓으면 바람에 날려 수거가 어렵습니다. 택배 상자 안의 뽁뽁이도 비닐류이고, 고무장갑이나 돗자리처럼 두꺼운 것은 비닐이 아닙니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'can',
    category: 'recyclable',
    name: localized('can', 'name', { ko: '캔' }),
    aliases: aliases(['알루미늄캔', '음료캔', '통조림']),
    summary: localized('can', 'summary', {
      ko: '음료수 캔과 통조림 캔입니다. 알루미늄이든 철이든 같은 수거함에 넣으면 됩니다.',
    }),
    ...image('can', '물로 헹구고 납작하게 누른 음료수 캔과 통조림 캔입니다.'),
    steps: steps('can', [
      '남은 음료를 비우고 물로 헹굽니다.',
      '통조림처럼 플라스틱 뚜껑이 달려 있으면 떼어 플라스틱류로 보냅니다.',
      '캔류 수거함에 넣습니다. 밟아서 눌러 두면 자리를 덜 차지합니다.',
    ]),
    commonMistake: localized('can', 'commonMistake', {
      ko: '캔 안에 담배꽁초나 휴지를 넣어 버리는 일이 많은데, 그러면 캔 전체를 못 씁니다. 부탄가스나 살충제 통은 바람이 통하는 곳에서 노즐을 눌러 가스를 완전히 뺀 다음 내놓아야 합니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'glass-bottle',
    category: 'recyclable',
    name: localized('glass-bottle', 'name', { ko: '유리병' }),
    aliases: aliases(['병', '소주병', '맥주병']),
    summary: localized('glass-bottle', 'summary', {
      ko: '음료수병과 술병입니다. 소주병과 맥주병은 가게에 돌려주면 보증금을 돌려받을 수 있습니다.',
    }),
    ...image('glass-bottle', '뚜껑을 열어 따로 놓은 유리병 여러 개입니다.'),
    steps: steps('glass-bottle', [
      '남은 내용물을 비우고 물로 헹굽니다.',
      '뚜껑을 열어 재질에 맞게 버립니다. 금속 뚜껑은 캔류, 플라스틱 뚜껑은 플라스틱류입니다.',
      '소주병과 맥주병은 편의점이나 마트에 가져가 보증금을 돌려받습니다.',
      '나머지 병은 깨지지 않게 조심해서 유리병 수거함에 넣습니다.',
    ]),
    commonMistake: localized('glass-bottle', 'commonMistake', {
      ko: '유리처럼 보여도 유리병이 아닌 것이 많습니다. 거울, 전구, 도자기 그릇, 내열 유리, 깨진 유리는 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 병 안에 담배꽁초를 넣는 것도 같은 이유로 안 됩니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'paper-box',
    category: 'recyclable',
    name: localized('paper-box', 'name', { ko: '종이·상자' }),
    aliases: aliases(['박스', '택배상자', '종이']),
    summary: localized('paper-box', 'summary', {
      ko: '택배 상자와 종이류입니다. 붙어 있는 테이프와 송장을 떼는 것이 가장 중요합니다.',
    }),
    ...image('paper-box', '테이프와 송장을 떼고 납작하게 접어 묶은 택배 상자입니다.'),
    steps: steps('paper-box', [
      '송장 스티커와 테이프를 뜯어냅니다. 송장에는 이름과 주소가 적혀 있으니 찢어서 버리세요.',
      '상자를 펼쳐 납작하게 접습니다.',
      '여러 장을 겹쳐 끈으로 묶어 종이류로 내놓습니다.',
    ]),
    commonMistake: localized('paper-box', 'commonMistake', {
      ko: '종이처럼 보이지만 종이류가 아닌 것들이 있습니다. 영수증, 코팅된 전단지, 비닐이 덮인 종이는 종량제 봉투로 갑니다. 기름이 밴 피자 상자는 그 부분만 뜯어내고 깨끗한 나머지만 종이로 보내면 됩니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'food-waste',
    category: 'food',
    name: localized('food-waste', 'name', { ko: '음식물' }),
    aliases: aliases(['음식물쓰레기', '잔반']),
    summary: localized('food-waste', 'summary', {
      ko: '음식물 쓰레기는 사료와 퇴비로 다시 쓰입니다. 그래서 동물이 먹을 수 있는 것만 넣는다고 생각하면 헷갈릴 일이 줄어듭니다.',
    }),
    ...image('food-waste', '물기를 짜서 음식물 전용 통에 담은 음식물 쓰레기입니다.'),
    steps: steps('food-waste', [
      '비닐, 나무젓가락, 이쑤시개 같은 이물질을 골라냅니다.',
      '물기를 꽉 짜서 뺍니다. 수분이 많으면 처리 비용이 올라갑니다.',
      '대파나 수박처럼 길거나 큰 것은 잘게 잘라 음식물 전용 통에 넣습니다.',
    ]),
    commonMistake: localized('food-waste', 'commonMistake', {
      ko: '껍질이라고 다 음식물은 아닙니다. 양파·마늘·옥수수 껍질과 대파 뿌리는 질겨서 사료가 되지 못하니 종량제 봉투로 보내세요. 차 찌꺼기와 한약재 찌꺼기도 마찬가지입니다. 지역마다 기준이 조금씩 달라 애매하면 구청 안내를 확인하는 편이 안전합니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-food-waste'],
  },
  {
    id: 'bones-shells',
    category: 'general',
    name: localized('bones-shells', 'name', { ko: '뼈·껍데기' }),
    aliases: aliases(['뼈', '껍데기', '조개껍데기']),
    summary: localized('bones-shells', 'summary', {
      ko: '닭뼈, 생선뼈, 조개껍데기, 달걀 껍데기는 음식물이 아니라 일반 쓰레기입니다. 딱딱해서 사료로 갈리지 않기 때문입니다.',
    }),
    ...image('bones-shells', '신문지에 싸서 종량제 봉투에 넣은 닭뼈와 조개껍데기입니다.'),
    steps: steps('bones-shells', [
      '물기를 털어냅니다. 젖은 채로 두면 냄새가 심해집니다.',
      '신문지나 봉지로 한 번 감쌉니다. 날카로운 뼈가 봉투를 뚫는 것을 막아 줍니다.',
      '종량제 봉투에 넣어 일반 쓰레기로 내놓습니다.',
    ]),
    commonMistake: localized('bones-shells', 'commonMistake', {
      ko: '먹고 남은 것이라 음식물 통에 넣기 쉬운데, 뼈와 껍데기가 섞이면 사료 만드는 기계가 멈춥니다. 게·가재 껍데기, 소라, 복숭아 씨, 밤과 호두 껍질도 같은 이유로 일반 쓰레기입니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-general-waste', 'me-food-waste'],
  },
  {
    id: 'battery',
    category: 'special',
    name: localized('battery', 'name', { ko: '폐건전지' }),
    aliases: aliases(['건전지', '배터리']),
    summary: localized('battery', 'summary', {
      ko: '건전지 안에는 수은과 카드뮴 같은 중금속이 들어 있습니다. 일반 쓰레기에 섞이면 안 되고 전용 수거함으로 가야 합니다.',
    }),
    ...image('battery', '양 끝을 테이프로 감싸 폐건전지 전용 수거함에 넣는 건전지입니다.'),
    steps: steps('battery', [
      '물기를 닦아냅니다. 젖으면 녹이 슬어 안의 액이 샐 수 있습니다.',
      '양 끝을 테이프로 감싸 두면 더 안전합니다.',
      '주민센터, 아파트 관리사무소, 편의점 등에 있는 폐건전지 전용 수거함에 넣습니다.',
    ]),
    commonMistake: localized('battery', 'commonMistake', {
      ko: '작다고 종량제 봉투에 넣으면 안 됩니다. 매립되면 중금속이 땅과 물로 흘러듭니다. 수거함 위치는 지역마다 다르니 구청 홈페이지나 분리배출 누리집의 지역별 안내에서 가까운 곳을 먼저 찾아보세요.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'broken-glass',
    category: 'general',
    name: localized('broken-glass', 'name', { ko: '깨진 유리' }),
    aliases: aliases(['유리조각', '깨진유리']),
    summary: localized('broken-glass', 'summary', {
      ko: '깨진 유리와 사기그릇은 재활용되지 않습니다. 수거하는 사람이 다치지 않게 싸서 버리는 것이 핵심입니다.',
    }),
    ...image('broken-glass', '신문지로 감싸고 테이프로 고정해 "유리"라고 적어 둔 유리 조각입니다.'),
    steps: steps('broken-glass', [
      '신문지나 두꺼운 종이로 조각을 감쌉니다.',
      '테이프로 단단히 고정하고 겉에 "유리"라고 적어 둡니다.',
      '불연성 폐기물 전용 마대에 넣습니다. 마대를 파는 곳은 구청에 확인하세요.',
    ]),
    commonMistake: localized('broken-glass', 'commonMistake', {
      ko: '유리병 수거함에 넣으면 안 됩니다. 깨진 유리는 병과 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 불연성 쓰레기를 다루는 방식은 지역마다 달라서 종량제 봉투로 받는 곳도 있으니 미리 확인하세요.',
    }),
    needsLocalCheck: true,
    sourceIds: ['me-general-waste', 'local-government'],
  },
  {
    id: 'clothing',
    category: 'special',
    name: localized('clothing', 'name', { ko: '의류' }),
    aliases: aliases(['옷', '헌옷']),
    summary: localized('clothing', 'summary', {
      ko: '입지 않는 옷과 천은 헌 옷 수거함으로 갑니다. 상태가 괜찮으면 다시 팔리거나 다른 나라로 수출됩니다.',
    }),
    ...image('clothing', '봉투에 담아 헌 옷 수거함에 넣는 옷가지입니다.'),
    steps: steps('clothing', [
      '주머니를 확인하고 젖은 옷은 말립니다.',
      '여러 벌을 봉투에 모아 담습니다. 비에 젖으면 못 쓰게 되니 묶어 두는 편이 좋습니다.',
      '길가나 아파트 단지에 있는 헌 옷 수거함에 넣습니다.',
    ]),
    commonMistake: localized('clothing', 'commonMistake', {
      ko: '수거함에 넣어도 재활용되지 않는 것들이 있습니다. 솜이불과 베개, 신발 한 짝, 심하게 찢어진 옷이 그렇습니다. 이런 것은 대형 폐기물로 신고하거나 종량제 봉투로 보내야 합니다.',
    }),
    needsLocalCheck: false,
    sourceIds: ['keco-special-waste'],
  },
  {
    id: 'small-electronics',
    category: 'special',
    name: localized('small-electronics', 'name', { ko: '소형가전' }),
    aliases: aliases(['소형 가전', '드라이기', '전자제품']),
    summary: localized('small-electronics', 'summary', {
      ko: '드라이기, 선풍기, 전기밥솥처럼 작은 가전입니다. 무상 방문 수거를 신청하면 돈을 내지 않고 가져갑니다.',
    }),
    ...image('small-electronics', '무상 방문 수거를 기다리며 모아 둔 드라이기와 선풍기 등 소형가전입니다.'),
    steps: steps('small-electronics', [
      '안에 든 건전지를 빼서 따로 버립니다.',
      '5개 이상 모읍니다. 소형가전은 하나만으로는 방문 수거를 부를 수 없습니다.',
      '폐가전 무상 방문 수거를 신청하거나 주민센터의 소형가전 수거함에 넣습니다.',
    ]),
    commonMistake: localized('small-electronics', 'commonMistake', {
      ko: '크기가 작다고 종량제 봉투에 넣으면 안 됩니다. 안에 든 금속은 재활용 가치가 높습니다. 수거 방식과 대상 품목은 지역마다 차이가 있으니 구청 안내를 먼저 보세요.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'fluorescent-lamp',
    category: 'special',
    name: localized('fluorescent-lamp', 'name', { ko: '형광등' }),
    aliases: aliases(['형광등', '전구']),
    summary: localized('fluorescent-lamp', 'summary', {
      ko: '형광등 안에는 수은이 들어 있습니다. 깨지면 수은이 퍼지기 때문에 온전한 상태로 전용 수거함까지 가져가야 합니다.',
    }),
    ...image('fluorescent-lamp', '깨지지 않게 세워서 폐형광등 전용 수거함에 넣는 형광등입니다.'),
    steps: steps('fluorescent-lamp', [
      '새 등을 사면서 받은 상자가 있으면 거기에 넣습니다. 옮기는 동안 깨지지 않게 하려는 것입니다.',
      '주민센터나 아파트에 있는 폐형광등 전용 수거함을 찾습니다.',
      '깨지지 않게 세워서 넣습니다.',
    ]),
    commonMistake: localized('fluorescent-lamp', 'commonMistake', {
      ko: 'LED 전구와 백열전구는 형광등이 아닙니다. 수은이 없어서 전용 수거함이 아니라 불연성 쓰레기로 갑니다. 이미 깨진 형광등은 수거함에 넣지 말고 신문지에 싸서 종량제 봉투에 넣은 뒤 창문을 열어 환기하세요.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'styrofoam',
    category: 'recyclable',
    name: localized('styrofoam', 'name', { ko: '스티로폼' }),
    aliases: aliases(['스티로폼', '아이스박스', '포장재']),
    summary: localized('styrofoam', 'summary', {
      ko: '택배 아이스박스와 전자제품 완충재입니다. 하얗고 깨끗한 것만 재활용됩니다.',
    }),
    ...image('styrofoam', '테이프와 송장을 떼어 깨끗해진 하얀 스티로폼 상자입니다.'),
    steps: steps('styrofoam', [
      '붙어 있는 테이프, 송장, 스티커를 모두 뜯어냅니다.',
      '음식물이 닿았던 곳은 물로 씻어 말립니다.',
      '스티로폼끼리 모아 내놓습니다. 부피가 크면 부러뜨려 겹쳐 두세요.',
    ]),
    commonMistake: localized('styrofoam', 'commonMistake', {
      ko: '색이 있거나 겉에 코팅이 된 스티로폼, 건축 자재로 쓰는 스티로폼은 재활용되지 않습니다. 테이프를 떼지 않으면 깨끗한 상자도 통째로 버려집니다. 전자제품을 사면서 나온 완충재는 가급적 산 곳에 돌려주세요.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
];
