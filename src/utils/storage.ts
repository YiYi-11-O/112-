import { Subject, Question, Coupon, AnswerRecord, AppSettings, VoucherDesign } from '../types';
import { formatSerialNumber } from './quiz';

const STORAGE_KEYS = {
  SETTINGS: 'ZEBRA_AVOCADO_SETTINGS_V1',
  SUBJECTS: 'ZEBRA_AVOCADO_SUBJECTS_V1',
  QUESTIONS: 'ZEBRA_AVOCADO_QUESTIONS_V1',
  ANSWERED: 'ZEBRA_AVOCADO_ANSWERED_V1',
  GLOBAL_COUNTER: 'ZEBRA_AVOCADO_GLOBAL_COUPON_COUNTER_V1',
  COUPONS: 'ZEBRA_AVOCADO_EARNED_COUPONS_V1',
};

export const DEFAULT_VOUCHER_DESIGN: VoucherDesign = {
  topBadge: 'QUIZ QUEST REWARD',
  certifiedText: '官方正品認證',
  mainTitle: '恭喜獲得8折優惠',
  discountLabel: 'SPECIAL DISCOUNT',
  discountDesc: '全單結帳享 8 折特惠',
  discountRate: '8折',
  discountSubRate: '20% OFF',
  themeColor: 'amber',
  iconType: 'tag',
  footerNote: '💡 本券限單次使用',
};

export const DEFAULT_ZEBRA_QUOTES = [
  '加油！動動腦，知識無極限！🦓✨',
  '斑馬認真奔跑，你也一定可以答對！🔥',
  '每一題都是一次升級的機會喔！🎯',
  '答對了就換我跳舞給你看！💃',
];

export const DEFAULT_AVOCADO_QUOTES = [
  '酪梨含有滿滿健康好能量！🥑💚',
  '偷偷告訴你：答對有超精緻兌換券喔！🎁',
  '深呼吸，仔細看題目，你超棒的！🌟',
  '我是世界上最好吃又營養的水果酪梨！🥑',
];

export const DEFAULT_SETTINGS: AppSettings = {
  appTitle: '斑馬與酪梨的知識大冒險 🥑🦓',
  appSubtitle: '快動動腦袋瓜，挑戰趣味闖關題，答對領取獨一無二專屬流水號兌換券！',
  adminPassword: '115394',
  badgeText: '探險拍檔',
  startGameBtnText: '開始遊戲',
  footerText: '© Zebra & Avocado Quest',
  zebraQuotes: DEFAULT_ZEBRA_QUOTES,
  avocadoQuotes: DEFAULT_AVOCADO_QUOTES,
  voucherDesign: DEFAULT_VOUCHER_DESIGN,
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_chinese',
    name: '國語文采',
    icon: 'book-open',
    color: 'from-amber-400 to-orange-400',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    description: '成語精華、詩詞典故與文字趣味',
  },
  {
    id: 'sub_math',
    name: '數學邏輯',
    icon: 'calculator',
    color: 'from-sky-400 to-blue-500',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
    description: '趣味運算、幾何想像與數字謎題',
  },
  {
    id: 'sub_english',
    name: '生活美語',
    icon: 'languages',
    color: 'from-emerald-400 to-teal-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: '單字片語、自然發音與生活對話',
  },
  {
    id: 'sub_nature',
    name: '自然科學',
    icon: 'leaf',
    color: 'from-lime-400 to-green-500',
    badgeBg: 'bg-lime-100 text-lime-800 border-lime-200',
    description: '動植物生態、奇妙天體與物理現象',
  },
  {
    id: 'sub_trivia',
    name: '趣味百科',
    icon: 'sparkles',
    color: 'from-purple-400 to-pink-500',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    description: '世界地理、生活常識與益智腦筋急轉彎',
  },
];

