import React, { useState } from 'react';

interface MascotsProps {
  size?: 'sm' | 'md' | 'lg';
  activeQuote?: string;
  className?: string;
  customZebraImage?: string;
  customAvocadoImage?: string;
  zebraQuotes?: string[];
  avocadoQuotes?: string[];
}

export const CartoonZebra: React.FC<{
  sizeClass?: string;
  onClick?: () => void;
  isBouncing?: boolean;
  customImageUrl?: string;
}> = ({
  sizeClass = 'w-24 h-24',
  onClick,
  isBouncing = false,
  customImageUrl,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="可愛斑馬吉祥物"
      className={`relative cursor-pointer transition-transform duration-300 select-none hover:scale-105 active:scale-95 ${
        isBouncing ? 'animate-bounce' : ''
      } ${sizeClass}`}
    >
      {customImageUrl ? (
        <img
          src={customImageUrl}
          alt="自訂斑馬吉祥物"
          className="w-full h-full object-contain rounded-2xl drop-shadow-md"
        />
      ) : (
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Zebra Ears */}
          <path d="M 32 30 Q 20 12 36 10 Q 42 20 38 32 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
          <path d="M 32 26 Q 24 16 34 14 Q 38 20 36 28 Z" fill="#f472b6" />
          <path d="M 88 30 Q 100 12 84 10 Q 78 20 82 32 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
          <path d="M 88 26 Q 96 16 86 14 Q 82 20 84 28 Z" fill="#f472b6" />

          {/* Mane / Hair tuft */}
          <path d="M 48 14 Q 54 4 60 12 Q 66 2 72 14 Z" fill="#111827" />
          <path d="M 44 20 Q 60 10 76 20 Q 60 16 44 20 Z" fill="#374151" />

          {/* Zebra Head Body */}
          <ellipse cx="60" cy="62" rx="42" ry="40" fill="#ffffff" stroke="#1f2937" strokeWidth="3.5" />

          {/* Zebra Stripes on Forehead */}
          <path d="M 40 34 C 48 38, 52 42, 54 46" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 80 34 C 72 38, 68 42, 66 46" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 60 22 L 60 38" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" />

          {/* Side Stripes */}
          <path d="M 22 55 Q 35 58 40 64" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 98 55 Q 85 58 80 64" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 24 70 Q 36 71 39 76" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 96 70 Q 84 71 81 76" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Muzzle (Snout) */}
          <ellipse cx="60" cy="80" rx="26" ry="18" fill="#f3f4f6" stroke="#1f2937" strokeWidth="3" />
          {/* Nostrils */}
          <ellipse cx="53" cy="78" rx="2.5" ry="3.5" fill="#374151" transform="rotate(-10 53 78)" />
          <ellipse cx="67" cy="78" rx="2.5" ry="3.5" fill="#374151" transform="rotate(10 67 78)" />
          {/* Smile */}
          <path d="M 52 86 Q 60 92 68 86" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Big Kawaii Eyes */}
          <circle cx="43" cy="53" r="7.5" fill="#1f2937" />
          <circle cx="77" cy="53" r="7.5" fill="#1f2937" />
          {/* Eye Highlights */}
          <circle cx="45.5" cy="50.5" r="2.8" fill="#ffffff" />
          <circle cx="41.5" cy="55.5" r="1.3" fill="#ffffff" />
          <circle cx="79.5" cy="50.5" r="2.8" fill="#ffffff" />
          <circle cx="75.5" cy="55.5" r="1.3" fill="#ffffff" />

          {/* Cute Blushing Cheeks */}
          <ellipse cx="33" cy="66" rx="6" ry="3.5" fill="#fca5a5" opacity="0.8" />
          <ellipse cx="87" cy="66" rx="6" ry="3.5" fill="#fca5a5" opacity="0.8" />
        </svg>
      )}
    </div>
  );
};

