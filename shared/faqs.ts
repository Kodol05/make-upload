import { localized } from './placeholder.js';
import type { Faq, ItemId } from './types.js';

/**
 * FAQ 20개.
 *
 * 유학생이 실제로 헷갈리는 지점을 골랐고, 16종 도감이 모두 한 번 이상 다뤄지게 배치했다.
 * 한국어 문안은 환경부 「재활용품 분리배출 가이드라인」 8장 FAQ와 생활폐기물 분리배출
 * 누리집 품목사전을 근거로 채웠다. 나머지 언어는 번역 대기다.
 *
 * `sourceIds`는 답변을 실제로 뒷받침하는 출처만 적는다. 챗봇은 여기 적힌 것만 인용할 수 있다.
 */
const topics: Array<{
  id: string;
  relatedItemIds: ItemId[];
  sourceIds: string[];
  question: string;
  answer: string;
}> = [
  {
    id: 'faq-plastic-cap',
    relatedItemIds: ['clear-pet', 'glass-bottle'],
    sourceIds: ['me-recyclable'],
    question: '병뚜껑은 떼야 하나요, 닫아야 하나요?',
    answer:
      '병 종류에 따라 다릅니다. 투명 페트병은 뚜껑을 닫은 채로 버립니다. 재활용 공정에서 물에 뜨는 뚜껑과 가라앉는 몸통이 저절로 갈라지기 때문입니다. 반대로 유리병은 뚜껑을 열어 금속은 캔류로, 플라스틱은 플라스틱류로 따로 보내야 합니다.',
  },
  {
    id: 'faq-pet-label',
    relatedItemIds: ['clear-pet'],
    sourceIds: ['me-recyclable'],
    question: '페트병 라벨이 잘 안 떨어지는데 그냥 버려도 되나요?',
    answer:
      '떼는 것이 맞습니다. 라벨은 페트병과 재질이 달라서 붙어 있으면 재활용 등급이 떨어집니다. 요즘 나오는 생수병은 대부분 절취선이 있어 그 선을 따라 당기면 쉽게 벗겨집니다. 접착제가 남아 잘 안 떨어질 때는 따뜻한 물에 잠깐 담가 두면 훨씬 수월합니다.',
  },
  {
    id: 'faq-oily-paper',
    relatedItemIds: ['paper-box'],
    sourceIds: ['me-recyclable'],
    question: '기름이 밴 피자 상자도 종이로 버릴 수 있나요?',
    answer:
      '기름이 밴 부분은 종이로 재활용되지 않습니다. 젖거나 기름진 면만 뜯어내 종량제 봉투에 넣고, 깨끗하게 남은 부분만 종이류로 내놓으세요. 상자 전체에 배어 있다면 통째로 종량제 봉투가 맞습니다.',
  },
  {
    id: 'faq-dirty-delivery-container',
    relatedItemIds: ['delivery-container'],
    sourceIds: ['me-recyclable'],
    question: '배달 용기를 꼭 씻어야 하나요?',
    answer:
      '씻어야 재활용됩니다. 양념과 기름이 남아 있으면 선별장에서 걸러져 결국 소각됩니다. 물로 한 번 헹구는 정도면 충분하고, 기름기가 심하면 세제를 조금 써도 됩니다. 아무리 씻어도 색이 지워지지 않을 만큼 배었다면 종량제 봉투에 넣으세요.',
  },
  {
    id: 'faq-cup-noodle-soup',
    relatedItemIds: ['cup-noodle'],
    sourceIds: ['me-recyclable'],
    question: '컵라면 국물이 밴 용기는 재활용되나요?',
    answer:
      '헹구면 됩니다. 남은 국물과 면을 음식물 쓰레기로 버리고 용기 안쪽을 물로 씻어 주세요. 그다음 스티로폼 용기는 스티로폼으로, 종이 용기는 종이류로 보냅니다. 기름 자국이 잘 지워지지 않으면 하루쯤 말려도 좋고, 그래도 안 되면 종량제 봉투에 넣습니다.',
  },
  {
    id: 'faq-paper-cup',
    relatedItemIds: ['disposable-cup'],
    sourceIds: ['me-recyclable'],
    question: '커피가 묻은 종이컵은 어디에 버리나요?',
    answer:
      '가볍게 헹궈서 종이류로 보내면 됩니다. 종이컵만 따로 모아 내놓는 것이 가장 좋고, 그러기 어려우면 종이팩과 함께 배출해도 됩니다. 다만 커피가 진하게 말라붙었거나 담배꽁초가 들어 있는 컵은 종량제 봉투로 가야 합니다.',
  },
  {
    id: 'faq-straw',
    relatedItemIds: ['disposable-cup'],
    sourceIds: ['me-recyclable'],
    question: '빨대는 어떻게 버리나요?',
    answer:
      '플라스틱 빨대는 헹궈서 플라스틱류로 배출합니다. 컵에 꽂은 채로 버리면 선별 과정에서 걸러지니 반드시 뽑아서 따로 내놓으세요. 음식물 쓰레기에 섞여 들어가는 일이 잦은데, 빨대는 음식물이 아닙니다.',
  },
  {
    id: 'faq-dirty-vinyl',
    relatedItemIds: ['vinyl'],
    sourceIds: ['me-recyclable'],
    question: '양념이 묻은 라면 봉지도 비닐로 버리나요?',
    answer:
      '씻어서 버리면 비닐류가 맞습니다. 재활용 표시가 없는 봉투도 과자 봉지, 라면 봉지와 함께 비닐류로 모읍니다. 다만 이물질이 잘 지워지지 않으면 종량제 봉투로 보내세요. 낱장으로 내놓으면 바람에 날리니 봉투 하나에 모아 담는 것이 좋습니다.',
  },
  {
    id: 'faq-can-crush',
    relatedItemIds: ['can'],
    sourceIds: ['me-recyclable'],
    question: '캔은 찌그러뜨려서 버려도 되나요?',
    answer:
      '괜찮습니다. 오히려 부피가 줄어 수거하기 좋습니다. 버리기 전에 내용물을 비우고 물로 헹구는 것을 잊지 마세요. 캔 안에 담배꽁초나 휴지를 넣으면 캔 전체가 재활용되지 못합니다.',
  },
  {
    id: 'faq-glass-bottle-cap',
    relatedItemIds: ['glass-bottle'],
    sourceIds: ['me-recyclable'],
    question: '소주병과 맥주병은 그냥 버리면 손해인가요?',
    answer:
      '가게에 돌려주면 빈용기보증금을 돌려받습니다. 소주병과 맥주병은 씻어서 다시 쓰는 병이라 제품 값에 보증금이 포함돼 있습니다. 편의점이나 마트에 가져가면 그 자리에서 현금으로 받을 수 있고, 라벨은 떼지 않아도 됩니다.',
  },
  {
    id: 'faq-box-tape',
    relatedItemIds: ['paper-box'],
    sourceIds: ['me-recyclable'],
    question: '택배 상자의 테이프와 송장을 꼭 떼야 하나요?',
    answer:
      '떼야 합니다. 테이프는 종이와 재질이 달라 그대로 두면 재활용을 방해합니다. 송장은 이름, 전화번호, 주소가 그대로 드러나니 개인정보를 지키기 위해서라도 반드시 뜯어내고 찢어서 버리세요.',
  },
  {
    id: 'faq-food-or-general',
    relatedItemIds: ['food-waste', 'bones-shells'],
    sourceIds: ['me-food-waste'],
    question: '음식물 쓰레기인지 일반 쓰레기인지 어떻게 구분하나요?',
    answer:
      '동물이 사료로 먹을 수 있는지를 기준으로 삼으면 대체로 맞습니다. 음식물 쓰레기는 사료와 퇴비로 다시 쓰이기 때문입니다. 뼈, 껍데기, 씨앗처럼 딱딱한 것과 차 찌꺼기, 한약재 찌꺼기는 종량제 봉투로 갑니다. 지역마다 기준이 조금씩 달라 애매하면 구청 안내를 확인하세요.',
  },
  {
    id: 'faq-bones',
    relatedItemIds: ['bones-shells'],
    sourceIds: ['me-general-waste'],
    question: '닭뼈와 생선뼈는 음식물 쓰레기 아닌가요?',
    answer:
      '아닙니다. 먹고 남은 것이지만 뼈는 딱딱해서 사료로 갈리지 않기 때문에 종량제 봉투에 넣어야 합니다. 물기를 털고 신문지에 한 번 싸서 버리면 냄새도 덜하고 봉투가 찢어지지도 않습니다.',
  },
  {
    id: 'faq-eggshell',
    relatedItemIds: ['bones-shells', 'food-waste'],
    sourceIds: ['me-food-waste'],
    question: '달걀 껍데기와 조개껍데기는 어디로 가나요?',
    answer:
      '둘 다 일반 쓰레기입니다. 달걀, 오리알, 메추리알 껍데기와 조개, 소라, 전복, 굴 껍데기는 음식물 쓰레기로 받지 않습니다. 게와 가재 같은 갑각류 껍데기도 마찬가지로 종량제 봉투에 넣습니다.',
  },
  {
    id: 'faq-dirty-styrofoam',
    relatedItemIds: ['styrofoam'],
    sourceIds: ['me-recyclable'],
    question: '스티로폼에 테이프가 붙어 있는데 그대로 버려도 되나요?',
    answer:
      '테이프와 송장은 모두 떼야 합니다. 하나라도 붙어 있으면 깨끗한 상자도 통째로 버려집니다. 음식물이 닿았던 자리는 물로 씻어 말리고, 색이 있거나 코팅된 스티로폼은 애초에 재활용 대상이 아니니 종량제 봉투로 보내세요.',
  },
  {
    id: 'faq-battery-where',
    relatedItemIds: ['battery'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: '다 쓴 건전지는 어디에 버리나요?',
    answer:
      '폐건전지 전용 수거함에 넣어야 합니다. 주민센터, 아파트 관리사무소, 편의점 등에 놓여 있습니다. 안에 수은과 카드뮴 같은 중금속이 들어 있어 종량제 봉투에 넣으면 안 됩니다. 수거함 위치는 지역마다 다르니 구청 홈페이지나 분리배출 누리집의 지역별 안내에서 확인하세요.',
  },
  {
    id: 'faq-broken-glass-safety',
    relatedItemIds: ['broken-glass'],
    sourceIds: ['me-general-waste', 'local-government'],
    question: '컵이 깨졌는데 유리병 수거함에 넣으면 되나요?',
    answer:
      '안 됩니다. 깨진 유리는 유리병과 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 신문지로 감싸 테이프로 고정하고 겉에 "유리"라고 적어, 불연성 폐기물 전용 마대에 넣으세요. 처리 방식은 지역마다 달라 종량제 봉투로 받는 곳도 있습니다.',
  },
  {
    id: 'faq-clothing-bin',
    relatedItemIds: ['clothing'],
    sourceIds: ['keco-special-waste'],
    question: '안 입는 옷은 헌 옷 수거함에 다 넣어도 되나요?',
    answer:
      '옷과 천 종류는 됩니다. 다만 솜이불, 베개, 신발 한 짝, 심하게 찢어진 옷은 수거함에 넣어도 재활용되지 않습니다. 이런 것은 대형 폐기물로 신고하거나 종량제 봉투로 보내야 합니다. 비에 젖으면 못 쓰게 되니 봉투에 담아 묶어서 넣으세요.',
  },
  {
    id: 'faq-small-appliance-where',
    relatedItemIds: ['small-electronics'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: '고장 난 드라이기 하나를 버리려면 어떻게 하나요?',
    answer:
      '하나만으로는 무상 방문 수거를 부를 수 없습니다. 소형가전은 5개 이상 모아야 신청할 수 있어서, 그 전까지는 주민센터에 있는 소형가전 수거함을 이용하는 편이 빠릅니다. 안에 건전지가 들어 있으면 먼저 빼서 따로 버리세요.',
  },
  {
    id: 'faq-lamp-where',
    relatedItemIds: ['fluorescent-lamp'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: 'LED 전구도 형광등 수거함에 넣나요?',
    answer:
      '아닙니다. 전용 수거함은 수은이 든 형광등을 위한 것이라 LED 전구와 백열전구는 대상이 아닙니다. 이 둘은 불연성 쓰레기로 배출합니다. 형광등이 이미 깨졌다면 수거함에 넣지 말고 신문지에 싸서 종량제 봉투에 넣은 뒤 창문을 열어 환기하세요.',
  },
];

export const faqs: Faq[] = topics.map(
  ({ id, relatedItemIds, sourceIds, question, answer }) => ({
    id,
    question: localized(id, 'question', { ko: question }),
    answer: localized(id, 'answer', { ko: answer }),
    relatedItemIds,
    sourceIds,
  }),
);
