/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewState, Subject, Question, Coupon, AppSettings } from './types';
import { StorageService } from './utils/storage';
import { checkAnswer } from './utils/quiz';
import { MascotDuo, CartoonZebra, CartoonAvocado } from './components/Mascots';
import { ResultModal } from './components/ResultModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MyCouponsModal } from './components/MyCouponsModal';
import {
  Sparkles,
  Play,
  ArrowLeft,
  Lock,
  Ticket,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Calculator,
  Languages,
  Leaf,
  Compass,
  Send,
  Award,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [viewState, setViewState] = useState<ViewState>({ type: 'home' });

  // Data from Storage
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [questions, setQuestions] = useState<Question[]>(() => StorageService.getQuestions());
  const [answeredMap, setAnsweredMap] = useState<Record<string, { answeredAt: string; isCorrect: boolean }>>(() =>
    StorageService.getAnsweredMap()
  );
  const [earnedCoupons, setEarnedCoupons] = useState<Coupon[]>(() => StorageService.getEarnedCoupons());

  // Answering State
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Result Modal State
  const [resultModalData, setResultModalData] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    question: Question | null;
    coupon: Coupon | null;
    userAnswer: string;
  }>({
    isOpen: false,
    isCorrect: false,
    question: null,
    coupon: null,
    userAnswer: '',
  });

  // Admin and Wallet Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

  // Reload data from storage whenever updated
  const refreshStorageData = () => {
    setSettings(StorageService.getSettings());
    setSubjects(StorageService.getSubjects());
    setQuestions(StorageService.getQuestions());
    setAnsweredMap(StorageService.getAnsweredMap());
    setEarnedCoupons(StorageService.getEarnedCoupons());
  };

  useEffect(() => {
    // Listen to storage events for cross-tab multi-window synchronization
    const handleStorageChange = () => {
      refreshStorageData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Icon mapping helper
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculator':
        return <Calculator className="w-5 h-5 text-sky-600" />;
      case 'languages':
        return <Languages className="w-5 h-5 text-emerald-600" />;
      case 'leaf':
        return <Leaf className="w-5 h-5 text-lime-600" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-purple-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-600" />;
    }
  };

  // Handle Answer Submission
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewState.type !== 'quiz') return;

    const currentQ = questions.find((q) => q.id === viewState.questionId);
    const currentSub = subjects.find((s) => s.id === viewState.subjectId);
    if (!currentQ || !currentSub) return;

    if (!currentAnswer.trim()) return;

    setIsEvaluating(true);
    const isCorrect = checkAnswer(currentAnswer, currentQ.correctAnswers);

    // Mark as answered in persistent storage (prevents any retrying)
    StorageService.markQuestionAnswered(currentQ.id, isCorrect, currentAnswer);
    setAnsweredMap(StorageService.getAnsweredMap());

    if (isCorrect) {
      // Issue coupon with atomic global serial number
      const newCoupon = StorageService.issueCoupon(currentQ, currentSub.name);
      setEarnedCoupons(StorageService.getEarnedCoupons());
      setResultModalData({
        isOpen: true,
        isCorrect: true,
        question: currentQ,
        coupon: newCoupon,
        userAnswer: currentAnswer,
      });
    } else {
      // Wrong answer
      setResultModalData({
        isOpen: true,
        isCorrect: false,
        question: currentQ,
        coupon: null,
        userAnswer: currentAnswer,
      });
    }

    setIsEvaluating(false);
  };

  // Use/Redeem coupon (makes it disappear)
  const handleUseCoupon = (couponCode: string) => {
    StorageService.useCoupon(couponCode);
    setEarnedCoupons(StorageService.getEarnedCoupons());
    if (resultModalData.coupon?.code === couponCode) {
      setResultModalData((prev) => ({ ...prev, coupon: null }));
    }
  };

  // Close Result Modal
  const handleConfirmCorrect = () => {
    const qSubjectId = (viewState as { subjectId?: string }).subjectId;
    setResultModalData((prev) => ({ ...prev, isOpen: false }));
    setCurrentAnswer('');
    if (qSubjectId) {
      setViewState({ type: 'questions', subjectId: qSubjectId });
    } else {
      setViewState({ type: 'subjects' });
    }
  };

  const handleConfirmIncorrect = () => {
    setResultModalData((prev) => ({ ...prev, isOpen: false }));
    setCurrentAnswer('');
    // As explicitly specified in prompt: 點擊確認後，自動將該題標記為已回答，並返回科目選單
    setViewState({ type: 'subjects' });
  };

  // Calculate subject progress
  const getSubjectStats = (subjectId: string) => {
    const subQuestions = questions.filter((q) => q.subjectId === subjectId);
    const completedCount = subQuestions.filter((q) => !!answeredMap[q.id]).length;
    return { total: subQuestions.length, completed: completedCount };
  };

  // Render Full Screen Admin if active
  if (viewState.type === 'admin') {
    return (
      <AdminDashboard
        onBack={() => {
          refreshStorageData();
          setViewState({ type: 'home' });
        }}
        onDataChanged={refreshStorageData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50/60 to-amber-50/70 flex flex-col items-center justify-center sm:p-4 select-none font-sans text-slate-800">
      
      {/* Mobile-First Shell Container: max 430px */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:max-h-[920px] bg-white sm:rounded-[40px] shadow-2xl sm:border-[7px] sm:border-slate-800/10 flex flex-col relative overflow-hidden transition-all">
        
        {/* Decorative Top Pill / Speaker bar on simulated phone */}
        <div className="hidden sm:flex justify-center pt-2">
          <div className="w-20 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* ========================================================
            VIEW 1: HOME PAGE
           ======================================================== */}
        {viewState.type === 'home' && (
          <div className="flex-1 flex flex-col justify-between p-5 pt-6 sm:p-6 animate-fade-in">
            {/* Top Bar with Wallet Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>趣味知識闖關</span>
              </span>

              {/* My Coupons Wallet Button */}
              <button
                type="button"
                onClick={() => setIsCouponsModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-95 px-3 py-1.5 rounded-full border border-amber-200 shadow-xs transition-all cursor-pointer"
                title="查看我的兌換券"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-600" />
                <span>我的兌換券</span>
                <span className="bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {earnedCoupons.length}
                </span>
              </button>
            </div>

            {/* Dynamic Editable Header with Big Cute Mascots */}
            <div className="text-center my-auto py-2 flex flex-col items-center">
              {/* Cute Prominent Zebra & Avocado Mascots without the badge box */}
              <div className="flex items-center justify-center gap-6 mb-3">
                <CartoonZebra
                  sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  customImageUrl={settings.customZebraImage}
                />
                <CartoonAvocado
                  sizeClass="w-16 h-16 sm:w-20 sm:h-20"
                  customImageUrl={settings.customAvocadoImage}
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug drop-shadow-xs px-2">
                {settings.appTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[320px] mx-auto leading-relaxed">
                {settings.appSubtitle}
              </p>
            </div>

            {/* Cartoon Zebra & Cartoon Avocado Interactive Mascot Stage */}
            <div className="my-auto py-1 flex flex-col items-center">
              <MascotDuo
                size="lg"
                customZebraImage={settings.customZebraImage}
                customAvocadoImage={settings.customAvocadoImage}
                zebraQuotes={settings.zebraQuotes}
                avocadoQuotes={settings.avocadoQuotes}
              />
            </div>

            {/* Start Game Action */}
            <div className="w-full flex flex-col items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setViewState({ type: 'subjects' })}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 border-b-4 border-emerald-700 group cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                <span className="tracking-wider">{settings.startGameBtnText || '開始遊戲'}</span>
              </button>
            </div>

            {/* Subtle Admin Entrance Button in Bottom Corner as explicitly requested */}
            <footer className="pt-4 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-300">
              <span className="text-[10px] text-slate-400">
                {settings.footerText || '© Zebra & Avocado Quest'}
              </span>
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="text-slate-300 hover:text-slate-500 p-1 flex items-center gap-1 transition-colors group cursor-pointer"
                title="後台設定"
                aria-label="管理員登入"
              >
                <Lock className="w-3 h-3 group-hover:text-amber-500 transition-colors" />
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">管理後台</span>
              </button>
            </footer>
          </div>
        )}

        {/* ========================================================
            VIEW 2: SUBJECT SELECTION PAGE (科目選擇頁面)
           ======================================================== */}
        {viewState.type === 'subjects' && (
          <div className="flex-1 flex flex-col bg-slate-50/50 animate-fade-in">
            {/* Top Navigation Bar */}
            <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shadow-xs sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setViewState({ type: 'home' })}
                className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 active:scale-90 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>回首頁</span>
              </button>

              <h2 className="text-sm font-black text-slate-800">選擇挑戰科目</h2>

              <button
                type="button"
                onClick={() => setIsCouponsModalOpen(true)}
                className="text-amber-600 hover:text-amber-700 text-xs font-bold flex items-center gap-1"
                aria-label="查看兌換券"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span className="font-mono">{earnedCoupons.length}</span>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-100">探險家，今天想先挑戰哪一科？</p>
                  <h3 className="text-sm font-black mt-0.5">點選科目開始通關答題 🥑🦓</h3>
                </div>
                <span className="text-2xl">📚</span>
              </div>

              {/* Dynamic Subject Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {subjects.map((sub) => {
                  const stats = getSubjectStats(sub.id);
                  const isAllDone = stats.total > 0 && stats.completed === stats.total;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setViewState({ type: 'questions', subjectId: sub.id })}
                      className="w-full bg-white hover:bg-slate-50/80 active:scale-[0.99] p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {getSubjectIcon(sub.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{sub.name}</h4>
                            {isAllDone && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                全部完成
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{sub.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {stats.completed}/{stats.total}
                        </span>
                        <span className="block text-[10px] text-slate-400">已作答</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: QUESTION SELECTION PAGE (題目選擇頁面)
           ======================================================== */}
        {viewState.type === 'questions' && (() => {
          const currentSub = subjects.find((s) => s.id === viewState.subjectId);
          const subQuestions = questions.filter((q) => q.subjectId === viewState.subjectId);

          return (
            <div className="flex-1 flex flex-col bg-slate-50/50 animate-fade-in">
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shadow-xs sticky top-0 z-10">
                <button
                  type="button"
                  onClick={() => setViewState({ type: 'subjects' })}
                  className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 active:scale-90 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回科目</span>
                </button>

                <h2 className="text-sm font-black text-slate-800">
                  {currentSub ? currentSub.name : '題目清單'}
                </h2>

                <div className="w-12 text-right text-xs font-mono font-bold text-slate-500">
                  共 {subQuestions.length} 題
                </div>
              </div>

              {/* Questions List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl text-xs flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>
                    <strong>答題規則：</strong>每題限挑戰一次，回答後將鎖定為「已完成」狀態，不可重複作答！
                  </span>
                </div>

                {subQuestions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">此科目目前尚無題目</p>
                    <p className="text-xs mt-1">可由後台管理員建立新題目。</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {subQuestions.map((q, idx) => {
                      const answeredRecord = answeredMap[q.id];
                      const isCompleted = !!answeredRecord;

                      return (
                        <div
                          key={q.id}
                          className={`w-full p-4 rounded-2xl border transition-all ${
                            isCompleted
                              ? 'bg-slate-100/90 border-slate-200 opacity-75'
                              : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-800">
                                  {q.title || `第 ${idx + 1} 題`}
                                </span>

                                {isCompleted ? (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                      answeredRecord.isCorrect
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    已完成
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                    待挑戰
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {q.content}
                              </p>
                            </div>

                            {/* Action Button: Disabled if already answered */}
                            <div className="shrink-0 self-center">
                              {isCompleted ? (
                                <button
                                  type="button"
                                  disabled
                                  className="py-1.5 px-3 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed select-none border border-slate-300"
                                >
                                  已完成
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewState({
                                      type: 'quiz',
                                      questionId: q.id,
                                      subjectId: q.subjectId,
                                    })
                                  }
                                  className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>挑戰</span>
                                  <Play className="w-3 h-3 fill-white" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================================
            VIEW 4: QUIZ ANSWERING SCREEN (答題介面)
           ======================================================== */}
        {viewState.type === 'quiz' && (() => {
          const currentQ = questions.find((q) => q.id === viewState.questionId);
          const currentSub = subjects.find((s) => s.id === viewState.subjectId);

          if (!currentQ || !currentSub) {
            return (
              <div className="p-6 text-center">
                <p>題目載入異常</p>
                <button
                  type="button"
                  onClick={() => setViewState({ type: 'subjects' })}
                  className="mt-3 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg"
                >
                  返回科目列表
                </button>
              </div>
            );
          }

          return (
            <div className="flex-1 flex flex-col bg-slate-50/50 animate-fade-in">
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shadow-xs sticky top-0 z-10">
                <button
                  type="button"
                  onClick={() => setViewState({ type: 'questions', subjectId: currentSub.id })}
                  className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 active:scale-90 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回清單</span>
                </button>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {currentSub.name}
                </span>

                <div className="w-12"></div>
              </div>

              {/* Question Body */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between">
                <div>
                  {/* Mascot cheer */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs mb-4">
                    <span className="text-3xl">🥑✨</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">{currentQ.title}</h3>
                      <p className="text-[11px] text-slate-400">認真思考，寫下你心中的答案吧！</p>
                    </div>
                  </div>

                  {/* Question Prompt Card */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-emerald-200 shadow-md">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wider mb-2">
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>問題描述</span>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                      {currentQ.content}
                    </p>
                  </div>
                </div>

                {/* Answer Submission Form */}
                <form onSubmit={handleAnswerSubmit} className="mt-6 space-y-3">
                  <div>
                    <label htmlFor="user-answer-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                      請在下方輸入您的作答答案：
                    </label>
                    <input
                      id="user-answer-input"
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="請輸入答案..."
                      autoFocus
                      required
                      className="w-full px-4 py-3 text-base sm:text-lg font-bold bg-white border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/20 focus:border-emerald-500 shadow-sm transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 提示：本題支援多元同義答案與英數大小寫，盡情發揮！
                  </p>

                  <button
                    type="submit"
                    disabled={!currentAnswer.trim() || isEvaluating}
                    className={`w-full py-3.5 px-6 font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                      !currentAnswer.trim() || isEvaluating
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white cursor-pointer'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>確認送出答案</span>
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ========================================================
          MODALS & OVERLAYS
         ======================================================== */}

      {/* Answering Result Modal */}
      {resultModalData.question && (
        <ResultModal
          isOpen={resultModalData.isOpen}
          isCorrect={resultModalData.isCorrect}
          question={resultModalData.question}
          coupon={resultModalData.coupon}
          userAnswer={resultModalData.userAnswer}
          onConfirmCorrect={handleConfirmCorrect}
          onConfirmIncorrect={handleConfirmIncorrect}
          onUseCoupon={handleUseCoupon}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setViewState({ type: 'admin' });
        }}
        expectedPassword={settings.adminPassword || '115394'}
      />

      {/* User Coupons Wallet Modal */}
      <MyCouponsModal
        isOpen={isCouponsModalOpen}
        onClose={() => setIsCouponsModalOpen(false)}
        coupons={earnedCoupons}
        onUseCoupon={handleUseCoupon}
      />
    </div>
  );
}
