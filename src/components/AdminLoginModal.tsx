import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPassword?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPassword = '115394',
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      setErrorMsg('');
      setPassword('');
      onSuccess();
    } else {
      setErrorMsg('密碼錯誤，請重新輸入！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-800 rounded-lg">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold tracking-wide">管理員後台驗證</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">請輸入管理員密碼</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              輸入後台授權密碼即可開啟控制台。
            </p>
          </div>

          <div>
            <label htmlFor="admin-pass-input" className="block text-xs font-semibold text-slate-700 mb-1">
              管理員密碼
            </label>
            <input
              id="admin-pass-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="••••••••"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono tracking-widest text-center"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              進入後台
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
