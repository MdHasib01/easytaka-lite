import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'button';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang.startsWith('bn') ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
  };

  const isBangla = currentLang.startsWith('bn');

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all flex-shrink-0 min-w-[46px] sm:min-w-[58px] ${
        isBangla
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
          : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
      } ${className}`}
      title={isBangla ? 'Switch to English' : 'বাংলায় দেখুন'}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
      <span className="sm:hidden">{isBangla ? 'বাং' : 'EN'}</span>
      <span className="hidden sm:inline">{isBangla ? 'বাংলা' : 'EN'}</span>
      <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
        {isBangla ? '/ EN' : '/ বাং'}
      </span>
    </button>
  );
};