export const CartoonAvocado: React.FC<{
  sizeClass?: string;
  onClick?: () => void;
  isWobbling?: boolean;
  customImageUrl?: string;
}> = ({
  sizeClass = 'w-24 h-24',
  onClick,
  isWobbling = false,
  customImageUrl,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="可愛酪梨吉祥物"
      className={`relative cursor-pointer transition-transform duration-300 select-none hover:scale-105 active:scale-95 ${
        isWobbling ? 'animate-bounce' : ''
      } ${sizeClass}`}
    >
      {customImageUrl ? (
        <img
          src={customImageUrl}
          alt="自訂酪梨吉祥物"
          className="w-full h-full object-contain rounded-2xl drop-shadow-md"
        />
      ) : (
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Little Leaf on top */}
          <path d="M 60 16 C 60 6, 75 8, 70 20 C 65 20, 62 18, 60 16 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
          <path d="M 60 18 Q 58 12 55 13" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Avocado Outer Skin (Dark Green) */}
          <path
            d="M 60 18 C 42 18 34 36 32 54 C 29 74 33 104 60 104 C 87 104 91 74 88 54 C 86 36 78 18 60 18 Z"
            fill="#3f6212"
            stroke="#1a2e05"
            strokeWidth="3.5"
          />

          {/* Avocado Flesh (Creamy Light Yellow-Green) */}
          <path
            d="M 60 23 C 45 23 38 39 37 54 C 34 72 38 99 60 99 C 82 99 86 72 83 54 C 82 39 75 23 60 23 Z"
            fill="#d9f99d"
          />
          <path
            d="M 60 28 C 48 28 42 41 41 54 C 38 69 41 94 60 94 C 79 94 82 69 79 54 C 78 41 72 28 60 28 Z"
            fill="#ecfccb"
          />

          {/* Tiny Waving Arms */}
          <path d="M 33 58 Q 22 55 24 64" stroke="#3f6212" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 87 58 Q 98 52 96 61" stroke="#3f6212" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Cute Big Brown Seed / Belly */}
          <ellipse cx="60" cy="74" rx="19" ry="19" fill="#854d0e" stroke="#582903" strokeWidth="2.5" />
          <ellipse cx="60" cy="74" rx="16" ry="16" fill="#a16207" />
          {/* Seed highlight */}
          <ellipse cx="54" cy="68" rx="4.5" ry="2.5" fill="#fef08a" opacity="0.6" transform="rotate(-30 54 68)" />

          {/* Cute Kawaii Eyes */}
          <circle cx="49" cy="46" r="4.8" fill="#1f2937" />
          <circle cx="71" cy="46" r="4.8" fill="#1f2937" />
          {/* Eye sparkles */}
          <circle cx="50.8" cy="44.2" r="1.8" fill="#ffffff" />
          <circle cx="72.8" cy="44.2" r="1.8" fill="#ffffff" />

          {/* Rosy Cheeks */}
          <ellipse cx="42" cy="52" rx="4" ry="2.5" fill="#f43f5e" opacity="0.75" />
          <ellipse cx="78" cy="52" rx="4" ry="2.5" fill="#f43f5e" opacity="0.75" />

          {/* Cheerful Smile */}
          <path d="M 55 52 Q 60 57 65 52" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </div>
  );
};

export const MascotDuo: React.FC<MascotsProps> = ({
  size = 'md',
  activeQuote,
  className = '',
  customZebraImage,
  customAvocadoImage,
  zebraQuotes,
  avocadoQuotes,
}) => {
  const [zebraQuote, setZebraQuote] = useState<string | null>(null);
  const [avocadoQuote, setAvocadoQuote] = useState<string | null>(null);
  const [bouncingZebra, setBouncingZebra] = useState(false);
  const [bouncingAvocado, setBouncingAvocado] = useState(false);

  const fallbackZebraQuotes = [
    '加油！動動腦，知識無極限！🦓✨',
    '斑馬認真奔跑，你也一定可以答對！🔥',
    '每一題都是一次升級的機會喔！🎯',
    '答對了就換我跳舞給你看！💃',
  ];

  const fallbackAvocadoQuotes = [
    '酪梨含有滿滿健康好能量！🥑💚',
    '偷偷告訴你：答對有超精緻兌換券喔！🎁',
    '深呼吸，仔細看題目，你超棒的！🌟',
    '我是世界上最好吃又營養的水果酪梨！🥑',
  ];

  const activeZebraList =
    zebraQuotes && zebraQuotes.length > 0 ? zebraQuotes : fallbackZebraQuotes;
  const activeAvocadoList =
    avocadoQuotes && avocadoQuotes.length > 0 ? avocadoQuotes : fallbackAvocadoQuotes;

  const handleZebraClick = () => {
    setBouncingZebra(true);
    const rand = activeZebraList[Math.floor(Math.random() * activeZebraList.length)];
    setZebraQuote(rand);
    setAvocadoQuote(null);
    setTimeout(() => setBouncingZebra(false), 800);
  };

  const handleAvocadoClick = () => {
    setBouncingAvocado(true);
    const rand = activeAvocadoList[Math.floor(Math.random() * activeAvocadoList.length)];
    setAvocadoQuote(rand);
    setZebraQuote(null);
    setTimeout(() => setBouncingAvocado(false), 800);
  };

  const sizeClass =
    size === 'sm'
      ? 'w-16 h-16'
      : size === 'lg'
      ? 'w-32 h-32 sm:w-36 sm:h-36'
      : 'w-26 h-26 sm:w-30 sm:h-30';

  const currentSpeech = activeQuote || zebraQuote || avocadoQuote;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Dynamic Cheerful Speech Bubble */}
      <div className="h-12 flex items-center justify-center mb-2 px-3 text-center">
        {currentSpeech ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-2xl shadow-sm animate-fade-in relative max-w-[280px]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-50 border-r border-b border-amber-200 transform rotate-45"></div>
          </div>
        ) : (
          <p className="text-xs text-emerald-700/80 font-medium tracking-wide">
            點擊斑馬或酪梨，聽聽他們的應援悄悄話！✨
          </p>
        )}
      </div>

      {/* Mascots Pair on cute pedestal */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6 py-2 px-6 bg-gradient-to-b from-white/60 to-emerald-50/80 rounded-3xl border border-emerald-100 shadow-inner">
        <CartoonZebra
          sizeClass={sizeClass}
          onClick={handleZebraClick}
          isBouncing={bouncingZebra}
          customImageUrl={customZebraImage}
        />
        
        {/* Playful connection badge */}
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-emerald-600 bg-white shadow-xs border border-emerald-100 rounded-full w-7 h-7 flex items-center justify-center">
            &
          </span>
        </div>

        <CartoonAvocado
          sizeClass={sizeClass}
          onClick={handleAvocadoClick}
          isWobbling={bouncingAvocado}
          customImageUrl={customAvocadoImage}
        />
      </div>
    </div>
  );
};
