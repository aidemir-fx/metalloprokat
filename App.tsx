import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Scale, 
  Ruler, 
  Scissors, 
  BookOpen, 
  Boxes, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Info, 
  Menu, 
  X,
  Search,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft,
  Sun,
  Moon,
  FileText,
  ShoppingCart,
  PlusCircle
} from 'lucide-react';
import { calculateCuttingPlan } from './cuttingPlanner';
import { CutCalculationResult } from './types';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { EstimateTab, EstimateItem } from './components/EstimateTab';

import { 
  GOST_DATABASE, 
  MANUFACTURERS, 
  StandardProfile, 
  ProfileCategory, 
  Manufacturer 
} from './gostDatabase';

interface GostCategoryMeta {
  shortTitle: string;
  subtitle: string;
  countLabel: string;
  badge: string;
  weightRange: string;
  iconType: 'rebar' | 'squarePipe' | 'roundPipe' | 'angle' | 'channel' | 'ibeam';
}

const GOST_CATEGORIES_META: Record<string, GostCategoryMeta> = {
  rebar: {
    shortTitle: 'Арматура рифленая',
    subtitle: 'А500С, А400, А240 (А3)',
    countLabel: `${GOST_DATABASE.rebar.items.length} поз.`,
    badge: 'Ø 6–40 мм',
    weightRange: 'от 0.22 кг/м',
    iconType: 'rebar'
  },
  squarePipe: {
    shortTitle: 'Труба профильная',
    subtitle: 'Квадратная и прямоугольная',
    countLabel: `${GOST_DATABASE.squarePipe.items.length} поз.`,
    badge: '15–200 мм',
    weightRange: 'от 0.43 кг/м',
    iconType: 'squarePipe'
  },
  roundPipe: {
    shortTitle: 'Труба круглая ВГП / Э/с',
    subtitle: 'ВГП и электросварная',
    countLabel: `${GOST_DATABASE.roundPipe.items.length} поз.`,
    badge: 'Ду 15–150 / Ø16–530',
    weightRange: 'от 0.54 кг/м',
    iconType: 'roundPipe'
  },
  angle: {
    shortTitle: 'Уголок стальной',
    subtitle: 'Горячекатаный сортовой уголок',
    countLabel: `${GOST_DATABASE.angle.items.length} поз.`,
    badge: '25–125 мм',
    weightRange: 'от 1.12 кг/м',
    iconType: 'angle'
  },
  channel: {
    shortTitle: 'Швеллер г/к',
    subtitle: 'Серии П с параллельными полками',
    countLabel: `${GOST_DATABASE.channel.items.length} поз.`,
    badge: '5П–30П',
    weightRange: 'от 4.84 кг/м',
    iconType: 'channel'
  },
  ibeam: {
    shortTitle: 'Двутавровая балка',
    subtitle: 'Горячекатаная несущая балка',
    countLabel: `${GOST_DATABASE.ibeam.items.length} поз.`,
    badge: '№ 10–30',
    weightRange: 'от 9.46 кг/м',
    iconType: 'ibeam'
  }
};

const renderProfileIcon = (type: string, className: string = "w-6 h-6") => {
  switch (type) {
    case 'rebar':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" fill="#FEF3C7" stroke="#D97706" />
          <path d="M8 8l8 8M8 16l8-8" stroke="#D97706" strokeWidth="1.8" />
        </svg>
      );
    case 'squarePipe':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="17" height="17" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.2" />
          <rect x="7.5" y="7.5" width="9" height="9" rx="1" fill="white" stroke="#D97706" strokeWidth="1.8" />
        </svg>
      );
    case 'roundPipe':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="4.5" fill="white" stroke="#D97706" strokeWidth="1.8" />
        </svg>
      );
    case 'angle':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4v15h15" stroke="#D97706" />
          <path d="M9 4v11h11" stroke="#D97706" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'channel':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Лежачая буква С (швеллер ⊔) */}
          <path d="M4 6v12h16V6" stroke="#D97706" strokeWidth="2.5" />
          <path d="M7.5 6v8.5h9V6" stroke="#D97706" strokeWidth="1.5" strokeDasharray="1.5 2" />
        </svg>
      );
    case 'ibeam':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* Двутавр как буква Н */}
          <path d="M5 4v16M19 4v16M5 12h14" stroke="#D97706" strokeWidth="2.5" />
          <path d="M8.5 4v16M15.5 4v16" stroke="#D97706" strokeWidth="1.2" strokeDasharray="1.5 2" />
        </svg>
      );
    default:
      return <BookOpen className={className} />;
  }
};




