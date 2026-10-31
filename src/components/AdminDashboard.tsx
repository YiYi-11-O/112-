import React, { useState } from 'react';
import { Subject, Question, AppSettings, Coupon, VoucherDesign, VoucherThemeColor, VoucherIconType } from '../types';
import { StorageService } from '../utils/storage';
import { parseAnswerList, formatSerialNumber } from '../utils/quiz';
import { VoucherCard } from './VoucherCard';
import {
  ArrowLeft,
  Settings,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  AlertCircle,
  Ticket,
  Palette,
  Image as ImageIcon,
  KeyRound,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
  onDataChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'voucher' | 'subjects' | 'questions' | 'records'>('settings');

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [zebraQuotesText, setZebraQuotesText] = useState<string>(() =>
    (settings.zebraQuotes || []).join('\n')
  );
  const [avocadoQuotesText, setAvocadoQuotesText] = useState<string>(() =>
    (settings.avocadoQuotes || []).join('\n')
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Subjects & Questions State
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [questions, setQuestions] = useState<Question[]>(() => StorageService.getQuestions());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => subjects[0]?.id || '');

  // Subject Form State
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');

  // Question Form State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qSubjectId, setQSubjectId] = useState(selectedSubjectId);
  const [qTitle, setQTitle] = useState('');
  const [qContent, setQContent] = useState('');
  const [qAnswersRaw, setQAnswersRaw] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qFormError, setQFormError] = useState('');

  // Records / Reset State
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [globalCounter, setGlobalCounter] = useState<number>(() => StorageService.getGlobalCounter());
  const [earnedCoupons, setEarnedCoupons] = useState<Coupon[]>(() => StorageService.getEarnedCoupons());

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // 1. Save All Settings (Texts, Images, Quotes, Voucher Design)
  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const zebraList = zebraQuotesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const avocadoList = avocadoQuotesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedSettings: AppSettings = {
      ...settings,
      zebraQuotes: zebraList,
      avocadoQuotes: avocadoList,
    };
    setSettings(updatedSettings);
    StorageService.saveSettings(updatedSettings);
    setSavedSuccess(true);
    onDataChanged();
    setTimeout(() => setSavedSuccess(false), 2000);
    showNotice('設定已成功儲存！前台已同步套用。');
  };

  const updateVoucherDesign = (partial: Partial<VoucherDesign>) => {
    setSettings((prev) => ({
      ...prev,
      voucherDesign: {
        ...prev.voucherDesign,
        ...partial,
      },
    }));
  };

  // 2. Subject CRUD
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    if (editingSubject) {
      const updated = subjects.map((sub) =>
        sub.id === editingSubject.id
          ? { ...sub, name: newSubjectName.trim(), description: newSubjectDesc.trim() }
          : sub
      );
      setSubjects(updated);
      StorageService.saveSubjects(updated);
      setEditingSubject(null);
      showNotice(`已更新科目「${newSubjectName}」`);
    } else {
      const newSub: Subject = {
        id: `sub_${Date.now()}`,
        name: newSubjectName.trim(),
        icon: 'book-open',
        color: 'from-amber-400 to-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        description: newSubjectDesc.trim() || '自訂科目探索',
      };
      const updated = [...subjects, newSub];
      setSubjects(updated);
      StorageService.saveSubjects(updated);
      setSelectedSubjectId(newSub.id);
      showNotice(`已新增科目「${newSubjectName}」`);
    }
    setNewSubjectName('');
    setNewSubjectDesc('');
    onDataChanged();
  };

  const handleDeleteSubject = (subId: string) => {
    if (subjects.length <= 1) {
      alert('至少需保留一個科目！');
      return;
    }
    if (!confirm('確定要刪除此科目嗎？該科目下的題目也會一併刪除。')) return;

    const updatedSubs = subjects.filter((s) => s.id !== subId);
    const updatedQs = questions.filter((q) => q.subjectId !== subId);

    setSubjects(updatedSubs);
    setQuestions(updatedQs);
    StorageService.saveSubjects(updatedSubs);
    StorageService.saveQuestions(updatedQs);

    if (selectedSubjectId === subId) {
      setSelectedSubjectId(updatedSubs[0]?.id || '');
    }
    showNotice('科目已成功刪除');
    onDataChanged();
  };

  const startEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setNewSubjectName(sub.name);
    setNewSubjectDesc(sub.description);
  };

  // 3. Question CRUD
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qContent.trim() || !qAnswersRaw.trim()) {
      setQFormError('題目標題、內容與正確答案皆為必填！');
      return;
    }

    const answers = parseAnswerList(qAnswersRaw);
    if (answers.length === 0) {
      setQFormError('請至少提供一個有效正確答案！');
      return;
    }
    setQFormError('');

    if (editingQuestion) {
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              subjectId: qSubjectId,
              title: qTitle.trim(),
              content: qContent.trim(),
              correctAnswers: answers,
              explanation: qExplanation.trim(),
            }
          : q
      );
      setQuestions(updated);
      StorageService.saveQuestions(updated);
      setEditingQuestion(null);
      showNotice(`已更新題目「${qTitle}」`);
    } else {
      const newQ: Question = {
        id: `q_${Date.now()}`,
        subjectId: qSubjectId,
        title: qTitle.trim(),
        content: qContent.trim(),
        correctAnswers: answers,
        explanation: qExplanation.trim(),
      };
      const updated = [...questions, newQ];
      setQuestions(updated);
      StorageService.saveQuestions(updated);
      showNotice(`已新增題目「${qTitle}」`);
    }

    setQTitle('');
    setQContent('');
    setQAnswersRaw('');
    setQExplanation('');
    onDataChanged();
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!confirm('確定要刪除這道題目嗎？')) return;
    const updated = questions.filter((q) => q.id !== qId);
    setQuestions(updated);
    StorageService.saveQuestions(updated);
    showNotice('題目已刪除');
    onDataChanged();
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQSubjectId(q.subjectId);
    setQTitle(q.title);
    setQContent(q.content);
    setQAnswersRaw(q.correctAnswers.join(', '));
    setQExplanation(q.explanation);
    const el = document.getElementById('question-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 4. Reset & Records
  const handleResetAnswered = () => {
    if (confirm('確定要清除本機所有已作答紀錄嗎？清除後所有題目將恢復為可點擊挑戰狀態！')) {
      StorageService.resetAnsweredQuestions();
      showNotice('✅ 本機答題紀錄已重置！所有題目皆可重新作答。');
      onDataChanged();
    }
  };

  const handleUpdateGlobalCounter = (val: number) => {
    StorageService.setGlobalCounter(val);
    setGlobalCounter(val);
    showNotice(`兌換券流水號已設為下一張發放：${formatSerialNumber(val)}`);
  };

  const handleRestoreDefaults = () => {
    if (confirm('確定要還原成預設題庫、樣式與科目設定嗎？自訂題目將被重設。')) {
      StorageService.resetAllToDefault();
      const freshSettings = StorageService.getSettings();
      setSettings(freshSettings);
      setZebraQuotesText((freshSettings.zebraQuotes || []).join('\n'));
      setAvocadoQuotesText((freshSettings.avocadoQuotes || []).join('\n'));
      setSubjects(StorageService.getSubjects());
      setQuestions(StorageService.getQuestions());
      setGlobalCounter(StorageService.getGlobalCounter());
      setEarnedCoupons(StorageService.getEarnedCoupons());
      showNotice('已成功恢復初始預設題庫！');
      onDataChanged();
    }
  };

  const filteredQuestions = questions.filter((q) => q.subjectId === selectedSubjectId);

  // Sample coupon for live preview
  const sampleCoupon: Coupon = {
    code: formatSerialNumber(globalCounter || 1),
    serialNumber: globalCounter || 1,
    questionId: 'preview_q',
    questionTitle: '範例挑戰題目',
    subjectName: subjects[0]?.name || '示範科目',
    issuedAt: new Date().toISOString(),
    design: settings.voucherDesign,
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 text-slate-800">
      
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回前台</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
          <span className="text-sm font-bold text-amber-400">後台控制管理系統</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg transition-all"
        >
          儲存並退出
        </button>
      </header>

      {/* Notice Banner */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center animate-fade-in shadow-inner">
          {actionNotice}
        </div>
      )}

      {/* Tabs */}
      <nav aria-label="後台選單" className="bg-white border-b border-slate-200 px-3 flex gap-1 overflow-x-auto scrollbar-none py-2">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>全站文字與圖片</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('voucher')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'voucher'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>兌換券樣式設計</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'subjects'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>科目管理 ({subjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'questions'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>題目管理 ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
            activeTab === 'records'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>測試與流水號</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 flex-1 max-w-xl mx-auto w-full">
        
        {/* ========================================================
            TAB 1: SETTINGS (ALL TEXTS & IMAGES)
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-amber-500" />
              <span>全站文字與圖片設計</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              在此自訂前台所有文字、按鈕、說明與吉祥物圖片。
            </p>

            <form onSubmit={handleSaveAllSettings} className="space-y-4">
              {/* Title & Subtitle */}
              <div className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block">首頁文字設定</span>
                
                <div>
                  <label htmlFor="settings-app-title" className="block text-xs font-semibold text-slate-600 mb-1">
                    首頁主標題
                  </label>
                  <input
                    id="settings-app-title"
                    type="text"
                    value={settings.appTitle}
                    onChange={(e) => setSettings({ ...settings, appTitle: e.target.value })}
                    placeholder="例如：斑馬與酪梨的知識大冒險 🥑🦓"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="settings-app-subtitle" className="block text-xs font-semibold text-slate-600 mb-1">
                    首頁副標題與說明文字
                  </label>
                  <textarea
                    id="settings-app-subtitle"
                    rows={2}
                    value={settings.appSubtitle}
                    onChange={(e) => setSettings({ ...settings, appSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="settings-start-btn" className="block text-xs font-semibold text-slate-600 mb-1">
                      開始按鈕文字
                    </label>
                    <input
                      id="settings-start-btn"
                      type="text"
                      value={settings.startGameBtnText || '開始遊戲'}
                      onChange={(e) => setSettings({ ...settings, startGameBtnText: e.target.value })}
                      placeholder="開始遊戲"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-footer-text" className="block text-xs font-semibold text-slate-600 mb-1">
                      頁尾版權文字
                    </label>
                    <input
                      id="settings-footer-text"
                      type="text"
                      value={settings.footerText || '© Zebra & Avocado Quest'}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Mascot Dialogue / Quotes Customization */}
              <div className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>斑馬與酪梨應援對話（點擊吉祥物時說的話，每行一句）</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  使用者在前台點擊斑馬或酪梨時，會跳出對話泡泡隨機說出以下句子：
                </p>

                <div>
                  <label htmlFor="settings-zebra-quotes" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <span>🦓 斑馬說的話（每行一句台詞）</span>
                  </label>
                  <textarea
                    id="settings-zebra-quotes"
                    rows={4}
                    value={zebraQuotesText}
                    onChange={(e) => setZebraQuotesText(e.target.value)}
                    placeholder="加油！動動腦，知識無極限！🦓✨&#10;斑馬認真奔跑，你也一定可以答對！🔥"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <label htmlFor="settings-avocado-quotes" className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <span>🥑 酪梨說的話（每行一句台詞）</span>
                  </label>
                  <textarea
                    id="settings-avocado-quotes"
                    rows={4}
                    value={avocadoQuotesText}
                    onChange={(e) => setAvocadoQuotesText(e.target.value)}
                    placeholder="酪梨含有滿滿健康好能量！🥑💚&#10;偷偷告訴你：答對有超精緻兌換券喔！🎁"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Mascot Images Customization */}
              <div className="space-y-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>吉祥物圖片客製化（留空則使用預設精美卡通向量）</span>
                </span>

                <div>
                  <label htmlFor="custom-zebra-img" className="block text-xs font-semibold text-slate-600 mb-1">
                    斑馬自訂圖片 URL
                  </label>
                  <input
                    id="custom-zebra-img"
                    type="url"
                    value={settings.customZebraImage || ''}
                    onChange={(e) => setSettings({ ...settings, customZebraImage: e.target.value })}
                    placeholder="https://example.com/zebra.png (留空為預設)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="custom-avocado-img" className="block text-xs font-semibold text-slate-600 mb-1">
                    酪梨自訂圖片 URL
                  </label>
                  <input
                    id="custom-avocado-img"
                    type="url"
                    value={settings.customAvocadoImage || ''}
                    onChange={(e) => setSettings({ ...settings, customAvocadoImage: e.target.value })}
                    placeholder="https://example.com/avocado.png (留空為預設)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Admin Password Setting (Hidden, Secure) */}
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>修改後台管理員密碼</span>
                </span>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.adminPassword || '115394'}
                    onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                    placeholder="請輸入新管理密碼"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono tracking-widest pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? '隱藏密碼' : '顯示密碼'}
                    aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  🔒 密碼已在登入畫面中完全隱藏，只有持有密碼的管理員才可登入。
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? '全站設定已儲存！' : '儲存全站圖文設定'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 2: VOUCHER DESIGN (兌換券樣式與圖案設計)
           ======================================================== */}
        {activeTab === 'voucher' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>兌換券圖案與文字設計</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                客製化兌換券上顯示的所有標語、折扣文字、配色主題與圖示，下方提供即時動態預覽！
              </p>

              <form onSubmit={handleSaveAllSettings} className="space-y-3.5">
                {/* Theme Palette */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    票券風格配色主題
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'amber', name: '經典金黃', bg: 'bg-amber-400' },
                      { id: 'emerald', name: '翡翠青綠', bg: 'bg-emerald-500' },
                      { id: 'purple', name: '夢幻紫粉', bg: 'bg-purple-500' },
                      { id: 'rose', name: '熱情珊瑚', bg: 'bg-rose-500' },
                      { id: 'sky', name: '科技湛藍', bg: 'bg-sky-500' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => updateVoucherDesign({ themeColor: th.id as VoucherThemeColor })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          settings.voucherDesign.themeColor === th.id
                            ? 'border-amber-600 bg-amber-50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${th.bg}`}></span>
                        <span className="text-[10px] font-bold text-slate-700">{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Heading on Voucher */}
                <div>
                  <label htmlFor="voucher-main-title" className="block text-xs font-semibold text-slate-700 mb-1">
                    兌換券大標題
                  </label>
                  <input
                    id="voucher-main-title"
                    type="text"
                    value={settings.voucherDesign.mainTitle}
                    onChange={(e) => updateVoucherDesign({ mainTitle: e.target.value })}
                    placeholder="恭喜獲得8折優惠"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                {/* Discount Rate & Badge Texts */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="voucher-rate-text" className="block text-xs font-semibold text-slate-700 mb-1">
                      主要折扣數字 (如: 8折)
                    </label>
                    <input
                      id="voucher-rate-text"
                      type="text"
                      value={settings.voucherDesign.discountRate}
                      onChange={(e) => updateVoucherDesign({ discountRate: e.target.value })}
                      placeholder="8折"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label htmlFor="voucher-subrate-text" className="block text-xs font-semibold text-slate-700 mb-1">
                      次要英文標籤 (如: 20% OFF)
                    </label>
                    <input
                      id="voucher-subrate-text"
                      type="text"
                      value={settings.voucherDesign.discountSubRate}
                      onChange={(e) => updateVoucherDesign({ discountSubRate: e.target.value })}
                      placeholder="20% OFF"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="voucher-desc-text" className="block text-xs font-semibold text-slate-700 mb-1">
                    折扣項目描述文字
                  </label>
                  <input
                    id="voucher-desc-text"
                    type="text"
                    value={settings.voucherDesign.discountDesc}
                    onChange={(e) => updateVoucherDesign({ discountDesc: e.target.value })}
                    placeholder="全單結帳享 8 折特惠"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Top Badge & Certified text */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="voucher-top-badge" className="block text-xs font-semibold text-slate-700 mb-1">
                      頂部緞帶標語
                    </label>
                    <input
                      id="voucher-top-badge"
                      type="text"
                      value={settings.voucherDesign.topBadge}
                      onChange={(e) => updateVoucherDesign({ topBadge: e.target.value })}
                      placeholder="QUIZ QUEST REWARD"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label htmlFor="voucher-certified-text" className="block text-xs font-semibold text-slate-700 mb-1">
                      右上認證標籤
                    </label>
                    <input
                      id="voucher-certified-text"
                      type="text"
                      value={settings.voucherDesign.certifiedText}
                      onChange={(e) => updateVoucherDesign({ certifiedText: e.target.value })}
                      placeholder="官方正品認證"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    票券中央圖案類型
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'tag', label: '折扣標籤' },
                      { id: 'gift', label: '禮物盒' },
                      { id: 'star', label: '星星徽章' },
                      { id: 'trophy', label: '優勝獎盃' },
                      { id: 'award', label: '榮譽勳章' },
                      { id: 'custom', label: '自訂圖片' },
                    ].map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => updateVoucherDesign({ iconType: ic.id as VoucherIconType })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          settings.voucherDesign.iconType === ic.id
                            ? 'border-amber-600 bg-amber-50 font-bold text-amber-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[11px] block">{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {settings.voucherDesign.iconType === 'custom' && (
                  <div>
                    <label htmlFor="voucher-custom-icon-url" className="block text-xs font-semibold text-slate-700 mb-1">
                      自訂圖案圖片 URL
                    </label>
                    <input
                      id="voucher-custom-icon-url"
                      type="url"
                      value={settings.voucherDesign.customImageUrl || ''}
                      onChange={(e) => updateVoucherDesign({ customImageUrl: e.target.value })}
                      placeholder="https://example.com/icon.png"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="voucher-footer-note" className="block text-xs font-semibold text-slate-700 mb-1">
                    票券底部使用備註
                  </label>
                  <input
                    id="voucher-footer-note"
                    type="text"
                    value={settings.voucherDesign.footerNote}
                    onChange={(e) => updateVoucherDesign({ footerNote: e.target.value })}
                    placeholder="💡 本券限單次使用，點擊核銷按鈕後將立即使用並消失！"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedSuccess ? '樣式設定已儲存！' : '儲存兌換券樣式'}</span>
                </button>
              </form>
            </div>

            {/* Live Interactive Preview */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                兌換券即時效果預覽
              </span>
              <VoucherCard
                coupon={sampleCoupon}
                previewDesign={settings.voucherDesign}
                showSaveHint={false}
              />
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SUBJECTS CRUD
           ======================================================== */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{editingSubject ? `編輯科目：${editingSubject.name}` : '新增科目'}</span>
              </h3>

              <form onSubmit={handleSaveSubject} className="space-y-3">
                <div>
                  <label htmlFor="subject-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    科目名稱
                  </label>
                  <input
                    id="subject-name-input"
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="例如：自然科學、生活美語..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject-desc-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    科目簡介說明
                  </label>
                  <input
                    id="subject-desc-input"
                    type="text"
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    placeholder="例如：成語精華、詩詞典故..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {editingSubject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubject(null);
                        setNewSubjectName('');
                        setNewSubjectDesc('');
                      }}
                      className="py-2 px-3 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                    >
                      取消編輯
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingSubject ? '更新科目' : '新增至科目列表'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                現有科目列表 ({subjects.length})
              </h4>
              <div className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const qCount = questions.filter((q) => q.subjectId === sub.id).length;
                  return (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{sub.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {qCount} 題
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{sub.description}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditSubject(sub)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="編輯"
                          aria-label={`編輯科目 ${sub.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="刪除"
                          aria-label={`刪除科目 ${sub.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: QUESTIONS CRUD
           ======================================================== */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
              <label htmlFor="filter-subject-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                切換檢視科目：
              </label>
              <select
                id="filter-subject-select"
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setQSubjectId(e.target.value);
                }}
                className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({questions.filter((q) => q.subjectId === sub.id).length} 題)
                  </option>
                ))}
              </select>
            </div>

            <div id="question-form" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{editingQuestion ? `編輯題目：${editingQuestion.title}` : '新增題目'}</span>
              </h3>

              {qFormError && (
                <div className="mb-3 p-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveQuestion} className="space-y-3">
                <div>
                  <label htmlFor="q-subject-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    所屬科目
                  </label>
                  <select
                    id="q-subject-select"
                    value={qSubjectId}
                    onChange={(e) => setQSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="q-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    題目標題 (如：第 1 題：成語大考驗)
                  </label>
                  <input
                    id="q-title-input"
                    type="text"
                    value={qTitle}
                    onChange={(e) => setQTitle(e.target.value)}
                    placeholder="第 X 題：..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="q-content-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    題目內容 (完整問題描述)
                  </label>
                  <textarea
                    id="q-content-input"
                    rows={3}
                    value={qContent}
                    onChange={(e) => setQContent(e.target.value)}
                    placeholder="請在此輸入問題題目內容..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="q-answers-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    正確答案清單 <span className="text-emerald-700 font-normal">（支援多個答案，請用逗號分隔）</span>
                  </label>
                  <input
                    id="q-answers-input"
                    type="text"
                    value={qAnswersRaw}
                    onChange={(e) => setQAnswersRaw(e.target.value)}
                    placeholder="例如：10, 十, Ten"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    💡 使用者輸入其中任意一個答案即可判定答對（不區分大小寫與全半形）。
                  </p>
                </div>

                <div>
                  <label htmlFor="q-explanation-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    題目詳解內容 (答對或答錯時皆會呈現給使用者)
                  </label>
                  <textarea
                    id="q-explanation-input"
                    rows={2}
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="請輸入詳解或背景故事說明..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {editingQuestion && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(null);
                        setQTitle('');
                        setQContent('');
                        setQAnswersRaw('');
                        setQExplanation('');
                      }}
                      className="py-2 px-3 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                    >
                      取消編輯
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingQuestion ? '儲存修改' : '新增題目'}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                當前科目下的題目 ({filteredQuestions.length})
              </h4>
              
              {filteredQuestions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  此科目目前尚未建立題目，請使用上方表單新增！
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredQuestions.map((q, idx) => (
                    <div key={q.id} className="py-3 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-800">
                            {idx + 1}. {q.title}
                          </span>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {q.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditQuestion(q)}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="編輯"
                            aria-label={`編輯題目 ${q.title}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="刪除"
                            aria-label={`刪除題目 ${q.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-500">
                        <span className="font-semibold text-emerald-700">答案清單：</span>
                        <span className="font-mono ml-1 text-slate-700">
                          {q.correctAnswers.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: TESTING & RECORDS & COUNTER
           ======================================================== */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>重置本機答題紀錄（方便測試）</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                依照規則，裝置答過的題目會記錄在 localStorage 並被鎖定。點擊此按鈕可清除本機的作答紀錄，重新進行測試流程。
              </p>

              <button
                type="button"
                onClick={handleResetAnswered}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>一鍵重置本機已答題目狀態</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-500" />
                <span>全域兌換券流水號計數器</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                目前下一張發放的流水編號為：
                <span className="font-mono font-bold text-amber-600 ml-1 text-sm">
                  {formatSerialNumber(globalCounter)}
                </span>
                （累計已發放 {globalCounter - 1} 張）
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={globalCounter}
                  onChange={(e) => setGlobalCounter(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-center"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateGlobalCounter(globalCounter)}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  設定下一張流水號
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateGlobalCounter(1)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  歸 1
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-teal-600" />
                <span>本機已領取兌換券清單 ({earnedCoupons.length})</span>
              </h3>
              
              {earnedCoupons.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  本機尚未領取任何兌換券，去前台答對題目即可獲取！
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {earnedCoupons.map((c) => (
                    <div key={c.code} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-amber-700">{c.code}</span>
                        <span className="text-slate-500 ml-2">({c.subjectName} - {c.questionTitle})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(c.issuedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-1">恢復出廠預設資料</h3>
              <p className="text-xs text-slate-500 mb-3">
                若修改題庫後想要重新載入精選範例題庫與五大科目，可點擊此處還原。
              </p>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="py-2 px-3 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-xl transition-all cursor-pointer"
              >
                還原為初始題庫與預設設定
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
