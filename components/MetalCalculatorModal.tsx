import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Scale, 
  Ruler, 
  Info, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  Boxes
} from 'lucide-react';

interface MetalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

import { GOST_DATABASE, MANUFACTURERS, StandardProfile, ProfileCategory, Manufacturer } from '../gostDatabase';

export const MetalCalculatorModal: React.FC<MetalCalculatorModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'m_to_kg' | 'kg_to_m' | 'sheet' | 'help'>('m_to_kg');

  // Input States for Tab 1 (Meters to Weight)
  const [mCategory, setMCategory] = useState<string>('rebar');
  const [mSizeIdx, setMSizeIdx] = useState<number>(3); // 12 mm by default
  const [mLength, setMLength] = useState<string>('100');
  const [mManufacturer, setMManufacturer] = useState<string>('theory');
  const [mPricePerTon, setMPricePerTon] = useState<string>('72000'); // rub per ton

  // Input States for Tab 2 (Weight to Meters)
  const [wCategory, setWCategory] = useState<string>('rebar');
  const [wSizeIdx, setWSizeIdx] = useState<number>(3); // 12 mm by default
  const [wWeight, setWWeight] = useState<string>('1.5'); // in TONS or kg? Let's clarify!
  const [wWeightUnit, setWWeightUnit] = useState<'ton' | 'kg'>('ton');
  const [wManufacturer, setWManufacturer] = useState<string>('theory');
  const [wPricePerTon, setWPricePerTon] = useState<string>('72000');

  // Input States for Tab 3 (Sheet steel calculator)
  const [sheetLength, setSheetLength] = useState<string>('2.0'); // m
  const [sheetWidth, setSheetWidth] = useState<string>('1.25'); // m
  const [sheetThickness, setSheetThickness] = useState<string>('3.0'); // mm
  const [sheetQty, setSheetQty] = useState<string>('10'); // sheets count
  const [sheetPricePerTon, setSheetPricePerTon] = useState<string>('85000');

  // Search filter for help directory
  const [helpSearch, setHelpSearch] = useState<string>('');

  if (!isOpen) return null;

  // Helpers for formatting
  const num = (v: number, decimals: number = 2) => {
    return isNaN(v) ? '0' : v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const toRub = (minor: number) => {
    return `${(minor / 100).toLocaleString('ru-RU')} ₽`;
  };

  // Manufacturer info helper
  const getMfgInfo = (id: string) => MANUFACTURERS.find(m => m.id === id);

  // --- TAB 1 CALCULATIONS: METERS -> WEIGHT ---
  const currentMCat = GOST_DATABASE[mCategory];
  const currentMItem = currentMCat?.items[mSizeIdx] || currentMCat?.items[0];
  const theoreticalMWeightPerMeter = currentMItem ? currentMItem.weightPerMeter : 0;
  
  const selectedMfgM = getMfgInfo(mManufacturer) || MANUFACTURERS[0];
  const actualMWeightPerMeter = theoreticalMWeightPerMeter * selectedMfgM.factor;

  const inputLength = parseFloat(mLength) || 0;
  const totalTheoWeightKg = theoreticalMWeightPerMeter * inputLength;
  const totalActualWeightKg = actualMWeightPerMeter * inputLength;
  const totalActualWeightTn = totalActualWeightKg / 1000;

  // Cost estimates
  const priceTonM = parseFloat(mPricePerTon) || 0;
  const costRubTotal = (totalActualWeightTn * priceTonM);
  const costPerMeterRub = (actualMWeightPerMeter * (priceTonM / 1000));

  // Average Rod count guide
  const isRebarSelected = mCategory === 'rebar';
  const approximateRodsCount = isRebarSelected ? (inputLength / 11.7) : 0;


  // --- TAB 2 CALCULATIONS: WEIGHT -> METERS ---
  const currentWCat = GOST_DATABASE[wCategory];
  const currentWItem = currentWCat?.items[wSizeIdx] || currentWCat?.items[0];
  const theoreticalWWeightPerMeter = currentWItem ? currentWItem.weightPerMeter : 0;

  const selectedMfgW = getMfgInfo(wManufacturer) || MANUFACTURERS[0];
  const actualWWeightPerMeter = theoreticalWWeightPerMeter * selectedMfgW.factor;

  const rawWWeight = parseFloat(wWeight) || 0;
  const inputWeightKg = wWeightUnit === 'ton' ? rawWWeight * 1000 : rawWWeight;

  const computedLengthMeters = actualWWeightPerMeter > 0 ? (inputWeightKg / actualWWeightPerMeter) : 0;
  const computedTheoLengthMeters = theoreticalWWeightPerMeter > 0 ? (inputWeightKg / theoreticalWWeightPerMeter) : 0;
  const lengthDifferenceM = computedLengthMeters - computedTheoLengthMeters;

  const priceTonW = parseFloat(wPricePerTon) || 0;
  const costWTotal = (inputWeightKg / 1000) * priceTonW;
  const wRodsCount = wCategory === 'rebar' ? (computedLengthMeters / 11.7) : 0;


  // --- TAB 3 CALCULATIONS: STEEL SHEET ---
  const shL = parseFloat(sheetLength) || 0;
  const shW = parseFloat(sheetWidth) || 0;
  const shT = parseFloat(sheetThickness) || 0;
  const shQ = parseFloat(sheetQty) || 0;
  const shPriceTn = parseFloat(sheetPricePerTon) || 0;

  // Volume calculations: Length (m) * Width (m) * Thickness (mm/1000)
  // Base density of steel = 7850 kg/m^3 (7.85 g/cm^3)
  const singleSheetWeightKg = shL * shW * (shT / 1000) * 7850;
  const totalSheetWeightKg = singleSheetWeightKg * shQ;
  const totalSheetWeightTn = totalSheetWeightKg / 1000;
  
  const totalSheetCost = totalSheetWeightTn * shPriceTn;
  const costPerSheet = singleSheetWeightKg * (shPriceTn / 1000);

  // Quick action: paste weight directly to clipboard or show values to easily enter during billing
  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Результат расчета скопирован в буфер обмена', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs transition-all animate-fade-in" id="metal-calc-modal-backdrop">
      <div className="bg-[#FAF6F0] border border-[#e6dfd5] text-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden font-sans" id="metal-calc-modal-container">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#eaddcd] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-slate-800 text-amber-500 rounded-lg flex items-center justify-center border border-slate-900">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                Калькулятор Металлопроката
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                  ГОСТ РФ
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                Быстрый перевод метров в тонны и расчет листового проката
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Закрыть панель калькулятора"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector Buttons */}
        <div className="px-6 py-2 bg-slate-100 border-b border-[#eaddcd] flex flex-wrap gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('m_to_kg')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'm_to_kg' 
                ? 'bg-white text-slate-950 shadow-xs border-b-2 border-slate-800' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            <Ruler className="h-4 w-4 text-slate-500" />
            <span>Арматура / Профиль: Метры → Вес</span>
          </button>

          <button
            onClick={() => setActiveTab('kg_to_m')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kg_to_m' 
                ? 'bg-white text-slate-950 shadow-xs border-b-2 border-slate-800' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            <Scale className="h-4 w-4 text-slate-500" />
            <span>Арматура / Профиль: Вес → Метры</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sheet' 
                ? 'bg-white text-slate-950 shadow-xs border-b-2 border-slate-800' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            <Boxes className="h-4 w-4 text-slate-500" />
            <span>Листовой прокат: Формула объема</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ml-auto cursor-pointer ${
              activeTab === 'help' 
                ? 'bg-white text-slate-950 shadow-xs border-b-2 border-slate-800' 
                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4 text-slate-500" />
            <span>Справочник ГОСТ весов ({Object.keys(GOST_DATABASE).length} категорий)</span>
          </button>
        </div>

        {/* Modal Main Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: METERS TO WEIGHT */}
          {activeTab === 'm_to_kg' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Form: Inputs (Spans 5) */}
              <div className="lg:col-span-5 space-y-4 bg-white p-5 border border-[#e6dfd5] rounded-xl shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-slate-600" />
                  Параметры проката и длина
                </h3>

                {/* Profile Type Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Тип металлопроката</label>
                  <select
                    value={mCategory}
                    onChange={(e) => {
                      setMCategory(e.target.value);
                      setMSizeIdx(0); // reset size index
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {Object.entries(GOST_DATABASE).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>

                {/* Profile Size Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Размер по стандарту ГОСТ</label>
                  <select
                    value={mSizeIdx}
                    onChange={(e) => setMSizeIdx(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {currentMCat?.items.map((item, index) => (
                      <option key={index} value={index}>
                        {item.label} ({item.weightPerMeter} кг/метр)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Length Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Запрашиваемая длина (в метрах)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={mLength}
                      onChange={(e) => setMLength(e.target.value)}
                      placeholder="Введите метраж..."
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-10 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden focus:border-slate-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-450 uppercase font-mono">метров</span>
                  </div>
                </div>

                {/* Manufacturer Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Завод производитель (Физический допуск)</label>
                  <select
                    value={mManufacturer}
                    onChange={(e) => setMManufacturer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {MANUFACTURERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.factor !== 1 ? `(${m.factor > 1 ? '+' : ''}${((m.factor - 1) * 100).toFixed(1)}%)` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 italic leading-tight">
                    {selectedMfgM.desc}
                  </p>
                </div>

                {/* Rubles per Ton parameter */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Оценка стоимости: Цена за тонну (₽)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={mPricePerTon}
                      onChange={(e) => setMPricePerTon(e.target.value)}
                      placeholder="Цена за тонну на базе..."
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-8 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden focus:border-slate-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₽/т</span>
                  </div>
                </div>

              </div>

              {/* Right Output: Professional Dashboard (Spans 7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Visual weight summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 text-[#FAF6F0] p-4 rounded-xl border border-slate-950 flex flex-col justify-between shadow-md">
                    <span className="text-[9px] tracking-widest font-extrabold uppercase text-amber-500">ТЕОРЕТИЧЕСКИЙ ВЕС</span>
                    <strong className="text-2xl font-mono tracking-tight text-white mt-1 block">
                      {num(totalTheoWeightKg / 1000, 3)} <span className="text-xs font-sans text-slate-400 font-normal">т</span>
                    </strong>
                    <p className="text-[10px] text-slate-450 mt-0.5 font-mono">
                      ГОСТ: {num(totalTheoWeightKg, 1)} кг
                    </p>
                  </div>

                  <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-900 flex flex-col justify-between shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] tracking-widest font-extrabold uppercase text-emerald-400">ФАКТИЧЕСКИЙ С ОТКЛОНЕНИЕМ</span>
                      {selectedMfgM.id !== 'theory' && (
                        <span className="text-[9px] bg-emerald-900 text-emerald-200 border border-emerald-700 px-1.5 py-0.5 rounded font-bold font-mono">
                          {selectedMfgM.factor}
                        </span>
                      )}
                    </div>
                    <strong className="text-2xl font-mono tracking-tight text-emerald-300 mt-1 block">
                      {num(totalActualWeightKg / 1000, 3)} <span className="text-xs font-sans text-emerald-400 font-normal">т</span>
                    </strong>
                    <p className="text-[10px] text-emerald-200/80 mt-0.5 font-mono">
                      С допуском: {num(totalActualWeightKg, 1)} кг
                    </p>
                  </div>
                </div>

                {/* Core Calculation Metrics Details Panel */}
                <div className="bg-white border border-[#e6dfd5] rounded-xl p-5 font-sans shadow-xs space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>Подробный технический анализ проката</span>
                    <span className="text-[10px] text-slate-400 font-mono normal-case">{currentMCat?.gost}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Вес 1 м.п. (Теория):</p>
                      <strong className="font-mono text-slate-800">{num(theoreticalMWeightPerMeter, 3)} кг/м</strong>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold font-sans">Вес 1 м.п. (Фактический):</p>
                      <strong className="font-mono text-emerald-800">{num(actualMWeightPerMeter, 3)} кг/м</strong>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-slate-450 uppercase font-bold">Разница в массе (погрешность):</p>
                        <strong className={`font-mono ${totalActualWeightKg - totalTheoWeightKg >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {totalActualWeightKg - totalTheoWeightKg >= 0 ? '+' : ''}
                          {num(totalActualWeightKg - totalTheoWeightKg, 2)} кг ({((selectedMfgM.factor - 1) * 100).toFixed(2)}%)
                        </strong>
                      </div>

                      {isRebarSelected && (
                        <div>
                          <p className="text-[10px] text-slate-450 uppercase font-bold">Оценочное кол-во хлыстов (по 11.7 м):</p>
                          <strong className="font-mono text-[#0066cc]">~ {num(approximateRodsCount, 1)} шт</strong>
                        </div>
                      )}
                    </div>

                    {priceTonM > 0 && (
                      <div className="col-span-2 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Расчетная стоимость:</p>
                          <strong className="text-md text-slate-900 font-mono">
                            {num(costRubTotal, 2)} ₽
                          </strong>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Стоимость 1 метра:</p>
                          <strong className="text-md text-slate-800 font-mono">
                            {num(costPerMeterRub, 2)} ₽/м
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operational utility buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[9px] text-slate-400 italic">
                      * Вес для весов, теория для метражных накладных.
                    </p>
                    <button
                      onClick={() => handleCopyResult(`${num(totalActualWeightKg / 1000, 4)} т (${num(totalActualWeightKg, 1)} кг)`)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[10px] tracking-wide cursor-pointer transition-all uppercase"
                    >
                      Копировать тоннаж
                    </button>
                  </div>

                </div>

                {/* Practical recommendation visual widget */}
                <div className="bg-amber-50/75 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-700 leading-relaxed">
                    Укажите <strong className="font-mono">{num(totalActualWeightKg, 1)} кг</strong> при оформлении позиции заказа, чтобы касса верно провела списание.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WEIGHT TO METERS */}
          {activeTab === 'kg_to_m' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Form: Inputs */}
              <div className="lg:col-span-5 space-y-4 bg-white p-5 border border-[#e6dfd5] rounded-xl shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-slate-600" />
                  Исходная Масса металла
                </h3>

                {/* Category Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Тип металлопроката</label>
                  <select
                    value={wCategory}
                    onChange={(e) => {
                      setWCategory(e.target.value);
                      setWSizeIdx(0);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {Object.entries(GOST_DATABASE).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>

                {/* Profile Size */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Размер по ГОСТ стандарту</label>
                  <select
                    value={wSizeIdx}
                    onChange={(e) => setWSizeIdx(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {currentWCat?.items.map((item, index) => (
                      <option key={index} value={index}>
                        {item.label} ({item.weightPerMeter} кг/метр)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight selection group */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Масса (Вес на весах / в накладной)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={wWeight}
                      onChange={(e) => setWWeight(e.target.value)}
                      placeholder="Введите массу..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <select
                      value={wWeightUnit}
                      onChange={(e) => setWWeightUnit(e.target.value as 'ton' | 'kg')}
                      className="bg-white border border-slate-300 rounded px-2 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="ton">Тонны (т)</option>
                      <option value="kg">Килограммы (кг)</option>
                    </select>
                  </div>
                </div>

                {/* Manufacturer Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Производственная площадка (Отклонение)</label>
                  <select
                    value={wManufacturer}
                    onChange={(e) => setWManufacturer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-slate-500 cursor-pointer"
                  >
                    {MANUFACTURERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.factor !== 1 ? `(${m.factor > 1 ? '+' : ''}${((m.factor - 1) * 100).toFixed(1)}%)` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 italic leading-tight">
                    {selectedMfgW.desc}
                  </p>
                </div>

                {/* Rubles per Ton */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Оценка: Цена за Тонну (₽)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wPricePerTon}
                      onChange={(e) => setWPricePerTon(e.target.value)}
                      placeholder="Цена за тонну на базе..."
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-8 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₽/т</span>
                  </div>
                </div>

              </div>

              {/* Right Output Dashboard */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Resulting Length card */}
                <div className="bg-slate-900 border border-slate-950 p-6 rounded-xl text-white flex flex-col justify-between shadow-md">
                  <div>
                    <span className="text-[9px] tracking-widest font-extrabold uppercase text-amber-500">РЕЗУЛЬТАТ ОБРАТНОГО РАСЧЕТА ДЛИНЫ</span>
                    <strong className="text-4xl font-mono tracking-tight text-[#ffbf00] mt-3 block">
                      {num(computedLengthMeters, 2)} <span className="text-sm font-sans text-slate-300 font-normal">метров</span>
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Фактический метраж на этот вес с учетом погрешностей завода ({getMfgInfo(wManufacturer)?.name || 'Теория'}).
                    </p>
                  </div>

                  {wCategory === 'rebar' && computedLengthMeters > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs font-medium text-slate-300 bg-slate-850/50 p-3 rounded-lg">
                      <span>Приблизительно стандартных арматурных хлыстов (по 11.7 м):</span>
                      <strong className="text-white font-mono text-md font-extrabold">~ {num(wRodsCount, 1)} шт.</strong>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown */}
                <div className="bg-white border border-[#e6dfd5] rounded-xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Измерительный анализ преобразования веса
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Заданная масса нетто:</p>
                      <strong className="font-mono text-slate-800">
                        {num(inputWeightKg, 1)} кг ({num(inputWeightKg / 1000, 3)} т)
                      </strong>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Вес 1 погонного метра погонажа:</p>
                      <strong className="font-mono text-slate-800">
                        {num(actualWWeightPerMeter, 3)} кг
                      </strong>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Сравнение с идеальной теорией ГОСТ:</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-50 rounded flex justify-between">
                          <span className="text-slate-500">По теории ГОСТ:</span>
                          <strong className="font-mono text-slate-900">{num(computedTheoLengthMeters, 2)} м</strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded flex justify-between">
                          <span className="text-slate-500">Отклонение проката:</span>
                          <strong className={`font-mono ${lengthDifferenceM >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {lengthDifferenceM >= 0 ? '+' : ''}{num(lengthDifferenceM, 2)} м
                          </strong>
                        </div>
                      </div>
                    </div>

                    {priceTonW > 0 && (
                      <div className="col-span-2 pt-2.5 border-t border-slate-100 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-650 uppercase font-bold">Общая стоимость этой партии металла:</span>
                          <strong className="text-lg text-slate-900 font-mono">
                            {num(costWTotal, 2)} ₽
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy Button */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCopyResult(`${num(computedLengthMeters, 2)} м`)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[10px] tracking-wide cursor-pointer transition-all uppercase"
                    >
                      Копировать метраж
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: STEEL SHEET (VOLUME & WEIGHT FORMULA) */}
          {activeTab === 'sheet' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Form: Inputs */}
              <div className="lg:col-span-5 space-y-4 bg-white p-5 border border-[#e6dfd5] rounded-xl shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-slate-600" />
                  Параметры стального листа
                </h3>

                <p className="text-[10px] text-slate-400">
                  Плотность сплава принята по ГОСТ за <strong className="font-mono text-slate-700">7 850 кг/м³</strong>.
                </p>

                {/* Length of sheet in meters */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Длина стального листа (м)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={sheetLength}
                      onChange={(e) => setSheetLength(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-8 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">м</span>
                  </div>
                </div>

                {/* Width of sheet in meters */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ширина стального листа (м)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={sheetWidth}
                      onChange={(e) => setSheetWidth(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-8 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">м</span>
                  </div>
                </div>

                {/* Thickness in mm */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Толщина проката (высота, в мм)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={sheetThickness}
                      onChange={(e) => setSheetThickness(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-10 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">мм</span>
                  </div>
                </div>

                {/* Card Presets */}
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Ходовые коммерческие форматы:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => { setSheetLength('2.0'); setSheetWidth('1.0'); }}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded text-[9px] font-mono font-semibold cursor-pointer text-slate-800"
                    >
                      1х2 м
                    </button>
                    <button
                      onClick={() => { setSheetLength('2.5'); setSheetWidth('1.25'); }}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded text-[9px] font-mono font-semibold cursor-pointer text-slate-800"
                    >
                      1.25х2.5 м
                    </button>
                    <button
                      onClick={() => { setSheetLength('3.0'); setSheetWidth('1.5'); }}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded text-[9px] font-mono font-semibold cursor-pointer text-slate-800"
                    >
                      1.5х3 м
                    </button>
                    <button
                      onClick={() => { setSheetLength('6.0'); setSheetWidth('1.5'); }}
                      className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded text-[9px] font-mono font-semibold cursor-pointer text-slate-800"
                    >
                      1.5х6 м
                    </button>
                  </div>
                </div>

                {/* Amount sheets input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Количество листов в партии</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={sheetQty}
                      onChange={(e) => setSheetQty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-10 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">листов</span>
                  </div>
                </div>

                {/* Price per Ton SHEET */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Цена за тонну металлических листов (₽)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sheetPricePerTon}
                      onChange={(e) => setSheetPricePerTon(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded pl-2.5 pr-8 py-1.5 text-xs font-bold font-mono text-slate-800 focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₽/т</span>
                  </div>
                </div>

              </div>

              {/* Right Output Dashboard */}
              <div className="lg:col-span-7 space-y-4">

                {/* Dynamic sheet weight metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-950 p-5 rounded-xl text-white flex flex-col justify-between shadow-md">
                    <span className="text-[9px] tracking-widest font-extrabold uppercase text-amber-500">ВЕС ОДНОГО СТАЛЬНОГО ЛИСТА</span>
                    <strong className="text-3xl font-mono tracking-tight text-[#ffbf00] mt-3 block">
                      {num(singleSheetWeightKg, 1)} <span className="text-sm font-sans text-slate-300 font-normal">кг</span>
                    </strong>
                    <p className="text-[10px] text-slate-450 mt-1 font-mono">
                      Площадь: {num(shL * shW, 2)} кв.м. при толщине {shT} мм.
                    </p>
                  </div>

                  <div className="bg-slate-800 border border-slate-850 p-5 rounded-xl text-white flex flex-col justify-between shadow-md">
                    <span className="text-[9px] tracking-widest font-extrabold uppercase text-slate-400">ОБЩИЙ ВЕС ВСЕЙ ПАРТИИ ({shQ} шт)</span>
                    <strong className="text-3xl font-mono tracking-tight text-white mt-3 block">
                      {num(totalSheetWeightKg / 1000, 3)} <span className="text-sm font-sans text-slate-400 font-normal">т</span>
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Вес пачки: {num(totalSheetWeightKg, 1)} кг по плотности 7.85
                    </p>
                  </div>
                </div>

                {/* Commercial calculation analysis */}
                <div className="bg-white border border-[#e6dfd5] rounded-xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Финансовая калькуляция стальных листов
                  </h4>

                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 font-medium">
                      <div>
                        <p className="text-[10px] text-slate-450 uppercase font-bold">Общая площадь металла:</p>
                        <strong className="font-mono text-slate-800">{num(shL * shW * shQ, 2)} м²</strong>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-450 uppercase font-bold">Суммарный объем стали:</p>
                        <strong className="font-mono text-slate-800">
                          {num((shL * shW * (shT / 1000)) * shQ, 5)} м³
                        </strong>
                      </div>
                    </div>

                    {shPriceTn > 0 && (
                      <div className="bg-slate-55 p-3.5 rounded-lg space-y-2 border border-slate-200">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-slate-600">Оценочная стоимость всей партии ({shQ} шт):</span>
                          <strong className="text-md text-emerald-850 font-mono font-black">{num(totalSheetCost, 2)} ₽</strong>
                        </div>
                        <div className="flex justify-between items-center font-semibold text-[11px] text-slate-500 pt-1.5 border-t border-dashed border-slate-300">
                          <span>Стоимость одного металлического листа:</span>
                          <strong className="font-mono">{num(costPerSheet, 2)} ₽/шт</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operational controls */}
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCopyResult(`${num(totalSheetWeightKg, 1)} кг`)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-[10px] tracking-wide cursor-pointer transition-all uppercase"
                    >
                      Копировать вес пачки
                    </button>
                  </div>

                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[10px] leading-snug text-slate-700">
                    Расчет выполнен согласно ГОСТ 19903-74. При поштучной продаже вес берется по указанной теории, при весовой — по платформенных весах базы.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: HELP/REFERENCE LIBRARY (СПРАВОЧНИК ГОСТ) */}
          {activeTab === 'help' && (
            <div className="space-y-4 font-sans text-slate-800 animate-slide-up">
              
              {/* Filter inputs */}
              <div className="flex bg-white border border-[#e6dfd5] rounded-xl p-3 items-center gap-3">
                <Ruler className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Быстрый поиск по марке, ГОСТу или сечению (например: 12 мм, 40х40, Ду)..."
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-hidden text-xs text-slate-800 font-medium placeholder-slate-440"
                />
              </div>

              {/* Grid categories block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {Object.entries(GOST_DATABASE).map(([key, cat]) => {
                  // filter items in this category
                  const matchedItems = cat.items.filter(item => 
                    item.label.toLowerCase().includes(helpSearch.toLowerCase()) ||
                    cat.name.toLowerCase().includes(helpSearch.toLowerCase()) ||
                    cat.gost.toLowerCase().includes(helpSearch.toLowerCase())
                  );

                  if (matchedItems.length === 0) return null;

                  return (
                    <div key={key} className="bg-white border border-[#e6dfd5] shadow-xs rounded-xl overflow-hidden flex flex-col">
                      <div className="bg-slate-100 p-3 border-b border-[#eaddcd] flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide leading-tight">{cat.name}</h4>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">{cat.gost}</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">
                          {matchedItems.length} поз.
                        </span>
                      </div>

                      <div className="flex-1 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                        {matchedItems.map((item, idx) => (
                          <div key={idx} className="p-2.5 flex justify-between items-center hover:bg-slate-50 transition-colors text-xs font-sans">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-850 font-mono block">{item.label}</span>
                              <span className="text-[9px] text-slate-400 font-medium max-w-[280px] line-clamp-1">{item.details}</span>
                            </div>

                            <div className="text-right">
                              <strong className="font-mono text-slate-900">{item.weightPerMeter} кг</strong>
                              <span className="text-[8px] text-slate-450 block uppercase font-mono tracking-wide">на 1 погонный метр</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                        <span className="text-[9px] text-slate-405 font-mono italic">Теор. вес сплава 7.85 г/см³</span>
                        <button
                          onClick={() => {
                            if (activeTab === 'help') {
                              // Auto scroll to corresponding calculators
                              if (key === 'rebar' || key === 'squarePipe' || key === 'roundPipe' || key === 'angle' || key === 'channel' || key === 'ibeam') {
                                setMCategory(key);
                                setMSizeIdx(0);
                                setActiveTab('m_to_kg');
                              }
                            }
                          }}
                          className="text-[9px] font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1 uppercase"
                        >
                          Открыть в калькуляторе
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#eaddcd] flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-sans leading-none">
            ГОСТ СТО АСЧМ 20-93 • Плотность стали 7850 кг/м³
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-[#faf6f0] border border-[#eaddcd] rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
          >
            Закрыть калькулятор
          </button>
        </div>

      </div>
    </div>
  );
};
