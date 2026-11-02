import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Clock, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle, 
  ClipboardList, 
  TrendingUp, 
  FileText, 
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { Shift, Order, Expense, Advance, Transaction } from '../types';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface ShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  activeShift: Shift | null;
  setActiveShift: (shift: Shift | null) => void;
  orders: Order[];
  expenses: Expense[];
  advances: Advance[];
  transactions: Transaction[];
  onOpenShift: (startCashMinor: number) => void;
  onCloseShift: (params: {
    actualCashMinor: number;
    retainedForChangeMinor: number;
    note: string;
  }) => void;
}

export const ShiftsModal: React.FC<ShiftsModalProps> = ({
  isOpen,
  onClose,
  shifts,
  setShifts,
  activeShift,
  setActiveShift,
  orders,
  expenses,
  advances,
  transactions,
  onOpenShift,
  onCloseShift
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  // Opening shift state
  const [startCashInput, setStartCashInput] = useState<string>('5000');
  
  // Closing shift state inputs
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [retainedChangeInput, setRetainedChangeInput] = useState<string>('5000');
  const [shiftNote, setShiftNote] = useState<string>('');
  const [showConfirmClose, setShowConfirmClose] = useState<boolean>(false);

  // Calendar Archive state
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);

  // Auto-fill suggested starting cash on open or when shifts history changes
  useEffect(() => {
    if (shifts.length > 0) {
      const lastShift = shifts[0]; // sorted newest first
      if (lastShift.retained_for_change_minor !== undefined) {
        setStartCashInput((lastShift.retained_for_change_minor / 100).toString());
        setRetainedChangeInput((lastShift.retained_for_change_minor / 100).toString());
      }

      // Auto-focus calendar on the latest closed shift
      const latestClosed = shifts.find(s => s.status === 'closed');
      if (latestClosed && latestClosed.closed_at) {
        const datePart = latestClosed.closed_at.split(' ')[0];
        const [y, m, d] = datePart.split('-').map(Number);
        setSelectedYear(y);
        setSelectedMonth(m - 1);
        setSelectedDate({ day: d, month: m - 1, year: y });
      }
    }
  }, [shifts]);

  if (!isOpen) return null;

  // Format currency helper
  const money = (minor: number) => {
    return `${(minor / 100).toLocaleString('ru-RU')} ₽`;
  };

  // ----------------------------------------------------
  // CALCULATE LIVE CURRENT ACTIVE SHIFT METRICS
  // ----------------------------------------------------
  const calculateLiveMetrics = () => {
    if (!activeShift) return {
      startCashMinor: 0,
      salesCashMinor: 0,
      salesDebtMinor: 0,
      debtPaymentsMinor: 0,
      expensesMinor: 0,
      advancesMinor: 0,
      expectedCashMinor: 0,
      totalSalesMinor: 0
    };

    const sId = activeShift.id;

    // Direct Cash Sales inside this shift
    const shiftDirectSalesCash = transactions
      .filter(tx => tx.shift_id === sId && tx.type === 'sale_revenue' && !tx.description.toLowerCase().includes('погашение долга'))
      .reduce((sum, tx) => sum + tx.amount_minor, 0);

    // Old Debts returned during this shift
    const shiftDebtPayments = transactions
      .filter(tx => tx.shift_id === sId && tx.type === 'sale_revenue' && tx.description.toLowerCase().includes('погашение долга'))
      .reduce((sum, tx) => sum + tx.amount_minor, 0);

    // Expenses created during this shift
    const shiftExpenses = expenses
      .filter(exp => exp.shift_id === sId)
      .reduce((sum, exp) => sum + exp.amount_minor, 0);

    // Employee advances issued during this shift
    const shiftAdvances = advances
      .filter(adv => adv.shift_id === sId)
      .reduce((sum, adv) => sum + adv.amount_minor, 0);

    // Goods given in debt (released on credit status === 'debt') inside this shift
    const shiftDebtSales = orders
      .filter(o => o.shift_id === sId && o.status === 'debt')
      .reduce((sum, o) => sum + (o.total_minor - (o.debt_paid_minor || 0)), 0);

    const startCash = activeShift.start_cash_minor;
    // FORMULA: Current Expected Cash = Start + Direct Cash Sales + Debt collections - Expenses - Advances
    const expected = startCash + shiftDirectSalesCash + shiftDebtPayments - shiftExpenses - shiftAdvances;
    const totalSales = shiftDirectSalesCash + shiftDebtSales;

    return {
      startCashMinor: startCash,
      salesCashMinor: shiftDirectSalesCash,
      salesDebtMinor: shiftDebtSales,
      debtPaymentsMinor: shiftDebtPayments,
      expensesMinor: shiftExpenses,
      advancesMinor: shiftAdvances,
      expectedCashMinor: expected,
      totalSalesMinor: totalSales
    };
  };

  const metrics = calculateLiveMetrics();

  // Closing calculations based on inputs
  const parsedActualCash = Math.round((parseFloat(actualCashInput) || 0) * 100);
  const parsedRetainedChange = Math.round((parseFloat(retainedChangeInput) || 0) * 100);
  
  const discrepancy = parsedActualCash - metrics.expectedCashMinor;
  const calculatedEncashment = parsedActualCash - parsedRetainedChange;

  const handleOpenClick = () => {
    const cashVal = parseFloat(startCashInput);
    if (isNaN(cashVal) || cashVal < 0) {
      alert('Пожалуйста, укажите корректное количество начальных денег в кассе');
      return;
    }
    onOpenShift(Math.round(cashVal * 100));
    setActualCashInput('');
    setShiftNote('');
    setShowConfirmClose(false);
  };

  const handleCloseClick = () => {
    if (!actualCashInput || isNaN(parseFloat(actualCashInput))) {
      alert('Пожалуйста, укажите фактически сосчитанную сумму наличности в кассе');
      return;
    }
    const changeVal = parseFloat(retainedChangeInput);
    if (isNaN(changeVal) || changeVal < 0) {
      alert('Пожалуйста, укажите сумму разменной наличности для следующего дня');
      return;
    }
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    onCloseShift({
      actualCashMinor: parsedActualCash,
      retainedForChangeMinor: parsedRetainedChange,
      note: shiftNote.trim()
    });
    setShowConfirmClose(false);
    setActualCashInput('');
    setShiftNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 text-slate-805 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header toolbar */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-xs border ${
              activeShift ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                Управление сменами
                {activeShift ? (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded-full font-sans tracking-normal font-bold">
                    Смена открыта: №{activeShift.number.split('-')[2] || activeShift.id}
                  </span>
                ) : (
                  <span className="text-[9px] bg-rose-100 text-rose-800 border border-rose-250 px-2 py-0.5 rounded-full font-sans tracking-normal font-bold">
                    Смена закрыта
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Автоматическая сверка наличности, учет долгов, расходов и инкассация
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 bg-slate-50/20 border-b border-slate-200 flex gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-2.5 font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'current' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {activeShift ? 'Текущая смена (Расчеты)' : 'Открытие смены'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            История смен ({shifts.length})
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/30">
          
          {activeTab === 'current' && (
            <div className="space-y-5">
              
              {/* IF SHIFT IS CLOSED - SHOW OPENING WIDGET */}
              {!activeShift ? (
                <div className="max-w-md mx-auto bg-white border border-slate-250 p-6 rounded-2xl shadow-sm text-center space-y-5 my-6">
                  <div className="h-14 w-14 bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-mono">СМЕНА ЗАКРЫТА</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Чтобы начать продажи, принимать возвраты долгов и проводить расходы по кассе, необходимо открыть новую рабочую смену.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3 font-sans">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 font-mono">
                        Начальная наличность в кассе (₽)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">₽</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={startCashInput}
                          onChange={(e) => setStartCashInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 pl-8 pr-3 py-2.5 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        Сумма сдачи, оставленная в кассе с утра для первых клиентов (обычно 4000-5000 рублей).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenClick}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:translate-y-px cursor-pointer"
                  >
                    Открыть новую смену
                  </button>
                </div>
              ) : (
                
                /* IF SHIFT IS OPEN - SHOW LIVE CALCULATOR AND DISCREPANCY RECONCILIATION */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column: Live Shift Report and Variables (Spans 7) */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-slate-600" />
                        Ведомость текущей смены
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        Открыта: {activeShift.opened_at}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="block text-[9px] uppercase font-black text-slate-400 font-mono">Начальная касса</span>
                        <strong className="text-sm font-mono text-slate-750 font-bold block mt-1">
                          {money(metrics.startCashMinor)}
                        </strong>
                      </div>
                      <div className="p-3 bg-slate-55/40 rounded-xl border border-slate-100 text-right">
                        <span className="block text-[9px] uppercase font-black text-slate-400 font-mono">Итого Выручка Продаж</span>
                        <strong className="text-sm font-mono text-slate-900 block mt-1 font-extrabold">
                          {money(metrics.totalSalesMinor)}
                        </strong>
                        <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
                          (Нал + Долги)
                        </span>
                      </div>
                    </div>

                    {/* Step-by-step math metrics */}
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 bg-white/50 border border-slate-100 rounded-xl space-y-2.5">
                        <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Движение Денег в Кассе:</h4>
                        
                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Начальный баланс с утра:
                          </span>
                          <span className="text-slate-800 font-bold">{money(metrics.startCashMinor)}</span>
                        </div>

                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Продажи за наличные (в кассу):
                          </span>
                          <span className="text-emerald-700 font-bold">+{money(metrics.salesCashMinor)}</span>
                        </div>

                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1 text-teal-700">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Возвраты старых долгов (в кассу):
                          </span>
                          <span className="text-teal-700 font-bold">+{money(metrics.debtPaymentsMinor)}</span>
                        </div>

                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1 text-rose-700">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            Выдано на расходы (обед, закупки, ремонт):
                          </span>
                          <span className="text-rose-700 font-bold">-{money(metrics.expensesMinor)}</span>
                        </div>

                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1 text-amber-700">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            Выдано авансов сотрудникам склада:
                          </span>
                          <span className="text-amber-700 font-bold">-{money(metrics.advancesMinor)}</span>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                          <span className="text-slate-800 uppercase text-xs">Должно быть налички в кассе:</span>
                          <span className="text-[#102a43] text-sm font-extrabold">{money(metrics.expectedCashMinor)}</span>
                        </div>
                      </div>

                      {/* DEBT SUB-REPORT DISPLAY */}
                      <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-xl space-y-2">
                        <h4 className="text-[9px] font-black uppercase text-amber-800 tracking-wider">Отдельный учет долгов (не вошли в кассу):</h4>
                        <div className="flex justify-between items-center text-slate-650">
                          <span className="flex items-center gap-1 text-amber-900 font-bold">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            Товар отпущен в долг за смену:
                          </span>
                          <span className="text-amber-900 font-extrabold">{money(metrics.salesDebtMinor)}</span>
                        </div>
                        <p className="text-[9px] text-amber-700 leading-snug font-sans">
                          * Товар отдан клиентам в долг, он учтен в объеме продаж (выручка), но физически исключен из текущей налички сейфа, так как деньги еще не занесены.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Active Closure Panel (Spans 5) */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono pb-2 border-b border-slate-100 flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-emerald-600" />
                        Сверка и Закрытие
                      </h3>

                      {/* Inputs panel */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 font-mono">
                            Фактически денег в кассе (₽):
                          </label>
                          <input
                            type="number"
                            placeholder="Пересчитайте вручную..."
                            value={actualCashInput}
                            onChange={(e) => setActualCashInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-850 focus:bg-white focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 font-mono">
                            Оставить на сдачу на завтра (₽):
                          </label>
                          <input
                            type="number"
                            placeholder="Обычно 4000-5000 руб."
                            value={retainedChangeInput}
                            onChange={(e) => setRetainedChangeInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-xs font-mono text-slate-850 focus:bg-white focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1 font-mono">
                            Заметка смены (необязательно):
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Запишите расхождения, форс-мажоры..."
                            value={shiftNote}
                            onChange={(e) => setShiftNote(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-150 p-2 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-slate-400 resize-none leading-normal rounded-xl"
                          />
                        </div>
                      </div>

                      {/* LIVE MATH CALCULATIONS FOR ERROR, RECONCILIATION */}
                      {actualCashInput && !isNaN(parseFloat(actualCashInput)) && (
                        <div className="p-3.5 rounded-xl border font-mono text-xs space-y-2.5 bg-slate-50 border-slate-150">
                          
                          {/* Discrepancy report */}
                          <div className="flex justify-between items-center">
                            <span>Результат сверки кассы:</span>
                            {discrepancy === 0 ? (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-350 px-2 py-0.5 rounded font-black flex items-center gap-1">
                                🟢 Идеально
                              </span>
                            ) : discrepancy < 0 ? (
                              <span className="bg-rose-100 text-rose-900 border border-rose-350 px-2 py-0.5 rounded font-black flex items-center gap-1">
                                🔴 Недостача: {money(discrepancy)}
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-350 px-2 py-0.5 rounded font-black flex items-center gap-1">
                                🟡 Излишек: +{money(discrepancy)}
                              </span>
                            )}
                          </div>

                          {/* Encashment math report */}
                          <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-200">
                            <span className="text-slate-500">Выручка к изъятию (Инкассация):</span>
                            <span className={`font-black text-xs ${calculatedEncashment >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                              {money(calculatedEncashment)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCloseClick}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:translate-y-px cursor-pointer"
                    >
                      Закрыть смену и провести сверку
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {activeTab === 'history' && (() => {
            // Number of days in the month
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

            // Back-fill previous month's days for aesthetics
            const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
            const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // Sunday=0, Monday=1
            const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0=Monday, 6=Sunday

            interface CalendarCell {
              day: number;
              isCurrentMonth: boolean;
              month: number;
              year: number;
            }

            const cells: CalendarCell[] = [];
            // Previous month fill-in
            for (let i = adjustedFirstDayIndex - 1; i >= 0; i--) {
              cells.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                month: selectedMonth === 0 ? 11 : selectedMonth - 1,
                year: selectedMonth === 0 ? selectedYear - 1 : selectedYear
              });
            }

            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
              cells.push({
                day: d,
                isCurrentMonth: true,
                month: selectedMonth,
                year: selectedYear
              });
            }

            // Next month fill-in
            const totalCellsLength = cells.length;
            const nextDaysCount = (7 - (totalCellsLength % 7)) % 7;
            for (let d = 1; d <= nextDaysCount; d++) {
              cells.push({
                day: d,
                isCurrentMonth: false,
                month: selectedMonth === 11 ? 0 : selectedMonth + 1,
                year: selectedMonth === 11 ? selectedYear + 1 : selectedYear
              });
            }

            // Helper to get shifts for cell
            const getShiftsForCell = (cell: { day: number; month: number; year: number }) => {
              return shifts.filter(s => {
                if (!s.closed_at) return false;
                const datePart = s.closed_at.split(' ')[0];
                const [y, m, d] = datePart.split('-').map(Number);
                return y === cell.year && m === (cell.month + 1) && d === cell.day;
              });
            };

            const handlePrevMonth = () => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(prev => prev - 1);
              } else {
                setSelectedMonth(prev => prev - 1);
              }
            };

            const handleNextMonth = () => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(prev => prev + 1);
              } else {
                setSelectedMonth(prev => prev + 1);
              }
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                {/* Left Column: Calendar Grid (Spans 7) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4 text-slate-650" />
                      Календарь закрытых смен
                    </h3>
                    
                    {/* Month Picker */}
                    <div className="flex items-center gap-2 select-none">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors font-bold text-xs"
                      >
                        &larr;
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-800 min-w-[100px] text-center uppercase tracking-wider">
                        {MONTH_NAMES[selectedMonth]} {selectedYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors font-bold text-xs"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Calendar Structure */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
                    {/* Weekdays row */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                      {WEEKDAYS.map((day) => (
                        <div key={day} className="py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grid of Days */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {cells.map((cell, idx) => {
                        const dayShifts = getShiftsForCell(cell);
                        const hasShifts = dayShifts.length > 0;
                        const daySalesMinor = dayShifts.reduce((sum, s) => sum + (s.sales_cash_minor + s.sales_debt_minor), 0);
                        
                        const isSelected = selectedDate && 
                          selectedDate.day === cell.day && 
                          selectedDate.month === cell.month && 
                          selectedDate.year === cell.year;
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (hasShifts) {
                                setSelectedDate({ day: cell.day, month: cell.month, year: cell.year });
                                if (cell.month !== selectedMonth) {
                                  setSelectedMonth(cell.month);
                                  setSelectedYear(cell.year);
                                }
                              }
                            }}
                            className={`min-h-[64px] rounded-xl border p-1.5 flex flex-col justify-between transition-all select-none ${
                              !cell.isCurrentMonth ? 'opacity-30' : ''
                            } ${
                              hasShifts
                                ? isSelected
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600/25 cursor-pointer'
                                  : 'bg-emerald-50/40 border-emerald-150 text-emerald-900 font-medium hover:bg-emerald-50 hover:border-emerald-350 cursor-pointer'
                                : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`text-[10px] font-mono leading-none ${hasShifts ? 'font-bold' : ''}`}>
                                {cell.day}
                              </span>
                              {hasShifts && (
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-250/50 px-1 rounded font-extrabold font-mono leading-none">
                                  {dayShifts.length}
                                </span>
                              )}
                            </div>
                            
                            {hasShifts && (
                              <div className="text-[9px] font-mono font-bold text-emerald-700 mt-1 truncate">
                                +{money(daySalesMinor)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Day Details Inspector (Spans 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-slate-700" />
                      Детали за выбранные сутки
                    </h3>
                  </div>

                  {selectedDate ? (() => {
                    const dayShifts = getShiftsForCell(selectedDate);
                    if (dayShifts.length === 0) {
                      return (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 font-mono text-xs italic">
                          Архивные смены не проводились {selectedDate.day.toString().padStart(2, '0')}.{(selectedDate.month + 1).toString().padStart(2, '0')}.{selectedDate.year}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4 overflow-y-auto max-h-[62vh] pr-1">
                        <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wide">
                          Выбранная дата: {selectedDate.day.toString().padStart(2, '0')}.{(selectedDate.month + 1).toString().padStart(2, '0')}.{selectedDate.year} (смен: {dayShifts.length})
                        </div>
                        
                        {dayShifts.map((s) => {
                          const diff = s.discrepancy_minor || 0;
                          return (
                            <div 
                              key={s.id} 
                              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-3.5 animate-fade-in"
                            >
                              {/* Header info */}
                              <div className="pb-2 border-b border-slate-100 flex justify-between items-center text-xs">
                                <div>
                                  <strong className="font-mono text-slate-900 font-black">
                                    {s.number}
                                  </strong>
                                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                                    {s.opened_at.split(' ')[0]}
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-all">
                                  {s.opened_at.split(' ')[1] || ''} — {s.closed_at ? s.closed_at.split(' ')[1] || '' : 'н/д'}
                                </span>
                              </div>

                              {/* Key statistics list */}
                              <div className="space-y-2 font-mono text-[10.5px] leading-relaxed">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Начальный баланс (утро):</span>
                                  <span className="text-slate-700 font-bold">{money(s.start_cash_minor)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-50 pt-1.5">
                                  <span className="text-emerald-800 flex items-center gap-1 font-semibold">
                                    <ArrowUpRight className="h-3 w-3" /> Нал в кассу (выручка):
                                  </span>
                                  <span className="text-emerald-700 font-extrabold">+{money(s.sales_cash_minor)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-amber-900 flex items-center gap-1 font-semibold">
                                    <ArrowUpRight className="h-3 w-3" /> Отгрузки под честное слово (долг):
                                  </span>
                                  <span className="text-amber-800 font-bold">{money(s.sales_debt_minor)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-teal-900 flex items-center gap-1 font-semibold">
                                    <ArrowUpRight className="h-3 w-3" /> Погашение старых долгов:
                                  </span>
                                  <span className="text-teal-700 font-bold">+{money(s.debt_payments_minor)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-800">
                                  <span className="flex items-center gap-1 font-semibold">
                                    <ArrowDownRight className="h-3 w-3" /> Расходы и авансы:
                                  </span>
                                  <strong className="font-bold">-{money(s.expenses_minor + s.advances_minor)}</strong>
                                </div>

                                <div className="h-px bg-slate-100 my-1"></div>

                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-slate-600">Должно быть в drawer сейфе:</span>
                                  <span className="text-slate-800">{money(s.expected_cash_minor)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-slate-850">
                                  <span className="text-slate-600">Фактическая наличность:</span>
                                  <span className="text-indigo-800 font-black">{money(s.actual_cash_minor || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  <span className="text-slate-500">Погрешность сверки:</span>
                                  {diff === 0 ? (
                                    <span className="text-emerald-750 font-black bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">0 ₽</span>
                                  ) : diff < 0 ? (
                                    <span className="text-rose-750 font-black bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">Недостача {money(diff)}</span>
                                  ) : (
                                    <span className="text-emerald-750 font-black bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">Излишек +{money(diff)}</span>
                                  )}
                                </div>

                                <div className="h-px bg-slate-100 my-1"></div>

                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                  <span>Оставлено сменщику:</span>
                                  <span className="font-extrabold text-slate-800">{money(s.retained_for_change_minor || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                  <span>Инкассация:</span>
                                  <span className="font-extrabold text-blue-700 bg-blue-50 px-1.5 rounded border border-blue-100/30">{money(s.encashment_minor || 0)}</span>
                                </div>
                              </div>

                              {/* Comment/Note section */}
                              {s.note && (
                                <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/50 font-sans italic text-slate-650 text-[10px] mt-1 tracking-wide leading-relaxed">
                                  💬 Комментарий кассира: «{s.note}»
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 font-mono text-xs italic">
                      Выберите любой подсвеченный день на календаре слева, чтобы открыть подробную сводку сверки.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

        {/* Outer confirmation drawer popup */}
        {showConfirmClose && (
          <div className="p-5 border-t border-slate-200 bg-slate-100/90 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans leading-relaxed animate-fade-in">
            <div className="flex items-start gap-2.5">
              <div className="mt-1 h-5 w-5 rounded-full bg-slate-850 text-white flex items-center justify-center font-bold text-xs">
                ?
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Подтверждение закрытия кассовой смены</h4>
                <p className="text-[11px] text-slate-500 max-w-xl mt-0.5">
                  Вы собираетесь завершить и запечатать рабочую смену. Финансовые итоги зафиксируются в архиве, а кассовый остаток {money(parsedRetainedChange)} будет перенесен как разменная монета на запуск следующей смены.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2.5 select-none text-xs shrink-0 self-end sm:self-center font-mono">
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 hover:bg-slate-200 text-slate-600 rounded-xl font-bold border border-slate-300 transition-colors cursor-pointer bg-white"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
              >
                Да, закрыть смену
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
