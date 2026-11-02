import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, WifiOff, X, HelpCircle, Share, QrCode, Copy, Check } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../usePWAInstall';

const APP_PUBLIC_URL = 'https://ais-pre-asn3tbrtpy3fgbzc5eeho2-475538597637.europe-west1.run.app';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use current origin if outside iframe, otherwise fallback to public preview URL
  const shareUrl = typeof window !== 'undefined' && window.location.origin.includes('run.app')
    ? window.location.origin
    : APP_PUBLIC_URL;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      {/* Offline Status Alert */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-pulse sticky top-0 z-50">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Офлайн-режим: все калькуляторы и справочники ГОСТ работают без интернета</span>
        </div>
      )}

      {/* Install & Mobile Access Bar */}
      {!isInstalled && !dismissed && (
        <div className="bg-slate-950 border-b border-amber-500/50 px-3 py-1.5 text-white shadow-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-xs bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-[10px] font-mono border border-amber-400">
                ГОСТ
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 leading-tight font-mono">
                  <Smartphone className="h-3 w-3 shrink-0" />
                  <span>Мобильная версия / Офлайн PWA</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight font-mono">
                  Поддержка оффлайн режима
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isInstallable ? (
                <button
                  onClick={install}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xs text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-amber-600 active:translate-y-px"
                >
                  <Download className="h-3 w-3" />
                  <span>Установить</span>
                </button>
              ) : null}

              <button
                onClick={() => setShowGuide(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              >
                <QrCode className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">QR-код</span>
                <span className="sm:hidden">QR</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-slate-400 hover:text-white rounded-xs cursor-pointer ml-0.5"
                title="Скрыть панель"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide & QR Code Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111722] rounded-xs max-w-sm w-full p-5 shadow-2xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-amber-600 dark:text-amber-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">Открыть на телефоне</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Наведите камеру смартфона на QR-код</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-[#161F2E] p-3 rounded-xs border border-slate-200 dark:border-slate-800 mb-3">
              <div className="p-2 bg-white rounded-xs shadow-none border border-slate-300 mb-2">
                <img 
                  src={qrCodeUrl} 
                  alt="QR-код для открытия калькулятора на телефоне" 
                  className="w-40 h-40 object-contain"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 text-center font-mono">
                Камера смартфона откроет калькулятор
              </p>
            </div>

            {/* Share / Copy Link Box */}
            <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xs border border-slate-300 dark:border-slate-800 mb-3">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1 uppercase tracking-wider font-mono">
                Прямая ссылка
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs px-2 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200 flex-1 truncate select-all outline-hidden"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-amber-600"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Скопировано' : 'Копия'}</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="bg-slate-50 dark:bg-[#161F2E] p-2.5 rounded-xs border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                  <Smartphone className="h-3.5 w-3.5" />
                  Установка на Android:
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-300 pl-1">
                  <li>Откройте ссылку в Chrome или Яндекс.</li>
                  <li>Нажмите <strong>три точки (⋮)</strong> в правом верхнем углу.</li>
                  <li>Нажмите <strong>«Установить приложение»</strong>.</li>
                </ol>
              </div>

              <div className="bg-slate-50 dark:bg-[#161F2E] p-2.5 rounded-xs border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-blue-700 dark:text-blue-400 text-[11px] uppercase tracking-wider">
                  <Share className="h-3.5 w-3.5" />
                  Установка на iPhone (iOS):
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-300 pl-1">
                  <li>Откройте ссылку в Safari.</li>
                  <li>Нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой).</li>
                  <li>Выберите <strong>«На экран "Домой"»</strong>.</li>
                </ol>
              </div>

              <div className="p-2 bg-emerald-50 dark:bg-[#07241A] rounded-xs border border-emerald-300 dark:border-emerald-800/80 text-[10.5px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Все калькуляторы и таблицы ГОСТ работают офлайн без интернета.</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-3.5 w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-slate-800 dark:border-amber-400"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};
