import React, { useState } from 'react';
import { Coupon, VoucherDesign } from '../types';
import { DEFAULT_VOUCHER_DESIGN } from '../utils/storage';
import {
  Sparkles,
  Award,
  Tag,
  Gift,
  Star,
  Trophy,
  CheckCircle,
  Flame,
} from 'lucide-react';

interface VoucherCardProps {
  coupon: Coupon;
  showSaveHint?: boolean;
  onUse?: (couponCode: string) => void;
  isUsed?: boolean;
  previewDesign?: VoucherDesign; // For admin live preview
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  coupon,
  showSaveHint = true,
  onUse,
  previewDesign,
}) => {
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const design: VoucherDesign = previewDesign || coupon.design || DEFAULT_VOUCHER_DESIGN;

  const formattedDate = new Date(coupon.issuedAt || Date.now()).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleUseClick = () => {
    setShowConfirm(true);
  };

  const confirmUse = () => {
    setIsDisappearing(true);
    setTimeout(() => {
      if (onUse) {
        onUse(coupon.code);
      }
    }, 450);
  };

  // Theme color styles
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'emerald':
        return {
          borderGradient: 'from-emerald-500 via-teal-400 to-green-400',
          topBand: 'from-emerald-600 via-teal-600 to-emerald-700',
          badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          headingGradient: 'from-emerald-800 via-teal-700 to-emerald-900',
          iconBg: 'bg-emerald-600',
          accentText: 'text-emerald-700',
          rateText: 'text-emerald-600',
          boxBg: 'from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300',
          serialBadge: 'text-emerald-900 bg-emerald-100 border-emerald-300',
          notchBg: 'bg-emerald-400',
        };
      case 'purple':
        return {
          borderGradient: 'from-purple-500 via-pink-400 to-fuchsia-400',
          topBand: 'from-purple-600 via-indigo-600 to-purple-700',
          badgeText: 'text-purple-700 bg-purple-50 border-purple-100',
          headingGradient: 'from-purple-800 via-pink-700 to-purple-900',
          iconBg: 'bg-purple-600',
          accentText: 'text-purple-700',
          rateText: 'text-purple-600',
          boxBg: 'from-purple-50 via-pink-50 to-purple-50 border-purple-300',
          serialBadge: 'text-purple-900 bg-purple-100 border-purple-300',
          notchBg: 'bg-purple-400',
        };
      case 'rose':
        return {
          borderGradient: 'from-rose-500 via-pink-400 to-red-400',
          topBand: 'from-rose-600 via-red-600 to-rose-700',
          badgeText: 'text-rose-700 bg-rose-50 border-rose-100',
          headingGradient: 'from-rose-800 via-pink-700 to-rose-900',
          iconBg: 'bg-rose-600',
          accentText: 'text-rose-700',
          rateText: 'text-rose-600',
          boxBg: 'from-rose-50 via-pink-50 to-rose-50 border-rose-300',
          serialBadge: 'text-rose-900 bg-rose-100 border-rose-300',
          notchBg: 'bg-rose-400',
        };
      case 'sky':
        return {
          borderGradient: 'from-sky-500 via-blue-400 to-cyan-400',
          topBand: 'from-blue-600 via-sky-600 to-blue-700',
          badgeText: 'text-blue-700 bg-blue-50 border-blue-100',
          headingGradient: 'from-blue-800 via-sky-700 to-blue-900',
          iconBg: 'bg-blue-600',
          accentText: 'text-blue-700',
          rateText: 'text-blue-600',
          boxBg: 'from-sky-50 via-blue-50 to-sky-50 border-sky-300',
          serialBadge: 'text-blue-900 bg-blue-100 border-blue-300',
          notchBg: 'bg-sky-400',
        };
      default: // amber
        return {
          borderGradient: 'from-amber-500 via-amber-400 to-yellow-400',
          topBand: 'from-emerald-600 via-teal-600 to-emerald-700',
          badgeText: 'text-amber-800 bg-amber-50 border-amber-200',
          headingGradient: 'from-amber-800 via-orange-600 to-amber-900',
          iconBg: 'bg-amber-500',
          accentText: 'text-amber-700',
          rateText: 'text-orange-600',
          boxBg: 'from-amber-50 via-orange-50 to-amber-50 border-amber-300',
          serialBadge: 'text-amber-900 bg-amber-100/90 border-amber-300',
          notchBg: 'bg-amber-400',
        };
    }
  };

  const themeStyle = getThemeClasses(design.themeColor || 'amber');

  // Render customizable center icon
  const renderIcon = () => {
    if (design.iconType === 'custom' && design.customImageUrl) {
      return (
        <img
          src={design.customImageUrl}
          alt="優惠圖示"
          className="w-9 h-9 rounded-xl object-cover shadow-xs border border-white"
        />
      );
    }
    switch (design.iconType) {
      case 'gift':
        return <Gift className="w-5 h-5 text-white" />;
      case 'star':
        return <Star className="w-5 h-5 text-white fill-white" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-white" />;
      case 'award':
        return <Award className="w-5 h-5 text-white" />;
      default:
        return <Tag className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center transition-all duration-400 ${
        isDisappearing
          ? 'opacity-0 scale-75 -translate-y-4 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Ticket Container */}
      <div
        className={`relative w-full max-w-[340px] bg-gradient-to-br ${themeStyle.borderGradient} p-1 rounded-3xl shadow-xl transition-all`}
      >
        <div className="bg-white rounded-[22px] overflow-hidden border-2 border-amber-100/60 relative">
          
          {/* Top Decorative Band with Custom Text */}
          <div
            className={`bg-gradient-to-r ${themeStyle.topBand} text-white px-4 py-2.5 flex items-center justify-between`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              <span className="text-xs font-black tracking-wider uppercase">
                {design.topBadge || 'QUIZ QUEST REWARD'}
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              {design.certifiedText || '官方正品認證'}
            </span>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 flex flex-col items-center text-center relative">
            {/* Watermark Seal */}
            <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
              <Award className="w-24 h-24 text-amber-600" />
            </div>

            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border mb-1 ${themeStyle.badgeText}`}
            >
              {coupon.subjectName || '精選科目'}
            </span>

            {/* Prominent Required Heading: e.g. 恭喜獲得8折優惠 */}
            <div className="my-1">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5">
                <span>🎉</span>
                <span
                  className={`bg-gradient-to-r ${themeStyle.headingGradient} bg-clip-text text-transparent drop-shadow-xs`}
                >
                  {design.mainTitle || '恭喜獲得8折優惠'}
                </span>
                <span>🎉</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500 line-clamp-1 max-w-[240px] mb-2.5">
              挑戰成功：{coupon.questionTitle || '通關挑戰'}
            </p>

            {/* Customizable Discount Badge Box */}
            <div
              className={`w-full bg-gradient-to-r ${themeStyle.boxBg} border-2 border-dashed rounded-2xl py-3 px-3.5 flex items-center justify-between shadow-inner`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl ${themeStyle.iconBg} text-white flex items-center justify-center shadow-xs shrink-0`}
                >
                  {renderIcon()}
                </div>
                <div className="text-left">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${themeStyle.accentText}`}
                  >
                    {design.discountLabel || 'SPECIAL DISCOUNT'}
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {design.discountDesc || '全單結帳享 8 折特惠'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 ml-1">
                <span className={`text-2xl font-black tracking-tighter ${themeStyle.rateText}`}>
                  {design.discountRate || '8折'}
                </span>
                <span className="text-[10px] text-slate-600 block font-semibold">
                  {design.discountSubRate || '20% OFF'}
                </span>
              </div>
            </div>

            {/* Ticket Perforation / Divider */}
            <div className="relative w-full my-3 flex items-center">
              <div
                className={`absolute -left-6 w-4 h-4 rounded-full ${themeStyle.notchBg}`}
              ></div>
              <div className="w-full border-t-2 border-dashed border-slate-200"></div>
              <div
                className={`absolute -right-6 w-4 h-4 rounded-full ${themeStyle.notchBg}`}
              ></div>
            </div>

            {/* Bottom Footer: Issue time on Left, Serial Number as Label in Bottom-Right Corner (右下角當標示) */}
            <div className="w-full flex items-center justify-between text-xs pt-0.5">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-mono">
                  發放時間
                </span>
                <span className="text-[11px] text-slate-600 font-medium">
                  {formattedDate}
                </span>
              </div>

              {/* Right-bottom Corner Serial Badge (No copy button, clean label tag) */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  NO.流水編號
                </span>
                <span
                  className={`font-mono text-xs sm:text-sm font-black border px-2.5 py-0.5 rounded-lg shadow-2xs mt-0.5 tracking-wider ${themeStyle.serialBadge}`}
                >
                  {coupon.code || 'NO.0001'}
                </span>
              </div>
            </div>

            {/* Use / Redeem Button: "按了就會消失" */}
            {onUse && !showConfirm && (
              <div className="w-full mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleUseClick}
                  className="w-full py-2 px-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>立即核銷使用此券（使用後消失）</span>
                </button>
              </div>
            )}

            {/* Confirmation dialog before disappearing */}
            {onUse && showConfirm && (
              <div className="w-full mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center flex flex-col gap-1.5 animate-fade-in">
                <p className="text-xs font-bold text-rose-900">
                  確定要核銷此兌換券嗎？
                </p>
                <p className="text-[10px] text-rose-600">
                  按確認後本券將立即從錢包中移除並消失！
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    再考慮一下
                  </button>
                  <button
                    type="button"
                    onClick={confirmUse}
                    className="flex-1 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 font-bold rounded-lg shadow-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>確認使用並銷毀</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showSaveHint && (
        <p className="text-[11px] text-slate-500 mt-2 font-medium">
          {design.footerNote || '💡 此兌換券已收錄於您的錢包，點擊核銷按鈕可立即使用！'}
        </p>
      )}
    </div>
  );
};
