import React, { useState } from 'react';
import { 
  X, Search, Phone, Calendar, Receipt, DollarSign, 
  Wallet, Eye, User, Edit, ChevronDown, ChevronRight, 
  Users, Layers, ArrowRight, HelpCircle 
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface DebtorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onSelectOrder: (orderId: number) => void;
  onPayDebt: (order: Order, amountMinor?: number) => void;
  onPayCustomerDebtChronologically?: (customerName: string, customerPhone: string | undefined, amountMinor: number) => void;
}

interface DebtorGroup {
  key: string;
  customer_name: string;
  customer_phone?: string;
  total_debt_minor: number;
  debt_paid_minor: number;
  remaining_debt_minor: number;
  orders: Order[];
}

export const DebtorsModal: React.FC<DebtorsModalProps> = ({
  isOpen,
  onClose,
  orders,
  setOrders,
  onSelectOrder,
  onPayDebt,
  onPayCustomerDebtChronologically
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'byCustomer' | 'byOrder'>('byCustomer');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(true);

  if (!isOpen) return null;

  // Formatting minor values block 
  const money = (minor: number) => {
    return (minor / 100).toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' руб';
  };

  const activeDebts = orders.filter(o => o.status === 'debt');
  
  // Outstanding debt sum taking partial payments into account
  const totalDebtSum = activeDebts.reduce((sum, o) => {
    const remaining = o.total_minor - (o.debt_paid_minor || 0);
    return sum + remaining;
  }, 0);

  // Group debts by client
  const debtorGroups: DebtorGroup[] = [];
  
  activeDebts.forEach(order => {
    const name = (order.customer_name || 'Неизвестный клиент').trim();
    const phone = (order.customer_phone || '').trim();
    // Unique key combines name and phone to ensure accurate aggregation
    const key = `${name.toLowerCase()}||${phone.toLowerCase()}`;
    
    let group = debtorGroups.find(g => g.key === key);
    
    const remaining = order.total_minor - (order.debt_paid_minor || 0);
    
    if (group) {
      group.total_debt_minor += order.total_minor;
      group.debt_paid_minor += (order.debt_paid_minor || 0);
      group.remaining_debt_minor += remaining;
      group.orders.push(order);
    } else {
      debtorGroups.push({
        key,
        customer_name: name,
        customer_phone: phone || undefined,
        total_debt_minor: order.total_minor,
        debt_paid_minor: (order.debt_paid_minor || 0),
        remaining_debt_minor: remaining,
        orders: [order]
      });
    }
  });

  // Sort groups so debtors with the most remaining debt are displayed first
  debtorGroups.sort((a, b) => b.remaining_debt_minor - a.remaining_debt_minor);

  // Sort orders inside each group chronologically (oldest first - lower ID is older)
  debtorGroups.forEach(g => {
    g.orders.sort((a, b) => a.id - b.id);
  });

  // Expand / collapse helper
  const toggleKeyExpand = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Filter groups
  const filteredGroups = debtorGroups.filter(g => {
    const term = searchQuery.toLowerCase();
    const name = g.customer_name.toLowerCase();
    const phone = (g.customer_phone || '').toLowerCase();
    const hasMatchingOrder = g.orders.some(o => 
      o.number.toLowerCase().includes(term) || 
      (o.note || '').toLowerCase().includes(term)
    );
    return name.includes(term) || phone.includes(term) || hasMatchingOrder;
  });

  // Filter individual orders (for 'byOrder' view)
  const filteredOrders = activeDebts.filter(o => {
    const term = searchQuery.toLowerCase();
    const name = (o.customer_name || '').toLowerCase();
    const phone = (o.customer_phone || '').toLowerCase();
    const num = o.number.toLowerCase();
    const note = (o.note || '').toLowerCase();
    return name.includes(term) || phone.includes(term) || num.includes(term) || note.includes(term);
  });

  // Prompt edit customer data in-place
  const handleEditBuyerMeta = (e: React.MouseEvent, o: Order) => {
    e.stopPropagation();
    const newName = prompt('Введите имя покупателя:', o.customer_name || '');
    if (newName === null) return;
    const newPhone = prompt('Введите контактный телефон:', o.customer_phone || '');
    if (newPhone === null) return;

    setOrders(prev => prev.map(item => {
      if (item.id === o.id) {
        return {
          ...item,
          customer_name: newName.trim() || undefined,
          customer_phone: newPhone.trim() || undefined
        };
      }
      return item;
    }));

    // If there are other orders with same old name, ask to update them too
    const oldName = o.customer_name || '';
    const oldPhone = o.customer_phone || '';
    const matchingCount = activeDebts.filter(item => 
      item.id !== o.id && 
      (item.customer_name || '') === oldName && 
      (item.customer_phone || '') === oldPhone
    ).length;

    if (matchingCount > 0) {
      const confirmAllStr = `Мы нашли еще ${matchingCount} долгов этого клиента. Обновить контактные данные во всех его долгах?`;
      if (window.confirm(confirmAllStr)) {
        setOrders(prev => prev.map(item => {
          if (item.status === 'debt' && (item.customer_name || '') === oldName && (item.customer_phone || '') === oldPhone) {
            return {
              ...item,
              customer_name: newName.trim() || undefined,
              customer_phone: newPhone.trim() || undefined
            };
          }
          return item;
        }));
      }
    }
  };

  // Settle aggregate customer debt chronologically
  const handlePayDebtorAggregate = (e: React.MouseEvent, group: DebtorGroup) => {
    e.stopPropagation();
    if (!onPayCustomerDebtChronologically) {
      alert('Интеграция групповых оплат временно недоступна');
      return;
    }
    
    const remainingRub = group.remaining_debt_minor / 100;
    const amountStr = window.prompt(
      `Оплата долга клиента: "${group.customer_name}"\n` +
      `Общий текущий долг: ${remainingRub.toFixed(2)} руб. (${group.orders.length} ордеров)\n\n` +
      `Важно: Оплата принимается в общую кассу смены и автоматически распределяется со старых долгов к новым (FIFO).\n\n` +
      `Введите сумму платежа к зачислению (руб.):`,
      remainingRub.toFixed(2)
    );
    if (amountStr === null) return;

    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Некорректная сумма оплаты');
      return;
    }

    const payAmountMinor = Math.round(parsedAmount * 100);
    if (payAmountMinor > group.remaining_debt_minor) {
      alert(`Сумма оплаты (${(payAmountMinor / 100).toFixed(2)} руб.) превышает совокупный долг клиента (${remainingRub.toFixed(2)} руб.)`);
      return;
    }

    onPayCustomerDebtChronologically(group.customer_name, group.customer_phone, payAmountMinor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF6F0] border border-[#eaddcd] text-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-[#eaddcd] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 text-amber-950 font-bold rounded-xl flex items-center justify-center text-lg shadow-sm">
              🤝
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-slate-800 uppercase tracking-wide">
                Дебиторская задолженность (Должники)
              </h3>
              <p className="text-[11px] text-slate-500">Учет отгруженного в долг металлопроката, частичных и FIFO оплат</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#fcfbf9] text-slate-400 hover:text-slate-600 rounded-lg transition-all border border-transparent hover:border-[#eaddcd]"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content body layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Status highlight ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
            <div className="p-4 bg-amber-50 border border-amber-205 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl flex items-center justify-center font-bold text-base">
                💰
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium block">Текущий долг:</span>
                <strong className="text-amber-900 font-mono text-lg font-black">{money(totalDebtSum)}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#fcfbf9] border border-[#eaddcd] rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-amber-100/40 text-slate-700 border border-[#eaddcd]/80 rounded-xl flex items-center justify-center font-bold text-base">
                👤
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium block">Всего должников:</span>
                <strong className="text-slate-800 font-mono text-lg font-black">{debtorGroups.length} человек(а)</strong>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-800 border border-emerald-250 rounded-xl flex items-center justify-center font-bold text-base">
                🛡️
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-mono font-medium block">Режим оплат:</span>
                <span className="text-[11px] text-[#1b4332] font-mono leading-relaxed block mt-0.5 font-bold">Частичное гашение и FIFO!</span>
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          {showExplanation && (
            <div className="p-3.5 bg-sky-50 border border-sky-150 rounded-xl text-xs text-sky-900/90 relative flex items-start gap-2.5 animate-fade-in shrink-0">
              <HelpCircle className="h-4.5 w-4.5 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1 pr-6 leading-relaxed">
                <p className="font-bold text-[11px] uppercase tracking-wider text-sky-950 font-mono">Как устроен учет долгов при повторных займах?</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li><strong>Складываются ли долги?</strong> Да! На вкладке «По людям» все отдельные долги одного человека выводятся суммарно в единый баланс.</li>
                  <li><strong>Откуда вычитается частичное закрытие?</strong> Мы используем стандартное правило <strong>FIFO (First-In, First-Out)</strong>. Любая зачисленная клиенту сумма автоматически списывает сначала его самый старый долг по времени. Если сумма платежа больше первого ордера, остаток переходит на гашение следующего по старшинству.</li>
                  <li>Вы также можете развернуть карточку человека и погасить конкретный ордер вручную, либо зачислить частичную оплату прямо на выбранный ордер.</li>
                </ul>
              </div>
              <button 
                onClick={() => setShowExplanation(false)} 
                className="absolute top-2.5 right-2.5 text-sky-400 hover:text-sky-700 p-0.5 rounded"
                title="Скрыть подсказку"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Search bar & Tabs row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between shrink-0">
            {/* Search tool block */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Поиск должника по ФИО, телефону, комментарию или ордеру..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs border border-[#eaddcd] p-3 pl-10 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 shadow-xs"
              />
            </div>

            {/* Layout view controls */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1 font-mono text-[11px] self-start md:self-auto min-w-[280px]">
              <button
                type="button"
                onClick={() => setViewMode('byCustomer')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all font-bold cursor-pointer select-none ${
                  viewMode === 'byCustomer' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>Группировать по клиентам</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('byOrder')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all font-bold cursor-pointer select-none ${
                  viewMode === 'byOrder' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span>По ордерам отдельно</span>
              </button>
            </div>
          </div>

          {/* Debt occurrences table */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider font-mono px-1">
              {searchQuery ? `Результаты поиска (${viewMode === 'byCustomer' ? filteredGroups.length : filteredOrders.length})` : `Список долгов в базе (${viewMode === 'byCustomer' ? filteredGroups.length : filteredOrders.length})`}
            </h4>

            {/* TAB 1: GROUPED BY CUSTOMER/PEOPLE */}
            {viewMode === 'byCustomer' && (
              <div className="space-y-3">
                {filteredGroups.length === 0 ? (
                  <div className="p-12 border border-dashed border-[#eaddcd] rounded-2xl text-center text-slate-500 bg-white">
                    <Wallet className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                    <p className="text-xs font-semibold leading-relaxed">
                      Должников не обнаружено.
                    </p>
                  </div>
                ) : (
                  filteredGroups.map(g => {
                    const isExpanded = expandedKeys.includes(g.key);
                    const initialNameChar = g.customer_name.trim().charAt(0).toUpperCase();
                    return (
                      <div 
                        key={g.key}
                        className="bg-white border border-[#eaddcd] rounded-2xl overflow-hidden shadow-xs hover:border-amber-400/60 transition-all"
                      >
                        {/* Parent customer line summary */}
                        <div 
                          onClick={() => toggleKeyExpand(g.key)}
                          className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-all select-none"
                        >
                          <div className="flex items-start gap-3">
                            {/* Collapse/Expand mini indicator */}
                            <div className="mt-2.5 text-slate-400">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>

                            {/* Rounded Initial badge */}
                            <div className="h-10 w-10 bg-amber-500 text-white font-black text-xs rounded-xl flex items-center justify-center shrink-0 font-mono shadow-xs">
                              {initialNameChar}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">
                                  {g.customer_name}
                                </span>
                                {g.customer_phone && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-[#faf6f0] border border-[#eaddcd] py-0.5 px-1.5 rounded text-slate-700">
                                    <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                    {g.customer_phone}
                                  </span>
                                )}
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                                  {g.orders.length} д. ордеров
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">
                                Сводный баланс: всего <span className="line-through text-slate-400">{money(g.total_debt_minor)}</span> • выплачено: {money(g.debt_paid_minor)}
                              </p>
                            </div>
                          </div>

                          {/* Right side: aggregation metrics & action */}
                          <div className="flex md:flex-col justify-between md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#f1eae0] gap-3">
                            <div className="text-left md:text-right">
                              <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[#a85507] block">Осталось выплатить</span>
                              <strong className="text-amber-900 font-black font-mono text-base">{money(g.remaining_debt_minor)}</strong>
                            </div>

                            <div className="flex gap-2">
                              {/* Consolidated payoff button */}
                              <button
                                onClick={(e) => handlePayDebtorAggregate(e, g)}
                                className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Принять платеж от покупателя и автоматически рапределить его по ордерам (FIFO)"
                              >
                                <span>💴 Внести зачисление (FIFO)</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Nested lists of active orders */}
                        {isExpanded && (
                          <div className="bg-[#FAF6F0]/40 border-t border-[#f0eae0] p-4 space-y-2.5 animate-fade-in">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">Хронология долгов клиента (в порядке образования):</div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {g.orders.map((o, idx) => {
                                const remaining = o.total_minor - (o.debt_paid_minor || 0);
                                return (
                                  <div 
                                    key={o.id}
                                    className="bg-white/90 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-amber-300"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-amber-800 font-mono bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                          #{idx + 1} Старейшина долга
                                        </span>
                                        <span className="text-xs font-bold font-mono text-slate-700">{o.number}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">({o.created_at})</span>
                                      </div>
                                      
                                      <p className="text-[11px] text-slate-600 pr-4">
                                        По ордеру: всего <strong className="text-slate-800 font-mono">{money(o.total_minor)}</strong> (из них оплачено по долгу: <span className="text-emerald-700 font-bold font-mono">{money(o.debt_paid_minor || 0)}</span>)
                                      </p>

                                      {/* Ordered positions list */}
                                      <div className="flex flex-wrap gap-1 pt-1.5">
                                        {o.items.map(item => (
                                          <span 
                                            key={item.id} 
                                            className="text-[9.5px] font-mono bg-slate-50 border border-slate-100 py-0.5 px-1.5 rounded text-slate-500"
                                          >
                                            {item.product_name_snapshot} × {item.qty} {item.unit_type_snapshot === 'meter' ? 'м' : item.unit_type_snapshot === 'piece' ? 'шт' : 'кг'}
                                          </span>
                                        ))}
                                      </div>

                                      {o.note && (
                                        <p className="text-[10px] text-slate-450 italic mt-1.5">
                                          📝 {o.note}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-100 gap-2 shrink-0">
                                      <div className="text-left sm:text-right">
                                        <span className="text-[9px] text-slate-400 font-mono block">Долг по ордеру:</span>
                                        <span className="text-xs font-bold text-amber-950 font-mono">{money(remaining)}</span>
                                      </div>

                                      <div className="flex gap-1.5">
                                        {/* Inspected action */}
                                        <button
                                          onClick={() => onPayDebt(o)}
                                          className="h-7 px-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all"
                                          title="Погасить конкретно этот ордер (частично или полностью)"
                                        >
                                          💴 Погасить ордер
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            onSelectOrder(o.id);
                                            onClose();
                                          }}
                                          className="h-7 w-7 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg justify-center flex items-center text-slate-500 hover:text-slate-800"
                                          title="Инспектировать детали заказа/раскроя"
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: SEPARATED INDIVIDUAL ORDERS */}
            {viewMode === 'byOrder' && (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 border border-dashed border-[#eaddcd] rounded-2xl text-center text-slate-500 bg-white">
                    <Wallet className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                    <p className="text-xs font-semibold leading-relaxed">
                      Неоплаченных ордеров в долг не найдено.
                    </p>
                  </div>
                ) : (
                  filteredOrders.map(o => {
                    const initialNameChar = o.customer_name ? o.customer_name.trim().charAt(0).toUpperCase() : '?';
                    const remainingDebt = o.total_minor - (o.debt_paid_minor || 0);

                    return (
                      <div 
                        key={o.id} 
                        className="bg-white border border-[#eaddcd] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md hover:border-amber-400/70 transition-all duration-200"
                      >
                        {/* Left: Client metadata block */}
                        <div className="flex items-start gap-3.5 max-w-2xl">
                          {/* Rounded Initial badge */}
                          <div className="h-11 w-11 bg-amber-100 text-amber-800 border border-amber-250 font-black text-sm rounded-xl flex items-center justify-center shrink-0 font-mono">
                            {initialNameChar}
                          </div>
                          
                          <div className="space-y-1">
                            {/* Client Title row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-slate-850">
                                {o.customer_name || '👤 Имя не привязано'}
                              </span>
                              {o.customer_phone && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#faf6f0] border border-[#eaddcd] py-0.5 px-1.5 rounded text-slate-700">
                                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                  {o.customer_phone}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleEditBuyerMeta(e, o)}
                                className="text-[10px] text-slate-450 hover:text-amber-700 font-semibold flex items-center gap-0.5 ml-1"
                                title="Привязать или скорректировать данные человека"
                              >
                                <Edit className="h-3 w-3" />
                                Изменить
                              </button>
                            </div>

                            {/* Order sub details */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                <strong>{o.number}</strong>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {o.created_at}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-mono">
                              Всего по чеку: <span className="line-through">{money(o.total_minor)}</span> • Совершено выплат: <span className="text-emerald-700 font-bold">{money(o.debt_paid_minor || 0)}</span>
                            </p>

                            {/* Detail notes */}
                            {o.note && (
                              <p className="text-[11px] text-slate-500 italic max-w-lg mt-1 line-clamp-1">
                                📝 «{o.note}»
                              </p>
                            )}

                            {/* Items included brief summary list */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {o.items.map(item => (
                                <span 
                                  key={item.id} 
                                  className="text-[9px] font-mono bg-[#fcfbf9] border border-[#f0eae0] py-0.5 px-1.5 rounded-md text-slate-650"
                                >
                                  {item.product_name_snapshot} × {item.qty} {item.unit_type_snapshot === 'meter' ? 'м' : item.unit_type_snapshot === 'piece' ? 'шт' : 'кг'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: actions & outstanding sum */}
                        <div className="flex md:flex-col justify-between md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#f1eae0] gap-3">
                          {/* Summary debt value */}
                          <div className="text-right">
                            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[#a85507] block">Осталось выплатить</span>
                            <strong className="text-amber-900 font-black font-mono text-base">{money(remainingDebt)}</strong>
                          </div>

                          {/* Control buttons */}
                          <div className="flex gap-2">
                            {/* Settle Debt button */}
                            <button
                              onClick={() => onPayDebt(o)}
                              className="h-8 px-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              title="Частичное или полное погашение данного ордера"
                            >
                              <span>💴 Погасить</span>
                            </button>

                            {/* Open and inspect button */}
                            <button
                              onClick={() => {
                                onSelectOrder(o.id);
                                onClose();
                              }}
                              className="h-8 w-8 bg-[#faf6f0] border border-[#eaddcd] hover:bg-[#eaddcd]/40 text-slate-600 hover:text-slate-900 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                              title="Посмотреть ордер в основном экране управления резкой"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer info lock banner */}
        <div className="px-6 py-4 bg-amber-500/10 border-t border-[#eaddcd] flex flex-col sm:flex-row justify-between items-center text-xs text-amber-900 font-medium select-none gap-2 shrink-0">
          <span>⚠️ Внимание: При любом погашении (полном или частичном) сумма фиксируется как доход Sale Revenue на тек. смену и отображается в её кассе.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#eaddcd] text-slate-700 hover:bg-[#faf6f0] font-bold rounded-lg transition-all text-xs cursor-pointer shadow-xs"
          >
            Закрыть реестр
          </button>
        </div>

      </div>
    </div>
  );
};