export const DEFAULT_QUESTIONS: Question[] = [
  // Chinese
  {
    id: 'q_ch_1',
    subjectId: 'sub_chinese',
    title: '第 1 題：經典詩詞填空',
    content: '「白日依山盡，黃河入海流。欲窮千里目，更上一層樓。」請問這首千古名詩的詩名是什麼？',
    correctAnswers: ['登鸛雀樓', '登鹳雀楼'],
    explanation: '唐代詩人王之渙的名作《登鸛雀樓》，前兩句描寫壯麗景色，後兩句富有深遠哲理，勉勵人要站得更高才能看得更遠。',
  },
  {
    id: 'q_ch_2',
    subjectId: 'sub_chinese',
    title: '第 2 題：成語大考驗',
    content: '比喻「只要堅持不懈，即使再困難的事情也能成功」的成語是「鐵杵磨成＿」？（請填入一個字或完整成語）',
    correctAnswers: ['針', '繡花針', '鐵杵磨成針', '鐵杵成針'],
    explanation: '相傳李白少時讀書未成，在溪邊看見一位老婦人把鐵棒磨成繡花針，深受感動並發奮苦讀，終成大器。',
  },
  {
    id: 'q_ch_3',
    subjectId: 'sub_chinese',
    title: '第 3 題：文字部首猜謎',
    content: '「休」這個字，由「人」依靠在「木（樹木）」旁組合而成，屬於六書中的哪一種造字法則？',
    correctAnswers: ['會意', '會意字', '会意'],
    explanation: '「會意」是組合兩個以上的字形以表達新意義的造字方法，「人靠著樹木休息」正是「休」的會意字由來。',
  },

  // Math
  {
    id: 'q_math_1',
    subjectId: 'sub_math',
    title: '第 1 題：幾何角度小常識',
    content: '在平面幾何中，任何一個三角形的三個內角總和是多少度？（可輸入數字或加上「度」）',
    correctAnswers: ['180', '180度', '180°', '一百八十', '一百八十度'],
    explanation: '任意三角形的三個內角和恆為 180 度，這也是歐幾里得幾何中的重要基本定理。',
  },
  {
    id: 'q_math_2',
    subjectId: 'sub_math',
    title: '第 2 題：數量量詞換算',
    content: '烘焙坊在買雞蛋時常說「一打」雞蛋，請問「一打」等於多少個？',
    correctAnswers: ['12', '12個', '十二', '十二個', 'Twelve', 'twelve'],
    explanation: '一打（Dozen）源自英制度量衡，數量固定為 12 個，例如一打鉛筆或一打甜甜圈。',
  },
  {
    id: 'q_math_3',
    subjectId: 'sub_math',
    title: '第 3 題：趣味數列規律',
    content: '觀察數列規律：2, 4, 8, 16, 32, ( ? )，請問括弧中應填入的下一個數字是多少？',
    correctAnswers: ['64', '六十四', '64!'],
    explanation: '這是一個等比數列，公比為 2，下一個數字為 32 × 2 = 64。',
  },

  // English
  {
    id: 'q_eng_1',
    subjectId: 'sub_english',
    title: '第 1 題：酪梨的英文名稱',
    content: '今天陪我們闖關的可愛吉祥物「酪梨」，它的英文單字是什麼？（大小寫皆可）',
    correctAnswers: ['Avocado', 'avocado', 'AVOCADO'],
    explanation: '酪梨的英文是 Avocado，富含健康不飽和脂肪酸與維生素，既營養又美味！',
  },
  {
    id: 'q_eng_2',
    subjectId: 'sub_english',
    title: '第 2 題：斑馬的英文名稱',
    content: '我們活潑的吉祥物「斑馬」，它的英文單字是什麼？（大小寫皆可）',
    correctAnswers: ['Zebra', 'zebra', 'ZEBRA'],
    explanation: '斑馬的英文是 Zebra，生活在非洲大草原，身上的黑白條紋是牠們天然的迷彩與體溫調節工具！',
  },

  // Nature
  {
    id: 'q_nat_1',
    subjectId: 'sub_nature',
    title: '第 1 題：酪梨的植物學身分',
    content: '在植物學與生物分類學上，酪梨（鱷梨）到底屬於「水果」還是「蔬菜」？',
    correctAnswers: ['水果', '果實', '單果', '漿果', 'Fruit', 'fruit'],
    explanation: '酪梨生長在酪梨樹上，是由花朵發育而成的單一果實（漿果類），內含單一大型種子，因此在植物學上是百分之百的水果！',
  },
  {
    id: 'q_nat_2',
    subjectId: 'sub_nature',
    title: '第 2 題：斑馬條紋的顏色',
    content: '斑馬身上的迷人斑紋主要是由哪兩種經典顏色交替構成的？',
    correctAnswers: ['黑白', '黑與白', '黑色與白色', '黑和白', '黑、白', 'Black and white'],
    explanation: '斑馬由黑色與白色條紋交錯組成。現代生物學研究證實，斑馬胚胎原色為黑色，在發育過程中部分區域抑制黑色素生成而形成白色條紋。',
  },

  // Trivia
  {
    id: 'q_tri_1',
    subjectId: 'sub_trivia',
    title: '第 1 題：太陽升起的方向',
    content: '在地球上，太陽每天早晨是從哪一個方位升起？',
    correctAnswers: ['東', '東方', '東邊', 'East', 'east'],
    explanation: '因為地球自西向東自轉，所以在地表觀察時，太陽永遠由東方升起、西方落下。',
  },
  {
    id: 'q_tri_2',
    subjectId: 'sub_trivia',
    title: '第 2 題：世界上最大洋',
    content: '地球上面積最廣大、深度最深的大洋是哪一個海洋？',
    correctAnswers: ['太平洋', 'Pacific Ocean', 'Pacific', 'pacific'],
    explanation: '太平洋覆蓋了地球表面約三分之一的面積，總面積比地球上所有陸地面積的總和還要大！',
  },
];

