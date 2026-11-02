import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Search, 
  Plus, 
  RefreshCw, 
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { Product, Transaction } from '../types';

const detectTheoreticalWeight = (name: string): number => {
  const lowercase = name.toLowerCase();
  if (lowercase.includes('12 мм') || lowercase.includes('ø12')) return 0.888;
  if (lowercase.includes('16 мм') || lowercase.includes('ø16')) return 1.580;
  if (lowercase.includes('10 мм') || lowercase.includes('ø10')) return 0.617;
  if (lowercase.includes('8 мм') || lowercase.includes('ø8')) return 0.395;
  if (lowercase.includes('40х40х2')) return 2.38;
  if (lowercase.includes('60х60х3')) return 5.32;
  if (lowercase.includes('ду 25')) return 2.39;
  if (lowercase.includes('50х50х5')) return 3.77;
  if (lowercase.includes('75х75х6')) return 6.89;
  if (lowercase.includes('швеллер № 10') || lowercase.includes('швеллер №10')) return 8.59;
  if (lowercase.includes('швеллер № 14') || lowercase.includes('швеллер №14')) return 12.3;
  return 1.0;
};

const MANUFACTURERS_REGISTRY = [
  { id: 'standard', name: 'ГОСТ Теоретический (100%)', factor: 1.0, description: 'Идеальный справочный вес по стандартам РФ' },
  { id: 'severstal', name: 'Северсталь (минус-допуск -1.5%)', factor: 0.985, description: 'Лёгкий прокат, больше метров в тонне (~ -1.5%)' },
  { id: 'evraz', name: 'ЕВРАЗ (плюс-допуск +0.8%)', factor: 1.008, description: 'Плотный прокат, меньше метров в тонне (~ +0.8%)' },
  { id: 'nlmk', name: 'НЛМК (допуск -0.5%)', factor: 0.995, description: 'Легкий минус-допуск (~ -0.5%)' },
  { id: 'mmk', name: 'ММК (допуск +1.2%)', factor: 1.012, description: 'Тяжелый прокат, чуть меньше метров в тонне (~ +1.2%)' },
  { id: 'abinsk', name: 'Абинский ЭМЗ (минус-допуск -2.2%)', factor: 0.978, description: 'Тонкая арматура, существенное приращение метров в тонне (~ -2.2%)' },
  { id: 'custom', name: 'Свой замер / Индивидуальный допуск', factor: null, description: 'Ручной ввод отклонения пачки от ГОСТа в %' }
];

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  products,
  setProducts,
  transactions,
  setTransactions,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'restock' | 'alerts'>('inventory');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Multi inventory inputs
  const [auditQuantities, setAuditQuantities] = useState<{[productId: number]: string}>({});

  // Restock form states
  const [restockProductId, setRestockProductId] = useState<number>(products[0]?.id || 0);
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState(''); // OPTIONAL cost in rubles if they paid from till
  const [restockNote, setRestockNote] = useState('');

  // Tonnage weight converter states
  const [isTonnageMode, setIsTonnageMode] = useState(false);
  const [inputTons, setInputTons] = useState('');
  const [customTheoWeight, setCustomTheoWeight] = useState('0.888');
  const [selectedManufacturer, setSelectedManufacturer] = useState('standard');
  const [customTolerancePercent, setCustomTolerancePercent] = useState('0.0');

  // Sync theoretical weight automatically on product selection change
  React.useEffect(() => {
    if (restockProductId) {
      const current = products.find(p => p.id === Number(restockProductId));
      if (current) {
        const detected = detectTheoreticalWeight(current.name);
        setCustomTheoWeight(String(detected));
      }
    }
  }, [restockProductId, products]);

  // Helper calculation
  const getConvertedMeters = () => {
    const tons = parseFloat(inputTons);
    if (isNaN(tons) || tons <= 0) return 0;
    
    const mfg = MANUFACTURERS_REGISTRY.find(m => m.id === selectedManufacturer);
    const mfgFactor = mfg && mfg.factor !== null ? mfg.factor : (1 + parseFloat(customTolerancePercent) / 100);
    
    const theoW = parseFloat(customTheoWeight);
    if (isNaN(theoW) || theoW <= 0) return 0;
    
    const actualWeightPerMeter = theoW * mfgFactor;
    const kg = tons * 1000;
    const meters = kg / actualWeightPerMeter;
    return Math.round(meters * 100) / 100;
  };

  if (!isOpen) return null;

  const money = (minor: number) => {
    return `${(minor / 100).toLocaleString('ru-RU')} ₽`;
  };

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 1. Audit inventory adjustments handler (aktualizacia ostatkov)
  const handleApplySingleAudit = (productId: number) => {
    const rawVal = auditQuantities[productId];
    if (rawVal === undefined || rawVal === '') {
      showToast('Сначала введите новое значение остатка', 'error');
      return;
    }

    const parsed = parseFloat(rawVal);
    if (isNaN(parsed) || parsed < 0) {
      showToast('Укажите корректный остаток (больше или равен 0)', 'error');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const oldQty = product.stock_qty || 0;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock_qty: Math.round(parsed * 100) / 100 };
      }
      return p;
    }));

    // Log the inventory override as a transaction event
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'operational_expense', // internal log
      amount_minor: 0,
      date: getTodayStr(),
      description: `Инвентаризация: Скорректирован остаток ${product.name} с ${oldQty} до ${parsed} ${product.unit_type === 'meter' ? 'м' : product.unit_type === 'piece' ? 'шт' : 'кг'}`,
      reference_id: `INV-${product.id}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Clear inputs
    setAuditQuantities(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });

    showToast(`Остаток по "${product.name}" успешно изменен на ${parsed}`, 'success');
  };

  // 2. Handle wholesale restocking arrival
  const handleRegisterRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProduct = products.find(p => p.id === Number(restockProductId));
    
    let qtyVal = parseFloat(restockQty);
    if (isTonnageMode && targetProduct && targetProduct.unit_type === 'meter') {
      qtyVal = getConvertedMeters();
    }

    if (!targetProduct) {
      showToast('Выберите товар из списка', 'error');
      return;
    }

    if (isNaN(qtyVal) || qtyVal <= 0) {
      showToast('Укажите верное количество поступившего товара', 'error');
      return;
    }

    const currentStock = targetProduct.stock_qty || 0;
    const nextStock = currentStock + qtyVal;

    // Update Product Stock Qty
    setProducts(prev => prev.map(p => {
      if (p.id === targetProduct.id) {
        return { ...p, stock_qty: Math.round(nextStock * 100) / 100 };
      }
      return p;
    }));

    // Optionally handle cash payout
    const costRub = parseFloat(restockCost);
    const hasCashOutflow = !isNaN(costRub) && costRub > 0;
    const costMinor = hasCashOutflow ? Math.round(costRub * 100) : 0;

    // Build rich, explanatory restock description for ledger
    let restockDescription = '';
    if (isTonnageMode && targetProduct.unit_type === 'meter') {
      const mfg = MANUFACTURERS_REGISTRY.find(m => m.id === selectedManufacturer);
      const mfgName = mfg ? mfg.name : 'Пользовательский замер';
      const mfgFactor = mfg && mfg.factor !== null ? mfg.factor : (1 + parseFloat(customTolerancePercent) / 100);
      const actualW = (parseFloat(customTheoWeight) * mfgFactor).toFixed(4);
      restockDescription = `Поступление по весу: ${targetProduct.name} (+${qtyVal.toFixed(2)} м). Оприходовано ${inputTons} т от [${mfgName}], расчётный вес 1м = ${actualW} кг (ГОСТ теор. ${customTheoWeight} кг/м). ${hasCashOutflow ? `Оплачено из кассы: ${costRub} руб.` : ''} Примечание: ${restockNote.trim() || 'Без примечания'}`;
    } else {
      restockDescription = `Поступление товара: ${targetProduct.name} (+${qtyVal} ${targetProduct.unit_type === 'meter' ? 'м' : targetProduct.unit_type === 'piece' ? 'шт' : 'кг'})${hasCashOutflow ? `. Выплачено из кассы: ${costRub} руб` : ''}. Примечание: ${restockNote.trim() || 'Без примечания'}`;
    }

    // Register log transaction in bookkeeping
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'operational_expense',
      amount_minor: costMinor,
      date: getTodayStr(),
      description: restockDescription,
      reference_id: `STOCK-ADD-${targetProduct.id}`
    };

    setTransactions(prev => [newTx, ...prev]);

    // reset fields
    setRestockQty('');
    setInputTons('');
    setRestockCost('');
    setRestockNote('');

    showToast(`Товар "${targetProduct.name}" успешно оприходован (+${qtyVal.toFixed(2)} м)`, 'success');
  };

  // Filter products lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate stats
  const totalPositions = products.length;
  const lowStockItems = products.filter(p => (p.stock_qty || 0) < 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-[#FAF6F0] border border-[#e6dfd5] text-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#eaddcd] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-50 text-[#1b4332] rounded-xl flex items-center justify-center border border-emerald-110">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-855 flex items-center gap-2">
                Склад и Контроль Запасов
                <span className="text-[10px] bg-[#1b4332]/10 text-emerald-800 border border-[#1b4332]/15 px-2 py-0.5 rounded-full font-mono font-bold">
                  WMS v1.1
                </span>
              </h2>
              <p className="text-xs text-slate-500">Корректировка остатков, проведение инвентаризаций, оприходование и учет дефицитных позиций металлопроката</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 px-2.5 rounded-lg border border-[#eaddcd] hover:bg-[#faf6f0] bg-white text-slate-500 hover:text-slate-800 transition-all duration-150 cursor-pointer"
            title="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-[#fcfbf9] border-b border-[#eaddcd] flex flex-wrap gap-2 py-2 shrink-0">
          {[
            { id: 'inventory', label: '📦 Текущие Остатки и Коррекция', icon: Package },
            { id: 'restock', label: '🚛 Оприходование Постулений', icon: ArrowUpRight },
            { id: 'alerts', label: '⚠️ Дефицит и Оповещения', icon: AlertTriangle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold select-none transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-[#1b4332] text-white shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-855 hover:bg-[#faf6f0] border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF6F0]">
          
          {/* TAB 1: INVENTORY AUDIT & DIRECT CORRECTION */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              
              {/* Quick statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#e6dfd5] p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Всего позиций проката</span>
                    <h4 className="text-lg font-bold font-mono text-slate-800">{totalPositions}</h4>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-650 opacity-40" />
                </div>
                <div className="bg-white border border-[#e6dfd5] p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Кинтики низкого остатка</span>
                    <h4 className={`text-lg font-bold font-mono ${lowStockItems.length > 0 ? 'text-amber-850' : 'text-slate-650'}`}>
                      {lowStockItems.length}
                    </h4>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-500 opacity-40" />
                </div>
                <div className="bg-white border border-[#e6dfd5] p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Базовая единица</span>
                    <h4 className="text-xs font-mono text-slate-700 mt-1">Тонны, метры, листы, штук</h4>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-700 opacity-30" />
                </div>
              </div>

              {/* Filters list bar */}
              <div className="bg-white border border-[#e6dfd5] p-3.5 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Быстрый поиск металла..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#fcfbf9] text-xs border border-[#e3dcd2] pl-9 pr-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex gap-2 flex-wrap text-xs font-mono">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold ${
                      categoryFilter === 'all'
                        ? 'bg-[#1b4332] text-white border-[#1b4332]'
                        : 'bg-[#faf6f0] border-[#eaddcd] text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Все категории
                  </button>
                  {['Арматура', 'Труба', 'Уголок', 'Лист', 'Швеллер'].map(category => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold ${
                        categoryFilter === category
                          ? 'bg-[#1b4332] text-white border-[#1b4332]'
                          : 'bg-[#faf6f0] border-[#eaddcd] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inventory items auditing grid list */}
              <div className="bg-white border border-[#e6dfd5] rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-[40vh] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-[#fcfbf9] border-b border-[#eaddcd] text-slate-500 font-mono sticky top-0 uppercase text-[9px] tracking-wider z-10">
                      <tr>
                        <th className="p-3">Категория</th>
                        <th className="p-3">Наименование проката</th>
                        <th className="p-3 text-center">Ед. изм.</th>
                        <th className="p-3 text-right">Стандарт. хлыст</th>
                        <th className="p-3 text-right text-slate-800 font-bold">Текущий запас</th>
                        <th className="p-3 text-right w-64">Внести изм. (Инвентаризация)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1eae0] text-slate-700 leading-relaxed">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center italic text-slate-450 font-sans">
                            Позиций под заданные критерии не обнаружено.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(p => {
                          const currentStockVal = p.stock_qty !== undefined ? p.stock_qty : 0;
                          const isLow = currentStockVal < 50;

                          return (
                            <tr key={p.id} className={`hover:bg-[#fcfbf9]/60 transition-colors ${isLow ? 'bg-amber-50/15' : ''}`}>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#f4ece1] text-slate-705 font-mono">
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-800 tabular-nums truncate max-w-sm" title={p.name}>
                                {p.name}
                              </td>
                              <td className="p-3 text-center">
                                <span className="capitalize font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-205 bg-white text-slate-600">
                                  {p.unit_type === 'meter' ? 'м' : p.unit_type === 'piece' ? 'шт' : 'кг'}
                                </span>
                              </td>
                              <td className="p-3 text-right text-slate-500 font-mono">
                                {p.standard_length_mm > 0 ? `${p.standard_length_mm / 1000}м` : '—'}
                              </td>
                              <td className="p-3 text-right">
                                <span className={`font-mono font-black text-xs ${isLow ? 'text-amber-800' : 'text-[#1b4332]'}`}>
                                  {currentStockVal.toLocaleString('ru-RU')}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2 justify-end items-center">
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="Новый остаток"
                                    value={auditQuantities[p.id] ?? ''}
                                    onChange={(e) => setAuditQuantities(prev => ({
                                      ...prev,
                                      [p.id]: e.target.value
                                    }))}
                                    className="w-28 bg-[#fcfbf9] text-right font-mono text-xs border border-[#e3dcd2] px-2 py-1 rounded placeholder:text-slate-400 placeholder:text-[10px] focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                                  />
                                  <button
                                    onClick={() => handleApplySingleAudit(p.id)}
                                    className="px-2.5 py-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold rounded text-[10px] transition-all cursor-pointer"
                                  >
                                    Переписать
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECEIVE ARRIVING SUPPLY (OPRIHODOVANIE) */}
          {activeTab === 'restock' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Arrival Form */}
              <div className="md:col-span-5 bg-white border border-[#e6dfd5] p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#eaddcd] pb-2">
                  <Plus className="h-4 w-4 text-[#1b4332]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Оформить поступление партии</h4>
                </div>
                
                <form onSubmit={handleRegisterRestock} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Продукт металлопроката *</label>
                    <select
                      value={restockProductId}
                      onChange={(e) => setRestockProductId(Number(e.target.value))}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          [{p.category}] {p.name}
                        </option>
                      ))}
                    </select>

                    {/* Integrated Tonnage Converter (only for products with unit_type === 'meter') */}
                    {(() => {
                      const currentProduct = products.find(p => p.id === Number(restockProductId));
                      const canShowTonnageConverter = currentProduct && currentProduct.unit_type === 'meter';
                      if (!canShowTonnageConverter) return null;

                      return (
                        <div className="bg-[#fcfbf9] border border-[#eaddcd] rounded-xl p-3 mt-1.5 transition-all duration-200">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isTonnageMode}
                              onChange={(e) => setIsTonnageMode(e.target.checked)}
                              className="rounded text-[#1b4332] focus:ring-[#1b4332]/30 h-4 w-4 border-[#e3dcd2] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-[#1b4332]">
                              🚛 Авто-конвертер тонн в метры (учет допуск-лимитов РФ)
                            </span>
                          </label>

                          {isTonnageMode && (
                            <div className="mt-2.5 space-y-2.5 border-t border-[#f1eae0] pt-2 text-[11px]">
                              <div className="bg-emerald-50/50 text-emerald-850 p-2 rounded-lg border border-emerald-100 text-[10px] leading-relaxed">
                                <strong>💡 Справка допусков:</strong> Масса 1 метра проката у разных заводов отличается. Учет фактического отклонения от ГОСТа (минус/плюс допуска) предотвращает нестыковку остатка на складе!
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">
                                    Вес партии (Тонны) *
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.001"
                                    placeholder="Напр., 1.5 т"
                                    value={inputTons}
                                    onChange={(e) => setInputTons(e.target.value)}
                                    className="w-full bg-white text-xs border border-[#e3dcd2] px-2.5 py-1.5 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">
                                    ГОСТ Вес 1м (кг)
                                  </label>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.01"
                                    placeholder="кг/метр"
                                    value={customTheoWeight}
                                    onChange={(e) => setCustomTheoWeight(e.target.value)}
                                    className="w-full bg-white text-xs border border-[#e3dcd2] px-2.5 py-1.5 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5 font-mono">
                                  Завод-изготовитель (допуск)
                                </label>
                                <select
                                  value={selectedManufacturer}
                                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                                  className="w-full bg-white text-xs border border-[#e3dcd2] p-1.5 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                                >
                                  {MANUFACTURERS_REGISTRY.map(m => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                                {(() => {
                                  const mfg = MANUFACTURERS_REGISTRY.find(m => m.id === selectedManufacturer);
                                  return mfg ? (
                                    <p className="text-[9px] text-slate-400 mt-0.5 italic leading-none">
                                      {mfg.description}
                                    </p>
                                  ) : null;
                                })()}
                              </div>

                              {selectedManufacturer === 'custom' && (
                                <div className="p-2 bg-[#f4ece1] rounded-lg border border-[#eaddcd] space-y-1">
                                  <label className="block text-[9px] uppercase font-bold text-slate-500 font-mono">
                                    Ручное отклонение массы от ГОСТ (%)
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="any"
                                      placeholder="Напр. -2.5"
                                      value={customTolerancePercent}
                                      onChange={(e) => setCustomTolerancePercent(e.target.value)}
                                      className="w-20 bg-white text-xs border border-[#e3dcd2] px-2 py-1 rounded text-slate-800"
                                    />
                                    <span className="text-slate-500 text-[9px] leading-tight">
                                      % (минус — легче/длиннее, плюс — тяжелее/короче)
                                    </span>
                                  </div>
                                </div>
                              )}

                              {parseFloat(inputTons) > 0 && (
                                <div className="p-2.5 bg-emerald-50 text-[#1b4332] rounded-lg border border-emerald-150 space-y-0.5">
                                  <div className="flex justify-between font-mono text-[9px] opacity-75">
                                    <span>Вес нетто:</span>
                                    <span>{(parseFloat(inputTons) * 1000).toLocaleString('ru-RU')} кг</span>
                                  </div>
                                  <div className="flex justify-between font-mono text-[9px] opacity-75">
                                    <span>Фактический вес 1 метра:</span>
                                    <span>
                                      {(() => {
                                        const theoW = parseFloat(customTheoWeight);
                                        const mfg = MANUFACTURERS_REGISTRY.find(m => m.id === selectedManufacturer);
                                        const mfgFactor = mfg && mfg.factor !== null ? mfg.factor : (1 + parseFloat(customTolerancePercent) / 100);
                                        return isNaN(theoW) ? '0' : (theoW * mfgFactor).toFixed(4);
                                      })()}{' '}
                                      кг/м
                                    </span>
                                  </div>
                                  <div className="pt-1 border-t border-emerald-200/60 flex justify-between items-baseline">
                                    <span className="font-bold text-emerald-900 text-[10px]">Фактический метраж:</span>
                                    <span className="text-xs font-black font-mono text-emerald-950">
                                      {getConvertedMeters().toLocaleString('ru-RU')} м
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                        {isTonnageMode ? 'Рассчитанный метраж (м) *' : 'Объем поставки *'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          step="any"
                          min="0.1"
                          placeholder={isTonnageMode ? getConvertedMeters().toString() : "Напр. 100"}
                          value={isTonnageMode ? getConvertedMeters() : restockQty}
                          onChange={(e) => {
                            if (!isTonnageMode) {
                              setRestockQty(e.target.value);
                            }
                          }}
                          disabled={isTonnageMode}
                          className={`w-full text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30 ${
                            isTonnageMode ? 'bg-[#f4ece1]/50 text-slate-600 font-bold border-dashed cursor-not-allowed' : 'bg-white'
                          }`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-550 border rounded bg-slate-50 px-1 hover:cursor-default uppercase font-bold shrink-0">
                          {(() => {
                            const p = products.find(prod => prod.id === Number(restockProductId));
                            if (!p) return 'ед';
                            return p.unit_type === 'meter' ? 'м' : p.unit_type === 'piece' ? 'шт' : 'кг';
                          })()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Выплата из кассы (руб)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Напр. 45000 (необяз.)"
                        value={restockCost}
                        onChange={(e) => setRestockCost(e.target.value)}
                        className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30 placeholder:text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Поставщик / Комментарий</label>
                    <input
                      type="text"
                      placeholder="Поставка ООО 'МеталлСнаб', плавка 452"
                      value={restockNote}
                      onChange={(e) => setRestockNote(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Принять металл на склад (Оприходовать)</span>
                  </button>
                </form>
              </div>

              {/* History list logging */}
              <div className="md:col-span-7 bg-white border border-[#e6dfd5] p-5 rounded-2xl flex flex-col">
                <div className="flex gap-2 items-center mb-4 border-b border-[#eaddcd] pb-2 text-slate-700">
                  <History className="h-4 w-4 text-emerald-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Последние поступления</h4>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {transactions.filter(t => t.reference_id && t.reference_id.startsWith('STOCK-ADD-')).length === 0 ? (
                    <div className="text-center py-12 italic text-slate-400 font-sans text-xs">
                      Оприходований со склада еще не проводилось за смену.
                    </div>
                  ) : (
                    transactions
                      .filter(t => t.reference_id && t.reference_id.startsWith('STOCK-ADD-'))
                      .map(t => (
                        <div key={t.id} className="p-3 bg-[#fcfbf9]/60 rounded-xl border border-[#eaddcd] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="font-sans text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide bg-emerald-50 text-emerald-850 border border-emerald-150">Приход</span>
                              <span className="font-mono text-[10px] text-slate-450">{t.date}</span>
                            </div>
                            <p className="text-slate-800 mt-1">{t.description}</p>
                          </div>
                          
                          {t.amount_minor > 0 && (
                            <div className="shrink-0 text-right">
                              <strong className="text-rose-700 font-mono text-xs">{money(t.amount_minor)}</strong>
                              <p className="text-[8px] uppercase tracking-wide font-bold text-slate-450">расход кассы</p>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LOW STOCK ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-205 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed font-sans">
                  <h4 className="font-bold text-amber-850">Позиции под угрозой дефицита (&lt; 50 ед.)</h4>
                  <p className="mt-0.5">Оператору рекомендуется спланировать поставки или поднять розничную цену на время дефицита. Списание со склада при продаже продолжится, но баланс остатка уйдет в отрицательные значения.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowStockItems.length === 0 ? (
                  <div className="col-span-2 bg-white border border-[#e6dfd5] p-8 rounded-2xl text-center text-xs font-sans italic text-slate-500 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-650" />
                    Все позиции металлопроката в достаточном профиците (&gt;= 50 ед.)
                  </div>
                ) : (
                  lowStockItems.map(p => {
                    const stock = p.stock_qty || 0;
                    return (
                      <div key={p.id} className="bg-white border border-[#e6dfd5] p-4 rounded-xl flex justify-between items-center hover:border-amber-400/80 transition-colors">
                        <div>
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md font-mono tracking-wide uppercase font-bold">Дефицит</span>
                          <h4 className="text-xs font-bold text-slate-800 pr-4 mt-2 font-sans truncate" title={p.name}>{p.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">Категория: {p.category}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <strong className="text-xl font-mono text-amber-850">{stock}</strong>
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wide block">
                            {p.unit_type === 'meter' ? 'м' : p.unit_type === 'piece' ? 'шт' : 'кг'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 bg-white border-t border-[#eaddcd] flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-sans leading-none">
            Корпоративный складской модуль Металл POS. Все ручные изменения записываются в журнал проводок.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-[#faf6f0] border border-[#eaddcd] rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
          >
            Закрыть менеджер склада
          </button>
        </div>

      </div>
    </div>
  );
};
