import { localized } from './placeholder.js';
import type { CatalogItem, CatalogStep, ItemId, LocalizedText } from './types.js';

/**
 * 품목별 처리 단계를 만든다.
 *
 * 단계는 3개 또는 4개만 쓴다. 손에 들고 따라 할 수 있는 크기여야 해서 그 이상 쪼개면
 * 오히려 안 읽힌다.
 */
function steps(itemId: ItemId, texts: LocalizedText[]): CatalogStep[] {
  return texts.map((text, index) => {
    const id = String(index + 1).padStart(2, '0');
    return { id, text: localized(itemId, `step${id}`, text) };
  });
}

/**
 * 품목 대표 이미지 경로와 대체 텍스트를 만든다.
 *
 * 이미지는 품목당 한 장이며 도감 카드·상세 화면과 스캔 화면의 선택 목록이 같은
 * 파일을 쓴다. 파일이 없어도 처리 순서와 흔한 실수는 그대로 읽혀야 한다.
 */
function image(itemId: ItemId, alt: LocalizedText) {
  return {
    image: `/images/items/${itemId}.webp`,
    imageAlt: localized(itemId, 'imageAlt', alt),
  };
}

/**
 * 검색용 별칭.
 *
 * 이름만으로는 안 찾아지는 말을 넣는다. 유학생은 '페트병'보다 'water bottle',
 * '矿泉水瓶', 'chai nước'로 먼저 떠올린다.
 */