// Helper: safe JSON load
function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function safeSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Storage API
export const StorageService = {
  getSettings(): AppSettings {
    const loaded = safeGetJSON<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    return {
      ...DEFAULT_SETTINGS,
      ...loaded,
      zebraQuotes:
        loaded.zebraQuotes && loaded.zebraQuotes.length > 0
          ? loaded.zebraQuotes
          : DEFAULT_ZEBRA_QUOTES,
      avocadoQuotes:
        loaded.avocadoQuotes && loaded.avocadoQuotes.length > 0
          ? loaded.avocadoQuotes
          : DEFAULT_AVOCADO_QUOTES,
      voucherDesign: {
        ...DEFAULT_VOUCHER_DESIGN,
        ...(loaded.voucherDesign || {}),
      },
    };
  },

  saveSettings(settings: AppSettings): void {
    safeSetJSON(STORAGE_KEYS.SETTINGS, settings);
  },

  getSubjects(): Subject[] {
    const list = safeGetJSON<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
    return list.length > 0 ? list : DEFAULT_SUBJECTS;
  },

  saveSubjects(subjects: Subject[]): void {
    safeSetJSON(STORAGE_KEYS.SUBJECTS, subjects);
  },

  getQuestions(): Question[] {
    const list = safeGetJSON<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    return list.length > 0 ? list : DEFAULT_QUESTIONS;
  },

  saveQuestions(questions: Question[]): void {
    safeSetJSON(STORAGE_KEYS.QUESTIONS, questions);
  },

  getAnsweredMap(): Record<string, AnswerRecord> {
    return safeGetJSON<Record<string, AnswerRecord>>(STORAGE_KEYS.ANSWERED, {});
  },

  isQuestionAnswered(questionId: string): boolean {
    const map = this.getAnsweredMap();
    return !!map[questionId];
  },

  markQuestionAnswered(questionId: string, isCorrect: boolean, userAnswer: string): AnswerRecord {
    const map = this.getAnsweredMap();
    const record: AnswerRecord = {
      questionId,
      answeredAt: new Date().toISOString(),
      isCorrect,
      userAnswer,
    };
    map[questionId] = record;
    safeSetJSON(STORAGE_KEYS.ANSWERED, map);
    return record;
  },

  resetAnsweredQuestions(): void {
    localStorage.removeItem(STORAGE_KEYS.ANSWERED);
  },

  getGlobalCounter(): number {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_COUNTER);
      const val = parseInt(raw || '1', 10);
      return isNaN(val) || val < 1 ? 1 : val;
    } catch {
      return 1;
    }
  },

  setGlobalCounter(newCounter: number): void {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_COUNTER, String(Math.max(1, newCounter)));
  },

  issueCoupon(question: Question, subjectName: string): Coupon {
    const currentCounter = this.getGlobalCounter();
    const formattedCode = formatSerialNumber(currentCounter);
    
    // Increment global counter atomically
    this.setGlobalCounter(currentCounter + 1);

    const settings = this.getSettings();

    const coupon: Coupon = {
      code: formattedCode,
      serialNumber: currentCounter,
      questionId: question.id,
      questionTitle: question.title,
      subjectName,
      issuedAt: new Date().toISOString(),
      design: settings.voucherDesign,
    };

    // Save to device's earned coupons wallet
    const coupons = this.getEarnedCoupons();
    coupons.unshift(coupon);
    safeSetJSON(STORAGE_KEYS.COUPONS, coupons);

    return coupon;
  },

  getEarnedCoupons(): Coupon[] {
    return safeGetJSON<Coupon[]>(STORAGE_KEYS.COUPONS, []);
  },

  useCoupon(couponCode: string): void {
    const coupons = this.getEarnedCoupons().filter((c) => c.code !== couponCode);
    safeSetJSON(STORAGE_KEYS.COUPONS, coupons);
  },

  resetAllToDefault(): void {
    safeSetJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    safeSetJSON(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    safeSetJSON(STORAGE_KEYS.QUESTIONS, DEFAULT_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.ANSWERED);
  },
};
