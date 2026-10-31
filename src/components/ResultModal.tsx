import React from 'react';
import { Coupon, Question } from '../types';
import { VoucherCard } from './VoucherCard';
import { CartoonZebra, CartoonAvocado } from './Mascots';
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  question: Question;
  coupon: Coupon | null;
  userAnswer: string;
  onConfirmCorrect: () => void;
  onConfirmIncorrect: () => void;
  onUseCoupon?: (couponCode: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  isCorrect,
  question,
  coupon,
  userAnswer,
  onConfirmCorrect,
  onConfirmIncorrect,
  onUseCoupon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border-4 border-amber-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between text-white ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-rose-500 to-orange-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
            ) : (
              <XCircle className="w-6 h-6 text-white" />
            )}
            <h2 className="text-base sm:text-lg font-black tracking-wide">
              {isCorrect ? '答對啦！恭喜獲得8折優惠' : '回答錯誤！別氣餒～'}
            </h2>
          </div>

          <div className="w-8 h-8 flex items-center justify-center">
            {isCorrect ? (
              <CartoonAvocado sizeClass="w-8 h-8" />
            ) : (
              <CartoonZebra sizeClass="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center">
          {isCorrect ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-2xl">🥳🎉🎊</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  智慧超群！恭喜獲得 8 折優惠兌換券！
                </p>
                <p className="text-xs text-slate-500">
                  流水編號已標示於票券右下角，並自動存入票夾：
                </p>
              </div>

              {/* Voucher Card with Serial Number & Disappear Button */}
              {coupon ? (
                <VoucherCard coupon={coupon} onUse={onUseCoupon} />
              ) : (
                <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center flex flex-col items-center gap-1 animate-fade-in">
                  <span className="text-2xl">✨🎟️💨</span>
                  <p className="text-xs font-bold text-emerald-900">
                    此兌換券已成功核銷使用並消失！
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    感謝您的使用，恭喜完成本次挑戰！
                  </p>
                </div>
              )}

              {/* Detailed Explanation for Correct Answer as requested */}
              <div className="w-full bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex flex-col gap-1.5 text-left">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>題目詳細解析（詳解）</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed bg-white/90 p-3 rounded-xl border border-emerald-100">
                  <p className="font-semibold text-emerald-800 mb-1">
                    恭喜答對！正確答案包括：
                    <span className="ml-1 font-mono font-bold text-emerald-600">
                      {question.correctAnswers.join(' / ')}
                    </span>
                  </p>
                  <p className="text-slate-600 text-[12px] whitespace-pre-line">
                    {question.explanation || '知識無價，繼續保持這份探索的好奇心！'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3.5">
              <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                <div className="shrink-0 text-3xl">🥑💔</div>
                <div className="text-xs">
                  <p className="text-rose-900 font-bold text-sm">答案不正確喔！</p>
                  <p className="text-rose-700 mt-0.5">
                    您的作答：<span className="font-mono font-semibold bg-rose-100 px-1.5 py-0.5 rounded text-rose-900">「{userAnswer || '未填寫'}」</span>
                  </p>
                </div>
              </div>

              {/* Detailed Explanation / Answer Details as explicitly required */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>題目詳細解析（詳解）</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-100">
                  <p className="font-semibold text-emerald-800 mb-1">
                    正確答案可為：
                    <span className="ml-1 font-mono font-bold text-emerald-600">
                      {question.correctAnswers.join(' / ')}
                    </span>
                  </p>
                  <p className="text-slate-600 text-[13px] whitespace-pre-line">
                    {question.explanation || '此題目暫無更多詳細備註解析。'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                ⚠️ 本題將標記為已作答，依規則每個題目僅限挑戰一次喔！
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          {isCorrect ? (
            <button
              type="button"
              onClick={onConfirmCorrect}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>收下兌換券，繼續挑戰</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmIncorrect}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>我知道了（返回科目選單）</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