function aliases(
  ko: string[],
  en: string[],
  zh: string[],
  vi: string[],
): CatalogItem['aliases'] {
  return { ko, en, zh, vi };
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
 * - 기후에너지환경부 「재활용품 분리배출 가이드라인」(재활용법 제12조의3·제13조 근거)
 * - 생활폐기물 분리배출 누리집 품목사전 <https://분리배출.kr>
 *
 * 번역에서는 유학생이 현장에서 마주치는 한국어 단어(종량제 봉투, 주민센터 등)를 괄호로
 * 병기한다. 봉투를 사거나 수거함을 찾을 때 결국 그 글자를 읽어야 하기 때문이다.
 * 지역마다 다를 수 있는 품목은 `needsLocalCheck`로 표시하고 화면이 확인 안내를 띄운다.
 */
export const catalogItems: CatalogItem[] = [
  {
    id: 'clear-pet',
    category: 'recyclable',
    name: localized('clear-pet', 'name', {
      ko: '투명 페트병',
      en: 'Clear PET bottle',
      zh: '透明塑料瓶',
      vi: 'Chai nhựa PET trong suốt',
    }),
    aliases: aliases(
      ['페트병', '생수병', '음료수병'],
      ['pet bottle', 'water bottle', 'plastic bottle', 'soda bottle'],
      ['矿泉水瓶', '饮料瓶', '塑料瓶'],
      ['chai nước', 'chai nhựa', 'chai nước ngọt'],
    ),
    summary: localized('clear-pet', 'summary', {
      ko: '생수나 음료가 담겨 있던 무색 페트병입니다. 라벨만 떼어 따로 모으면 옷이나 새 페트병의 원료가 됩니다.',
      en: 'A colourless PET bottle that held water or a soft drink. Peel off the label and collect it separately, and it becomes fabric or a new bottle.',
      zh: '装过矿泉水或饮料的无色塑料瓶。只要撕掉标签单独收集，就能变成衣服或新瓶子的原料。',
      vi: 'Chai PET không màu từng đựng nước hoặc nước ngọt. Chỉ cần bóc nhãn và gom riêng, nó sẽ thành nguyên liệu cho vải hoặc chai mới.',
    }),
    ...image('clear-pet', {
      ko: '라벨을 뗀 빈 투명 페트병입니다.',
      en: 'An empty clear PET bottle with the label removed.',
      zh: '撕掉标签的空透明塑料瓶。',
      vi: 'Chai nhựa PET trong suốt đã bóc nhãn, bên trong trống.',
    }),
    steps: steps('clear-pet', [
      {
        ko: '남은 음료를 비우고 안쪽을 물로 한 번 헹굽니다.',
        en: 'Empty out any drink left inside and rinse the bottle once with water.',
        zh: '倒掉剩余饮料，用水冲洗一次瓶内。',
        vi: 'Đổ hết nước còn lại và tráng bên trong chai bằng nước một lần.',
      },
      {
        ko: '몸통을 감싼 비닐 라벨을 뜯어냅니다. 절취선이 있으면 그 선을 따라 당기면 쉽게 떨어집니다.',
        en: 'Peel off the plastic label around the body. If there is a tear line, pull along it and the label comes away easily.',
        zh: '撕掉包在瓶身上的塑料标签。若有撕裂线，顺着那条线拉就能轻松撕下。',
        vi: 'Bóc lớp nhãn nhựa quanh thân chai. Nếu có đường xé, kéo theo đường đó là bóc ra dễ dàng.',
      },
      {
        ko: '발로 밟아 납작하게 눌러 부피를 줄입니다.',
        en: 'Step on the bottle to flatten it and reduce its volume.',
        zh: '用脚踩扁瓶子以减少体积。',
        vi: 'Giẫm cho chai bẹp lại để giảm thể tích.',
      },
      {
        ko: '뚜껑을 닫은 채로 투명 페트병 전용 수거함에 넣습니다. 전용함이 없으면 플라스틱류에 넣습니다.',
        en: 'Screw the cap back on and put it in the clear-PET collection bin. If there is no dedicated bin, put it with plastics.',
        zh: '拧上盖子后投入透明塑料瓶专用回收箱。没有专用箱时投到塑料类。',
        vi: 'Vặn nắp lại rồi bỏ vào thùng thu gom chai PET trong suốt. Nếu không có thùng riêng thì bỏ vào nhựa.',
      },
    ]),
    commonMistake: localized('clear-pet', 'commonMistake', {
      ko: '뚜껑을 반드시 떼야 한다고 알고 있는 사람이 많은데, 투명 페트병은 닫아서 버리는 것이 맞습니다. 재활용 과정에서 물에 뜨는 뚜껑과 가라앉는 몸통이 저절로 갈라지기 때문입니다. 대신 라벨은 꼭 떼야 하고, 색이 들어간 병은 투명 페트병이 아니라 플라스틱류로 갑니다.',
      en: 'Many people believe the cap must always come off, but for clear PET bottles leaving it on is correct: during recycling the cap floats while the body sinks, so they separate by themselves. The label, on the other hand, really does have to go. Coloured bottles are not clear PET and belong with plastics.',
      zh: '很多人以为盖子必须取下，但透明塑料瓶拧上盖子扔才是对的。回收时盖子浮起、瓶身下沉，会自动分离。反倒是标签一定要撕掉。有颜色的瓶子不属于透明塑料瓶，要投到塑料类。',
      vi: 'Nhiều người nghĩ nhất định phải tháo nắp, nhưng với chai PET trong suốt thì vặn nắp lại mới đúng: khi tái chế nắp nổi lên còn thân chìm xuống nên tự tách ra. Ngược lại, nhãn thì bắt buộc phải bóc. Chai có màu không phải PET trong suốt mà thuộc về nhựa.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'delivery-container',
    category: 'recyclable',
    name: localized('delivery-container', 'name', {
      ko: '배달용기',
      en: 'Food delivery container',
      zh: '外卖餐盒',
      vi: 'Hộp đồ ăn giao tận nơi',
    }),
    aliases: aliases(
      ['배달 용기', '플라스틱 용기'],
      ['delivery box', 'takeout container', 'plastic container', 'food container'],
      ['外卖盒', '塑料餐盒', '打包盒'],
      ['hộp nhựa', 'hộp mang về', 'hộp đựng thức ăn'],
    ),
    summary: localized('delivery-container', 'summary', {
      ko: '배달 음식이 담겨 오는 플라스틱 용기입니다. 기름과 양념을 씻어냈는지가 재활용 여부를 가릅니다.',
      en: 'The plastic container your delivery food arrives in. Whether you wash off the oil and sauce decides if it can be recycled.',
      zh: '外卖食物装来的塑料容器。有没有洗掉油和酱汁，决定了它能否被回收。',
      vi: 'Hộp nhựa đựng đồ ăn giao đến. Việc bạn có rửa sạch dầu và sốt hay không quyết định nó có tái chế được không.',
    }),
    ...image('delivery-container', {
      ko: '양념 자국이 남은 투명 플라스틱 배달용기에 뚜껑이 덮여 있습니다.',
      en: 'A clear plastic delivery container with sauce stains inside, lid still on.',
      zh: '盖着盖子的透明塑料外卖容器，里面还留着酱汁痕迹。',
      vi: 'Hộp nhựa trong đựng đồ ăn giao tận nơi còn vết sốt bên trong, nắp vẫn đậy.',
    }),
    steps: steps('delivery-container', [
      {
        ko: '남은 음식을 음식물 쓰레기로 먼저 덜어냅니다.',
        en: 'Scrape any leftover food into food waste first.',
        zh: '先把剩余食物倒进厨余垃圾。',
        vi: 'Trước tiên gạt hết đồ ăn thừa vào rác thực phẩm.',
      },
      {
        ko: '설거지하듯 물로 헹굽니다. 기름기가 심하면 세제를 조금 써도 됩니다.',
        en: 'Rinse it with water as you would when washing dishes. A little detergent is fine for heavy grease.',
        zh: '像洗碗一样用水冲洗。油太重时可以用一点洗洁精。',
        vi: 'Tráng bằng nước như khi rửa chén. Dầu nhiều thì dùng chút nước rửa chén cũng được.',
      },
      {
        ko: '뚜껑과 몸통을 포개어 플라스틱류로 내놓습니다.',
        en: 'Stack the lid and the container together and put them out with plastics.',
        zh: '把盖子和容器叠好，投到塑料类。',
        vi: 'Xếp chồng nắp và hộp lại rồi bỏ vào nhựa.',
      },
    ]),
    commonMistake: localized('delivery-container', 'commonMistake', {
      ko: '양념이 밴 용기를 그대로 내놓으면 재활용되지 않고 결국 소각됩니다. 씻어도 색이 지워지지 않을 만큼 배어 있다면 종량제 봉투에 넣는 편이 낫습니다. 용기에 붙은 비닐 뚜껑은 떼어 비닐류로 보냅니다.',
      en: 'A container still stained with sauce will not be recycled — it ends up incinerated. If the colour will not wash out, a standard garbage bag (종량제 봉투) is the better choice. Peel off the film lid and send it to plastic film.',
      zh: '沾着酱汁直接投放的容器不会被回收，最终只能焚烧。如果颜色怎么洗都去不掉，放进从量制垃圾袋(종량제 봉투)更合适。容器上的塑料封膜要撕下来投到塑料薄膜类。',
      vi: 'Hộp còn thấm sốt mà bỏ ra thì sẽ không được tái chế và cuối cùng bị đốt. Nếu rửa mà màu không phai thì cho vào túi rác tính phí (종량제 봉투) sẽ tốt hơn. Lớp màng nylon dán trên hộp hãy bóc ra và bỏ vào nylon.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'cup-noodle',
    category: 'recyclable',
    name: localized('cup-noodle', 'name', {
      ko: '컵라면 용기',
      en: 'Cup noodle container',
      zh: '杯面容器',
      vi: 'Hộp mì ly',
    }),
    aliases: aliases(
      ['컵라면', '사발면'],
      ['cup noodle', 'instant noodle cup', 'ramen cup'],
      ['泡面碗', '方便面杯', '杯面'],
      ['mì ly', 'mì cốc', 'hộp mì ăn liền'],
    ),
    summary: localized('cup-noodle', 'summary', {
      ko: '컵라면 용기는 종이와 스티로폼 두 종류가 있습니다. 어느 쪽이든 국물 자국을 씻어내야 재활용됩니다.',
      en: 'Cup noodle containers come in paper and styrofoam. Either way, the broth stains have to be washed out before it can be recycled.',
      zh: '杯面容器分纸质和泡沫塑料两种。无论哪种，都要洗掉汤渍才能回收。',
      vi: 'Hộp mì ly có hai loại: giấy và xốp. Loại nào cũng phải rửa sạch vết nước dùng mới tái chế được.',
    }),
    ...image('cup-noodle', {
      ko: '뚜껑을 뗀 종이 컵라면 용기입니다. 안이 비어 있습니다.',
      en: 'A paper cup noodle container with the film lid peeled off, empty inside.',
      zh: '撕掉盖膜的纸质杯面容器，里面是空的。',
      vi: 'Hộp mì ly bằng giấy đã bóc lớp màng nắp, bên trong trống rỗng.',
    }),
    steps: steps('cup-noodle', [
      {
        ko: '남은 국물과 면을 음식물 쓰레기로 버립니다.',
        en: 'Pour the leftover broth and noodles into food waste.',
        zh: '把剩下的汤和面倒进厨余垃圾。',
        vi: 'Đổ nước dùng và mì còn thừa vào rác thực phẩm.',
      },
      {
        ko: '용기 안쪽을 물로 헹굽니다. 기름이 잘 지워지지 않으면 하루쯤 말려도 좋습니다.',
        en: 'Rinse the inside with water. If oil marks resist, letting it dry for a day helps.',
        zh: '用水冲洗容器内侧。油渍不好去除时，晾一天也有帮助。',
        vi: 'Tráng mặt trong hộp bằng nước. Nếu vết dầu khó sạch, phơi khô khoảng một ngày cũng tốt.',
      },
      {
        ko: '스티로폼 용기는 스티로폼으로, 종이 용기는 종이류로 나눠 내놓습니다.',
        en: 'Put styrofoam containers with styrofoam and paper ones with paper.',
        zh: '泡沫塑料容器投到泡沫塑料类，纸质容器投到纸类。',
        vi: 'Hộp xốp bỏ vào xốp, hộp giấy bỏ vào giấy.',
      },
    ]),
    commonMistake: localized('cup-noodle', 'commonMistake', {
      ko: '국물이 밴 채로 버리면 같이 모인 재활용품까지 못 쓰게 만듭니다. 씻기 어려울 정도면 종량제 봉투가 맞습니다. 뚜껑의 비닐 부분은 따로 떼서 비닐류로 보내세요.',
      en: 'Throwing it out soaked in broth spoils the other recyclables collected with it. If washing is not realistic, a standard garbage bag (종량제 봉투) is the right call. Peel the film part of the lid off and send it to plastic film.',
      zh: '带着汤汁直接扔会连累一起收集的其他可回收物。实在洗不干净时，从量制垃圾袋(종량제 봉투)才是正确选择。盖子的塑料膜部分要单独撕下投到塑料薄膜类。',
      vi: 'Vứt khi còn thấm nước dùng sẽ làm hỏng cả những đồ tái chế được gom cùng. Nếu khó rửa thì túi rác tính phí (종량제 봉투) mới đúng. Phần màng nylon của nắp hãy bóc riêng và bỏ vào nylon.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'disposable-cup',
    category: 'recyclable',
    name: localized('disposable-cup', 'name', {
      ko: '일회용 컵·뚜껑·빨대',
      en: 'Disposable cup, lid and straw',
      zh: '一次性杯子、杯盖和吸管',
      vi: 'Cốc dùng một lần, nắp và ống hút',
    }),
    aliases: aliases(
      ['일회용컵', '테이크아웃컵', '빨대'],
      ['paper cup', 'plastic cup', 'takeout cup', 'straw', 'coffee cup', 'lid'],
      ['纸杯', '塑料杯', '外带杯', '吸管', '杯盖'],
      ['cốc giấy', 'ly nhựa', 'ống hút', 'nắp cốc', 'cốc cà phê'],
    ),
    summary: localized('disposable-cup', 'summary', {
      ko: '카페에서 받은 컵은 부분마다 재질이 달라 가는 곳도 다릅니다. 컵과 뚜껑, 빨대를 나누는 것이 먼저입니다.',
      en: 'A cup from a cafe is made of several materials, and each part goes somewhere different. Start by separating the cup, the lid and the straw.',
      zh: '咖啡店的杯子各部分材质不同，去处也不同。首先要把杯子、杯盖和吸管分开。',
      vi: 'Cốc lấy ở quán cà phê gồm nhiều chất liệu, mỗi phần đi một nơi khác nhau. Việc đầu tiên là tách cốc, nắp và ống hút ra.',
    }),
    ...image('disposable-cup', {
      ko: '컵에서 뚜껑과 빨대를 뽑아 따로 놓은 일회용 컵입니다.',
      en: 'A disposable cup with its lid and straw pulled out and laid separately.',
      zh: '把杯盖和吸管取出后分开摆放的一次性杯子。',
      vi: 'Cốc dùng một lần đã rút nắp và ống hút ra để riêng.',
    }),
    steps: steps('disposable-cup', [
      {
        ko: '남은 음료와 얼음을 비우고 컵 안을 물로 헹굽니다.',
        en: 'Empty out the drink and ice, then rinse the inside of the cup.',
        zh: '倒掉剩余饮料和冰块，用水冲洗杯内。',
        vi: 'Đổ hết đồ uống và đá, rồi tráng bên trong cốc bằng nước.',
      },
      {
        ko: '뚜껑과 빨대를 컵에서 뽑아 분리합니다.',
        en: 'Pull the lid and the straw off the cup.',
        zh: '把杯盖和吸管从杯子上取下来。',
        vi: 'Rút nắp và ống hút ra khỏi cốc.',
      },
      {
        ko: '종이컵은 종이류, 플라스틱 컵과 뚜껑, 빨대는 플라스틱류로 보냅니다.',
        en: 'Paper cups go with paper; plastic cups, lids and straws go with plastics.',
        zh: '纸杯投到纸类，塑料杯、杯盖和吸管投到塑料类。',
        vi: 'Cốc giấy bỏ vào giấy; cốc nhựa, nắp và ống hút bỏ vào nhựa.',
      },
    ]),
    commonMistake: localized('disposable-cup', 'commonMistake', {
      ko: '뚜껑과 빨대를 컵에 꽂은 채로 버리는 경우가 가장 많습니다. 이렇게 나오면 선별장에서 일일이 뜯어야 해서 대부분 그냥 버려집니다. 커피가 진하게 밴 종이컵은 종이류가 아니라 종량제 봉투로 가야 합니다.',
      en: 'The most common mistake is tossing the cup with the lid and straw still attached. Sorting centres would have to pull each one apart, so in practice they are simply discarded. A paper cup deeply stained with coffee belongs in a standard garbage bag (종량제 봉투), not with paper.',
      zh: '最常见的错误是杯盖和吸管还插在杯子上就扔。这样送来分拣厂得一个个拆开，实际上大多直接被丢弃。咖啡渍很重的纸杯不属于纸类，要放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Lỗi phổ biến nhất là vứt cả cốc khi nắp và ống hút vẫn còn cắm. Như vậy nhà máy phân loại phải tách từng cái nên thực tế phần lớn bị bỏ đi. Cốc giấy thấm đậm cà phê thì không thuộc giấy mà phải vào túi rác tính phí (종량제 봉투).',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'vinyl',
    category: 'recyclable',
    name: localized('vinyl', 'name', {
      ko: '비닐',
      en: 'Plastic film and bags',
      zh: '塑料薄膜类',
      vi: 'Túi và màng nylon',
    }),
    aliases: aliases(
      ['비닐봉투', '비닐봉지', '봉지'],
      ['plastic bag', 'snack wrapper', 'film', 'vinyl', 'bubble wrap'],
      ['塑料袋', '零食袋', '包装袋', '气泡膜'],
      ['túi nylon', 'bao bì', 'vỏ bánh kẹo', 'màng xốp hơi'],
    ),
    summary: localized('vinyl', 'summary', {
      ko: '과자 봉지, 라면 봉지, 비닐봉투처럼 얇고 잘 구겨지는 포장재입니다. 재활용 표시가 없어도 비닐류로 모읍니다.',
      en: 'Thin, crinkly packaging such as snack bags, ramen wrappers and shopping bags. Collect them together even when there is no recycling mark.',
      zh: '零食袋、方便面袋、塑料袋这类又薄又易皱的包装材料。即使没有回收标志，也一起归入塑料薄膜类。',
      vi: 'Bao bì mỏng và dễ nhàu như vỏ bánh kẹo, vỏ mì, túi nylon. Dù không có ký hiệu tái chế vẫn gom chung vào nylon.',
    }),
    ...image('vinyl', {
      ko: '비닐 포장재를 한데 모아 담은 투명한 비닐봉투입니다.',
      en: 'A clear plastic bag holding assorted plastic film and wrappers.',
      zh: '把各种塑料薄膜和包装袋收在一起的透明塑料袋。',
      vi: 'Túi nylon trong đựng gộp các loại màng nhựa và bao bì.',
    }),
    steps: steps('vinyl', [
      {
        ko: '안에 남은 부스러기나 소스를 털어냅니다.',
        en: 'Shake out any crumbs or sauce left inside.',
        zh: '把里面残留的碎屑或酱料抖出来。',
        vi: 'Giũ sạch vụn hoặc sốt còn sót bên trong.',
      },
      {
        ko: '기름이나 양념이 묻었으면 물로 씻어 말립니다.',
        en: 'If oil or sauce is stuck on, wash it with water and let it dry.',
        zh: '若沾了油或酱汁，用水洗净后晾干。',
        vi: 'Nếu dính dầu hoặc sốt thì rửa bằng nước rồi phơi khô.',
      },
      {
        ko: '흩날리지 않게 봉투 하나에 모아 담아서 내놓습니다.',
        en: 'Gather everything into one bag so it will not blow away, then put it out.',
        zh: '装进一个袋子里以免被风吹散，然后投放。',
        vi: 'Gom tất cả vào một túi để khỏi bay tứ tung rồi mang ra bỏ.',
      },
    ]),
    commonMistake: localized('vinyl', 'commonMistake', {
      ko: '씻어도 기름이 남는 봉지는 비닐류에 넣지 말고 종량제 봉투로 보내세요. 낱장으로 내놓으면 바람에 날려 수거가 어렵습니다. 택배 상자 안의 뽁뽁이도 비닐류이고, 고무장갑이나 돗자리처럼 두꺼운 것은 비닐이 아닙니다.',
      en: 'If oil stays even after washing, do not put the bag with plastic film — use a standard garbage bag (종량제 봉투). Loose sheets blow away and are hard to collect. Bubble wrap from delivery boxes counts as plastic film, while thick items like rubber gloves and picnic mats do not.',
      zh: '洗过仍有油渍的袋子不要投到塑料薄膜类，请放进从量制垃圾袋(종량제 봉투)。一张张散着放会被风吹走，难以收运。快递箱里的气泡膜也属于塑料薄膜类，而橡胶手套、野餐垫这类厚的则不属于。',
      vi: 'Túi rửa rồi vẫn còn dầu thì đừng bỏ vào nylon mà cho vào túi rác tính phí (종량제 봉투). Để rời từng tờ sẽ bị gió cuốn, khó thu gom. Màng xốp hơi trong thùng hàng cũng thuộc nylon, còn đồ dày như găng tay cao su hay chiếu thì không.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'can',
    category: 'recyclable',
    name: localized('can', 'name', {
      ko: '캔',
      en: 'Metal can',
      zh: '金属罐',
      vi: 'Lon kim loại',
    }),
    aliases: aliases(
      ['알루미늄캔', '음료캔', '통조림'],
      ['can', 'aluminium can', 'tin can', 'soda can', 'food can'],
      ['易拉罐', '铝罐', '罐头', '饮料罐'],
      ['lon nước', 'lon nhôm', 'hộp thiếc', 'đồ hộp'],
    ),
    summary: localized('can', 'summary', {
      ko: '음료수 캔과 통조림 캔입니다. 알루미늄이든 철이든 같은 수거함에 넣으면 됩니다.',
      en: 'Drink cans and food cans. Aluminium and steel both go in the same bin.',
      zh: '饮料罐和罐头。铝制和铁制都投到同一个回收箱即可。',
      vi: 'Lon nước và lon đồ hộp. Nhôm hay sắt đều bỏ chung một thùng.',
    }),
    ...image('can', {
      ko: '뚜껑을 따서 비운 알루미늄 음료수 캔입니다.',
      en: 'An opened and emptied aluminium drink can.',
      zh: '已开启并倒空的铝制饮料罐。',
      vi: 'Lon nước bằng nhôm đã mở và đổ hết.',
    }),
    steps: steps('can', [
      {
        ko: '남은 음료를 비우고 물로 헹굽니다.',
        en: 'Empty out anything left inside and rinse with water.',
        zh: '倒空剩余饮料并用水冲洗。',
        vi: 'Đổ hết phần còn lại và tráng bằng nước.',
      },
      {
        ko: '통조림처럼 플라스틱 뚜껑이 달려 있으면 떼어 플라스틱류로 보냅니다.',
        en: 'If there is a plastic lid, as on some food cans, take it off and send it to plastics.',
        zh: '像罐头那样带塑料盖的，把盖子取下投到塑料类。',
        vi: 'Nếu có nắp nhựa như một số hộp thực phẩm, hãy tháo ra và bỏ vào nhựa.',
      },
      {
        ko: '캔류 수거함에 넣습니다. 밟아서 눌러 두면 자리를 덜 차지합니다.',
        en: 'Put it in the can bin. Stepping on it first saves space.',
        zh: '投入金属罐回收箱。事先踩扁能节省空间。',
        vi: 'Bỏ vào thùng thu gom lon. Giẫm bẹp trước sẽ đỡ tốn chỗ.',
      },
    ]),
    commonMistake: localized('can', 'commonMistake', {
      ko: '캔 안에 담배꽁초나 휴지를 넣어 버리는 일이 많은데, 그러면 캔 전체를 못 씁니다. 부탄가스나 살충제 통은 바람이 통하는 곳에서 노즐을 눌러 가스를 완전히 뺀 다음 내놓아야 합니다.',
      en: 'People often drop cigarette butts or tissues inside a can, which makes the whole can unusable. Butane and insecticide canisters must be fully emptied first — press the nozzle somewhere well ventilated until no gas is left.',
      zh: '很多人往罐子里塞烟头或纸巾，这会让整个罐子无法使用。丁烷气罐和杀虫剂罐要先在通风处按压喷嘴，把气体完全排空后再投放。',
      vi: 'Nhiều người bỏ đầu lọc thuốc lá hay khăn giấy vào trong lon, làm cả lon không dùng được. Bình gas butan và bình thuốc xịt côn trùng phải xả hết khí trước — bấm vòi ở nơi thoáng gió cho đến khi không còn gas.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'glass-bottle',
    category: 'recyclable',
    name: localized('glass-bottle', 'name', {
      ko: '유리병',
      en: 'Glass bottle',
      zh: '玻璃瓶',
      vi: 'Chai thủy tinh',
    }),
    aliases: aliases(
      ['병', '소주병', '맥주병'],
      ['glass bottle', 'beer bottle', 'soju bottle', 'jar'],
      ['玻璃瓶', '啤酒瓶', '烧酒瓶'],
      ['chai thủy tinh', 'chai bia', 'chai soju', 'lọ thủy tinh'],
    ),
    summary: localized('glass-bottle', 'summary', {
      ko: '음료수병과 술병입니다. 소주병과 맥주병은 가게에 돌려주면 보증금을 돌려받을 수 있습니다.',
      en: 'Drink and liquor bottles. Return soju and beer bottles to a shop and you get the deposit back.',
      zh: '饮料瓶和酒瓶。烧酒瓶和啤酒瓶拿回店里可以退还押金。',
      vi: 'Chai nước và chai rượu. Chai soju và chai bia mang trả cửa hàng sẽ được hoàn tiền đặt cọc.',
    }),
    ...image('glass-bottle', {
      ko: '뚜껑을 뺀 투명 유리병과 초록 유리병이 나란히 서 있습니다.',
      en: 'A clear glass bottle and a green one standing side by side, caps removed.',
      zh: '取下瓶盖的透明玻璃瓶和绿色玻璃瓶并排立着。',
      vi: 'Một chai thủy tinh trong và một chai màu xanh đứng cạnh nhau, đã tháo nắp.',
    }),
    steps: steps('glass-bottle', [
      {
        ko: '남은 내용물을 비우고 물로 헹굽니다.',
        en: 'Empty out what is left and rinse with water.',
        zh: '倒空剩余内容物并用水冲洗。',
        vi: 'Đổ hết phần còn lại và tráng bằng nước.',
      },
      {
        ko: '뚜껑을 열어 재질에 맞게 버립니다. 금속 뚜껑은 캔류, 플라스틱 뚜껑은 플라스틱류입니다.',
        en: 'Take the cap off and dispose of it by material: metal caps with cans, plastic caps with plastics.',
        zh: '取下瓶盖，按材质投放：金属盖投到金属罐类，塑料盖投到塑料类。',
        vi: 'Tháo nắp và bỏ theo chất liệu: nắp kim loại vào lon, nắp nhựa vào nhựa.',
      },
      {
        ko: '소주병과 맥주병은 편의점이나 마트에 가져가 보증금을 돌려받습니다.',
        en: 'Take soju and beer bottles to a convenience store or supermarket and claim the deposit.',
        zh: '烧酒瓶和啤酒瓶拿到便利店或超市退还押金。',
        vi: 'Mang chai soju và chai bia đến cửa hàng tiện lợi hoặc siêu thị để nhận lại tiền cọc.',
      },
      {
        ko: '나머지 병은 깨지지 않게 조심해서 유리병 수거함에 넣습니다.',
        en: 'Put the remaining bottles carefully into the glass bin without breaking them.',
        zh: '其余的瓶子小心地放入玻璃瓶回收箱，注意不要打碎。',
        vi: 'Các chai còn lại nhẹ tay bỏ vào thùng thu gom chai thủy tinh, tránh làm vỡ.',
      },
    ]),
    commonMistake: localized('glass-bottle', 'commonMistake', {
      ko: '유리처럼 보여도 유리병이 아닌 것이 많습니다. 거울, 전구, 도자기 그릇, 내열 유리, 깨진 유리는 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 병 안에 담배꽁초를 넣는 것도 같은 이유로 안 됩니다.',
      en: 'Plenty of things look like glass but are not glass bottles. Mirrors, light bulbs, ceramic dishes, heat-resistant glass and broken glass have a different composition, and mixing them in ruins the whole batch. Dropping cigarette butts inside a bottle causes the same problem.',
      zh: '很多东西看着像玻璃却不是玻璃瓶。镜子、灯泡、陶瓷器皿、耐热玻璃和碎玻璃成分不同，混入会让整批报废。往瓶里塞烟头也是同样的道理，不可以。',
      vi: 'Nhiều thứ trông như thủy tinh nhưng không phải chai thủy tinh. Gương, bóng đèn, đồ gốm sứ, thủy tinh chịu nhiệt và thủy tinh vỡ có thành phần khác, trộn vào sẽ làm hỏng cả mẻ. Bỏ đầu lọc thuốc lá vào trong chai cũng gây hại tương tự.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'paper-box',
    category: 'recyclable',
    name: localized('paper-box', 'name', {
      ko: '종이·상자',
      en: 'Paper and cardboard',
      zh: '纸类和纸箱',
      vi: 'Giấy và thùng carton',
    }),
    aliases: aliases(
      ['박스', '택배상자', '종이'],
      ['cardboard', 'box', 'paper', 'delivery box', 'carton'],
      ['纸箱', '快递箱', '纸板', '废纸'],
      ['thùng giấy', 'thùng carton', 'giấy', 'hộp giao hàng'],
    ),
    summary: localized('paper-box', 'summary', {
      ko: '택배 상자와 종이류입니다. 붙어 있는 테이프와 송장을 떼는 것이 가장 중요합니다.',
      en: 'Delivery boxes and paper. Removing the tape and the shipping label matters most.',
      zh: '快递箱和纸类。最重要的是撕掉上面的胶带和面单。',
      vi: 'Thùng giao hàng và giấy các loại. Quan trọng nhất là bóc hết băng keo và phiếu giao hàng.',
    }),
    ...image('paper-box', {
      ko: '종이와 봉투, 납작하게 편 골판지를 함께 쌓아 둔 더미입니다.',
      en: 'A stack of paper, envelopes and flattened cardboard piled together.',
      zh: '把纸张、信封和压平的瓦楞纸板堆放在一起。',
      vi: 'Chồng giấy, phong bì và bìa carton đã ép phẳng xếp chung.',
    }),
    steps: steps('paper-box', [
      {
        ko: '송장 스티커와 테이프를 뜯어냅니다. 송장에는 이름과 주소가 적혀 있으니 찢어서 버리세요.',
        en: 'Tear off the shipping label and the tape. The label carries your name and address, so rip it up before throwing it away.',
        zh: '撕下面单贴纸和胶带。面单上写着姓名和地址，请撕碎后再扔。',
        vi: 'Bóc phiếu giao hàng và băng keo. Phiếu có ghi tên và địa chỉ nên hãy xé nhỏ trước khi vứt.',
      },
      {
        ko: '상자를 펼쳐 납작하게 접습니다.',
        en: 'Open the box out and fold it flat.',
        zh: '把箱子展开并压平。',
        vi: 'Mở thùng ra và gấp cho phẳng.',
      },
      {
        ko: '여러 장을 겹쳐 끈으로 묶어 종이류로 내놓습니다.',
        en: 'Stack several together, tie them with string, and put them out with paper.',
        zh: '把几张叠在一起用绳子捆好，投到纸类。',
        vi: 'Xếp chồng vài tấm, buộc dây lại rồi bỏ vào giấy.',
      },
    ]),
    commonMistake: localized('paper-box', 'commonMistake', {
      ko: '종이처럼 보이지만 종이류가 아닌 것들이 있습니다. 영수증, 코팅된 전단지, 비닐이 덮인 종이는 종량제 봉투로 갑니다. 기름이 밴 피자 상자는 그 부분만 뜯어내고 깨끗한 나머지만 종이로 보내면 됩니다.',
      en: 'Some things look like paper but do not belong with it. Receipts, coated flyers and plastic-laminated paper go in a standard garbage bag (종량제 봉투). For a greasy pizza box, tear off the stained part and send only the clean remainder to paper.',
      zh: '有些东西看着像纸却不属于纸类。收据、覆膜传单、贴了塑料膜的纸要放进从量制垃圾袋(종량제 봉투)。沾油的比萨盒只需撕掉那部分，把干净的部分投到纸类即可。',
      vi: 'Có những thứ trông như giấy nhưng không thuộc giấy. Hóa đơn, tờ rơi có phủ bóng, giấy bọc màng nhựa thì cho vào túi rác tính phí (종량제 봉투). Với hộp pizza dính dầu, chỉ cần xé bỏ phần bẩn và bỏ phần sạch còn lại vào giấy.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'food-waste',
    category: 'food',
    name: localized('food-waste', 'name', {
      ko: '음식물',
      en: 'Food waste',
      zh: '厨余垃圾',
      vi: 'Rác thực phẩm',
    }),
    aliases: aliases(
      ['음식물쓰레기', '잔반'],
      ['food waste', 'leftovers', 'kitchen waste', 'food scraps'],
      ['厨余', '剩饭', '餐厨垃圾'],
      ['rác thực phẩm', 'thức ăn thừa', 'rác nhà bếp'],
    ),
    summary: localized('food-waste', 'summary', {
      ko: '음식물 쓰레기는 사료와 퇴비로 다시 쓰입니다. 그래서 동물이 먹을 수 있는 것만 넣는다고 생각하면 헷갈릴 일이 줄어듭니다.',
      en: 'Food waste is turned into animal feed and compost. Thinking of it as "only what an animal could eat" clears up most of the confusion.',
      zh: '厨余垃圾会被制成饲料和堆肥。所以只要想成"只放动物能吃的东西"，就不容易搞混。',
      vi: 'Rác thực phẩm được chế thành thức ăn chăn nuôi và phân bón. Cứ nghĩ "chỉ bỏ thứ động vật ăn được" là bớt nhầm lẫn.',
    }),
    ...image('food-waste', {
      ko: '물기를 짜서 음식물 전용 통에 담은 음식물 쓰레기입니다.',
      en: 'Food waste squeezed dry and placed in a dedicated food waste bin.',
      zh: '挤干水分后装入厨余专用桶的食物垃圾。',
      vi: 'Rác thực phẩm đã vắt ráo nước và cho vào thùng chuyên dụng.',
    }),
    steps: steps('food-waste', [
      {
        ko: '비닐, 나무젓가락, 이쑤시개 같은 이물질을 골라냅니다.',
        en: 'Pick out anything that is not food — plastic, wooden chopsticks, toothpicks.',
        zh: '挑出塑料、一次性木筷、牙签等非食物杂质。',
        vi: 'Nhặt bỏ những thứ không phải thực phẩm như nylon, đũa gỗ, tăm.',
      },
      {
        ko: '물기를 꽉 짜서 뺍니다. 수분이 많으면 처리 비용이 올라갑니다.',
        en: 'Squeeze out the moisture firmly. Wet waste costs more to process.',
        zh: '用力挤干水分。水分多会增加处理成本。',
        vi: 'Vắt thật ráo nước. Nhiều nước sẽ làm tăng chi phí xử lý.',
      },
      {
        ko: '대파나 수박처럼 길거나 큰 것은 잘게 잘라 음식물 전용 통에 넣습니다.',
        en: 'Cut long or bulky items such as spring onions and watermelon into small pieces, then put them in the food waste bin.',
        zh: '大葱、西瓜这类又长又大的要切碎后放入厨余专用桶。',
        vi: 'Những thứ dài hoặc to như hành lá, dưa hấu thì cắt nhỏ rồi cho vào thùng rác thực phẩm.',
      },
    ]),
    commonMistake: localized('food-waste', 'commonMistake', {
      ko: '껍질이라고 다 음식물은 아닙니다. 양파·마늘·옥수수 껍질과 대파 뿌리는 질겨서 사료가 되지 못하니 종량제 봉투로 보내세요. 차 찌꺼기와 한약재 찌꺼기도 마찬가지입니다. 지역마다 기준이 조금씩 달라 애매하면 구청 안내를 확인하는 편이 안전합니다.',
      en: 'Not every peel counts as food waste. Onion, garlic and corn husks and spring onion roots are too tough to become feed, so they go in a standard garbage bag (종량제 봉투). The same applies to tea and herbal-medicine dregs. Standards vary slightly by district, so checking your district office is the safe move when in doubt.',
      zh: '并非所有的皮都算厨余。洋葱、大蒜、玉米的皮和大葱根太硬，做不成饲料，请放进从量制垃圾袋(종량제 봉투)。茶渣和中药渣也一样。各地区标准略有差异，拿不准时查看区厅指南更稳妥。',
      vi: 'Không phải vỏ nào cũng là rác thực phẩm. Vỏ hành tây, tỏi, ngô và rễ hành lá quá dai, không làm thức ăn chăn nuôi được nên cho vào túi rác tính phí (종량제 봉투). Bã trà và bã thuốc bắc cũng vậy. Tiêu chuẩn hơi khác nhau theo quận, không chắc thì xem hướng dẫn của quận cho chắc.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-food-waste'],
  },
  {
    id: 'bones-shells',
    category: 'general',
    name: localized('bones-shells', 'name', {
      ko: '뼈·껍데기',
      en: 'Bones and shells',
      zh: '骨头和壳类',
      vi: 'Xương và vỏ',
    }),
    aliases: aliases(
      ['뼈', '껍데기', '조개껍데기'],
      ['bone', 'shell', 'eggshell', 'fish bone', 'chicken bone', 'clam shell'],
      ['骨头', '贝壳', '鸡蛋壳', '鱼骨'],
      ['xương', 'vỏ sò', 'vỏ trứng', 'xương cá', 'xương gà'],
    ),
    summary: localized('bones-shells', 'summary', {
      ko: '닭뼈, 생선뼈, 조개껍데기, 달걀 껍데기는 음식물이 아니라 일반 쓰레기입니다. 딱딱해서 사료로 갈리지 않기 때문입니다.',
      en: 'Chicken bones, fish bones, clam shells and eggshells are general waste, not food waste — they are too hard to be ground into feed.',
      zh: '鸡骨、鱼骨、贝壳、蛋壳属于一般垃圾而非厨余，因为太硬无法磨成饲料。',
      vi: 'Xương gà, xương cá, vỏ nghêu, vỏ trứng là rác thường chứ không phải rác thực phẩm, vì quá cứng không nghiền thành thức ăn chăn nuôi được.',
    }),
    ...image('bones-shells', {
      ko: '신문지에 싸서 종량제 봉투에 넣은 닭뼈와 조개껍데기입니다.',
      en: 'Chicken bones and clam shells wrapped in newspaper and placed in a standard garbage bag.',
      zh: '用报纸包好后放进从量制垃圾袋的鸡骨和贝壳。',
      vi: 'Xương gà và vỏ nghêu được bọc giấy báo rồi cho vào túi rác tính phí.',
    }),
    steps: steps('bones-shells', [
      {
        ko: '물기를 털어냅니다. 젖은 채로 두면 냄새가 심해집니다.',
        en: 'Shake off the moisture. Left wet, they start to smell badly.',
        zh: '甩掉水分。带着水放着会产生很重的异味。',
        vi: 'Vẩy ráo nước. Để ướt sẽ bốc mùi nặng.',
      },
      {
        ko: '신문지나 봉지로 한 번 감쌉니다. 날카로운 뼈가 봉투를 뚫는 것을 막아 줍니다.',
        en: 'Wrap them once in newspaper or a bag. That keeps sharp bones from tearing through.',
        zh: '用报纸或袋子包一层，防止尖锐的骨头戳破垃圾袋。',
        vi: 'Bọc một lớp giấy báo hoặc túi. Việc này ngăn xương nhọn đâm thủng túi.',
      },
      {
        ko: '종량제 봉투에 넣어 일반 쓰레기로 내놓습니다.',
        en: 'Put them in a standard garbage bag (종량제 봉투) and set them out as general waste.',
        zh: '放进从量制垃圾袋(종량제 봉투)，作为一般垃圾投放。',
        vi: 'Cho vào túi rác tính phí (종량제 봉투) và bỏ như rác thường.',
      },
    ]),
    commonMistake: localized('bones-shells', 'commonMistake', {
      ko: '먹고 남은 것이라 음식물 통에 넣기 쉬운데, 뼈와 껍데기가 섞이면 사료 만드는 기계가 멈춥니다. 게·가재 껍데기, 소라, 복숭아 씨, 밤과 호두 껍질도 같은 이유로 일반 쓰레기입니다.',
      en: 'Because they are leftovers it feels natural to drop them in the food bin, but bones and shells jam the machines that make feed. Crab and crayfish shells, conches, peach stones and chestnut or walnut shells are general waste for the same reason.',
      zh: '因为是吃剩的，很容易顺手扔进厨余桶，但骨头和壳会让制作饲料的机器卡住。螃蟹和小龙虾的壳、海螺、桃核、栗子和核桃壳也基于同样原因属于一般垃圾。',
      vi: 'Vì là đồ ăn thừa nên rất dễ bỏ vào thùng rác thực phẩm, nhưng xương và vỏ sẽ làm kẹt máy chế biến thức ăn chăn nuôi. Vỏ cua, vỏ tôm hùm đất, ốc, hạt đào, vỏ hạt dẻ và óc chó cũng là rác thường vì lý do tương tự.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-general-waste', 'me-food-waste'],
  },
  {
    id: 'battery',
    category: 'special',
    name: localized('battery', 'name', {
      ko: '폐건전지',
      en: 'Used battery',
      zh: '废电池',
      vi: 'Pin đã qua sử dụng',
    }),
    aliases: aliases(
      ['건전지', '배터리'],
      ['battery', 'aa battery', 'dry cell', 'used battery'],
      ['电池', '干电池', '五号电池'],
      ['pin', 'pin tiểu', 'pin khô'],
    ),
    summary: localized('battery', 'summary', {
      ko: '건전지 안에는 수은과 카드뮴 같은 중금속이 들어 있습니다. 일반 쓰레기에 섞이면 안 되고 전용 수거함으로 가야 합니다.',
      en: 'Batteries contain heavy metals such as mercury and cadmium. They must never go with general waste — they belong in a dedicated collection box.',
      zh: '电池中含有汞、镉等重金属。不能混入一般垃圾，必须投入专用回收箱。',
      vi: 'Pin chứa kim loại nặng như thủy ngân và cadimi. Không được lẫn vào rác thường mà phải bỏ vào thùng thu gom chuyên dụng.',
    }),
    ...image('battery', {
      ko: '나란히 놓인 알카라인 건전지 두 개입니다.',
      en: 'Two alkaline batteries lying side by side.',
      zh: '并排放着的两节碱性电池。',
      vi: 'Hai viên pin kiềm đặt cạnh nhau.',
    }),
    steps: steps('battery', [
      {
        ko: '물기를 닦아냅니다. 젖으면 녹이 슬어 안의 액이 샐 수 있습니다.',
        en: 'Wipe off any moisture. Damp batteries rust and can leak.',
        zh: '擦干水分。受潮会生锈，里面的液体可能泄漏。',
        vi: 'Lau khô nước. Bị ẩm pin sẽ gỉ và có thể rò rỉ dung dịch bên trong.',
      },
      {
        ko: '양 끝을 테이프로 감싸 두면 더 안전합니다.',
        en: 'Taping over both ends makes them safer to handle.',
        zh: '用胶带把两端包住会更安全。',
        vi: 'Dán băng keo hai đầu sẽ an toàn hơn.',
      },
      {
        ko: '주민센터, 아파트 관리사무소, 편의점 등에 있는 폐건전지 전용 수거함에 넣습니다.',
        en: 'Drop them in a battery collection box at a community service centre (주민센터), an apartment management office or a convenience store.',
        zh: '投入居民中心(주민센터)、公寓管理处或便利店等处的废电池专用回收箱。',
        vi: 'Bỏ vào thùng thu gom pin ở trung tâm hành chính phường (주민센터), văn phòng quản lý chung cư hoặc cửa hàng tiện lợi.',
      },
    ]),
    commonMistake: localized('battery', 'commonMistake', {
      ko: '작다고 종량제 봉투에 넣으면 안 됩니다. 매립되면 중금속이 땅과 물로 흘러듭니다. 수거함 위치는 지역마다 다르니 구청 홈페이지나 분리배출 누리집의 지역별 안내에서 가까운 곳을 먼저 찾아보세요.',
      en: 'Being small is no reason to put them in a standard garbage bag (종량제 봉투). Once buried, the heavy metals leach into soil and water. Collection points differ by area, so look up the nearest one on your district office site or the regional guidance of the waste separation portal first.',
      zh: '不能因为体积小就放进从量制垃圾袋(종량제 봉투)。一旦填埋，重金属会渗入土壤和水中。回收箱位置因地区而异，请先在区厅网站或分类投放网站的地区指南上找到最近的地点。',
      vi: 'Nhỏ không phải lý do để cho vào túi rác tính phí (종량제 봉투). Khi bị chôn lấp, kim loại nặng sẽ ngấm vào đất và nước. Vị trí thùng thu gom khác nhau theo khu vực, hãy tra chỗ gần nhất trên trang của quận hoặc mục hướng dẫn theo khu vực của cổng thông tin phân loại rác.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'broken-glass',
    category: 'general',
    name: localized('broken-glass', 'name', {
      ko: '깨진 유리',
      en: 'Broken glass',
      zh: '碎玻璃',
      vi: 'Thủy tinh vỡ',
    }),
    aliases: aliases(
      ['유리조각', '깨진유리'],
      ['broken glass', 'glass shard', 'cracked cup', 'broken dish'],
      ['玻璃碎片', '碎片', '打碎的杯子'],
      ['mảnh thủy tinh', 'kính vỡ', 'cốc vỡ'],
    ),
    summary: localized('broken-glass', 'summary', {
      ko: '깨진 유리와 사기그릇은 재활용되지 않습니다. 수거하는 사람이 다치지 않게 싸서 버리는 것이 핵심입니다.',
      en: 'Broken glass and ceramics are not recycled. What matters is wrapping them so the collector does not get hurt.',
      zh: '碎玻璃和陶瓷器皿无法回收。关键是包好后再扔，以免收运人员受伤。',
      vi: 'Thủy tinh vỡ và đồ sứ không được tái chế. Điều quan trọng là bọc kỹ để người thu gom không bị thương.',
    }),
    ...image('broken-glass', {
      ko: '여러 조각으로 깨진 유리 파편입니다.',
      en: 'Shards of broken glass.',
      zh: '碎成多块的玻璃碎片。',
      vi: 'Những mảnh thủy tinh vỡ.',
    }),
    steps: steps('broken-glass', [
      {
        ko: '신문지나 두꺼운 종이로 조각을 감쌉니다.',
        en: 'Wrap the shards in newspaper or thick paper.',
        zh: '用报纸或厚纸把碎片包起来。',
        vi: 'Bọc các mảnh vỡ bằng giấy báo hoặc giấy dày.',
      },
      {
        ko: '테이프로 단단히 고정하고 겉에 "유리"라고 적어 둡니다.',
        en: 'Tape it firmly shut and write "유리" (glass) on the outside.',
        zh: '用胶带牢牢固定，并在外面写上"유리"(玻璃)。',
        vi: 'Dán băng keo chắc chắn và ghi bên ngoài chữ "유리" (thủy tinh).',
      },
      {
        ko: '불연성 폐기물 전용 마대에 넣습니다. 마대를 파는 곳은 구청에 확인하세요.',
        en: 'Put it in the sack for non-combustible waste. Ask your district office where those sacks are sold.',
        zh: '放入不燃性垃圾专用袋。专用袋的售卖地点请向区厅确认。',
        vi: 'Cho vào bao đựng rác không cháy. Hỏi quận để biết nơi bán loại bao này.',
      },
    ]),
    commonMistake: localized('broken-glass', 'commonMistake', {
      ko: '유리병 수거함에 넣으면 안 됩니다. 깨진 유리는 병과 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 불연성 쓰레기 처리 방식은 지역마다 달라서 종량제 봉투로 받는 곳도 있으니 미리 확인하세요.',
      en: 'Do not put it in the glass bottle bin. Broken glass has a different composition from bottles, and mixing it in ruins the whole batch. How non-combustible waste is handled varies by area — some districts take it in a standard garbage bag (종량제 봉투), so check first.',
      zh: '不能投入玻璃瓶回收箱。碎玻璃与瓶子成分不同，混入会让整批报废。不燃性垃圾的处理方式因地区而异，也有用从量制垃圾袋(종량제 봉투)收取的地方，请事先确认。',
      vi: 'Không được bỏ vào thùng thu gom chai thủy tinh. Thủy tinh vỡ khác thành phần với chai, trộn vào sẽ làm hỏng cả mẻ. Cách xử lý rác không cháy khác nhau theo khu vực — có nơi nhận qua túi rác tính phí (종량제 봉투), nên hãy kiểm tra trước.',
    }),
    needsLocalCheck: true,
    sourceIds: ['me-general-waste', 'local-government'],
  },
  {
    id: 'clothing',
    category: 'special',
    name: localized('clothing', 'name', {
      ko: '의류',
      en: 'Clothing',
      zh: '衣物',
      vi: 'Quần áo',
    }),
    aliases: aliases(
      ['옷', '헌옷'],
      ['clothes', 'clothing', 'old clothes', 'fabric', 'textile'],
      ['衣服', '旧衣服', '布料', '纺织品'],
      ['quần áo', 'áo cũ', 'vải', 'đồ cũ'],
    ),
    summary: localized('clothing', 'summary', {
      ko: '입지 않는 옷과 천은 헌 옷 수거함으로 갑니다. 상태가 괜찮으면 다시 팔리거나 다른 나라로 수출됩니다.',
      en: 'Clothes and fabric you no longer wear go into the used clothing bin. If they are in decent shape they get resold or exported.',
      zh: '不穿的衣服和布料投入旧衣回收箱。状态尚好的会被再次出售或出口到其他国家。',
      vi: 'Quần áo và vải không mặc nữa thì bỏ vào thùng thu gom đồ cũ. Nếu còn tốt, chúng sẽ được bán lại hoặc xuất khẩu.',
    }),
    ...image('clothing', {
      ko: '개어 둔 흰 티셔츠와 청바지입니다.',
      en: 'A folded white T-shirt and a pair of folded jeans.',
      zh: '叠好的白色T恤和牛仔裤。',
      vi: 'Áo thun trắng và quần jean đã gấp gọn.',
    }),
    steps: steps('clothing', [
      {
        ko: '주머니를 확인하고 젖은 옷은 말립니다.',
        en: 'Check the pockets and dry anything that is damp.',
        zh: '检查口袋，把潮湿的衣服晾干。',
        vi: 'Kiểm tra túi áo quần và phơi khô đồ còn ẩm.',
      },
      {
        ko: '여러 벌을 봉투에 모아 담습니다. 비에 젖으면 못 쓰게 되니 묶어 두는 편이 좋습니다.',
        en: 'Gather several pieces into a bag. Rain ruins fabric, so tying it closed is worth the trouble.',
        zh: '把几件衣服装进一个袋子。淋雨会让布料报废，扎紧袋口更好。',
        vi: 'Gom vài bộ vào một túi. Mưa làm hỏng vải nên buộc kín túi sẽ tốt hơn.',
      },
      {
        ko: '길가나 아파트 단지에 있는 헌 옷 수거함에 넣습니다.',
        en: 'Drop it into a used clothing bin on the street or in your apartment complex.',
        zh: '投入路边或公寓小区内的旧衣回收箱。',
        vi: 'Bỏ vào thùng thu gom đồ cũ ở ven đường hoặc trong khu chung cư.',
      },
    ]),
    commonMistake: localized('clothing', 'commonMistake', {
      ko: '수거함에 넣어도 재활용되지 않는 것들이 있습니다. 솜이불과 베개, 신발 한 짝, 심하게 찢어진 옷이 그렇습니다. 이런 것은 대형 폐기물로 신고하거나 종량제 봉투로 보내야 합니다.',
      en: 'Some things will not be recycled even if you put them in the bin: padded blankets and pillows, a single shoe, badly torn clothing. Those have to be reported as bulky waste or put in a standard garbage bag (종량제 봉투).',
      zh: '有些东西即使投进回收箱也不会被回收，比如棉被和枕头、单只鞋子、破损严重的衣服。这些要申报为大型垃圾，或放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Có những thứ dù bỏ vào thùng cũng không được tái chế: chăn bông và gối, giày lẻ một chiếc, quần áo rách nát. Những thứ này phải khai báo là rác cồng kềnh hoặc cho vào túi rác tính phí (종량제 봉투).',
    }),
    needsLocalCheck: false,
    sourceIds: ['keco-special-waste'],
  },
  {
    id: 'small-electronics',
    category: 'special',
    name: localized('small-electronics', 'name', {
      ko: '소형가전',
      en: 'Small appliance',
      zh: '小型家电',
      vi: 'Đồ điện gia dụng nhỏ',
    }),
    aliases: aliases(
      ['소형 가전', '드라이기', '전자제품'],
      ['small appliance', 'hair dryer', 'electronics', 'fan', 'rice cooker', 'e-waste'],
      ['小家电', '吹风机', '电子产品', '电风扇', '电饭煲'],
      ['đồ điện nhỏ', 'máy sấy tóc', 'thiết bị điện tử', 'quạt điện', 'nồi cơm điện'],
    ),
    summary: localized('small-electronics', 'summary', {
      ko: '드라이기, 선풍기, 전기밥솥처럼 작은 가전입니다. 무상 방문 수거를 신청하면 돈을 내지 않고 가져갑니다.',
      en: 'Small appliances such as hair dryers, fans and rice cookers. Request the free pickup service and they are taken away at no charge.',
      zh: '吹风机、电风扇、电饭煲这类小型家电。申请免费上门回收就能免费带走。',
      vi: 'Đồ điện nhỏ như máy sấy tóc, quạt, nồi cơm điện. Đăng ký dịch vụ thu gom tận nhà miễn phí là họ đến lấy không mất tiền.',
    }),
    ...image('small-electronics', {
      ko: '나란히 놓은 스마트폰과 계산기입니다.',
      en: 'A smartphone and a calculator placed side by side.',
      zh: '并排放着的智能手机和计算器。',
      vi: 'Điện thoại thông minh và máy tính bỏ túi đặt cạnh nhau.',
    }),
    steps: steps('small-electronics', [
      {
        ko: '안에 든 건전지를 빼서 따로 버립니다.',
        en: 'Take out any batteries inside and dispose of them separately.',
        zh: '取出里面的电池并单独投放。',
        vi: 'Tháo pin bên trong ra và bỏ riêng.',
      },
      {
        ko: '5개 이상 모읍니다. 소형가전은 하나만으로는 방문 수거를 부를 수 없습니다.',
        en: 'Collect five or more. A single small appliance is not enough to request a pickup.',
        zh: '凑齐5件以上。小型家电只有一件时无法申请上门回收。',
        vi: 'Gom từ 5 món trở lên. Chỉ một món thì không gọi được dịch vụ thu gom tận nhà.',
      },
      {
        ko: '폐가전 무상 방문 수거를 신청하거나 주민센터의 소형가전 수거함에 넣습니다.',
        en: 'Request the free e-waste pickup, or use the small-appliance bin at a community service centre (주민센터).',
        zh: '申请废家电免费上门回收，或投入居民中心(주민센터)的小型家电回收箱。',
        vi: 'Đăng ký thu gom đồ điện cũ miễn phí, hoặc bỏ vào thùng đồ điện nhỏ ở trung tâm hành chính phường (주민센터).',
      },
    ]),
    commonMistake: localized('small-electronics', 'commonMistake', {
      ko: '크기가 작다고 종량제 봉투에 넣으면 안 됩니다. 안에 든 금속은 재활용 가치가 높습니다. 수거 방식과 대상 품목은 지역마다 차이가 있으니 구청 안내를 먼저 보세요.',
      en: 'Small size is no reason to use a standard garbage bag (종량제 봉투). The metal inside has real recycling value. Pickup rules and eligible items differ by district, so check your district office first.',
      zh: '不能因为体积小就放进从量制垃圾袋(종량제 봉투)。里面的金属回收价值很高。回收方式和适用品类因地区而异，请先查看区厅指南。',
      vi: 'Nhỏ không phải lý do để cho vào túi rác tính phí (종량제 봉투). Kim loại bên trong có giá trị tái chế cao. Cách thu gom và danh mục áp dụng khác nhau theo quận, hãy xem hướng dẫn của quận trước.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'fluorescent-lamp',
    category: 'special',
    name: localized('fluorescent-lamp', 'name', {
      ko: '형광등',
      en: 'Fluorescent lamp',
      zh: '荧光灯',
      vi: 'Đèn huỳnh quang',
    }),
    aliases: aliases(
      ['형광등', '전구'],
      ['fluorescent lamp', 'light bulb', 'tube light', 'lamp'],
      ['荧光灯', '灯泡', '日光灯', '灯管'],
      ['đèn huỳnh quang', 'bóng đèn', 'đèn tuýp'],
    ),
    summary: localized('fluorescent-lamp', 'summary', {
      ko: '형광등 안에는 수은이 들어 있습니다. 깨지면 수은이 퍼지기 때문에 온전한 상태로 전용 수거함까지 가져가야 합니다.',
      en: 'Fluorescent lamps contain mercury. If one breaks the mercury escapes, so carry it to the dedicated bin intact.',
      zh: '荧光灯内含有汞。一旦破碎汞就会散出，因此必须完好地带到专用回收箱。',
      vi: 'Đèn huỳnh quang chứa thủy ngân. Nếu vỡ thì thủy ngân sẽ phát tán, nên phải mang nguyên vẹn đến thùng chuyên dụng.',
    }),
    ...image('fluorescent-lamp', {
      ko: '깨지지 않게 세워서 폐형광등 전용 수거함에 넣는 형광등입니다.',
      en: 'A fluorescent lamp being placed upright into a dedicated lamp collection box so it will not break.',
      zh: '为避免破碎而竖着放入废荧光灯专用回收箱的荧光灯。',
      vi: 'Đèn huỳnh quang được dựng đứng bỏ vào thùng thu gom chuyên dụng để khỏi vỡ.',
    }),
    steps: steps('fluorescent-lamp', [
      {
        ko: '새 등을 사면서 받은 상자가 있으면 거기에 넣습니다. 옮기는 동안 깨지지 않게 하려는 것입니다.',
        en: 'If you kept the box the new lamp came in, put the old one in it — that keeps it from breaking on the way.',
        zh: '如果还留着买新灯时的包装盒，就把旧灯装进去，这样搬运途中不易破碎。',
        vi: 'Nếu còn giữ hộp của bóng đèn mới mua, hãy cho bóng cũ vào đó để không vỡ trên đường đi.',
      },
      {
        ko: '주민센터나 아파트에 있는 폐형광등 전용 수거함을 찾습니다.',
        en: 'Find the lamp collection box at a community service centre (주민센터) or in your apartment complex.',
        zh: '找到居民中心(주민센터)或公寓内的废荧光灯专用回收箱。',
        vi: 'Tìm thùng thu gom đèn huỳnh quang ở trung tâm hành chính phường (주민센터) hoặc trong chung cư.',
      },
      {
        ko: '깨지지 않게 세워서 넣습니다.',
        en: 'Slide it in upright so it does not break.',
        zh: '竖着放入，避免破碎。',
        vi: 'Đặt đứng vào thùng để tránh làm vỡ.',
      },
    ]),
    commonMistake: localized('fluorescent-lamp', 'commonMistake', {
      ko: 'LED 전구와 백열전구는 형광등이 아닙니다. 수은이 없어서 전용 수거함이 아니라 불연성 쓰레기로 갑니다. 이미 깨진 형광등은 수거함에 넣지 말고 신문지에 싸서 종량제 봉투에 넣고, 창문을 열어 환기하세요.',
      en: 'LED and incandescent bulbs are not fluorescent lamps. They contain no mercury, so they go out as non-combustible waste rather than to the dedicated bin. If a lamp is already broken, skip the bin: wrap it in newspaper, put it in a standard garbage bag (종량제 봉투), and open a window to air the room.',
      zh: 'LED灯泡和白炽灯泡不是荧光灯。它们不含汞，所以作为不燃性垃圾投放，而不是投入专用回收箱。已经碎掉的荧光灯不要投入回收箱，请用报纸包好放进从量制垃圾袋(종량제 봉투)，并开窗通风。',
      vi: 'Bóng LED và bóng sợi đốt không phải đèn huỳnh quang. Chúng không chứa thủy ngân nên bỏ theo rác không cháy chứ không vào thùng chuyên dụng. Đèn đã vỡ thì đừng bỏ vào thùng: hãy bọc giấy báo, cho vào túi rác tính phí (종량제 봉투) và mở cửa sổ thông gió.',
    }),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'styrofoam',
    category: 'recyclable',
    name: localized('styrofoam', 'name', {
      ko: '스티로폼',
      en: 'Styrofoam',
      zh: '泡沫塑料',
      vi: 'Xốp',
    }),
    aliases: aliases(
      ['스티로폼', '아이스박스', '포장재'],
      ['styrofoam', 'polystyrene', 'foam box', 'cooler box', 'packing foam'],
      ['泡沫箱', '保温箱', '发泡塑料', '缓冲材料'],
      ['thùng xốp', 'xốp đóng gói', 'hộp xốp giữ lạnh'],
    ),
    summary: localized('styrofoam', 'summary', {
      ko: '택배 아이스박스와 전자제품 완충재입니다. 하얗고 깨끗한 것만 재활용됩니다.',
      en: 'Delivery cooler boxes and the padding around electronics. Only clean white foam gets recycled.',
      zh: '快递保温箱和电子产品的缓冲材料。只有洁白干净的才能回收。',
      vi: 'Thùng xốp giữ lạnh khi giao hàng và lớp đệm bọc đồ điện tử. Chỉ loại trắng và sạch mới được tái chế.',
    }),
    ...image('styrofoam', {
      ko: '깨끗한 흰 스티로폼 상자입니다.',
      en: 'A clean white styrofoam box.',
      zh: '干净的白色泡沫塑料箱。',
      vi: 'Hộp xốp trắng sạch.',
    }),
    steps: steps('styrofoam', [
      {
        ko: '붙어 있는 테이프, 송장, 스티커를 모두 뜯어냅니다.',
        en: 'Peel off every piece of tape, every label and every sticker.',
        zh: '把所有胶带、面单和贴纸全部撕掉。',
        vi: 'Bóc sạch mọi băng keo, phiếu giao hàng và nhãn dán.',
      },
      {
        ko: '음식물이 닿았던 곳은 물로 씻어 말립니다.',
        en: 'Wash and dry any spot that came into contact with food.',
        zh: '接触过食物的地方用水洗净后晾干。',
        vi: 'Rửa và phơi khô những chỗ từng tiếp xúc với thức ăn.',
      },
      {
        ko: '스티로폼끼리 모아 내놓습니다. 부피가 크면 부러뜨려 겹쳐 두세요.',
        en: 'Put it out together with other styrofoam. If it is bulky, break it up and stack the pieces.',
        zh: '和其他泡沫塑料一起投放。体积大时可以掰开叠放。',
        vi: 'Bỏ chung với xốp khác. Nếu cồng kềnh thì bẻ nhỏ và xếp chồng lên nhau.',
      },
    ]),
    commonMistake: localized('styrofoam', 'commonMistake', {
      ko: '색이 있거나 겉에 코팅이 된 스티로폼, 건축 자재로 쓰는 스티로폼은 재활용되지 않습니다. 테이프를 떼지 않으면 깨끗한 상자도 통째로 버려집니다. 전자제품을 사면서 나온 완충재는 가급적 산 곳에 돌려주세요.',
      en: 'Coloured or coated styrofoam and construction-grade foam are not recyclable. Leave the tape on and even a clean box is discarded whole. Padding that came with an electronic product is best returned to the shop you bought it from.',
      zh: '有颜色或表面有涂层的泡沫塑料，以及用作建筑材料的泡沫塑料都不能回收。不撕掉胶带的话，干净的箱子也会被整个丢弃。购买电子产品时附带的缓冲材料，尽量退还给购买处。',
      vi: 'Xốp có màu hoặc có lớp phủ và xốp dùng làm vật liệu xây dựng thì không tái chế được. Không bóc băng keo thì thùng dù sạch cũng bị bỏ nguyên. Lớp xốp đệm đi kèm khi mua đồ điện tử thì nên trả lại nơi đã mua.',
    }),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
];
