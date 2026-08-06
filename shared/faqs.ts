import { localized } from './placeholder.js';
import type { Faq, ItemId, LocalizedText } from './types.js';

/**
 * FAQ 20개.
 *
 * 유학생이 실제로 헷갈리는 지점을 골랐고, 16종 도감이 모두 한 번 이상 다뤄지게 배치했다.
 * 한국어 문안은 기후에너지환경부 「재활용품 분리배출 가이드라인」 8장 FAQ와 생활폐기물
 * 분리배출 누리집 품목사전을 근거로 채웠다.
 *
 * 번역에서는 유학생이 현장에서 마주치는 한국어 단어(종량제 봉투 등)를 괄호로 병기한다.
 * 봉투를 사거나 수거함을 찾을 때 결국 그 글자를 읽어야 하기 때문이다.
 *
 * `sourceIds`는 답변을 실제로 뒷받침하는 출처만 적는다. 챗봇은 여기 적힌 것만 인용할 수 있다.
 */
const topics: Array<{
  id: string;
  relatedItemIds: ItemId[];
  sourceIds: string[];
  question: LocalizedText;
  answer: LocalizedText;
}> = [
  {
    id: 'faq-plastic-cap',
    relatedItemIds: ['clear-pet', 'glass-bottle'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '병뚜껑은 떼야 하나요, 닫아야 하나요?',
      en: 'Should I remove the cap or leave it on?',
      zh: '瓶盖要取下来还是拧上去？',
      vi: 'Nắp chai nên tháo ra hay vặn lại?',
    },
    answer: {
      ko: '병 종류에 따라 다릅니다. 투명 페트병은 뚜껑을 닫은 채로 버립니다. 재활용 공정에서 물에 뜨는 뚜껑과 가라앉는 몸통이 저절로 갈라지기 때문입니다. 반대로 유리병은 뚜껑을 열어 금속은 캔류로, 플라스틱은 플라스틱류로 따로 보내야 합니다.',
      en: 'It depends on the bottle. Leave the cap on a clear PET bottle. During recycling the cap floats and the body sinks, so they separate on their own. Glass bottles are the opposite: take the cap off and send metal caps to cans and plastic caps to plastics.',
      zh: '要看是什么瓶子。透明塑料瓶请拧上盖子再扔。回收过程中盖子浮起、瓶身下沉，会自动分开。玻璃瓶则相反，要把盖子取下来，金属盖投到金属罐类，塑料盖投到塑料类。',
      vi: 'Tùy loại chai. Chai nhựa PET trong suốt thì vặn nắp lại rồi bỏ. Khi tái chế, nắp nổi còn thân chai chìm nên chúng tự tách ra. Chai thủy tinh thì ngược lại: hãy tháo nắp, nắp kim loại bỏ vào lon, nắp nhựa bỏ vào nhựa.',
    },
  },
  {
    id: 'faq-pet-label',
    relatedItemIds: ['clear-pet'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '페트병 라벨이 잘 안 떨어지는데 그냥 버려도 되나요?',
      en: 'The label will not come off my PET bottle. Can I just throw it away?',
      zh: '塑料瓶的标签撕不下来，可以直接扔吗？',
      vi: 'Nhãn chai nhựa khó bóc, tôi bỏ luôn được không?',
    },
    answer: {
      ko: '떼는 것이 맞습니다. 라벨은 페트병과 재질이 달라서 붙어 있으면 재활용 등급이 떨어집니다. 요즘 나오는 생수병은 대부분 절취선이 있어 그 선을 따라 당기면 쉽게 벗겨집니다. 접착제가 남아 잘 안 떨어질 때는 따뜻한 물에 잠깐 담가 두면 훨씬 수월합니다.',
      en: 'You should remove it. The label is a different material from the bottle, so leaving it on lowers the recycling grade. Most water bottles now have a tear line — pull along it and the label peels off easily. If glue is holding it, soak the bottle in warm water for a moment and it comes off much more easily.',
      zh: '还是撕下来为好。标签和瓶身材质不同，留着会降低回收等级。现在的矿泉水瓶大多有撕裂线，顺着那条线拉就能轻松撕下。如果有胶粘着撕不动，把瓶子泡在温水里一会儿会容易很多。',
      vi: 'Nên bóc ra. Nhãn khác chất liệu với thân chai, để lại sẽ làm giảm chất lượng tái chế. Chai nước hiện nay hầu hết có đường xé, kéo theo đường đó là bóc được dễ dàng. Nếu keo dính khó bóc, ngâm chai vào nước ấm một lát sẽ dễ hơn nhiều.',
    },
  },
  {
    id: 'faq-oily-paper',
    relatedItemIds: ['paper-box'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '기름이 밴 피자 상자도 종이로 버릴 수 있나요?',
      en: 'Can a greasy pizza box go with the paper?',
      zh: '沾了油的比萨盒能当纸类扔吗？',
      vi: 'Hộp pizza dính dầu có bỏ chung với giấy được không?',
    },
    answer: {
      ko: '기름이 밴 부분은 종이로 재활용되지 않습니다. 젖거나 기름진 면만 뜯어내 종량제 봉투에 넣고, 깨끗하게 남은 부분만 종이류로 내놓으세요. 상자 전체에 배어 있다면 통째로 종량제 봉투가 맞습니다.',
      en: 'The greasy part cannot be recycled as paper. Tear off the wet or oily side and put it in a standard garbage bag (종량제 봉투), then put out only the clean part with the paper. If grease has soaked through the whole box, the whole thing goes in the garbage bag.',
      zh: '沾油的部分无法作为纸类回收。把湿掉或沾油的那面撕下来放进从量制垃圾袋(종량제 봉투)，只把干净的部分投到纸类。如果整个盒子都渗透了油，就整个放进垃圾袋。',
      vi: 'Phần dính dầu không thể tái chế thành giấy. Hãy xé bỏ mặt ướt hoặc dính dầu cho vào túi rác tính phí (종량제 봉투), chỉ phần sạch mới bỏ vào giấy. Nếu dầu thấm khắp hộp thì bỏ cả hộp vào túi rác.',
    },
  },
  {
    id: 'faq-dirty-delivery-container',
    relatedItemIds: ['delivery-container'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '배달 용기를 꼭 씻어야 하나요?',
      en: 'Do I really have to wash delivery containers?',
      zh: '外卖餐盒一定要洗吗？',
      vi: 'Hộp đồ ăn giao tận nơi nhất định phải rửa sao?',
    },
    answer: {
      ko: '씻어야 재활용됩니다. 양념과 기름이 남아 있으면 선별장에서 걸러져 결국 소각됩니다. 물로 한 번 헹구는 정도면 충분하고, 기름기가 심하면 세제를 조금 써도 됩니다. 아무리 씻어도 색이 지워지지 않을 만큼 배었다면 종량제 봉투에 넣으세요.',
      en: 'Washing is what makes them recyclable. If sauce or oil is left, the sorting centre pulls them out and they end up incinerated. A single rinse under water is enough, and a little detergent helps with heavy grease. If the colour will not come out no matter how you wash it, put it in a standard garbage bag (종량제 봉투).',
      zh: '洗过才能回收。留有酱汁和油渍的话会在分拣厂被挑出来，最后只能焚烧。用水冲一遍就够了，油太重时可以用一点洗洁精。如果怎么洗颜色都去不掉，就放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Rửa rồi mới tái chế được. Nếu còn sốt và dầu, nhà máy phân loại sẽ loại ra và cuối cùng đem đốt. Chỉ cần tráng qua nước một lần là đủ, dầu nhiều thì dùng chút nước rửa chén. Nếu rửa thế nào màu cũng không phai thì bỏ vào túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-cup-noodle-soup',
    relatedItemIds: ['cup-noodle'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '컵라면 국물이 밴 용기는 재활용되나요?',
      en: 'Can a cup noodle container stained with broth be recycled?',
      zh: '被汤汁浸过的杯面容器还能回收吗？',
      vi: 'Hộp mì ly bị nước dùng thấm vào có tái chế được không?',
    },
    answer: {
      ko: '헹구면 됩니다. 남은 국물과 면을 음식물 쓰레기로 버리고 용기 안쪽을 물로 씻어 주세요. 그다음 스티로폼 용기는 스티로폼으로, 종이 용기는 종이류로 보냅니다. 기름 자국이 잘 지워지지 않으면 하루쯤 말려도 좋고, 그래도 안 되면 종량제 봉투에 넣습니다.',
      en: 'Rinsing solves it. Put the leftover broth and noodles in food waste, then wash the inside of the container with water. After that, styrofoam containers go with styrofoam and paper ones with paper. If oil marks will not come off, letting it dry for a day helps; if that still fails, use a standard garbage bag (종량제 봉투).',
      zh: '冲洗一下就行。把剩下的汤和面倒进厨余垃圾，再用水洗容器内侧。之后泡沫塑料容器投到泡沫塑料类，纸质容器投到纸类。油渍洗不掉时晾一天也有帮助，还是不行就放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Tráng nước là được. Đổ nước dùng và mì thừa vào rác thực phẩm, rồi rửa mặt trong hộp bằng nước. Sau đó hộp xốp bỏ vào xốp, hộp giấy bỏ vào giấy. Nếu vết dầu khó sạch, phơi khô một ngày cũng giúp ích; vẫn không được thì cho vào túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-paper-cup',
    relatedItemIds: ['disposable-cup'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '커피가 묻은 종이컵은 어디에 버리나요?',
      en: 'Where does a paper cup with coffee in it go?',
      zh: '沾了咖啡的纸杯要扔到哪里？',
      vi: 'Cốc giấy dính cà phê thì bỏ vào đâu?',
    },
    answer: {
      ko: '가볍게 헹궈서 종이류로 보내면 됩니다. 종이컵만 따로 모아 내놓는 것이 가장 좋고, 그러기 어려우면 종이팩과 함께 배출해도 됩니다. 다만 커피가 진하게 말라붙었거나 담배꽁초가 들어 있는 컵은 종량제 봉투로 가야 합니다.',
      en: 'Rinse it lightly and put it with the paper. Collecting paper cups separately is best; if that is hard, putting them with paper cartons also works. Cups with dried-on coffee or cigarette butts inside belong in a standard garbage bag (종량제 봉투).',
      zh: '简单冲一下投到纸类即可。把纸杯单独收集起来最好，做不到的话和纸盒一起投放也可以。但咖啡渍已经干硬或里面有烟头的杯子要放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Tráng nhẹ rồi bỏ vào giấy là được. Gom riêng cốc giấy là tốt nhất, khó thì bỏ chung với hộp giấy cũng được. Riêng cốc có cà phê khô bám chặt hoặc có đầu lọc thuốc lá thì phải cho vào túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-straw',
    relatedItemIds: ['disposable-cup'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '빨대는 어떻게 버리나요?',
      en: 'How do I throw away a straw?',
      zh: '吸管怎么扔？',
      vi: 'Ống hút bỏ thế nào?',
    },
    answer: {
      ko: '플라스틱 빨대는 헹궈서 플라스틱류로 배출합니다. 컵에 꽂은 채로 버리면 선별 과정에서 걸러지니 반드시 뽑아서 따로 내놓으세요. 음식물 쓰레기에 섞여 들어가는 일이 잦은데, 빨대는 음식물이 아닙니다.',
      en: 'Rinse a plastic straw and put it with plastics. If you leave it stuck in the cup it gets filtered out during sorting, so always pull it out and put it out separately. Straws often end up in food waste by mistake — a straw is not food waste.',
      zh: '塑料吸管冲洗后投到塑料类。插在杯子里扔会在分拣时被筛掉，所以一定要拔出来单独投放。吸管常被误扔进厨余垃圾，但它不是厨余。',
      vi: 'Ống hút nhựa hãy tráng nước rồi bỏ vào nhựa. Nếu để cắm trong cốc thì sẽ bị loại ra khi phân loại, vì vậy phải rút ra và bỏ riêng. Ống hút hay bị lẫn vào rác thực phẩm, nhưng nó không phải rác thực phẩm.',
    },
  },
  {
    id: 'faq-dirty-vinyl',
    relatedItemIds: ['vinyl'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '양념이 묻은 라면 봉지도 비닐로 버리나요?',
      en: 'Does a ramen wrapper with sauce on it still go with plastic film?',
      zh: '沾了调料的方便面袋也算塑料薄膜类吗？',
      vi: 'Vỏ mì gói dính gia vị có bỏ vào nylon không?',
    },
    answer: {
      ko: '씻어서 버리면 비닐류가 맞습니다. 재활용 표시가 없는 봉투도 과자 봉지, 라면 봉지와 함께 비닐류로 모읍니다. 다만 이물질이 잘 지워지지 않으면 종량제 봉투로 보내세요. 낱장으로 내놓으면 바람에 날리니 봉투 하나에 모아 담는 것이 좋습니다.',
      en: 'If you wash it, yes — it belongs with plastic film. Bags without a recycling mark also go there along with snack and ramen wrappers. If the residue will not come off, use a standard garbage bag (종량제 봉투) instead. Loose sheets blow away, so gather them into one bag before putting them out.',
      zh: '洗干净后投到塑料薄膜类是对的。没有回收标志的袋子也和零食袋、方便面袋一起投放。但污渍洗不掉时请放进从量制垃圾袋(종량제 봉투)。一张张散着扔会被风吹走，最好装进一个袋子里再投放。',
      vi: 'Rửa sạch rồi bỏ vào nylon là đúng. Túi không có ký hiệu tái chế cũng gom chung với vỏ bánh kẹo, vỏ mì. Nhưng nếu vết bẩn không sạch thì cho vào túi rác tính phí (종량제 봉투). Để rời từng tờ sẽ bị gió thổi bay, nên gom vào một túi rồi mới đem ra.',
    },
  },
  {
    id: 'faq-can-crush',
    relatedItemIds: ['can'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '캔은 찌그러뜨려서 버려도 되나요?',
      en: 'Is it fine to crush cans before throwing them out?',
      zh: '易拉罐可以压扁再扔吗？',
      vi: 'Lon có thể bóp bẹp rồi bỏ không?',
    },
    answer: {
      ko: '괜찮습니다. 오히려 부피가 줄어 수거하기 좋습니다. 버리기 전에 내용물을 비우고 물로 헹구는 것을 잊지 마세요. 캔 안에 담배꽁초나 휴지를 넣으면 캔 전체가 재활용되지 못합니다.',
      en: 'It is fine, and it actually helps because it takes up less space. Just remember to empty the can and rinse it first. If you drop cigarette butts or tissues inside, the whole can becomes unrecyclable.',
      zh: '可以，而且体积变小更方便收运。扔之前别忘了倒空并用水冲洗。如果往罐里塞烟头或纸巾，整个罐子就无法回收了。',
      vi: 'Được, mà còn tốt vì đỡ tốn chỗ. Chỉ cần nhớ đổ hết bên trong và tráng nước trước. Nếu nhét đầu lọc thuốc lá hay khăn giấy vào trong, cả cái lon sẽ không tái chế được.',
    },
  },
  {
    id: 'faq-glass-bottle-cap',
    relatedItemIds: ['glass-bottle'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '소주병과 맥주병은 그냥 버리면 손해인가요?',
      en: 'Am I losing money if I just throw out soju and beer bottles?',
      zh: '烧酒瓶和啤酒瓶直接扔掉是不是亏了？',
      vi: 'Vứt thẳng chai soju và chai bia thì có bị thiệt không?',
    },
    answer: {
      ko: '가게에 돌려주면 빈용기보증금을 돌려받습니다. 소주병과 맥주병은 씻어서 다시 쓰는 병이라 제품 값에 보증금이 포함돼 있습니다. 편의점이나 마트에 가져가면 그 자리에서 현금으로 받을 수 있고, 라벨은 떼지 않아도 됩니다.',
      en: 'Take them back to a shop and you get the empty-container deposit refunded. Soju and beer bottles are washed and reused, so a deposit is already built into the price. Bring them to a convenience store or supermarket and you get cash on the spot. You do not need to remove the labels.',
      zh: '拿回店里可以退还空瓶押金。烧酒瓶和啤酒瓶是清洗后重复使用的瓶子，押金已经含在售价里。带到便利店或超市当场就能拿到现金，标签不用撕。',
      vi: 'Mang trả lại cửa hàng sẽ được hoàn tiền đặt cọc vỏ chai. Chai soju và chai bia được rửa để dùng lại nên tiền cọc đã tính vào giá bán. Mang đến cửa hàng tiện lợi hoặc siêu thị là nhận tiền mặt ngay, và không cần bóc nhãn.',
    },
  },
  {
    id: 'faq-box-tape',
    relatedItemIds: ['paper-box'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '택배 상자의 테이프와 송장을 꼭 떼야 하나요?',
      en: 'Do I have to remove the tape and shipping label from delivery boxes?',
      zh: '快递箱上的胶带和面单一定要撕掉吗？',
      vi: 'Băng keo và phiếu giao hàng trên thùng có bắt buộc phải bóc không?',
    },
    answer: {
      ko: '떼야 합니다. 테이프는 종이와 재질이 달라 그대로 두면 재활용을 방해합니다. 송장은 이름, 전화번호, 주소가 그대로 드러나니 개인정보를 지키기 위해서라도 반드시 뜯어내고 찢어서 버리세요.',
      en: 'Yes. Tape is a different material from paper and gets in the way of recycling if left on. The shipping label shows your name, phone number and address, so tear it off and rip it up — that protects your personal information as much as it helps recycling.',
      zh: '要撕。胶带和纸的材质不同，留着会妨碍回收。面单上写着姓名、电话和地址，为了保护个人信息也务必撕下来并撕碎再扔。',
      vi: 'Phải bóc. Băng keo khác chất liệu với giấy, để lại sẽ cản trở tái chế. Phiếu giao hàng ghi rõ tên, số điện thoại và địa chỉ, nên hãy bóc ra và xé nhỏ — vừa bảo vệ thông tin cá nhân vừa giúp việc tái chế.',
    },
  },
  {
    id: 'faq-food-or-general',
    relatedItemIds: ['food-waste', 'bones-shells'],
    sourceIds: ['me-food-waste'],
    question: {
      ko: '음식물 쓰레기인지 일반 쓰레기인지 어떻게 구분하나요?',
      en: 'How do I tell food waste from general waste?',
      zh: '怎么区分厨余垃圾和一般垃圾？',
      vi: 'Làm sao phân biệt rác thực phẩm với rác thường?',
    },
    answer: {
      ko: '동물이 사료로 먹을 수 있는지를 기준으로 삼으면 대체로 맞습니다. 음식물 쓰레기는 사료와 퇴비로 다시 쓰이기 때문입니다. 뼈, 껍데기, 씨앗처럼 딱딱한 것과 차 찌꺼기, 한약재 찌꺼기는 종량제 봉투로 갑니다. 지역마다 기준이 조금씩 달라 애매하면 구청 안내를 확인하세요.',
      en: 'Ask whether an animal could eat it as feed — that rule gets you most of the way. Food waste is turned into animal feed and compost. Hard things like bones, shells and seeds, plus tea and herbal-medicine dregs, go in a standard garbage bag (종량제 봉투). Rules differ slightly by district, so check your district office when unsure.',
      zh: '用"动物能不能当饲料吃"来判断，大体上就对了。厨余垃圾会被制成饲料和堆肥。骨头、壳、果核这类硬的东西，以及茶渣、中药渣，都要放进从量制垃圾袋(종량제 봉투)。各地区标准略有不同，拿不准时请查看区厅的指南。',
      vi: 'Hãy tự hỏi động vật có ăn được như thức ăn chăn nuôi không — quy tắc đó đúng trong hầu hết trường hợp. Rác thực phẩm được chế thành thức ăn chăn nuôi và phân bón. Những thứ cứng như xương, vỏ, hạt, cùng bã trà và bã thuốc bắc thì cho vào túi rác tính phí (종량제 봉투). Tiêu chuẩn hơi khác nhau theo từng quận, không chắc thì xem hướng dẫn của quận.',
    },
  },
  {
    id: 'faq-bones',
    relatedItemIds: ['bones-shells'],
    sourceIds: ['me-general-waste'],
    question: {
      ko: '닭뼈와 생선뼈는 음식물 쓰레기 아닌가요?',
      en: 'Are chicken bones and fish bones not food waste?',
      zh: '鸡骨头和鱼骨不算厨余垃圾吗？',
      vi: 'Xương gà và xương cá không phải rác thực phẩm sao?',
    },
    answer: {
      ko: '아닙니다. 먹고 남은 것이지만 뼈는 딱딱해서 사료로 갈리지 않기 때문에 종량제 봉투에 넣어야 합니다. 물기를 털고 신문지에 한 번 싸서 버리면 냄새도 덜하고 봉투가 찢어지지도 않습니다.',
      en: 'They are not. They are leftovers, but bones are too hard to be ground into feed, so they go in a standard garbage bag (종량제 봉투). Shake off the moisture and wrap them in newspaper first — it cuts the smell and keeps the bag from tearing.',
      zh: '不算。虽然是吃剩的，但骨头太硬无法磨成饲料，所以要放进从量制垃圾袋(종량제 봉투)。甩掉水分后用报纸包一层再扔，既能减少异味，也不会把袋子戳破。',
      vi: 'Không phải. Tuy là đồ ăn thừa nhưng xương quá cứng, không nghiền thành thức ăn chăn nuôi được, nên phải cho vào túi rác tính phí (종량제 봉투). Hãy vẩy ráo nước và bọc một lớp giấy báo — vừa đỡ mùi vừa không làm rách túi.',
    },
  },
  {
    id: 'faq-eggshell',
    relatedItemIds: ['bones-shells', 'food-waste'],
    sourceIds: ['me-food-waste'],
    question: {
      ko: '달걀 껍데기와 조개껍데기는 어디로 가나요?',
      en: 'Where do eggshells and clam shells go?',
      zh: '鸡蛋壳和贝壳要扔到哪里？',
      vi: 'Vỏ trứng và vỏ nghêu bỏ vào đâu?',
    },
    answer: {
      ko: '둘 다 일반 쓰레기입니다. 달걀, 오리알, 메추리알 껍데기와 조개, 소라, 전복, 굴 껍데기는 음식물 쓰레기로 받지 않습니다. 게와 가재 같은 갑각류 껍데기도 마찬가지로 종량제 봉투에 넣습니다.',
      en: 'Both are general waste. Shells from eggs, duck eggs and quail eggs, and from clams, conches, abalone and oysters are not accepted as food waste. Crab and crayfish shells go the same way — into a standard garbage bag (종량제 봉투).',
      zh: '两者都属于一般垃圾。鸡蛋、鸭蛋、鹌鹑蛋的壳，以及蛤蜊、海螺、鲍鱼、牡蛎的壳都不收作厨余垃圾。螃蟹、小龙虾等甲壳类的壳也一样，放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Cả hai đều là rác thường. Vỏ trứng gà, trứng vịt, trứng cút và vỏ nghêu, ốc, bào ngư, hàu đều không được nhận làm rác thực phẩm. Vỏ giáp xác như cua, tôm hùm đất cũng vậy — cho vào túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-dirty-styrofoam',
    relatedItemIds: ['styrofoam'],
    sourceIds: ['me-recyclable'],
    question: {
      ko: '스티로폼에 테이프가 붙어 있는데 그대로 버려도 되나요?',
      en: 'There is tape on my styrofoam box. Can I put it out as is?',
      zh: '泡沫箱上贴着胶带，可以就这样扔吗？',
      vi: 'Thùng xốp còn dính băng keo, bỏ nguyên vậy được không?',
    },
    answer: {
      ko: '테이프와 송장은 모두 떼야 합니다. 하나라도 붙어 있으면 깨끗한 상자도 통째로 버려집니다. 음식물이 닿았던 자리는 물로 씻어 말리고, 색이 있거나 코팅된 스티로폼은 애초에 재활용 대상이 아니니 종량제 봉투로 보내세요.',
      en: 'Every piece of tape and every label has to come off. Even one left behind can send an otherwise clean box straight to disposal. Wash and dry any spot that touched food. Coloured or coated styrofoam is not recyclable to begin with, so that goes in a standard garbage bag (종량제 봉투).',
      zh: '胶带和面单都要撕掉。哪怕只剩一处，干净的箱子也会被整个丢弃。接触过食物的地方要用水洗净晾干。有颜色或有涂层的泡沫塑料本来就不属于回收对象，请放进从量制垃圾袋(종량제 봉투)。',
      vi: 'Phải bóc hết băng keo và phiếu dán. Chỉ cần sót một chỗ là cả thùng sạch cũng bị bỏ đi. Chỗ từng dính thức ăn thì rửa nước rồi phơi khô. Xốp có màu hoặc có phủ lớp phủ vốn không thuộc diện tái chế, hãy cho vào túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-battery-where',
    relatedItemIds: ['battery'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: {
      ko: '다 쓴 건전지는 어디에 버리나요?',
      en: 'Where do I take used batteries?',
      zh: '用完的电池要扔到哪里？',
      vi: 'Pin đã dùng hết bỏ ở đâu?',
    },
    answer: {
      ko: '폐건전지 전용 수거함에 넣어야 합니다. 주민센터, 아파트 관리사무소, 편의점 등에 놓여 있습니다. 안에 수은과 카드뮴 같은 중금속이 들어 있어 종량제 봉투에 넣으면 안 됩니다. 수거함 위치는 지역마다 다르니 구청 홈페이지나 분리배출 누리집의 지역별 안내에서 확인하세요.',
      en: 'They go in a dedicated battery collection box. You will find one at community service centres (주민센터), apartment management offices and many convenience stores. Batteries contain heavy metals such as mercury and cadmium, so never put them in a standard garbage bag (종량제 봉투). Locations differ by area — check your district office website or the regional guidance on the waste separation portal.',
      zh: '要投入废电池专用回收箱。居民中心(주민센터)、公寓管理处、便利店等地都有。电池含有汞、镉等重金属，绝不能放进从量制垃圾袋(종량제 봉투)。回收箱位置因地区而异，请在区厅网站或分类投放网站的地区指南中确认。',
      vi: 'Phải bỏ vào thùng thu gom pin cũ chuyên dụng. Thùng này đặt ở trung tâm hành chính phường (주민센터), văn phòng quản lý chung cư và nhiều cửa hàng tiện lợi. Pin chứa kim loại nặng như thủy ngân và cadimi nên tuyệt đối không cho vào túi rác tính phí (종량제 봉투). Vị trí thùng khác nhau theo khu vực — hãy xem trang web của quận hoặc mục hướng dẫn theo khu vực trên cổng thông tin phân loại rác.',
    },
  },
  {
    id: 'faq-broken-glass-safety',
    relatedItemIds: ['broken-glass', 'glass-bottle'],
    sourceIds: ['me-general-waste', 'local-government'],
    question: {
      ko: '컵이 깨졌는데 유리병 수거함에 넣으면 되나요?',
      en: 'My glass broke. Can I put it in the glass bottle bin?',
      zh: '杯子摔碎了，可以放进玻璃瓶回收箱吗？',
      vi: 'Cốc bị vỡ, tôi bỏ vào thùng thu gom chai thủy tinh được không?',
    },
    answer: {
      ko: '안 됩니다. 깨진 유리는 유리병과 성분이 달라 섞이면 전체를 못 쓰게 만듭니다. 신문지로 감싸 테이프로 고정하고 겉에 "유리"라고 적어, 불연성 폐기물 전용 마대에 넣으세요. 처리 방식은 지역마다 달라 종량제 봉투로 받는 곳도 있습니다.',
      en: 'No. Broken glass has a different composition from bottles, and mixing it in ruins the whole batch. Wrap the pieces in newspaper, tape it shut, write "유리" (glass) on the outside, and put it in the sack for non-combustible waste. Handling varies by area — some districts accept it in a standard garbage bag (종량제 봉투).',
      zh: '不行。碎玻璃与玻璃瓶成分不同，混进去会让整批都报废。请用报纸包好、用胶带固定，在外面写上"유리"(玻璃)，放入不燃性垃圾专用袋。各地区处理方式不同，也有用从量制垃圾袋(종량제 봉투)收取的地方。',
      vi: 'Không được. Thủy tinh vỡ có thành phần khác chai lọ, trộn vào sẽ làm hỏng cả mẻ. Hãy bọc mảnh vỡ bằng giấy báo, dán băng keo cố định, ghi bên ngoài chữ "유리" (thủy tinh) rồi cho vào bao đựng rác không cháy. Cách xử lý khác nhau theo khu vực — có nơi nhận qua túi rác tính phí (종량제 봉투).',
    },
  },
  {
    id: 'faq-clothing-bin',
    relatedItemIds: ['clothing'],
    sourceIds: ['keco-special-waste'],
    question: {
      ko: '안 입는 옷은 헌 옷 수거함에 다 넣어도 되나요?',
      en: 'Can I put any unwanted clothes in the used clothing bin?',
      zh: '不穿的衣服都能放进旧衣回收箱吗？',
      vi: 'Quần áo không mặc nữa có thể bỏ hết vào thùng thu gom đồ cũ không?',
    },
    answer: {
      ko: '옷과 천 종류는 됩니다. 다만 솜이불, 베개, 신발 한 짝, 심하게 찢어진 옷은 수거함에 넣어도 재활용되지 않습니다. 이런 것은 대형 폐기물로 신고하거나 종량제 봉투로 보내야 합니다. 비에 젖으면 못 쓰게 되니 봉투에 담아 묶어서 넣으세요.',
      en: 'Clothes and fabrics, yes. But padded blankets, pillows, a single shoe and badly torn clothing will not be recycled even if you put them in. Those need to be reported as bulky waste or put in a standard garbage bag (종량제 봉투). Rain ruins fabric, so bag everything and tie it before dropping it in.',
      zh: '衣物和布料可以。但棉被、枕头、单只鞋子和破损严重的衣服即使放进去也无法回收。这些要申报为大型垃圾，或放进从量制垃圾袋(종량제 봉투)。淋雨会让布料报废，所以请装袋扎紧后再投入。',
      vi: 'Quần áo và vải thì được. Nhưng chăn bông, gối, giày lẻ một chiếc và quần áo rách nát thì dù bỏ vào cũng không tái chế được. Những thứ đó phải khai báo là rác cồng kềnh hoặc cho vào túi rác tính phí (종량제 봉투). Vải bị mưa ướt sẽ hỏng, nên hãy cho vào túi buộc kín rồi mới bỏ vào thùng.',
    },
  },
  {
    id: 'faq-small-appliance-where',
    relatedItemIds: ['small-electronics'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: {
      ko: '고장 난 드라이기 하나를 버리려면 어떻게 하나요?',
      en: 'How do I get rid of a single broken hair dryer?',
      zh: '只有一个坏掉的吹风机要怎么处理？',
      vi: 'Chỉ có một cái máy sấy tóc hỏng thì xử lý thế nào?',
    },
    answer: {
      ko: '하나만으로는 무상 방문 수거를 부를 수 없습니다. 소형가전은 5개 이상 모아야 신청할 수 있어서, 그 전까지는 주민센터에 있는 소형가전 수거함을 이용하는 편이 빠릅니다. 안에 건전지가 들어 있으면 먼저 빼서 따로 버리세요.',
      en: 'One item is not enough to call the free pickup service. Small appliances need five or more before you can request it, so until then the small-appliance bin at a community service centre (주민센터) is quicker. If there are batteries inside, take them out and dispose of them separately first.',
      zh: '只有一件的话无法申请免费上门回收。小型家电要凑够5件以上才能申请，在那之前用居民中心(주민센터)的小型家电回收箱更快。如果里面装有电池，请先取出单独投放。',
      vi: 'Chỉ một món thì không gọi được dịch vụ thu gom tận nhà miễn phí. Đồ điện nhỏ phải gom từ 5 món trở lên mới đăng ký được, nên trước đó dùng thùng thu gom đồ điện nhỏ ở trung tâm hành chính phường (주민센터) sẽ nhanh hơn. Nếu bên trong có pin, hãy tháo ra và bỏ riêng trước.',
    },
  },
  {
    id: 'faq-lamp-where',
    relatedItemIds: ['fluorescent-lamp'],
    sourceIds: ['keco-special-waste', 'local-government'],
    question: {
      ko: 'LED 전구도 형광등 수거함에 넣나요?',
      en: 'Do LED bulbs go in the fluorescent lamp bin?',
      zh: 'LED灯泡也放进荧光灯回收箱吗？',
      vi: 'Bóng đèn LED có bỏ vào thùng thu gom đèn huỳnh quang không?',
    },
    answer: {
      ko: '아닙니다. 전용 수거함은 수은이 든 형광등을 위한 것이라 LED 전구와 백열전구는 대상이 아닙니다. 이 둘은 불연성 쓰레기로 배출합니다. 형광등이 이미 깨졌다면 수거함에 넣지 말고 신문지에 싸서 종량제 봉투에 넣은 뒤 창문을 열어 환기하세요.',
      en: 'No. The dedicated bin exists for fluorescent lamps because they contain mercury, so LED and incandescent bulbs are not covered. Those two go out as non-combustible waste. If a fluorescent lamp is already broken, do not use the bin — wrap it in newspaper, put it in a standard garbage bag (종량제 봉투), and open a window to air out the room.',
      zh: '不放。专用回收箱是为含汞的荧光灯设置的，LED灯泡和白炽灯泡不在范围内。这两种作为不燃性垃圾投放。如果荧光灯已经碎了，不要投入回收箱，请用报纸包好放进从量制垃圾袋(종량제 봉투)，并打开窗户通风。',
      vi: 'Không. Thùng chuyên dụng dành cho đèn huỳnh quang vì chúng chứa thủy ngân, nên bóng LED và bóng sợi đốt không thuộc diện này. Hai loại đó bỏ theo rác không cháy. Nếu đèn huỳnh quang đã vỡ, đừng bỏ vào thùng — hãy bọc giấy báo, cho vào túi rác tính phí (종량제 봉투) rồi mở cửa sổ thông gió.',
    },
  },
];

export const faqs: Faq[] = topics.map(
  ({ id, relatedItemIds, sourceIds, question, answer }) => ({
    id,
    question: localized(id, 'question', question),
    answer: localized(id, 'answer', answer),
    relatedItemIds,
    sourceIds,
  }),
);
