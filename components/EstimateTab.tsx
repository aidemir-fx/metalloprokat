import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Copy, 
  Printer, 
  Plus, 
  Truck, 
  Scissors, 
  Percent, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Edit2,
  X,
  Package
} from 'lucide-react';

export interface EstimateItem {
  id: string;
  title: string;              // e.g. "Арматура А500С Ø12 мм"
  standard?: string;           // e.g. "ГОСТ 34028-2016"
  manufacturer?: string;       // e.g. "Северсталь (+1.5%)"
  details: string;             // e.g. "120 м (10 хлыстов по 12.0м) • 0.888 кг/м"
  quantity: number;            // e.g. 120 (m) or 10 (sheets)
  unit: string;                // "м", "т", "шт", "м²"
  weightKg: number;            // total kg for this position
  priceInput: number;          // user entered price
  priceType: 'meter' | 'ton' | 'piece' | 'fixed';
  effectivePricePerMeter?: number;
  effectivePricePerTon?: number;
  totalCost: number;
  notes?: string;
  createdAt: number;
}

interface EstimateTabProps {
  items: EstimateItem[];
  onUpdateItem: (id: string, updated: Partial<EstimateItem>) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onAddItem: (item: EstimateItem) => void;
  onSwitchTab: (tab: 'calc' | 'sheet' | 'cutting' | 'gost') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const EstimateTab: React.FC<EstimateTabProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onClearAll,
  onAddItem,
  onSwitchTab,
  showToast
}) => {
  // Extra logistics & processing fees
  const [deliveryCost, setDeliveryCost] = useState<string>('');
  const [cuttingCost, setCuttingCost] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>(() => `СМ-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Custom item modal
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');
  const [customUnit, setCustomUnit] = useState('шт');
  const [customWeight, setCustomWeight] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  // Calculations
  const rawItemsTotalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const totalWeightKg = items.reduce((sum, item) => sum + item.weightKg, 0);
  const totalWeightTon = totalWeightKg / 1000;

  const numDelivery = parseFloat(deliveryCost) || 0;
  const numCutting = parseFloat(cuttingCost) || 0;
  const numDiscountPct = parseFloat(discountPercent) || 0;

  const subtotalWithServices = rawItemsTotalCost + numDelivery + numCutting;
  const discountAmount = subtotalWithServices * (Math.min(Math.max(numDiscountPct, 0), 100) / 100);
  const grandTotalCost = Math.max(0, subtotalWithServices - discountAmount);

  // Helper formatting
  const num = (v: number, decimals: number = 2) => {
    return v.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Recommended transport based on tonnage
  const getRecommendedTransport = (ton: number) => {
    if (ton <= 0) return 'Транспорт не требуется';
    if (ton <= 1.5) return 'Газель стандарт (до 1.5 т, до 3-4 м)';
    if (ton <= 3.5) return 'Газель Удлинённая / Манипулятор (до 3.5 т, до 6 м)';
    if (ton <= 5.0) return 'Валдай / Бычок (до 5 т, до 6 м)';
    if (ton <= 10.0) return 'КамАЗ / МАЗ (до 10 т, до 9-12 м)';
    if (ton <= 22.0) return 'Шаланда / Длинномер (до 20-22 т, хлысты 12-13.6 м)';
    return `Тяжеловоз / Несколько рейсов (${Math.ceil(ton / 20)} шаланд)`;
  };

  // Quick adjust quantity
  const handleAdjustQty = (item: EstimateItem, delta: number) => {
    const newQty = Math.max(1, Math.round(item.quantity + delta));
    if (newQty === item.quantity) return;

    const ratio = newQty / item.quantity;
    const newWeight = item.weightKg * ratio;
    let newCost = item.totalCost;

    if (item.priceType === 'meter' || item.priceType === 'piece') {
      newCost = newQty * item.priceInput;
    } else if (item.priceType === 'ton') {
      newCost = (newWeight / 1000) * item.priceInput;
    } else {
      newCost = item.totalCost * ratio;
    }

    onUpdateItem(item.id, {
      quantity: newQty,
      weightKg: newWeight,
      totalCost: newCost,
      details: item.details.replace(/\b\d+(\.\d+)?\s*(м|шт)/, `${newQty} ${item.unit}`)
    });
  };

  // Copy full specification to clipboard
  const handleCopyEstimate = () => {
    if (items.length === 0) {
      showToast('Смета пуста', 'error');
      return;
    }

    const dateStr = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const lines: string[] = [
      `СПЕЦИФИКАЦИЯ МЕТАЛЛОПРОКАТА (Заказ ${orderNumber})`,
      `Дата: ${dateStr}${clientName ? ` • Заказчик: ${clientName}` : ''}`,
      `==================================================`,
      ...items.map((it, idx) => {
        const priceInfo = it.priceInput > 0
          ? `${num(it.priceInput, 2)} ₽/${it.priceType === 'ton' ? 'т' : (it.priceType === 'meter' ? 'м' : it.unit)}`
          : 'цена по согласованию';
        const costInfo = it.totalCost > 0 ? `${num(it.totalCost, 2)} ₽` : '—';
        return `${idx + 1}. ${it.title}${it.standard ? ` (${it.standard})` : ''}\n   Кол-во: ${it.quantity} ${it.unit} | Вес: ${num(it.weightKg / 1000, 3)} т (${num(it.weightKg, 1)} кг)\n   Цена: ${priceInfo} | Сумма: ${costInfo}`;
      }),
      `--------------------------------------------------`,
      `ПОЗИЦИЙ: ${items.length} шт`,
      `ОБЩИЙ ВЕС МЕТАЛЛА: ${num(totalWeightTon, 3)} т (${num(totalWeightKg, 1)} кг)`,
      `Стоимость металлопроката: ${num(rawItemsTotalCost, 2)} ₽`,
    ];

    if (numCutting > 0) {
      lines.push(`Услуги резки металла: ${num(numCutting, 2)} ₽`);
    }
    if (numDelivery > 0) {
      lines.push(`Доставка: ${num(numDelivery, 2)} ₽`);
    }
    if (numDiscountPct > 0) {
      lines.push(`Скидка (${numDiscountPct}%): -${num(discountAmount, 2)} ₽`);
    }

    lines.push(`ИТОГО К ОПЛАТЕ: ${num(grandTotalCost, 2)} ₽`);
    lines.push(`Рекомендуемый транспорт: ${getRecommendedTransport(totalWeightTon)}`);
    lines.push(`==================================================`);

    const textToCopy = lines.join('\n');
    try {
      navigator.clipboard.writeText(textToCopy);
      showToast('Спецификация скопирована для мессенджера!', 'success');
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Спецификация скопирована!', 'success');
    }
  };

  // Print estimate
  const handlePrint = () => {
    if (items.length === 0) {
      showToast('Добавьте позиции в смету перед печатью', 'error');
      return;
    }
    window.print();
  };

  // Add custom position
  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      showToast('Укажите наименование позиции', 'error');
      return;
    }

    const qty = parseFloat(customQuantity) || 1;
    const wt = parseFloat(customWeight) || 0;
    const pr = parseFloat(customPrice) || 0;
    const cost = pr * qty;

    const newItem: EstimateItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      standard: '',
      details: customDetails.trim() || `${qty} ${customUnit}`,
      quantity: qty,
      unit: customUnit,
      weightKg: wt,
      priceInput: pr,
      priceType: 'piece',
      totalCost: cost,
      createdAt: Date.now()
    };

    onAddItem(newItem);
    showToast(`Позиция «${customTitle}» добавлена в смету`, 'success');
    
    // Reset form
    setCustomTitle('');
    setCustomQuantity('1');
    setCustomWeight('');
    setCustomPrice('');
    setCustomDetails('');
    setShowAddCustom(false);
  };

  return (
    <div className="space-y-4">
      {/* Printable Sheet View - Hidden on Screen, Visible on Print */}
      <div className="hidden print:block text-black bg-white p-6 font-sans">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider font-mono">Спецификация металлопроката № {orderNumber}</h1>
            <p className="text-xs text-gray-600 mt-1">
              Дата формирования: {new Date().toLocaleDateString('ru-RU')}
              {clientName ? ` • Клиент / Организация: ${clientName}` : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono">МЕТАЛЛОКАЛЬКУЛЯТОР ГОСТ</span>
            <p className="text-[10px] text-gray-500">Инженерный расчет массы и проката</p>
          </div>
        </div>

        <table className="w-full text-xs border-collapse border border-gray-400 mb-4">
          <thead>
            <tr className="bg-gray-100 font-bold uppercase text-[10px]">
              <th className="border border-gray-400 p-1.5 text-center w-8">№</th>
              <th className="border border-gray-400 p-1.5 text-left">Наименование и стандарт</th>
              <th className="border border-gray-400 p-1.5 text-left">Параметры / Размеры</th>
              <th className="border border-gray-400 p-1.5 text-center">Кол-во</th>
              <th className="border border-gray-400 p-1.5 text-right">Вес (т)</th>
              <th className="border border-gray-400 p-1.5 text-right">Вес (кг)</th>
              <th className="border border-gray-400 p-1.5 text-right">Цена</th>
              <th className="border border-gray-400 p-1.5 text-right">Сумма (₽)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className="border-b border-gray-300">
                <td className="border border-gray-400 p-1.5 text-center">{idx + 1}</td>
                <td className="border border-gray-400 p-1.5 font-bold">
                  {it.title}
                  {it.standard && <span className="block text-[10px] font-normal text-gray-600">{it.standard}</span>}
                </td>
                <td className="border border-gray-400 p-1.5">{it.details}</td>
                <td className="border border-gray-400 p-1.5 text-center">{it.quantity} {it.unit}</td>
                <td className="border border-gray-400 p-1.5 text-right font-mono">{num(it.weightKg / 1000, 3)}</td>
                <td className="border border-gray-400 p-1.5 text-right font-mono">{num(it.weightKg, 1)}</td>
                <td className="border border-gray-400 p-1.5 text-right font-mono">
                  {it.priceInput > 0 ? `${num(it.priceInput, 2)}` : '—'}
                </td>
                <td className="border border-gray-400 p-1.5 text-right font-mono font-bold">
                  {it.totalCost > 0 ? num(it.totalCost, 2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start text-xs border-t-2 border-black pt-3">
          <div className="space-y-1">
            <p><strong>Общий вес партии:</strong> {num(totalWeightTon, 3)} т ({num(totalWeightKg, 1)} кг)</p>
            <p><strong>Позиций в спецификации:</strong> {items.length} шт</p>
            <p><strong>Рекомендуемый транспорт:</strong> {getRecommendedTransport(totalWeightTon)}</p>
          </div>
          <div className="text-right space-y-1 font-mono">
            <p>Металлопрокат: {num(rawItemsTotalCost, 2)} ₽</p>
            {numCutting > 0 && <p>Резка: {num(numCutting, 2)} ₽</p>}
            {numDelivery > 0 && <p>Доставка: {num(numDelivery, 2)} ₽</p>}
            {numDiscountPct > 0 && <p>Скидка {numDiscountPct}%: -{num(discountAmount, 2)} ₽</p>}
            <p className="text-sm font-bold border-t border-gray-400 pt-1 mt-1">
              ИТОГО К ОПЛАТЕ: {num(grandTotalCost, 2)} ₽
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-between text-xs pt-6 border-t border-gray-300">
          <div>Отпустил: ___________________ / ___________________ /</div>
          <div>Получил: ___________________ / ___________________ /</div>
        </div>
      </div>

      {/* Screen View */}
      <div className="print:hidden space-y-4">
        {/* Header Title & Actions Toolbar */}
        <div className="bg-white dark:bg-[#111722] p-4 rounded-xs border border-slate-300 dark:border-slate-800 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-white font-mono">
                Смета и спецификация заказа
              </h2>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950">
                {items.length} поз.
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Сводная корзина проката, расчет общего тоннажа партии, услуг резки и доставки
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAddCustom(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-amber-500" />
              <span>Добавить вручную</span>
            </button>
            <button
              type="button"
              onClick={handleCopyEstimate}
              disabled={items.length === 0}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-800 dark:border-amber-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Копировать</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={items.length === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Распечатать или сохранить в PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              <span>Печать / PDF</span>
            </button>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Очистить все позиции из сметы?')) {
                    onClearAll();
                    showToast('Смета очищена', 'success');
                  }
                }}
                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xs transition-colors cursor-pointer border border-transparent hover:border-rose-300 dark:hover:border-rose-900"
                title="Очистить смету"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Total Weight */}
          <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Общий вес заказа
            </span>
            <div className="mt-2">
              <strong className="text-xl sm:text-2xl font-mono font-black text-white leading-none">
                {num(totalWeightTon, 3)}
              </strong>
              <span className="ml-1 text-xs font-mono font-bold text-amber-400">т</span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                {num(totalWeightKg, 1)} кг
              </p>
            </div>
          </div>

          {/* Card 2: Total Cost */}
          <div className="bg-slate-950 dark:bg-[#151D2A] border border-slate-800 text-white p-3 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              Итого к оплате
            </span>
            <div className="mt-2">
              <strong className="text-xl sm:text-2xl font-mono font-black text-emerald-400 leading-none">
                {num(grandTotalCost, 2)}
              </strong>
              <span className="ml-1 text-xs font-mono font-bold text-slate-400">₽</span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Металл: {num(rawItemsTotalCost, 2)} ₽
              </p>
            </div>
          </div>

          {/* Card 3: Positions Count */}
          <div className="bg-white dark:bg-[#111722] border border-slate-300 dark:border-slate-800 p-3 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Позиций в партии
            </span>
            <div className="mt-2">
              <strong className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white leading-none">
                {items.length}
              </strong>
              <span className="ml-1 text-xs font-mono font-bold text-slate-500">поз.</span>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                {items.reduce((s, i) => s + (i.unit === 'шт' ? i.quantity : 0), 0)} шт изделий
              </p>
            </div>
          </div>

          {/* Card 4: Recommended Transport */}
          <div className="bg-white dark:bg-[#111722] border border-slate-300 dark:border-slate-800 p-3 sm:p-4 rounded-xs shadow-none flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-amber-500" />
              Логистика / Транспорт
            </span>
            <div className="mt-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {getRecommendedTransport(totalWeightTon)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                по нормам грузоподъемности
              </p>
            </div>
          </div>
        </div>

        {/* Client & Additional Logistics Bar */}
        <div className="bg-slate-50 dark:bg-[#111722] p-3 sm:p-4 rounded-xs border border-slate-300 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Клиент / Контрагент
              </label>
              <input
                type="text"
                placeholder="ООО «СтройГрупп» или ФИО"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Scissors className="h-3 w-3 text-slate-500" />
                Резка металлопроката (₽)
              </label>
              <input
                type="number"
                placeholder="0"
                value={cuttingCost}
                onChange={(e) => setCuttingCost(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Truck className="h-3 w-3 text-slate-500" />
                Доставка манипулятором (₽)
              </label>
              <input
                type="number"
                placeholder="0"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Percent className="h-3 w-3 text-slate-500" />
                Скидка клиенту (%)
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Items List / Table */}
        {items.length === 0 ? (
          <div className="bg-white dark:bg-[#111722] p-8 sm:p-12 rounded-xs border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-xs mx-auto flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Смета пока пуста
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Рассчитайте параметры в калькуляторе веса, раскрое или листовом прокате и нажмите кнопку 
                <span className="font-bold text-slate-900 dark:text-amber-400 mx-1">«+ В смету»</span>, 
                либо добавьте произвольную позицию вручную.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => onSwitchTab('calc')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Перейти в калькулятор веса</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-[#111722] p-3.5 sm:p-4 rounded-xs border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {item.title}
                    </h4>
                    {item.standard && (
                      <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.standard}
                      </span>
                    )}
                    {item.manufacturer && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        ({item.manufacturer})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    {item.details}
                  </p>
                  {item.notes && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                      Примечание: {item.notes}
                    </p>
                  )}
                </div>

                {/* Right metrics and quantity controls */}
                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Quantity quick controls */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xs border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleAdjustQty(item, -1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xs text-xs font-bold cursor-pointer"
                      title="Уменьшить"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-slate-900 dark:text-white min-w-[3rem] text-center">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustQty(item, 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xs text-xs font-bold cursor-pointer"
                      title="Увеличить"
                    >
                      +
                    </button>
                  </div>

                  {/* Weight column */}
                  <div className="text-right min-w-[4.5rem]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Вес
                    </span>
                    <strong className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 block">
                      {num(item.weightKg / 1000, 3)} т
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                      {num(item.weightKg, 1)} кг
                    </span>
                  </div>

                  {/* Price and Cost column */}
                  <div className="text-right min-w-[6.5rem]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {item.priceInput > 0 ? (
                        <>
                          {num(item.priceInput, 1)} ₽/{item.priceType === 'ton' ? 'т' : (item.priceType === 'meter' ? 'м' : item.unit)}
                        </>
                      ) : 'Без цены'}
                    </span>
                    <strong className="text-sm sm:text-base font-mono font-bold text-emerald-700 dark:text-amber-400 block">
                      {item.totalCost > 0 ? `${num(item.totalCost, 2)} ₽` : '—'}
                    </strong>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteItem(item.id);
                      showToast('Позиция удалена из сметы', 'success');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xs transition-colors cursor-pointer"
                    title="Удалить позицию"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Custom Item / Service */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#111722] border border-slate-300 dark:border-slate-800 rounded-xs max-w-md w-full p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                Добавить позицию или услугу
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Наименование *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Погрузка краном / Уголок 75×75×6"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Количество *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Единица измерения
                  </label>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="шт">шт (штук)</option>
                    <option value="м">м (метров)</option>
                    <option value="т">т (тонн)</option>
                    <option value="кг">кг (килограмм)</option>
                    <option value="м²">м² (кв. метров)</option>
                    <option value="усл">усл (услуга)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Вес общий (кг)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Цена за ед. (₽)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Примечание / Описание
                </label>
                <input
                  type="text"
                  placeholder="Дополнительные детали"
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xs text-xs font-bold uppercase cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xs text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