export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'sheet' | 'cutting' | 'estimate' | 'gost'>('calc');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Estimate / Order Specification Cart Items (persisted in localStorage)
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>(() => {
    try {
      const saved = localStorage.getItem('metal_estimate_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('metal_estimate_items', JSON.stringify(estimateItems));
    } catch (e) {
      console.error('Failed to save estimate to localStorage', e);
    }
  }, [estimateItems]);

  // Theme state (persisted in localStorage and synced with document root)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calculator Sub-mode
  const [calcSubMode, setCalcSubMode] = useState<'m_to_kg' | 'kg_to_m'>('m_to_kg');

  // Helper for default bar length by category
  const getDefaultBarLength = (cat: string) => {
    if (cat === 'squarePipe' || cat === 'roundPipe') return '6.0';
    if (cat === 'channel' || cat === 'ibeam') return '12.0';
    return '11.7';
  };

  // Meters -> Weight states
  const [mCategory, setMCategory] = useState<string>('rebar');
  const [mSizeIdx, setMSizeIdx] = useState<number | null>(null);
  const [mInputMode, setMInputMode] = useState<'meters' | 'pieces'>('meters');
  const [mLength, setMLength] = useState<string>('');
  const [mPieces, setMPieces] = useState<string>('');
  const [mBarLength, setMBarLength] = useState<string>('11.7');
  const [mManufacturer, setMManufacturer] = useState<string>('theory');
  const [mPricePerTon, setMPricePerTon] = useState<string>('');
  const [mPriceType, setMPriceType] = useState<'ton' | 'meter'>('ton');

  // Weight -> Meters states
  const [wCategory, setWCategory] = useState<string>('rebar');
  const [wSizeIdx, setWSizeIdx] = useState<number | null>(null);
  const [wWeight, setWWeight] = useState<string>('');
  const [wWeightUnit, setWWeightUnit] = useState<'ton' | 'kg'>('ton');
  const [wBarLength, setWBarLength] = useState<string>('11.7');
  const [wManufacturer, setWManufacturer] = useState<string>('theory');
  const [wPricePerTon, setWPricePerTon] = useState<string>('');
  const [wPriceType, setWPriceType] = useState<'ton' | 'meter'>('ton');

  // Sheet Calculator states
  const [sheetL, setSheetL] = useState<string>('2.5');
  const [sheetW, setSheetW] = useState<string>('1.25');
  const [sheetT, setSheetT] = useState<string>('4.0');
  const [sheetQty, setSheetQty] = useState<string>('10');
  const [sheetPrice, setSheetPrice] = useState<string>('82000');

  // Cutting Planner states
  const [stockLengthM, setStockLengthM] = useState<string>('11.7'); // meters
  const [cutsList, setCutsList] = useState<{ length_m: string; count: string }[]>([
    { length_m: '', count: '' }
  ]);
  const [cuttingResult, setCuttingResult] = useState<CutCalculationResult | null>(null);

  // GOST Directory states
  const [gostSearch, setGostSearch] = useState<string>('');
  const [selectedGostCat, setSelectedGostCat] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState<string>('');

  const handleApplyToCalc = (catKey: string, itemIdx: number, itemLabel: string) => {
    setMCategory(catKey);
    setMSizeIdx(itemIdx);
    setMBarLength(getDefaultBarLength(catKey));
    setActiveTab('calc');
    setCalcSubMode('m_to_kg');
    showToast(`Выбран профиль: ${itemLabel} — открыт калькулятор`, 'success');
  };

  const handleCopyGostItem = (catName: string, gost: string, label: string, weight: number, details?: string) => {
    const text = `${catName} (${label})\nСтандарт: ${gost}\nТеоретический вес: ${weight} кг/м${details ? `\nНазначение: ${details}` : ''}`;
    navigator.clipboard.writeText(text);
    showToast(`Скопировано: ${label} (${weight} кг/м)`, 'success');
  };

  // Helpers
  const num = (v: number, decimals: number = 2) => {
    return isNaN(v) ? '0' : v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCm = (mm: number): string => {
    const cm = mm / 10;
    if (Math.abs(cm - Math.round(cm)) < 0.001) {
      return Math.round(cm).toString();
    }
    return Number(cm.toFixed(1)).toString().replace('.', ',');
  };

  const getMfg = (id: string) => MANUFACTURERS.find(m => m.id === id) || MANUFACTURERS[0];

  // Calculations for Meters -> Weight
  const currentMCat = GOST_DATABASE[mCategory];
  const currentMItem = mSizeIdx !== null ? currentMCat?.items[mSizeIdx] : null;
  const theoMPerM = currentMItem ? currentMItem.weightPerMeter : 0;
  const actualMPerM = theoMPerM * getMfg(mManufacturer).factor;
  const mBarLen = parseFloat(mBarLength) || 11.7;
  const mPiecesVal = parseInt(mPieces) || 0;
  const lenVal = mInputMode === 'pieces' ? mPiecesVal * mBarLen : (parseFloat(mLength) || 0);
  const calculatedMPieces = mBarLen > 0 ? lenVal / mBarLen : 0;
  const totalWeightKg = actualMPerM * lenVal;
  const totalWeightTn = totalWeightKg / 1000;
  const priceInputM = parseFloat(mPricePerTon) || 0;
  const totalCostM = mPriceType === 'ton' ? (totalWeightTn * priceInputM) : (lenVal * priceInputM);
  const effectivePriceTonM = mPriceType === 'ton' ? priceInputM : (totalWeightTn > 0 ? (totalCostM / totalWeightTn) : 0);
  const effectivePriceMeterM = mPriceType === 'meter' ? priceInputM : (lenVal > 0 ? (totalCostM / lenVal) : 0);

  // Calculations for Weight -> Meters
  const currentWCat = GOST_DATABASE[wCategory];
  const currentWItem = wSizeIdx !== null ? currentWCat?.items[wSizeIdx] : null;
  const theoWPerM = currentWItem ? currentWItem.weightPerMeter : 0;
  const actualWPerM = theoWPerM * getMfg(wManufacturer).factor;
  const rawW = parseFloat(wWeight) || 0;
  const weightKg = wWeightUnit === 'ton' ? rawW * 1000 : rawW;
  const calculatedMeters = actualWPerM > 0 ? weightKg / actualWPerM : 0;
  const wBarLen = parseFloat(wBarLength) || 11.7;
  const calculatedWPieces = wBarLen > 0 ? calculatedMeters / wBarLen : 0;
  const priceInputW = parseFloat(wPricePerTon) || 0;
  const totalCostW = wPriceType === 'ton' ? ((weightKg / 1000) * priceInputW) : (calculatedMeters * priceInputW);
  const effectivePriceTonW = wPriceType === 'ton' ? priceInputW : ((weightKg / 1000) > 0 ? (totalCostW / (weightKg / 1000)) : 0);
  const effectivePriceMeterW = wPriceType === 'meter' ? priceInputW : (calculatedMeters > 0 ? (totalCostW / calculatedMeters) : 0);

  // Sheet Steel calculations
  const sL = parseFloat(sheetL) || 0;
  const sW = parseFloat(sheetW) || 0.0;
  const sT = parseFloat(sheetT) || 0.0;
  const sQ = parseFloat(sheetQty) || 0;
  const sPriceTn = parseFloat(sheetPrice) || 0;
  // Steel density = 7850 kg/m^3 -> thickness in mm / 1000
  const singleSheetWeightKg = sL * sW * (sT / 1000) * 7850;
  const totalSheetKg = singleSheetWeightKg * sQ;
  const totalSheetTn = totalSheetKg / 1000;
  const totalSheetCost = totalSheetTn * sPriceTn;

  // Run Cutting Planner
  const handleRunCutting = () => {
    const stockMm = (parseFloat(stockLengthM) || 11.7) * 1000;
    const formattedCuts = cutsList.map(c => ({
      length_mm: Math.round((parseFloat(c.length_m) || 0) * 1000),
      count: parseInt(c.count) || 0
    })).filter(c => c.length_mm > 0 && c.count > 0);

    if (formattedCuts.length === 0) {
      showToast('Укажите длину и количество хотя бы для одной детали', 'error');
      return;
    }

    const res = calculateCuttingPlan(stockMm, 0, formattedCuts);
    setCuttingResult(res);
    showToast('План раскроя успешно рассчитан!', 'success');
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Расчет скопирован в буфер обмена!', 'success');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Расчет скопирован в буфер обмена!', 'success');
    } catch {
      showToast('Не удалось скопировать', 'error');
    }
  };

  const handleCopyMToKg = () => {
    const item = mSizeIdx !== null ? currentMCat?.items[mSizeIdx] : null;
    if (!item) {
      showToast('Сначала выберите размер по стандарту', 'error');
      return;
    }
    const costPerMeter = lenVal > 0 ? totalCostM / lenVal : 0;
    const piecesText = mInputMode === 'pieces'
      ? `${mPiecesVal} шт (хлыст ${mBarLen} м)`
      : `${Math.round(calculatedMPieces)} шт (~${num(calculatedMPieces, 1)} хлыстов по ${mBarLen} м)`;
    
    const lines = [
      `Наименование: ${currentMCat?.name || 'Металлопрокат'}${currentMCat?.gost ? ` (${currentMCat.gost})` : ''}`,
      `Размер: ${item.label} (ГОСТ ${item.weightPerMeter} кг/м)`,
      `Количество: ${piecesText}`,
      `Метраж: ${num(lenVal, 2)} м`,
      `Вес: ${num(totalWeightTn, 3)} т (${num(totalWeightKg, 1)} кг)`,
      `Цена: ${priceInputM > 0 ? `${num(totalCostM, 2)} ₽` : 'не указана'}`,
      `Цена за тонну: ${priceInputM > 0 ? `${num(effectivePriceTonM, 2)} ₽/т` : 'не указана'}`,
      `Цена за метр: ${costPerMeter > 0 ? `${num(costPerMeter, 2)} ₽/м` : 'не указана'}`,
    ];
    copyToClipboard(lines.join('\n'));
  };

  const handleCopyKgToM = () => {
    const item = wSizeIdx !== null ? currentWCat?.items[wSizeIdx] : null;
    if (!item) {
      showToast('Сначала выберите размер по стандарту', 'error');
      return;
    }
    const costPerMeter = calculatedMeters > 0 ? totalCostW / calculatedMeters : 0;
    const piecesText = `${Math.round(calculatedWPieces)} шт (~${num(calculatedWPieces, 1)} хлыстов по ${wBarLen} м)`;

    const lines = [
      `Наименование: ${currentWCat?.name || 'Металлопрокат'}${currentWCat?.gost ? ` (${currentWCat.gost})` : ''}`,
      `Размер: ${item.label} (ГОСТ ${item.weightPerMeter} кг/м)`,
      `Количество: ${piecesText}`,
      `Метраж: ${num(calculatedMeters, 2)} м`,
      `Вес: ${num(weightKg / 1000, 3)} т (${num(weightKg, 1)} кг)`,
      `Цена: ${priceInputW > 0 ? `${num(totalCostW, 2)} ₽` : 'не указана'}`,
      `Цена за тонну: ${priceInputW > 0 ? `${num(effectivePriceTonW, 2)} ₽/т` : 'не указана'}`,
      `Цена за метр: ${priceInputW > 0 && calculatedMeters > 0 ? `${num(effectivePriceMeterW, 2)} ₽/м` : 'не указана'}`,
    ];
    copyToClipboard(lines.join('\n'));
  };

  const handleCopySheet = () => {
    const sheetLVal = parseFloat(sheetL) || 0;
    const sheetWVal = parseFloat(sheetW) || 0;
    const sheetQtyVal = parseInt(sheetQty) || 0;
    const totalArea = sheetLVal * sheetWVal * sheetQtyVal;
    const costPerSheet = sheetQtyVal > 0 && totalSheetCost > 0 ? totalSheetCost / sheetQtyVal : 0;
    const costPerM2 = totalArea > 0 && totalSheetCost > 0 ? totalSheetCost / totalArea : 0;

    const lines = [
      `Наименование: Листовой прокат стальной (ГОСТ 19903-2015)`,
      `Размер: ${sheetL} м × ${sheetW} м × ${sheetT} мм (вес 1 листа: ${num(singleSheetWeightKg, 1)} кг)`,
      `Количество: ${sheetQtyVal} шт`,
      `Метраж: ${num(totalArea, 2)} м² (${num(sheetLVal * sheetQtyVal, 2)} пог. м)`,
      `Вес: ${num(totalSheetTn, 3)} т (${num(totalSheetKg, 1)} кг)`,
      `Цена: ${totalSheetCost > 0 ? `${num(totalSheetCost, 2)} ₽` : 'не указана'}`,
      `Цена за тонну: ${sheetPrice ? `${num(parseFloat(sheetPrice) || 0, 2)} ₽/т` : 'не указана'}`,
      `Цена за метр: ${costPerM2 > 0 ? `${num(costPerM2, 2)} ₽/м²` : 'не указана'}${costPerSheet > 0 ? ` (${num(costPerSheet, 2)} ₽/лист)` : ''}`,
    ];
    copyToClipboard(lines.join('\n'));
  };

  const handleCopyCutting = () => {
    if (!cuttingResult) return;
    const stockM = cuttingResult.stock_length_mm / 1000;
    const payableM = cuttingResult.payable_mm / 1000;
    const requestedM = cuttingResult.requested_mm / 1000;
    const wasteM = cuttingResult.waste_mm / 1000;
    const wastePct = payableM > 0 ? (wasteM / payableM * 100) : 0;
    const usefulPct = 100 - wastePct;

    const lines = [
      `Результат расчета раскроя:`,
      `Длина исходного хлыста: ${stockM} м`,
      `Хлыстов к покупке: ${cuttingResult.bars_needed} шт`,
      `Покупаемый метраж: ${num(payableM, 2)} м`,
      `Полезный расход: ${num(requestedM, 2)} м (${num(usefulPct, 1)}%)`,
      `Общий остаток (обрезь): ${num(wasteM, 2)} м (${num(wastePct, 1)}%)`,
      ``,
      `Схема раскроя:`,
      ...cuttingResult.bars.map(bar => 
        `Хлыст №${bar.bar_index}: ${bar.groups.map(g => `${formatCm(g.length_mm)} см × ${g.count} шт`).join(', ')} (остаток: ${formatCm(bar.waste_mm)} см / ${num(bar.waste_mm / 1000, 2)} м)`
      )
    ];
    copyToClipboard(lines.join('\n'));
  };

  // Estimate Cart Handlers
  const handleAddToEstimateFromMeters = () => {
    const item = mSizeIdx !== null ? currentMCat?.items[mSizeIdx] : null;
    if (!item) {
      showToast('Сначала выберите размер по стандарту', 'error');
      return;
    }
    if (lenVal <= 0) {
      showToast('Укажите длину или количество штук', 'error');
      return;
    }

    const piecesText = mInputMode === 'pieces'
      ? `${mPiecesVal} шт (хлыст ${mBarLen}м)`
      : `~${Math.round(calculatedMPieces)} шт (по ${mBarLen}м)`;

    const newItem: EstimateItem = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${currentMCat?.name || 'Металлопрокат'} ${item.label}`,
      standard: currentMCat?.gost || '',
      manufacturer: getMfg(mManufacturer).name,
      details: `${num(lenVal, 2)} м (${piecesText}) • ${item.weightPerMeter} кг/м`,
      quantity: Math.round(lenVal * 100) / 100,
      unit: 'м',
      weightKg: totalWeightKg,
      priceInput: priceInputM,
      priceType: mPriceType,
      effectivePricePerMeter: effectivePriceMeterM,
      effectivePricePerTon: effectivePriceTonM,
      totalCost: totalCostM,
      createdAt: Date.now()
    };

    setEstimateItems(prev => [newItem, ...prev]);
    showToast(`Позиция «${item.label}» добавлена в смету!`, 'success');
  };

  const handleAddToEstimateFromWeight = () => {
    const item = wSizeIdx !== null ? currentWCat?.items[wSizeIdx] : null;
    if (!item) {
      showToast('Сначала выберите размер по стандарту', 'error');
      return;
    }
    if (weightKg <= 0) {
      showToast('Укажите массу металла', 'error');
      return;
    }

    const piecesText = `~${Math.round(calculatedWPieces)} шт (хлыст ${wBarLen}м)`;

    const newItem: EstimateItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${currentWCat?.name || 'Металлопрокат'} ${item.label}`,
      standard: currentWCat?.gost || '',
      manufacturer: getMfg(wManufacturer).name,
      details: `${num(calculatedMeters, 2)} м (${piecesText}) • ${item.weightPerMeter} кг/м`,
      quantity: Math.round(calculatedMeters * 100) / 100,
      unit: 'м',
      weightKg: weightKg,
      priceInput: priceInputW,
      priceType: wPriceType,
      effectivePricePerMeter: effectivePriceMeterW,
      effectivePricePerTon: effectivePriceTonW,
      totalCost: totalCostW,
      createdAt: Date.now()
    };

    setEstimateItems(prev => [newItem, ...prev]);
    showToast(`Позиция «${item.label}» добавлена в смету!`, 'success');
  };

  const handleAddToEstimateFromSheet = () => {
    const sLVal = parseFloat(sheetL) || 0;
    const sWVal = parseFloat(sheetW) || 0;
    const sTVal = parseFloat(sheetT) || 0;
    const sQVal = parseInt(sheetQty) || 0;

    if (sLVal <= 0 || sWVal <= 0 || sTVal <= 0 || sQVal <= 0) {
      showToast('Укажите размеры и количество листов', 'error');
      return;
    }

    const totalArea = sLVal * sWVal * sQVal;

    const newItem: EstimateItem = {
      id: `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `Лист г/к стальной ${sTVal} мм`,
      standard: 'ГОСТ 19903-2015',
      details: `${sLVal}×${sWVal} м • ${sQVal} шт (${num(totalArea, 2)} м²) • 1 лист: ${num(singleSheetWeightKg, 1)} кг`,
      quantity: sQVal,
      unit: 'шт',
      weightKg: totalSheetKg,
      priceInput: sPriceTn,
      priceType: 'ton',
      totalCost: totalSheetCost,
      createdAt: Date.now()
    };

    setEstimateItems(prev => [newItem, ...prev]);
    showToast(`Листовой прокат (${sQVal} шт) добавлен в смету!`, 'success');
  };

  const handleAddToEstimateFromCutting = () => {
    if (!cuttingResult || cuttingResult.bars_needed <= 0) {
      showToast('Сначала выполните расчет раскроя', 'error');
      return;
    }

    const stockM = (parseFloat(stockLengthM) || 11.7);
    const totalBarsM = cuttingResult.bars_needed * stockM;

    const newItem: EstimateItem = {
      id: `cut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `Хлысты под раскрой (${cuttingResult.bars_needed} шт по ${stockM} м)`,
      standard: 'Расчет карты раскроя',
      details: `Всего ${num(totalBarsM, 2)} м • Полезный расход: ${num(cuttingResult.requested_mm / 1000, 2)} м • Обрезь: ${num(cuttingResult.waste_total_mm / 1000, 2)} м (${num(cuttingResult.waste_percentage, 1)}%)`,
      quantity: cuttingResult.bars_needed,
      unit: 'шт',
      weightKg: 0,
      priceInput: 0,
      priceType: 'piece',
      totalCost: 0,
      notes: `Деталей в раскрое: ${cuttingResult.total_parts_cut} шт`,
      createdAt: Date.now()
    };

    setEstimateItems(prev => [newItem, ...prev]);
    showToast(`Хлысты для раскроя (${cuttingResult.bars_needed} шт) добавлены в смету!`, 'success');
  };

  const handleUpdateEstimateItem = (id: string, updated: Partial<EstimateItem>) => {
    setEstimateItems(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
  };

  const handleDeleteEstimateItem = (id: string) => {
    setEstimateItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearEstimate = () => {
    setEstimateItems([]);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors duration-150">
      
      {/* PWA Install Banner & Offline Status */}
      <PWAInstallBanner />
      
      {/* Top Header with App Title and Theme Toggle */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 px-4 sm:px-6 py-2 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-slate-900 dark:bg-amber-500 text-amber-400 dark:text-slate-950 flex items-center justify-center font-black border border-slate-700 dark:border-amber-400 shadow-none">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white leading-tight font-mono">
                Металлокалькулятор ГОСТ
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Инженерный расчет веса, раскроя и сортамента РФ</p>
            </div>
          </div>
          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xs border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('calc')}
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calc'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Вес</span>
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sheet'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Лист</span>
            </button>
            <button
              onClick={() => setActiveTab('cutting')}
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cutting'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Раскрой</span>
            </button>
            <button
              onClick={() => setActiveTab('estimate')}
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'estimate'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Смета</span>
              {estimateItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-none ${
                  activeTab === 'estimate'
                    ? 'bg-amber-400 text-slate-950 dark:bg-slate-950 dark:text-amber-400'
                    : 'bg-amber-500 text-slate-950'
                }`}>
                  {estimateItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('gost')}
              className={`px-3 py-1 rounded-xs text-xs font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gost'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>ГОСТ</span>
            </button>
          </nav>

          <button
            onClick={toggleTheme}
            className="px-2.5 sm:px-3 py-1 rounded-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] uppercase font-mono tracking-wider">Светлая</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-[10px] uppercase font-mono tracking-wider">Тёмная</span>
              </>
            )}
          </button>
        </div>
      </header>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-14 right-5 z-50 bg-slate-950 text-white px-3.5 py-2 rounded-xs shadow-md flex items-center gap-2.5 border border-slate-800">
          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}

      {/* Bottom Navigation Bar - Strict Industrial Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 backdrop-blur-md border-t border-slate-800 safe-area-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-5 px-1 py-0.5 gap-0.5">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex flex-col items-center py-1.5 rounded-xs text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'calc'
                ? 'text-amber-400 bg-slate-900 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
            }`}
          >
            <Scale className="h-3.5 w-3.5 mb-0.5" />
            <span>Вес</span>
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex flex-col items-center py-1.5 rounded-xs text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'sheet'
                ? 'text-amber-400 bg-slate-900 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
            }`}
          >
            <Boxes className="h-3.5 w-3.5 mb-0.5" />
            <span>Лист</span>
          </button>
          <button
            onClick={() => setActiveTab('cutting')}
            className={`flex flex-col items-center py-1.5 rounded-xs text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'cutting'
                ? 'text-amber-400 bg-slate-900 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
            }`}
          >
            <Scissors className="h-3.5 w-3.5 mb-0.5" />
            <span>Раскрой</span>
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`flex flex-col items-center py-1.5 rounded-xs text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer relative ${
              activeTab === 'estimate'
                ? 'text-amber-400 bg-slate-900 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
            }`}
          >
            <div className="relative">
              <FileText className="h-3.5 w-3.5 mb-0.5" />
              {estimateItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                  {estimateItems.length > 9 ? '9+' : estimateItems.length}
                </span>
              )}
            </div>
            <span>Смета</span>
          </button>
          <button
            onClick={() => setActiveTab('gost')}
            className={`flex flex-col items-center py-1.5 rounded-xs text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'gost'
                ? 'text-amber-400 bg-slate-900 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-t-2 border-transparent'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 mb-0.5" />
            <span>ГОСТ</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-16 flex-1 w-full">
        
        {/* TAB 1: METERS <-> WEIGHT */}
        {activeTab === 'calc' && (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            
            {/* Sub-mode Switcher */}
            <div className="flex bg-slate-200 dark:bg-slate-900 p-0.5 rounded-xs max-w-xs mx-auto border border-slate-300 dark:border-slate-800">
              <button
                onClick={() => setCalcSubMode('m_to_kg')}
                className={`flex-1 py-1 px-3 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  calcSubMode === 'm_to_kg'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Метры → Вес
              </button>
              <button
                onClick={() => setCalcSubMode('kg_to_m')}
                className={`flex-1 py-1 px-3 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  calcSubMode === 'kg_to_m'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Вес → Метры
              </button>
            </div>

            {/* METERS -> WEIGHT VIEW */}
            {calcSubMode === 'm_to_kg' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                
                {/* Input panel */}
                <div className="lg:col-span-5 bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
                  <div>
                    <select
                      value={mCategory}
                      aria-label="Тип металлопроката"
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setMCategory(newCat);
                        setMSizeIdx(null);
                        setMBarLength(getDefaultBarLength(newCat));
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {Object.entries(GOST_DATABASE).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={mSizeIdx !== null ? mSizeIdx : ''}
                      aria-label="Размер по стандарту"
                      onChange={(e) => setMSizeIdx(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Выберите размер --</option>
                      {currentMCat?.items.map((item, idx) => (
                        <option key={idx} value={idx}>
                          {item.label} ({item.weightPerMeter} кг/м)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {mInputMode === 'meters' ? 'Длина металлопроката' : 'Количество хлыстов (шт)'}
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xs border border-slate-300 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setMInputMode('meters')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            mInputMode === 'meters'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          Метры
                        </button>
                        <button
                          type="button"
                          onClick={() => setMInputMode('pieces')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            mInputMode === 'pieces'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          Штуки
                        </button>
                      </div>
                    </div>

                    {mInputMode === 'meters' ? (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0.00"
                            value={mLength}
                            onChange={(e) => setMLength(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 pointer-events-none">м</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-0.5">
                          <span>Стандарт хлыста (для шт):</span>
                          <select
                            value={mBarLength}
                            onChange={(e) => setMBarLength(e.target.value)}
                            className="bg-transparent font-bold text-slate-700 dark:text-slate-300 border-b border-slate-400 dark:border-slate-600 pb-0.5 cursor-pointer focus:outline-hidden font-mono text-[11px]"
                          >
                            <option value="11.7" className="dark:bg-slate-800">11.7 м (арматура)</option>
                            <option value="12.0" className="dark:bg-slate-800">12.0 м (прокат)</option>
                            <option value="6.0" className="dark:bg-slate-800">6.0 м (труба/профиль)</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={mPieces}
                              onChange={(e) => setMPieces(e.target.value)}
                              placeholder="Кол-во"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 pr-8 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 pointer-events-none">шт</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              value={mBarLength}
                              onChange={(e) => setMBarLength(e.target.value)}
                              placeholder="Длина хлыста"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 pr-10 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 pointer-events-none">м/шт</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 px-0.5">
                          Общий метраж: <strong className="font-mono text-slate-900 dark:text-slate-200">{num(lenVal, 2)} м</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <select
                      value={mManufacturer}
                      aria-label="Производитель (допуск)"
                      onChange={(e) => setMManufacturer(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {MANUFACTURERS.map((m) => (
                        <option key={m.id} value={m.id} className="dark:bg-slate-800">
                          {m.name} {m.factor !== 1 ? `(${m.factor > 1 ? '+' : ''}${((m.factor - 1) * 100).toFixed(1)}%)` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{getMfg(mManufacturer).desc}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {mPriceType === 'ton' ? 'Цена за 1 тонну (₽/т)' : 'Цена за 1 метр (₽/м)'}
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xs border border-slate-300 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setMPriceType('ton')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            mPriceType === 'ton'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          За тонну
                        </button>
                        <button
                          type="button"
                          onClick={() => setMPriceType('meter')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            mPriceType === 'meter'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          За метр
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={mPricePerTon}
                      onChange={(e) => setMPricePerTon(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Output panel */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3.5 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">ТЕОРЕТИЧЕСКИЙ ВЕС (ГОСТ)</span>
                      <div className="mt-2">
                        <strong className="text-xl sm:text-2xl font-mono tracking-tight text-white block">
                          {mSizeIdx !== null && lenVal > 0 ? `${num(theoMPerM * lenVal / 1000, 3)} ` : '— '}<span className="text-xs font-normal text-slate-400">т</span>
                        </strong>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          ГОСТ: {mSizeIdx !== null && lenVal > 0 ? `${num(theoMPerM * lenVal, 1)} кг` : (mSizeIdx === null ? 'выберите размер' : 'укажите длину')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#062418] dark:bg-[#07241A] text-white p-3.5 sm:p-4 rounded-xs shadow-none flex flex-col justify-between border border-emerald-900/90 dark:border-emerald-800/80">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">ФАКТИЧЕСКИЙ ВЕС</span>
                        <span className="text-[9px] bg-emerald-900/90 text-emerald-200 border border-emerald-700/80 px-1.5 py-0.5 rounded-xs font-mono font-bold uppercase tracking-wider shrink-0">
                          {getMfg(mManufacturer).name}
                        </span>
                      </div>
                      <div className="mt-2">
                        <strong className="text-xl sm:text-2xl font-mono tracking-tight text-emerald-300 block">
                          {mSizeIdx !== null && lenVal > 0 ? `${num(totalWeightTn, 3)} ` : '— '}<span className="text-xs font-normal text-emerald-400">т</span>
                        </strong>
                        <p className="text-[11px] font-mono text-emerald-200 mt-0.5">
                          Фактически: {mSizeIdx !== null && lenVal > 0 ? `${num(totalWeightKg, 1)} кг` : (mSizeIdx === null ? 'выберите размер' : 'укажите длину')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 font-mono">
                      Спецификация партии и стоимости
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Вес 1 пог. метра:</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{mSizeIdx !== null ? `${num(actualMPerM, 3)} кг/м` : '—'}</strong>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Метраж в партии:</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{num(lenVal, 2)} м</strong>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Количество (штук):</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">
                          {mInputMode === 'pieces' ? `${mPiecesVal} шт` : `${Math.round(calculatedMPieces)} шт`}
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-normal">
                            ({mInputMode === 'pieces' ? `хлыст ${mBarLen}м` : `~${num(calculatedMPieces, 1)} по ${mBarLen}м`})
                          </span>
                        </strong>
                      </div>
                      {priceInputM > 0 && lenVal > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Цена за 1 метр:</p>
                          <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm block mt-0.5">{num(effectivePriceMeterM, 2)} ₽/м</strong>
                        </div>
                      )}
                      {priceInputM > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Цена за 1 тонну:</p>
                          <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{num(effectivePriceTonM, 2)} ₽/т</strong>
                        </div>
                      )}
                      <div className="col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        {priceInputM > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 rounded-xs flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Расчетная стоимость партии:</p>
                              <div className="mt-0.5">
                                <strong className="text-lg sm:text-xl font-mono font-bold text-slate-900 dark:text-amber-400 break-words">{num(totalCostM, 2)}</strong>
                                <span className="ml-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400">₽</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleAddToEstimateFromMeters}
                            disabled={mSizeIdx === null || lenVal <= 0}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 active:translate-y-px rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors border border-amber-600 dark:border-amber-400 shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Добавить расчет в сводную смету заказа"
                          >
                            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>+ В смету</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyMToKg}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border border-slate-800 dark:border-slate-700 shadow-none active:translate-y-px"
                          >
                            <Copy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Копировать расчет</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* WEIGHT -> METERS VIEW */}
            {calcSubMode === 'kg_to_m' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                
                {/* Input panel */}
                <div className="lg:col-span-5 bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
                  <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-mono">
                    <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Масса металла на весах / в накладной
                  </h3>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Тип металлопроката</label>
                    <select
                      value={wCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setWCategory(newCat);
                        setWSizeIdx(null);
                        setWBarLength(getDefaultBarLength(newCat));
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {Object.entries(GOST_DATABASE).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Размер по стандарту</label>
                    <select
                      value={wSizeIdx !== null ? wSizeIdx : ''}
                      onChange={(e) => setWSizeIdx(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Выберите размер --</option>
                      {currentWCat?.items.map((item, idx) => (
                        <option key={idx} value={idx}>
                          {item.label} ({item.weightPerMeter} кг/м)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Масса металлопроката</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={wWeight}
                        onChange={(e) => setWWeight(e.target.value)}
                        className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <select
                        value={wWeightUnit}
                        onChange={(e) => setWWeightUnit(e.target.value as 'ton' | 'kg')}
                        className="w-28 sm:w-32 shrink-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 truncate"
                      >
                        <option value="ton">Тонны (т)</option>
                        <option value="kg">Кг (кг)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-0.5 mt-1.5">
                      <span>Стандарт хлыста (для шт):</span>
                      <select
                        value={wBarLength}
                        onChange={(e) => setWBarLength(e.target.value)}
                        className="bg-transparent font-bold text-slate-700 dark:text-slate-300 border-b border-slate-400 dark:border-slate-600 pb-0.5 cursor-pointer focus:outline-hidden font-mono text-[11px]"
                      >
                        <option value="11.7" className="dark:bg-slate-800">11.7 м (арматура)</option>
                        <option value="12.0" className="dark:bg-slate-800">12.0 м (прокат)</option>
                        <option value="6.0" className="dark:bg-slate-800">6.0 м (труба/профиль)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Производитель</label>
                    <select
                      value={wManufacturer}
                      onChange={(e) => setWManufacturer(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {MANUFACTURERS.map((m) => (
                        <option key={m.id} value={m.id} className="dark:bg-slate-800">
                          {m.name} {m.factor !== 1 ? `(${m.factor > 1 ? '+' : ''}${((m.factor - 1) * 100).toFixed(1)}%)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {wPriceType === 'ton' ? 'Цена за 1 тонну (₽/т)' : 'Цена за 1 метр (₽/м)'}
                      </label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xs border border-slate-300 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setWPriceType('ton')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            wPriceType === 'ton'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          За тонну
                        </button>
                        <button
                          type="button"
                          onClick={() => setWPriceType('meter')}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs cursor-pointer transition-colors ${
                            wPriceType === 'meter'
                              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          За метр
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={wPricePerTon}
                      onChange={(e) => setWPricePerTon(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Output panel */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3.5 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">РЕЗУЛЬТАТ: МЕТРАЖ И КОЛИЧЕСТВО</span>
                    <div className="mt-2">
                      <strong className="text-2xl sm:text-3xl font-mono tracking-tight text-amber-400 block">
                        {wSizeIdx !== null && weightKg > 0 ? `${num(calculatedMeters, 2)} ` : '— '}<span className="text-xs font-normal text-slate-300">м</span>
                      </strong>
                      <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                        {wSizeIdx !== null && weightKg > 0 ? (
                          <>≈ <span className="text-white font-bold">{Math.round(calculatedWPieces)} шт</span> ({num(calculatedWPieces, 1)} хлыстов по {wBarLen} м)</>
                        ) : (
                          wSizeIdx === null ? 'Выберите размер по стандарту' : 'Укажите массу металла'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 font-mono">
                      Финансово-метрический расчет
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Вес 1 пог. метра:</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{wSizeIdx !== null ? `${num(actualWPerM, 3)} кг/м` : '—'}</strong>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Метраж в партии:</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{num(calculatedMeters, 2)} м</strong>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Количество (штук):</p>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">
                          {Math.round(calculatedWPieces)} шт
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-normal">
                            (~{num(calculatedWPieces, 1)} по {wBarLen}м)
                          </span>
                        </strong>
                      </div>
                      {priceInputW > 0 && calculatedMeters > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Цена за 1 метр:</p>
                          <strong className="font-mono text-emerald-700 dark:text-emerald-400 text-sm block mt-0.5">{num(effectivePriceMeterW, 2)} ₽/м</strong>
                        </div>
                      )}
                      {priceInputW > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Цена за 1 тонну:</p>
                          <strong className="font-mono text-slate-900 dark:text-slate-100 text-sm block mt-0.5">{num(effectivePriceTonW, 2)} ₽/т</strong>
                        </div>
                      )}
                      <div className="col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                        {priceInputW > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 rounded-xs flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Расчетная стоимость партии:</p>
                              <div className="mt-0.5">
                                <strong className="text-lg sm:text-xl font-mono font-bold text-slate-900 dark:text-amber-400 break-words">{num(totalCostW, 2)}</strong>
                                <span className="ml-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-400">₽</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleAddToEstimateFromWeight}
                            disabled={wSizeIdx === null || weightKg <= 0}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 active:translate-y-px rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors border border-amber-600 dark:border-amber-400 shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Добавить расчет в сводную смету заказа"
                          >
                            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>+ В смету</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyKgToM}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border border-slate-800 dark:border-slate-700 shadow-none active:translate-y-px"
                          >
                            <Copy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Копировать расчет</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: SHEET STEEL */}
        {activeTab === 'sheet' && (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 animate-fade-in">
            <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
              <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-mono">
                <Boxes className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Калькулятор Листового Проката (ГОСТ 19903-2015)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Длина листа (м)</label>
                  <input
                    type="number"
                    step="any"
                    value={sheetL}
                    onChange={(e) => setSheetL(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ширина листа (м)</label>
                  <input
                    type="number"
                    step="any"
                    value={sheetW}
                    onChange={(e) => setSheetW(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Толщина (мм)</label>
                  <input
                    type="number"
                    step="any"
                    value={sheetT}
                    onChange={(e) => setSheetT(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Количество листов (шт)</label>
                  <input
                    type="number"
                    value={sheetQty}
                    onChange={(e) => setSheetQty(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Цена за 1 тонну листового металла (₽)</label>
                  <input
                    type="number"
                    value={sheetPrice}
                    onChange={(e) => setSheetPrice(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Results card */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3.5 sm:p-4 rounded-xs shadow-none">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">ВЕС 1 ЛИСТА</span>
                  <strong className="text-xl sm:text-2xl font-mono block mt-1.5 text-white">{num(singleSheetWeightKg, 1)} кг</strong>
                </div>
                <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3.5 sm:p-4 rounded-xs shadow-none">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">ОБЩИЙ ТОННАЖ</span>
                  <strong className="text-xl sm:text-2xl font-mono block mt-1.5 text-amber-400">
                    {num(totalSheetTn, 3)} т <span className="text-xs font-mono text-slate-400">({num(totalSheetKg, 1)} кг)</span>
                  </strong>
                </div>
                <div className="bg-[#062418] dark:bg-[#07241A] text-white p-3.5 sm:p-4 rounded-xs shadow-none border border-emerald-900/90 dark:border-emerald-800/80">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">СТОИМОСТЬ ПАРТИИ</span>
                  <strong className="text-xl sm:text-2xl font-mono block mt-1.5 text-emerald-300">{num(totalSheetCost, 2)} ₽</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleAddToEstimateFromSheet}
                  disabled={totalSheetKg <= 0}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 active:translate-y-px rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors border border-amber-600 dark:border-amber-400 shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Добавить листовой прокат в смету"
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>+ В смету</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySheet}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border border-slate-800 dark:border-slate-700 shadow-none active:translate-y-px"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Копировать расчет</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUTTING PLANNER */}
        {activeTab === 'cutting' && (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
              <div className="max-w-md">
                <select
                  value={stockLengthM}
                  aria-label="Длина стандартного хлыста"
                  onChange={(e) => setStockLengthM(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="11.7" className="dark:bg-slate-800">11.7 м (Стандарт арматуры РФ)</option>
                  <option value="12.0" className="dark:bg-slate-800">12.0 м (ГОСТ прокат длинный)</option>
                  <option value="6.0" className="dark:bg-slate-800">6.0 м (Стандарт трубы / профиля)</option>
                  <option value="9.0" className="dark:bg-slate-800">9.0 м (Спецпрокат)</option>
                </select>
              </div>

              {/* Cuts input table */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">Требуемые отрезки:</label>
                  <button
                    type="button"
                    onClick={() => setCutsList([...cutsList, { length_m: '', count: '' }])}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white rounded-xs text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors active:translate-y-px"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Добавить позицию</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {cutsList.map((c, index) => (
                    <div key={index} className="flex items-end gap-2 sm:gap-3 bg-slate-50 dark:bg-[#161F2E] p-2 sm:p-2.5 rounded-xs border border-slate-200 dark:border-slate-800">
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 h-4 leading-4 truncate">
                          Длина
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={c.length_m}
                            placeholder="Например: 2.45"
                            onChange={(e) => {
                              const updated = [...cutsList];
                              updated[index].length_m = e.target.value;
                              setCutsList(updated);
                            }}
                            className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs pl-2.5 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 pointer-events-none">
                            м
                          </span>
                        </div>
                      </div>

                      <div className="w-28 sm:w-36 shrink-0">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 h-4 leading-4 truncate">
                          Количество
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={c.count}
                            placeholder="1"
                            onChange={(e) => {
                              const updated = [...cutsList];
                              updated[index].count = e.target.value;
                              setCutsList(updated);
                            }}
                            className="w-full h-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs pl-2.5 pr-6 py-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-400 pointer-events-none">
                            шт
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (cutsList.length <= 1) {
                            setCutsList([{ length_m: '', count: '' }]);
                          } else {
                            setCutsList(cutsList.filter((_, i) => i !== index));
                          }
                        }}
                        className="h-8 w-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-900 rounded-xs transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-700"
                        title="Очистить или удалить строку"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRunCutting}
                  className="mt-2.5 py-2 px-4 sm:px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-xs shadow-none text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto active:translate-y-px"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Рассчитать раскрой</span>
                </button>
              </div>
            </div>

            {/* Cutting Results Display - Unified Compact Window */}
            {cuttingResult && (
              <div className="space-y-3.5">
                {/* Single Unified Summary Window */}
                <div className="bg-white dark:bg-[#111722] p-3.5 sm:p-4 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3">
                  {/* Header with Title, Efficiency Badge, and Copy Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                        Итоги раскроя
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 uppercase tracking-wider">
                        КПД: {num(100 - (cuttingResult.payable_mm > 0 ? (cuttingResult.waste_mm / cuttingResult.payable_mm) * 100 : 0), 1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAddToEstimateFromCutting}
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-amber-600 cursor-pointer transition-colors active:translate-y-px"
                        title="Добавить необходимое число хлыстов в смету заказа"
                      >
                        <PlusCircle className="h-3 w-3" />
                        <span>+ В смету</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyCutting}
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xs border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors active:translate-y-px"
                        title="Скопировать весь раскрой"
                      >
                        <Copy className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span>Копировать</span>
                      </button>
                    </div>
                  </div>

                  {/* Compact 4-metrics Grid in a single block */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                    {/* Metric 1: Bars Needed */}
                    <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-2.5 sm:p-3 rounded-xs flex flex-col justify-between shadow-none">
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                        Хлыстов к покупке
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <strong className="text-xl sm:text-2xl font-mono font-black text-white leading-none">
                          {cuttingResult.bars_needed}
                        </strong>
                        <span className="text-xs font-mono font-bold text-slate-400">шт</span>
                      </div>
                    </div>

                    {/* Metric 2: Payable Meters */}
                    <div className="bg-slate-50 dark:bg-[#161F2E] border border-slate-300 dark:border-slate-800 p-2.5 sm:p-3 rounded-xs flex flex-col justify-between">
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Покупаемый метраж
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <strong className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white leading-none">
                          {num(cuttingResult.payable_mm / 1000, 2)}
                        </strong>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">м</span>
                      </div>
                    </div>

                    {/* Metric 3: Useful consumption */}
                    <div className="bg-emerald-50 dark:bg-[#07241A] border border-emerald-300 dark:border-emerald-800/80 p-2.5 sm:p-3 rounded-xs flex flex-col justify-between">
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Полезный расход
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <strong className="text-lg sm:text-xl font-mono font-black text-emerald-700 dark:text-emerald-400 leading-none">
                          {num(cuttingResult.requested_mm / 1000, 2)}
                        </strong>
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">м</span>
                      </div>
                    </div>

                    {/* Metric 4: Waste */}
                    <div className="bg-rose-50 dark:bg-[#280B11] border border-rose-300 dark:border-rose-800/80 p-2.5 sm:p-3 rounded-xs flex flex-col justify-between">
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 truncate">
                        Остаток (обрезь)
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <strong className="text-lg sm:text-xl font-mono font-black text-rose-700 dark:text-rose-400 leading-none">
                          {num(cuttingResult.waste_mm / 1000, 2)}
                        </strong>
                        <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300">м</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Usage Bar - Precision Rectangular Gauge */}
                  <div className="pt-0.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-none h-2 border border-slate-300 dark:border-slate-700 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, cuttingResult.payable_mm > 0 ? (cuttingResult.requested_mm / cuttingResult.payable_mm) * 100 : 0))}%`
                        }}
                        title="Полезная часть"
                      />
                      <div
                        className="bg-rose-500 h-full"
                        style={{
                          width: `${Math.min(100, Math.max(0, cuttingResult.payable_mm > 0 ? (cuttingResult.waste_mm / cuttingResult.payable_mm) * 100 : 0))}%`
                        }}
                        title="Обрезь"
                      />
                    </div>
                  </div>
                </div>

                {/* Scheme */}
                <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 font-mono">
                    Схема раскроя по каждому хлысту
                  </h4>

                  <div className="space-y-2">
                    {cuttingResult.bars.map((bar) => (
                      <div key={bar.bar_index} className="bg-slate-50 dark:bg-[#161F2E] p-2.5 sm:p-3 rounded-xs border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">Хлыст №{bar.bar_index} ({cuttingResult.stock_length_mm / 1000} м)</strong>
                          <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold">Остаток: {formatCm(bar.waste_mm)} см ({num(bar.waste_mm / 1000, 2)} м)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {bar.groups.map((g, gIdx) => (
                            <span key={gIdx} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-none text-xs font-mono font-bold">
                              {formatCm(g.length_mm)} см × {g.count} шт
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ESTIMATE & SPECIFICATION CART */}
        {activeTab === 'estimate' && (
          <div className="animate-fade-in">
            <EstimateTab
              items={estimateItems}
              onUpdateItem={handleUpdateEstimateItem}
              onDeleteItem={handleDeleteEstimateItem}
              onClearAll={handleClearEstimate}
              onAddItem={(newItem) => setEstimateItems(prev => [newItem, ...prev])}
              onSwitchTab={setActiveTab}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 5: GOST DIRECTORY */}
        {activeTab === 'gost' && (
          <div className="space-y-4 animate-fade-in">
            {/* If NO category is selected, show category tiles in a 2-column grid */}
            {!selectedGostCat ? (
              <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
                {/* Header with Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5 font-mono">
                      <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Справочник ГОСТ Металлопроката
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Официальные веса 1 м по государственным стандартам РФ</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={gostSearch}
                      onChange={(e) => setGostSearch(e.target.value)}
                      placeholder="Поиск по размеру..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs pl-8 pr-7 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                    {gostSearch && (
                      <button
                        onClick={() => setGostSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* If searching globally, show search results */}
                {gostSearch.trim() !== '' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-800 font-mono">
                      <span>Найдено по «<strong className="text-slate-900 dark:text-white">{gostSearch}</strong>»:</span>
                      <button
                        onClick={() => setGostSearch('')}
                        className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer text-[11px] uppercase tracking-wider"
                      >
                        Сбросить
                      </button>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(GOST_DATABASE).map(([key, cat]) => {
                        const filteredItems = cat.items.filter(item => 
                          item.label.toLowerCase().includes(gostSearch.toLowerCase()) ||
                          (item.details && item.details.toLowerCase().includes(gostSearch.toLowerCase())) ||
                          cat.name.toLowerCase().includes(gostSearch.toLowerCase())
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center bg-slate-950 dark:bg-slate-900 text-white px-3 py-1.5 rounded-xs border border-slate-800 text-xs">
                              <span className="font-bold uppercase tracking-wider font-mono">{cat.name}</span>
                              <button
                                onClick={() => { setSelectedGostCat(key); setGostSearch(''); }}
                                className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 underline cursor-pointer font-mono"
                              >
                                Открыть все ({cat.items.length}) →
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                              {filteredItems.map((item, idx) => {
                                const originalIdx = cat.items.findIndex(it => it.label === item.label);
                                return (
                                  <div key={idx} className="bg-white dark:bg-[#161F2E] border border-slate-300 dark:border-slate-800 p-2 rounded-xs flex flex-col justify-between gap-1.5 shadow-none">
                                    <div>
                                      <div className="flex items-start justify-between gap-1">
                                        <strong className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 block truncate">{item.label}</strong>
                                        <span className="text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-1.5 py-0.5 rounded-none shrink-0">
                                          {item.weightPerMeter}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.details || 'ГОСТ'}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                                      <button
                                        onClick={() => handleCopyGostItem(cat.name, cat.gost, item.label, item.weightPerMeter, item.details)}
                                        className="p-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xs text-[9px] font-bold uppercase cursor-pointer"
                                        title="Копировать"
                                      >
                                        <Copy className="h-2.5 w-2.5" />
                                      </button>
                                      <button
                                        onClick={() => handleApplyToCalc(key, originalIdx >= 0 ? originalIdx : idx, item.label)}
                                        className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xs text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer border border-amber-600 active:translate-y-px"
                                        title="В калькулятор"
                                      >
                                        <Calculator className="h-2.5 w-2.5" />
                                        <span>В расчет</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* 2-column tiles view strictly enforced for mobile (grid-cols-2) */
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <span>Каталог профилей (выберите):</span>
                      <span className="text-[10px] text-slate-400 font-normal">6 позиций</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {Object.entries(GOST_DATABASE).map(([key, cat]) => {
                        const meta = GOST_CATEGORIES_META[key];
                        return (
                          <div
                            key={key}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedGostCat(key);
                              setCatSearch('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedGostCat(key);
                                setCatSearch('');
                              }
                            }}
                            className="group bg-white dark:bg-[#161F2E] hover:border-amber-500 dark:hover:border-amber-500 border border-slate-300 dark:border-slate-800 rounded-xs p-2.5 sm:p-3 shadow-none transition-colors text-left flex flex-col justify-between cursor-pointer active:translate-y-px"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                                  {renderProfileIcon(meta?.iconType || key, "w-4 h-4 text-amber-600 dark:text-amber-400")}
                                </div>
                                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded-none border border-slate-300 dark:border-slate-700 shrink-0 whitespace-nowrap uppercase">
                                  {meta?.badge || `${cat.items.length} поз.`}
                                </span>
                              </div>

                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight min-h-[2.1rem] flex items-center font-mono">
                                {meta?.shortTitle || cat.name}
                              </h4>
                              
                              <span className="inline-block text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded-none mt-1 uppercase">
                                {cat.gost.split('/')[0].trim()}
                              </span>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">{cat.items.length} поз.</span>
                              <strong className="text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">{meta?.weightRange}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* DETAIL VIEW FOR SELECTED CATEGORY */
              (() => {
                const currentCat = GOST_DATABASE[selectedGostCat];
                const currentMeta = GOST_CATEGORIES_META[selectedGostCat];
                if (!currentCat) return null;

                const filteredCatItems = currentCat.items.filter(item =>
                  item.label.toLowerCase().includes(catSearch.toLowerCase()) ||
                  (item.details && item.details.toLowerCase().includes(catSearch.toLowerCase()))
                );

                return (
                  <div className="bg-white dark:bg-[#111722] p-4 sm:p-5 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none space-y-3.5">
                    {/* Top Compact Navigation Bar */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => { setSelectedGostCat(null); setCatSearch(''); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xs border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>← Каталог</span>
                      </button>

                      <div className="relative w-36 sm:w-56">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        <input
                          type="text"
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          placeholder="Поиск..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs pl-6 pr-6 py-1 text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        />
                        {catSearch && (
                          <button
                            onClick={() => setCatSearch('')}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Compact Category Header */}
                    <div className="bg-slate-950 dark:bg-[#151D2A] text-white px-3 py-2 rounded-xs border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-xs bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {renderProfileIcon(currentMeta?.iconType || selectedGostCat, "w-3.5 h-3.5 text-amber-400")}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold truncate font-mono uppercase tracking-wider">{currentCat.name}</h4>
                      </div>
                      <span className="text-[9px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded-none font-mono font-bold border border-slate-700 shrink-0 uppercase">
                        {currentCat.gost.split('/')[0].trim()}
                      </span>
                    </div>

                    {/* Compact Items Grid - 2 columns on mobile */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 px-0.5">
                        <span>Показано: <strong className="text-slate-900 dark:text-slate-200">{filteredCatItems.length} поз.</strong></span>
                        <span>Теоретический вес 1 м (ГОСТ)</span>
                      </div>

                      {filteredCatItems.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-[#161F2E] p-6 rounded-xs border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
                          По запросу «{catSearch}» ничего не найдено.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                          {filteredCatItems.map((item, idx) => {
                            const originalIdx = currentCat.items.findIndex(it => it.label === item.label);
                            return (
                              <div
                                key={idx}
                                className="bg-white dark:bg-[#161F2E] border border-slate-300 dark:border-slate-800 p-2 sm:p-2.5 rounded-xs flex flex-col justify-between gap-1.5 hover:border-amber-500 transition-colors shadow-none"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <strong className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 block truncate leading-tight">
                                      {item.label}
                                    </strong>
                                    <span className="text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-1.5 py-0.5 rounded-none shrink-0">
                                      {item.weightPerMeter}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-tight">{item.details || 'ГОСТ'}</p>
                                </div>

                                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                                  <button
                                    onClick={() => handleCopyGostItem(currentCat.name, currentCat.gost, item.label, item.weightPerMeter, item.details)}
                                    className="p-1 sm:px-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xs text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                                    title="Копировать"
                                  >
                                    <Copy className="h-2.5 w-2.5" />
                                    <span className="hidden sm:inline">Копия</span>
                                  </button>
                                  <button
                                    onClick={() => handleApplyToCalc(selectedGostCat, originalIdx >= 0 ? originalIdx : idx, item.label)}
                                    className="px-1.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xs text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer border border-amber-600 active:translate-y-px"
                                    title="В калькулятор"
                                  >
                                    <Calculator className="h-2.5 w-2.5" />
                                    <span>В расчет</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

      </main>

      {/* Footer with clearance for fixed bottom navigation */}
      <footer className="bg-slate-950 text-slate-500 py-3 pb-16 sm:pb-12 border-t border-slate-800 mt-auto text-center text-[11px] px-4 font-mono">
        <p className="max-w-2xl mx-auto leading-tight">
          © 2026 Калькулятор Металла и Раскроя ГОСТ. Инженерные расчеты проката по ГОСТ РФ.
        </p>
      </footer>

    </div>
  );
}
