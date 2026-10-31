import React from 'react';
import { Coupon } from '../types';
import { VoucherCard } from './VoucherCard';
import { X, Ticket } from 'lucide-react';

interface MyCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: Coupon[];
  onUseCoupon?: (couponCode: string) => void;
}

export const MyCouponsModal: React.FC<MyCouponsModalProps> = ({
  isOpen,
  onClose,
  coupons,
  onUseCoupon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold tracking-wide">我的榮譽兌換券背包 ({coupons.length})</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {coupons.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="text-4xl block mb-2">🎫✨</span>
              <p className="text-sm font-bold text-slate-700">尚未獲得任何兌換券</p>
              <p className="text-xs text-slate-500 mt-1">
                快去參加答題挑戰，只要答對題目就能獲得專屬流水號兌換券喔！
              </p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <VoucherCard
                key={coupon.code}
                coupon={coupon}
                showSaveHint={false}
                onUse={onUseCoupon}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
