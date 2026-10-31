export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
}

export interface Question {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  correctAnswers: string[];
  explanation: string;
}

export type VoucherThemeColor = 'amber' | 'emerald' | 'purple' | 'rose' | 'sky';
export type VoucherIconType = 'tag' | 'gift' | 'star' | 'trophy' | 'award' | 'custom';

export interface VoucherDesign {
  topBadge: string;
  certifiedText: string;
  mainTitle: string;
  discountLabel: string;
  discountDesc: string;
  discountRate: string;
  discountSubRate: string;
  themeColor: VoucherThemeColor;
  iconType: VoucherIconType;
  customImageUrl?: string;
  footerNote: string;
}

export interface Coupon {
  code: string; // e.g. "NO.0001"
  serialNumber: number;
  questionId: string;
  questionTitle: string;
  subjectName: string;
  issuedAt: string;
  isUsed?: boolean;
  design?: VoucherDesign;
}

export interface AnswerRecord {
  questionId: string;
  answeredAt: string;
  isCorrect: boolean;
  userAnswer: string;
}

export interface AppSettings {
  appTitle: string;
  appSubtitle: string;
  adminPassword?: string;
  badgeText: string;
  startGameBtnText: string;
  footerText: string;
  customZebraImage?: string;
  customAvocadoImage?: string;
  zebraQuotes?: string[];
  avocadoQuotes?: string[];
  voucherDesign: VoucherDesign;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'subjects' }
  | { type: 'questions'; subjectId: string }
  | { type: 'quiz'; questionId: string; subjectId: string }
  | { type: 'admin' };
