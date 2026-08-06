import { localized } from '@shared/placeholder';

/**
 * 도감·FAQ 데이터 바깥의 모든 화면 문자열.
 *
 * 한곳에 모아 두어야 파일 하나만 열고 번역할 수 있고, 모든 항목이 네 언어 값을 갖는지
 * 테스트가 재귀로 확인할 수 있다. 아직 채우지 못한 언어는 화면에 `(임시값)`으로 보인다.
 *
 * **아직 만들지 않은 화면의 문자열도 미리 적어 둔다.** 화면을 만들면서 조금씩 늘리면
 * 번역을 여러 번 나눠 해야 하므로, 설계 문서에 정의된 화면의 문안을 먼저 확정해
 * 한 번에 번역할 수 있게 한다.
 *
 * 번역에서는 유학생이 현장에서 마주치는 한국어 단어(종량제 봉투 등)를 괄호로 병기한다.
 */
export const ui = {
  nav: {
    home: localized('ui', 'nav.home', {
      ko: '소개',
      en: 'Start',
      zh: '介绍',
      vi: 'Giới thiệu',
    }),
    learn: localized('ui', 'nav.learn', {
      ko: '배우기',
      en: 'Learn',
      zh: '学习',
      vi: 'Học',
    }),
    scan: localized('ui', 'nav.scan', {
      ko: 'AI 스캔',
      en: 'AI Scan',
      zh: 'AI扫描',
      vi: 'Quét AI',
    }),
    catalog: localized('ui', 'nav.catalog', {
      ko: '도감',
      en: 'Guide',
      zh: '图鉴',
      vi: 'Cẩm nang',
    }),
    chat: localized('ui', 'nav.chat', {
      ko: 'AI에게 묻기',
      en: 'Ask AI',
      zh: '问AI',
      vi: 'Hỏi AI',
    }),
    game: localized('ui', 'nav.game', {
      ko: '게임',
      en: 'Game',
      zh: '游戏',
      vi: 'Trò chơi',
    }),
  },

  common: {
    language: localized('ui', 'common.language', {
      ko: '언어',
      en: 'Language',
      zh: '语言',
      vi: 'Ngôn ngữ',
    }),
    close: localized('ui', 'common.close', {
      ko: '닫기',
      en: 'Close',
      zh: '关闭',
      vi: 'Đóng',
    }),
    retry: localized('ui', 'common.retry', {
      ko: '다시 시도',
      en: 'Try again',
      zh: '重试',
      vi: 'Thử lại',
    }),
    skipToContent: localized('ui', 'common.skipToContent', {
      ko: '본문으로 건너뛰기',
      en: 'Skip to content',
      zh: '跳到正文',
      vi: 'Bỏ qua đến nội dung',
    }),
    loading: localized('ui', 'common.loading', {
      ko: '불러오는 중',
      en: 'Loading',
      zh: '加载中',
      vi: 'Đang tải',
    }),
    openCatalog: localized('ui', 'common.openCatalog', {
      ko: '도감에서 찾기',
      en: 'Find it in the guide',
      zh: '在图鉴中查找',
      vi: 'Tìm trong cẩm nang',
    }),
  },

  category: {
    all: localized('ui', 'category.all', {
      ko: '전체',
      en: 'All',
      zh: '全部',
      vi: 'Tất cả',
    }),
    recyclable: localized('ui', 'category.recyclable', {
      ko: '재활용',
      en: 'Recyclable',
      zh: '可回收',
      vi: 'Tái chế',
    }),
    food: localized('ui', 'category.food', {
      ko: '음식물',
      en: 'Food waste',
      zh: '厨余',
      vi: 'Thực phẩm',
    }),
    general: localized('ui', 'category.general', {
      ko: '일반',
      en: 'General',
      zh: '一般垃圾',
      vi: 'Rác thường',
    }),
    special: localized('ui', 'category.special', {
      ko: '특수',
      en: 'Special',
      zh: '特殊',
      vi: 'Đặc biệt',
    }),
  },

  /**
   * 네 페이지를 순서대로 지나가는 흐름의 문구.
   *
   * 다음 버튼은 "다음"처럼 뭉뚱그리지 않고 **어디로 가는지**를 적는다. 누르기 전에
   * 무엇이 나올지 알 수 있어야 머물지 넘어갈지 스스로 정할 수 있다.
   */
  journey: {
    begin: localized('ui', 'journey.begin', {
      ko: '영상으로 배우기',
      en: 'Learn by video',
      zh: '通过视频学习',
      vi: 'Học qua video',
    }),
    toCatalog: localized('ui', 'journey.toCatalog', {
      ko: '도감 보러 가기',
      en: 'Open the guide',
      zh: '前往图鉴',
      vi: 'Mở cẩm nang',
    }),
    toGame: localized('ui', 'journey.toGame', {
      ko: '게임으로 확인하기',
      en: 'Check with a game',
      zh: '用游戏检验',
      vi: 'Kiểm tra bằng trò chơi',
    }),
    restart: localized('ui', 'journey.restart', {
      ko: '처음으로 돌아가기',
      en: 'Back to the start',
      zh: '回到开头',
      vi: 'Quay lại từ đầu',
    }),
    stayHint: localized('ui', 'journey.stayHint', {
      ko: '천천히 봐도 됩니다. 준비되면 넘어가세요.',
      en: 'Take your time. Move on when you are ready.',
      zh: '可以慢慢看，准备好了再继续。',
      vi: 'Cứ xem từ từ. Khi nào sẵn sàng thì đi tiếp.',
    }),
    progressLabel: localized('ui', 'journey.progressLabel', {
      ko: '진행 단계',
      en: 'Progress',
      zh: '进度',
      vi: 'Tiến độ',
    }),
  },

  home: {
    /** 소개 화면에서 네 분류를 세워 놓고 그 위에 붙이는 말. */
    legendCaption: localized('ui', 'home.legendCaption', {
      ko: '한국의 쓰레기는 네 갈래로 나뉩니다',
      en: 'Waste in Korea is sorted into four groups',
      zh: '韩国的垃圾分为四类',
      vi: 'Rác ở Hàn Quốc được chia thành bốn nhóm',
    }),
    intro: localized('ui', 'home.intro', {
      ko: '한국의 분리배출을 영상으로 배우고, 사진으로 찾고, 도감에서 확인하세요.',
      en: 'Learn how Korea sorts its waste: watch the video, snap a photo, and check the guide.',
      zh: '通过视频学习韩国的垃圾分类，用照片查找，在图鉴中确认。',
      vi: 'Học cách phân loại rác ở Hàn Quốc: xem video, chụp ảnh tra cứu và kiểm tra trong cẩm nang.',
    }),
  },

  learn: {
    title: localized('ui', 'learn.title', {
      ko: '영상으로 배우기',
      en: 'Learn by video',
      zh: '通过视频学习',
      vi: 'Học qua video',
    }),
    videoUnavailable: localized('ui', 'learn.videoUnavailable', {
      ko: '영상을 재생할 수 없습니다',
      en: 'The video cannot be played',
      zh: '无法播放视频',
      vi: 'Không thể phát video',
    }),
    videoSummary: localized('ui', 'learn.videoSummary', {
      ko: '아래 4대 원칙과 도감으로 같은 내용을 확인할 수 있습니다.',
      en: 'The four principles below and the guide cover the same material.',
      zh: '下面的四大原则和图鉴涵盖了同样的内容。',
      vi: 'Bốn nguyên tắc bên dưới và cẩm nang cũng nói cùng nội dung này.',
    }),
    /** 영상이 끝났을 때 뜨는 선택지. */
    endedTitle: localized('ui', 'learn.endedTitle', {
      ko: '다 보셨습니다',
      en: 'That is the whole video',
      zh: '视频到此结束',
      vi: 'Bạn đã xem hết video',
    }),
    watchAgain: localized('ui', 'learn.watchAgain', {
      ko: '다시 보기',
      en: 'Watch again',
      zh: '再看一遍',
      vi: 'Xem lại',
    }),
    subtitleLabel: localized('ui', 'learn.subtitleLabel', {
      ko: '자막',
      en: 'Subtitles',
      zh: '字幕',
      vi: 'Phụ đề',
    }),
    principlesTitle: localized('ui', 'learn.principlesTitle', {
      ko: '분리배출 4대 원칙',
      en: 'The four principles of waste separation',
      zh: '垃圾分类四大原则',
      vi: 'Bốn nguyên tắc phân loại rác',
    }),
    /** 원칙 이름 네 가지는 설계 문서가 정한 값이다. */
    principles: {
      empty: {
        label: localized('ui', 'learn.principles.empty.label', {
          ko: '비운다',
          en: 'Empty it',
          zh: '倒空',
          vi: 'Đổ hết',
        }),
        description: localized('ui', 'learn.principles.empty.description', {
          ko: '용기 안에 남은 음식물과 이물질을 모두 비웁니다.',
          en: 'Get every bit of food and debris out of the container.',
          zh: '把容器里剩下的食物和杂物全部倒空。',
          vi: 'Đổ hết thức ăn và tạp chất còn lại trong hộp.',
        }),
      },
      rinse: {
        label: localized('ui', 'learn.principles.rinse.label', {
          ko: '헹군다',
          en: 'Rinse it',
          zh: '冲洗',
          vi: 'Tráng nước',
        }),
        description: localized('ui', 'learn.principles.rinse.description', {
          ko: '양념이나 기름이 묻었으면 물로 헹궈 깨끗하게 만듭니다.',
          en: 'If sauce or oil is stuck on, rinse it off with water.',
          zh: '若沾有酱汁或油渍，用水冲洗干净。',
          vi: 'Nếu dính sốt hoặc dầu thì tráng bằng nước cho sạch.',
        }),
      },
      separate: {
        label: localized('ui', 'learn.principles.separate.label', {
          ko: '분리한다',
          en: 'Separate it',
          zh: '拆分',
          vi: 'Tách ra',
        }),
        description: localized('ui', 'learn.principles.separate.description', {
          ko: '라벨이나 뚜껑처럼 몸체와 재질이 다른 부분은 떼어 냅니다.',
          en: 'Take off parts made of a different material from the body, such as labels and caps.',
          zh: '把标签、瓶盖等与主体材质不同的部分拆下来。',
          vi: 'Tháo bỏ những phần khác chất liệu với thân, như nhãn hay nắp.',
        }),
      },
      dontMix: {
        label: localized('ui', 'learn.principles.dontMix.label', {
          ko: '섞지 않는다',
          en: 'Do not mix',
          zh: '不混投',
          vi: 'Không trộn lẫn',
        }),
        description: localized('ui', 'learn.principles.dontMix.description', {
          ko: '재질이 다른 것끼리 한데 담지 않고 종류별로 나눠 배출합니다.',
          en: 'Never put different materials in one pile — sort them by type before putting them out.',
          zh: '不要把不同材质的东西混在一起，按种类分开投放。',
          vi: 'Đừng dồn các chất liệu khác nhau vào cùng một chỗ — hãy phân theo loại rồi mới bỏ.',
        }),
      },
    },
  },

  catalog: {
    title: localized('ui', 'catalog.title', {
      ko: '분리배출 도감',
      en: 'Waste separation guide',
      zh: '垃圾分类图鉴',
      vi: 'Cẩm nang phân loại rác',
    }),
    searchLabel: localized('ui', 'catalog.searchLabel', {
      ko: '품목 검색',
      en: 'Search items',
      zh: '搜索物品',
      vi: 'Tìm vật phẩm',
    }),
    searchPlaceholder: localized('ui', 'catalog.searchPlaceholder', {
      ko: '예: 페트병, 컵라면',
      en: 'e.g. plastic bottle, cup noodle',
      zh: '例如：塑料瓶、杯面',
      vi: 'Ví dụ: chai nhựa, mì ly',
    }),
    filterLabel: localized('ui', 'catalog.filterLabel', {
      ko: '분류로 거르기',
      en: 'Filter by category',
      zh: '按分类筛选',
      vi: 'Lọc theo phân loại',
    }),
    resultCount: localized('ui', 'catalog.resultCount', {
      ko: '개 품목',
      en: 'items',
      zh: '件物品',
      vi: 'vật phẩm',
    }),
    empty: localized('ui', 'catalog.empty', {
      ko: '찾는 품목이 없습니다',
      en: 'No matching item',
      zh: '没有找到相应物品',
      vi: 'Không có vật phẩm phù hợp',
    }),
    emptyHint: localized('ui', 'catalog.emptyHint', {
      ko: '다른 말로 검색하거나 AI에게 물어보세요.',
      en: 'Try a different word, or ask the AI.',
      zh: '换个词搜索，或者问问AI。',
      vi: 'Thử từ khác, hoặc hỏi AI.',
    }),
    stepsTitle: localized('ui', 'catalog.stepsTitle', {
      ko: '처리 순서',
      en: 'How to do it',
      zh: '处理步骤',
      vi: 'Các bước thực hiện',
    }),
    mistakeTitle: localized('ui', 'catalog.mistakeTitle', {
      ko: '흔한 실수',
      en: 'Common mistakes',
      zh: '常见错误',
      vi: 'Lỗi thường gặp',
    }),
    localCheckTitle: localized('ui', 'catalog.localCheckTitle', {
      ko: '지역 확인이 필요합니다',
      en: 'Check your local rules',
      zh: '需要确认所在地区的规定',
      vi: 'Cần kiểm tra quy định địa phương',
    }),
    localCheckBody: localized('ui', 'catalog.localCheckBody', {
      ko: '지역마다 배출 방법이 다를 수 있습니다. 거주지 안내도 함께 확인하세요.',
      en: 'Disposal rules can differ by district. Check the guidance where you live as well.',
      zh: '各地区的投放方法可能不同。请同时确认居住地的指南。',
      vi: 'Cách bỏ rác có thể khác nhau theo khu vực. Hãy xem thêm hướng dẫn nơi bạn sống.',
    }),
    sourcesTitle: localized('ui', 'catalog.sourcesTitle', {
      ko: '공식 출처',
      en: 'Official sources',
      zh: '官方出处',
      vi: 'Nguồn chính thức',
    }),
    sourceUnverified: localized('ui', 'catalog.sourceUnverified', {
      ko: '출처 확인 중',
      en: 'Source being verified',
      zh: '出处确认中',
      vi: 'Đang xác minh nguồn',
    }),
    askAi: localized('ui', 'catalog.askAi', {
      ko: '이 품목을 AI에게 묻기',
      en: 'Ask the AI about this item',
      zh: '就此物品询问AI',
      vi: 'Hỏi AI về vật phẩm này',
    }),
  },

  scanner: {
    title: localized('ui', 'scanner.title', {
      ko: 'AI로 찾기',
      en: 'Find it with AI',
      zh: '用AI查找',
      vi: 'Tìm bằng AI',
    }),
    intro: localized('ui', 'scanner.intro', {
      ko: '이름을 모르는 물건은 사진으로 찾을 수 있습니다. 아래 도감에서 바로 찾아도 됩니다.',
      en: 'If you do not know what something is called, find it by photo. Searching the guide below works too.',
      zh: '不知道名称的物品可以用照片查找。直接在下面的图鉴中搜索也可以。',
      vi: 'Vật không biết tên thì có thể tìm bằng ảnh. Tra thẳng trong cẩm nang bên dưới cũng được.',
    }),
    /** 사진 고르기 화면을 여는 버튼. 도감 검색 옆에 선다. */
    openFinder: localized('ui', 'scanner.openFinder', {
      ko: '사진으로 찾기',
      en: 'Find by photo',
      zh: '用照片查找',
      vi: 'Tìm bằng ảnh',
    }),
    dropHint: localized('ui', 'scanner.dropHint', {
      ko: '사진을 여기에 끌어다 놓거나 아래에서 고르세요',
      en: 'Drop a photo here, or choose one below',
      zh: '把照片拖到这里，或在下方选择',
      vi: 'Kéo ảnh vào đây, hoặc chọn ở bên dưới',
    }),
    privacyTitle: localized('ui', 'scanner.privacyTitle', {
      ko: '사진을 보내기 전에 알아 두세요',
      en: 'Before you send a photo',
      zh: '发送照片前请了解',
      vi: 'Trước khi gửi ảnh, hãy lưu ý',
    }),
    takePhoto: localized('ui', 'scanner.takePhoto', {
      ko: '사진 찍기',
      en: 'Take a photo',
      zh: '拍照',
      vi: 'Chụp ảnh',
    }),
    choosePhoto: localized('ui', 'scanner.choosePhoto', {
      ko: '사진 올리기',
      en: 'Upload a photo',
      zh: '上传照片',
      vi: 'Tải ảnh lên',
    }),
    analyzing: localized('ui', 'scanner.analyzing', {
      ko: '분석하는 중',
      en: 'Analysing',
      zh: '分析中',
      vi: 'Đang phân tích',
    }),
    resultTitle: localized('ui', 'scanner.resultTitle', {
      ko: '찾은 물건',
      en: 'What we found',
      zh: '识别到的物品',
      vi: 'Vật đã tìm thấy',
    }),
    privacyNotice: localized('ui', 'scanner.privacyNotice', {
      ko: '사진은 Google Gemini로 전송되어 분석되며 K-SORT 서버에는 저장하지 않습니다. 무료 등급을 사용하므로 Google의 서비스 개선에 활용될 수 있으니 개인정보가 담긴 사진은 올리지 마세요.',
      en: 'Your photo is sent to Google Gemini for analysis and is not stored on K-SORT servers. We use the free tier, so Google may use it to improve their services — please do not upload photos containing personal information.',
      zh: '照片会发送到Google Gemini进行分析，不会保存在K-SORT服务器上。由于使用的是免费版，Google可能将其用于改进服务，请不要上传含有个人信息的照片。',
      vi: 'Ảnh của bạn được gửi đến Google Gemini để phân tích và không lưu trên máy chủ K-SORT. Chúng tôi dùng gói miễn phí nên Google có thể dùng ảnh để cải thiện dịch vụ — xin đừng tải lên ảnh chứa thông tin cá nhân.',
    }),
    certaintyHigh: localized('ui', 'scanner.certaintyHigh', {
      ko: '확실',
      en: 'Confident',
      zh: '确定',
      vi: 'Chắc chắn',
    }),
    certaintyMedium: localized('ui', 'scanner.certaintyMedium', {
      ko: '확인 필요',
      en: 'Please confirm',
      zh: '需要确认',
      vi: 'Cần xác nhận',
    }),
    certaintyLow: localized('ui', 'scanner.certaintyLow', {
      ko: '불확실',
      en: 'Uncertain',
      zh: '不确定',
      vi: 'Không chắc',
    }),
    unknownLabel: localized('ui', 'scanner.unknownLabel', {
      ko: '판단하지 못했습니다',
      en: 'Could not identify this',
      zh: '无法判断',
      vi: 'Không nhận dạng được',
    }),
    confirmPrompt: localized('ui', 'scanner.confirmPrompt', {
      ko: '이 중에 맞는 것이 있나요?',
      en: 'Is any of these correct?',
      zh: '这些当中有正确的吗？',
      vi: 'Có cái nào đúng trong số này không?',
    }),
    noObjects: localized('ui', 'scanner.noObjects', {
      ko: '버릴 물건을 찾지 못했습니다',
      en: 'No disposable item was found',
      zh: '没有找到要丢弃的物品',
      vi: 'Không tìm thấy vật cần bỏ',
    }),
    imageTooLarge: localized('ui', 'scanner.imageTooLarge', {
      ko: '사진이 너무 큽니다. 더 작은 사진을 골라 주세요.',
      en: 'The photo is too large. Please choose a smaller one.',
      zh: '照片太大了，请选择更小的照片。',
      vi: 'Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.',
    }),
    unsupportedType: localized('ui', 'scanner.unsupportedType', {
      ko: 'JPEG, PNG, WebP 사진만 사용할 수 있습니다.',
      en: 'Only JPEG, PNG and WebP images can be used.',
      zh: '只能使用JPEG、PNG、WebP格式的照片。',
      vi: 'Chỉ dùng được ảnh JPEG, PNG và WebP.',
    }),
    showExample: localized('ui', 'scanner.showExample', {
      ko: '예시 결과 보기',
      en: 'See an example result',
      zh: '查看示例结果',
      vi: 'Xem kết quả mẫu',
    }),
    exampleNotice: localized('ui', 'scanner.exampleNotice', {
      ko: '미리 준비한 예시입니다. 지금 분석한 결과가 아닙니다.',
      en: 'This is a prepared example, not a result from your photo.',
      zh: '这是事先准备的示例，不是刚才的分析结果。',
      vi: 'Đây là ví dụ chuẩn bị sẵn, không phải kết quả vừa phân tích.',
    }),
  },

  chat: {
    title: localized('ui', 'chat.title', {
      ko: 'AI에게 묻기',
      en: 'Ask the AI',
      zh: '向AI提问',
      vi: 'Hỏi AI',
    }),
    intro: localized('ui', 'chat.intro', {
      ko: '검수된 도감과 자주 묻는 질문 안에서만 답합니다.',
      en: 'Answers come only from the verified guide and FAQ.',
      zh: '仅在经过核实的图鉴和常见问题范围内作答。',
      vi: 'Chỉ trả lời dựa trên cẩm nang và câu hỏi thường gặp đã được kiểm chứng.',
    }),
    /**
     * 대화를 열면 맨 위에 놓이는 인사. 정해진 문장이라 모델을 부르지 않는다.
     * 무엇을 물어도 되는지, 무엇으로 답하는지를 먼저 알려 준다.
     */
    greeting: localized('ui', 'chat.greeting', {
      ko: '안녕하세요. 분리배출에 대해 편하게 물어보세요. 도감에서 확인된 내용으로만 답합니다.',
      en: 'Hello. Ask me anything about sorting waste. I answer only from what the guide has verified.',
      zh: '你好。关于垃圾分类可以随意提问。我只根据图鉴中已核实的内容作答。',
      vi: 'Xin chào. Cứ thoải mái hỏi về phân loại rác. Tôi chỉ trả lời dựa trên nội dung đã kiểm chứng trong cẩm nang.',
    }),
    /** 도감에서 챗봇 버튼 옆에 잠깐 떴다 사라지는 말풍선. */
    nudge: localized('ui', 'chat.nudge', {
      ko: '찾는 것이 없나요? AI에게 물어보세요',
      en: 'Cannot find it? Ask the AI',
      zh: '没找到想要的？可以问AI',
      vi: 'Không tìm thấy? Hãy hỏi AI',
    }),
    inputLabel: localized('ui', 'chat.inputLabel', {
      ko: '질문 입력',
      en: 'Enter your question',
      zh: '输入问题',
      vi: 'Nhập câu hỏi',
    }),
    inputPlaceholder: localized('ui', 'chat.inputPlaceholder', {
      ko: '무엇이 궁금한가요?',
      en: 'What would you like to know?',
      zh: '你想了解什么？',
      vi: 'Bạn muốn biết điều gì?',
    }),
    send: localized('ui', 'chat.send', {
      ko: '보내기',
      en: 'Send',
      zh: '发送',
      vi: 'Gửi',
    }),
    thinking: localized('ui', 'chat.thinking', {
      ko: '답변을 찾는 중',
      en: 'Looking for an answer',
      zh: '正在查找答案',
      vi: 'Đang tìm câu trả lời',
    }),
    suggestionsTitle: localized('ui', 'chat.suggestionsTitle', {
      ko: '추천 질문',
      en: 'Suggested questions',
      zh: '推荐问题',
      vi: 'Câu hỏi gợi ý',
    }),
    relatedItems: localized('ui', 'chat.relatedItems', {
      ko: '관련 품목',
      en: 'Related items',
      zh: '相关物品',
      vi: 'Vật phẩm liên quan',
    }),
    sources: localized('ui', 'chat.sources', {
      ko: '출처',
      en: 'Sources',
      zh: '出处',
      vi: 'Nguồn',
    }),
    needsLocalCheck: localized('ui', 'chat.needsLocalCheck', {
      ko: '지역마다 다를 수 있으니 거주지 안내를 확인하세요.',
      en: 'This can differ by district — check the guidance where you live.',
      zh: '各地区可能不同，请确认居住地的指南。',
      vi: 'Điều này có thể khác theo khu vực — hãy xem hướng dẫn nơi bạn sống.',
    }),
    outOfScope: localized('ui', 'chat.outOfScope', {
      ko: '분리배출과 관련된 질문에만 답할 수 있습니다.',
      en: 'I can only answer questions about waste separation.',
      zh: '只能回答与垃圾分类相关的问题。',
      vi: 'Tôi chỉ có thể trả lời câu hỏi về phân loại rác.',
    }),
    tooLong: localized('ui', 'chat.tooLong', {
      ko: '질문은 500자까지 쓸 수 있습니다.',
      en: 'Questions can be up to 500 characters.',
      zh: '问题最多可输入500字。',
      vi: 'Câu hỏi tối đa 500 ký tự.',
    }),
  },

  game: {
    title: localized('ui', 'game.title', {
      ko: '게임으로 복습하기',
      en: 'Review with a game',
      zh: '通过游戏复习',
      vi: 'Ôn tập bằng trò chơi',
    }),
    intro: localized('ui', 'game.intro', {
      ko: '쓰레기를 보고 알맞은 곳에 버려 보세요. 열 문제입니다.',
      en: 'Look at each piece of waste and put it in the right place. Ten questions.',
      zh: '看着垃圾把它投到正确的地方。共十道题。',
      vi: 'Nhìn từng loại rác và bỏ vào đúng chỗ. Gồm mười câu.',
    }),
    start: localized('ui', 'game.start', {
      ko: '시작하기',
      en: 'Start',
      zh: '开始',
      vi: 'Bắt đầu',
    }),
    progress: localized('ui', 'game.progress', {
      ko: '문제',
      en: 'Question',
      zh: '第几题',
      vi: 'Câu',
    }),
    prepQuestion: localized('ui', 'game.prepQuestion', {
      ko: '이대로는 버릴 수 없어요. 먼저 무엇을 해야 할까요?',
      en: 'You cannot throw this out as it is. What has to happen first?',
      zh: '就这样是不能扔的。首先该做什么？',
      vi: 'Không thể bỏ nguyên như vậy. Trước tiên phải làm gì?',
    }),
    sortQuestion: localized('ui', 'game.sortQuestion', {
      ko: '어디에 버릴까요?',
      en: 'Where does it go?',
      zh: '该扔到哪里？',
      vi: 'Bỏ vào đâu?',
    }),
    binsLocked: localized('ui', 'game.binsLocked', {
      ko: '먼저 처리 방법을 고르면 열립니다',
      en: 'Choose how to prepare it first, and these unlock',
      zh: '先选择处理方法后才会解锁',
      vi: 'Chọn cách xử lý trước thì mới mở khóa',
    }),
    hintTitle: localized('ui', 'game.hintTitle', {
      ko: '힌트',
      en: 'Hint',
      zh: '提示',
      vi: 'Gợi ý',
    }),
    wrongAgain: localized('ui', 'game.wrongAgain', {
      ko: '다시 한 번 골라 보세요',
      en: 'Give it another try',
      zh: '再选一次看看',
      vi: 'Hãy chọn lại lần nữa',
    }),
    revealed: localized('ui', 'game.revealed', {
      ko: '정답은 이것입니다',
      en: 'Here is the answer',
      zh: '正确答案是这个',
      vi: 'Đáp án là đây',
    }),
    correct: localized('ui', 'game.correct', {
      ko: '맞았습니다',
      en: 'Correct',
      zh: '答对了',
      vi: 'Chính xác',
    }),
    nextQuestion: localized('ui', 'game.nextQuestion', {
      ko: '다음 문제',
      en: 'Next question',
      zh: '下一题',
      vi: 'Câu tiếp theo',
    }),
    score: localized('ui', 'game.score', {
      ko: '맞힌 문제',
      en: 'Correct answers',
      zh: '答对题数',
      vi: 'Số câu đúng',
    }),
    resultTitle: localized('ui', 'game.resultTitle', {
      ko: '결과',
      en: 'Result',
      zh: '结果',
      vi: 'Kết quả',
    }),
    playAgain: localized('ui', 'game.playAgain', {
      ko: '다시 하기',
      en: 'Play again',
      zh: '再玩一次',
      vi: 'Chơi lại',
    }),
    reviewHint: localized('ui', 'game.reviewHint', {
      ko: '틀린 문제의 품목입니다. 도감에서 처리 순서를 한 번 더 보세요.',
      en: 'These are the items you missed. Check their steps in the guide once more.',
      zh: '这些是答错的物品。请在图鉴中再确认一次处理步骤。',
      vi: 'Đây là những vật bạn trả lời sai. Hãy xem lại các bước trong cẩm nang.',
    }),
    openInCatalog: localized('ui', 'game.openInCatalog', {
      ko: '도감에서 확인하기',
      en: 'Check them in the guide',
      zh: '在图鉴中确认',
      vi: 'Xem trong cẩm nang',
    }),
    reviewTitle: localized('ui', 'game.reviewTitle', {
      ko: '다시 볼 품목',
      en: 'Items to review',
      zh: '需要复习的物品',
      vi: 'Vật phẩm cần xem lại',
    }),
    allCorrect: localized('ui', 'game.allCorrect', {
      ko: '모두 맞혔습니다',
      en: 'All correct',
      zh: '全部答对',
      vi: 'Đúng tất cả',
    }),
    backToHome: localized('ui', 'game.backToHome', {
      ko: '홈으로 돌아가기',
      en: 'Back to home',
      zh: '返回首页',
      vi: 'Về trang chủ',
    }),
  },

  error: {
    sectionFailed: localized('ui', 'error.sectionFailed', {
      ko: '이 부분을 불러오지 못했습니다',
      en: 'This section could not be loaded',
      zh: '无法加载这一部分',
      vi: 'Không tải được phần này',
    }),
    sectionFailedHint: localized('ui', 'error.sectionFailedHint', {
      ko: '다른 기능은 그대로 쓸 수 있습니다.',
      en: 'Everything else still works.',
      zh: '其他功能仍然可以正常使用。',
      vi: 'Các chức năng khác vẫn dùng bình thường.',
    }),
    network: localized('ui', 'error.network', {
      ko: '연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      en: 'The connection failed. Please try again in a moment.',
      zh: '连接失败。请稍后重试。',
      vi: 'Kết nối thất bại. Vui lòng thử lại sau giây lát.',
    }),
    rateLimited: localized('ui', 'error.rateLimited', {
      ko: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
      en: 'Too many requests. Please try again in a moment.',
      zh: '请求过多。请稍后重试。',
      vi: 'Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.',
    }),
    timeout: localized('ui', 'error.timeout', {
      ko: '응답이 늦어지고 있습니다. 다시 시도해 주세요.',
      en: 'The response is taking too long. Please try again.',
      zh: '响应时间过长。请重试。',
      vi: 'Phản hồi đang quá lâu. Vui lòng thử lại.',
    }),
    unavailable: localized('ui', 'error.unavailable', {
      ko: 'AI 기능을 지금 쓸 수 없습니다. 도감에서 직접 찾아보세요.',
      en: 'The AI features are unavailable right now. Please look it up in the guide instead.',
      zh: '目前无法使用AI功能。请直接在图鉴中查找。',
      vi: 'Hiện không dùng được chức năng AI. Vui lòng tra cứu trực tiếp trong cẩm nang.',
    }),
  },
};
