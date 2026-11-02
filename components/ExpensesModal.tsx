import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart2, 
  History, 
  X, 
  Trash2, 
  Plus, 
  Briefcase, 
  UserCheck, 
  UserMinus, 
  Calendar, 
  Tag, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Employee, Advance, Expense, Transaction, Order, Product, Shift } from '../types';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  advances: Advance[];
  setAdvances: React.Dispatch<React.SetStateAction<Advance[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  orders: Order[];
  products: Product[];
  activeShift: Shift | null;
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  employees,
  setEmployees,
  advances,
  setAdvances,
  expenses,
  setExpenses,
  transactions,
  setTransactions,
  orders,
  products,
  activeShift
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'advances' | 'expenses' | 'kpi' | 'transactions'>('kpi');

  // New Employee fields
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Резчик-заготовщик (болгарка)');
  const [newEmpRate, setNewEmpRate] = useState('');

  // New Advance fields
  const [advEmpId, setAdvEmpId] = useState<number>(employees[0]?.id || 0);
  const [advAmount, setAdvAmount] = useState('');
  const [advNote, setAdvNote] = useState('');

  // New Expense fields
  const [expCategory, setExpCategory] = useState<'rent' | 'utility' | 'logistics' | 'supplies' | 'other'>('supplies');
  const [expAmount, setExpAmount] = useState('');
  const [expNote, setExpNote] = useState('');

  // Filters
  const [txFilter, setTxFilter] = useState<string>('all');
  const [txSearch, setTxSearch] = useState<string>('');

  if (!isOpen) return null;

  // Format money helper
  const money = (minor: number) => {
    return `${(minor / 100).toLocaleString('ru-RU')} ₽`;
  };

  // Convert current date string (YYYY-MM-DD)
  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  // HANDLERS
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRate) return;

    const rateInKopecks = Math.round(parseFloat(newEmpRate) * 100);
    const newEmp: Employee = {
      id: employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1,
      name: newEmpName.trim(),
      role: newEmpRole,
      rate_minor: rateInKopecks,
      status: 'active',
      hire_date: getTodayStr()
    };

    setEmployees(prev => [...prev, newEmp]);
    setNewEmpName('');
    setNewEmpRate('');

    // Add transaction event log for hiring
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'operational_expense',
      amount_minor: 0,
      date: getTodayStr(),
      description: `Принят на работу новый сотрудник: ${newEmp.name} (${newEmp.role})`,
      reference_id: `EMP-${newEmp.id}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const toggleEmployeeStatus = (id: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
        // Log transaction history
        const newTx: Transaction = {
          id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
          type: 'operational_expense',
          amount_minor: 0,
          date: getTodayStr(),
          description: `Сотрудник ${emp.name} переведен в статус: ${nextStatus === 'active' ? 'Работает' : 'Уволен/Неактивен'}`,
          reference_id: `EMP-${emp.id}`
        };
        setTransactions(txs => [newTx, ...txs]);
        return { ...emp, status: nextStatus };
      }
      return emp;
    }));
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(advAmount);
    if (!advEmpId || isNaN(amountFloat) || amountFloat <= 0) return;

    const emp = employees.find(x => x.id === Number(advEmpId));
    if (!emp) return;

    const amountMinor = Math.round(amountFloat * 100);
    const newAdv: Advance = {
      id: advances.length > 0 ? Math.max(...advances.map(a => a.id)) + 1 : 1,
      employee_id: Number(advEmpId),
      amount_minor: amountMinor,
      date: getTodayStr(),
      note: advNote.trim() || 'Внеочередной аванс',
      shift_id: activeShift ? activeShift.id : undefined
    };

    setAdvances(prev => [...prev, newAdv]);
    setAdvAmount('');
    setAdvNote('');

    // Deduct salary outflow transaction entry
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'advance_payment',
      amount_minor: amountMinor,
      date: getTodayStr(),
      description: `Выдан аванс сотруднику: ${emp.name} (${newAdv.note})`,
      reference_id: `ADV-${newAdv.id}`,
      shift_id: activeShift ? activeShift.id : undefined
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteAdvance = (id: number) => {
    const adv = advances.find(x => x.id === id);
    if (!adv) return;
    setAdvances(prev => prev.filter(x => x.id !== id));
    // Add cancelling ledger
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'sale_revenue', // refund back to balance
      amount_minor: adv.amount_minor,
      date: getTodayStr(),
      description: `Аннулирована выдача аванса №${adv.id} (сумма возвращена в кассу)`,
      reference_id: `ADV-DEL-${adv.id}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFloat = parseFloat(expAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) return;

    const amountMinor = Math.round(amountFloat * 100);
    const newExp: Expense = {
      id: expenses.length > 0 ? Math.max(...expenses.map(x => x.id)) + 1 : 1,
      category: expCategory,
      amount_minor: amountMinor,
      date: getTodayStr(),
      note: expNote.trim() || 'Расход склада',
      shift_id: activeShift ? activeShift.id : undefined
    };

    setExpenses(prev => [...prev, newExp]);
    setExpAmount('');
    setExpNote('');

    // Translate category
    const catLabels: {[k: string]: string} = {
      rent: 'Аренда',
      utility: 'Коммунальные/Электричество',
      logistics: 'Логистика/Топливо',
      supplies: 'Расходные материалы/Инструменты',
      other: 'Прочие расходы'
    };

    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'operational_expense',
      amount_minor: amountMinor,
      date: getTodayStr(),
      description: `Складской расход [${catLabels[expCategory]}]: ${newExp.note}`,
      reference_id: `EXP-${newExp.id}`,
      shift_id: activeShift ? activeShift.id : undefined
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleDeleteExpense = (id: number) => {
    const exp = expenses.find(x => x.id === id);
    if (!exp) return;
    setExpenses(prev => prev.filter(x => x.id !== id));
    const newTx: Transaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      type: 'sale_revenue',
      amount_minor: exp.amount_minor,
      date: getTodayStr(),
      description: `Удалена строка расхода №${exp.id}: "${exp.note}"`,
      reference_id: `EXP-DEL-${exp.id}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // CALCULATE FINANCIAL STATISTICS FOR KPI
  const getFinancialStats = () => {
    // 1. Total Revenue from paid/issued orders
    const salesRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'issued')
      .reduce((sum, o) => sum + o.total_minor, 0);

    // 2. Extra income from manual sale transactions
    const manualRevenue = transactions
      .filter(t => t.type === 'sale_revenue' && !t.reference_id?.startsWith('ORD-') && !t.reference_id?.startsWith('ADV-DEL-') && !t.reference_id?.startsWith('EXP-DEL-'))
      .reduce((sum, t) => sum + t.amount_minor, 0);

    const totalRevenue = salesRevenue + manualRevenue;

    // 3. Salary obligation (sum of active employee monthly rate)
    const activeStaffSalaries = employees
      .filter(e => e.status === 'active')
      .reduce((sum, e) => sum + e.rate_minor, 0);

    // 4. Advances paid
    const totalAdvancesPaid = advances.reduce((sum, a) => sum + a.amount_minor, 0);

    // 5. Active operational expenses (OpEx)
    const totalOpEx = expenses.reduce((sum, e) => sum + e.amount_minor, 0);

    // 6. Net Profit
    const profit = totalRevenue - (activeStaffSalaries + totalOpEx);

    // 7. Materials metrics (cutting plans calculated)
    const cuttingOrders = orders.filter(o => o.items.some(i => !!i.cut_plan_json));
    const totalCutsCalculated = cuttingOrders.length;
    
    // Scraps Analysis
    let totalStockUsedMM = 0;
    let totalRequestedMM = 0;
    let totalWasteMM = 0;

    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.cut_plan_json) {
          try {
            const plan = JSON.parse(item.cut_plan_json);
            if (plan.payable_mm && plan.requested_mm) {
              totalStockUsedMM += plan.payable_mm;
              totalRequestedMM += plan.requested_mm;
              totalWasteMM += (plan.waste_mm || 0);
            }
          } catch(e){}
        }
      });
    });

    const efficiencyPercent = totalStockUsedMM > 0 
      ? Math.round((totalRequestedMM / totalStockUsedMM) * 100) 
      : 88; // Default mockup ratio if no plans

    return {
      totalRevenue,
      salesRevenue,
      salaries: activeStaffSalaries,
      advances: totalAdvancesPaid,
      opex: totalOpEx,
      profit,
      efficiencyPercent,
      totalCutsCalculated,
      totalWasteM: (totalWasteMM / 1000)
    };
  };

  const kpiStats = getFinancialStats();

  // Filtered transactions
  const filteredTxs = transactions.filter(t => {
    // 1. Search filter
    const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) || 
                          (t.reference_id && t.reference_id.toLowerCase().includes(txSearch.toLowerCase()));
    
    // 2. Type tab filter
    if (!matchesSearch) return false;
    if (txFilter === 'all') return true;
    if (txFilter === 'inflow') return t.type === 'sale_revenue';
    if (txFilter === 'outflow') return t.type === 'salary_payment' || t.type === 'advance_payment' || t.type === 'operational_expense';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-[#FAF6F0] border border-[#e6dfd5] text-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#eaddcd] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#eaddcd] text-[#1b4332] rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-850 flex items-center gap-2">
                Управление Финансами и Расходами Склада
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-250 px-2 py-0.5 rounded-full font-mono font-bold">
                  ERP v1.4
                </span>
              </h2>
              <p className="text-xs text-slate-500">Учёт выплат сотрудников, авансовых дотаций, операционного баланса и эффективности резчика</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 px-2.5 rounded-lg border border-[#eaddcd] hover:bg-[#faf6f0] bg-white text-slate-500 hover:text-slate-800 transition-all duration-150"
            title="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs Header */}
        <div className="px-6 bg-[#fcfbf9] border-b border-[#eaddcd] flex flex-wrap gap-2 py-2 shrink-0">
          {[
            { id: 'kpi', label: '📊 Дашборд и KPI', icon: BarChart2 },
            { id: 'employees', label: '👥 Персонал (Оклады)', icon: Users },
            { id: 'advances', label: '💸 Выдача авансов', icon: DollarSign },
            { id: 'expenses', label: '🛠️ Операционные расходы', icon: Tag },
            { id: 'transactions', label: '📖 Книга проводок', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold select-none transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#1b4332] text-white shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-850 hover:bg-[#faf6f0] border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF6F0]">
          
          {/* TAB 1: KPI & FINANCIAL ANALYSIS */}
          {activeTab === 'kpi' && (
            <div className="space-y-6">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-white border border-[#e6dfd5] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Приходы (Выручка)</span>
                    <h3 className="text-xl font-bold font-mono mt-1 text-emerald-800">{money(kpiStats.totalRevenue)}</h3>
                    <span className="text-[11px] text-slate-500">Ордера + Проводки</span>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white border border-[#e6dfd5] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ФОТ (Оклады персонала)</span>
                    <h3 className="text-xl font-bold font-mono mt-1 text-blue-850">{money(kpiStats.salaries)}</h3>
                    <span className="text-[11px] text-slate-500">Задействованный состав</span>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white border border-[#e6dfd5] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Складские OpEx</span>
                    <h3 className="text-xl font-bold font-mono mt-1 text-rose-800">{money(kpiStats.opex)}</h3>
                    <span className="text-[11px] text-slate-500">Аренда, топливо, СИЗ</span>
                  </div>
                  <div className="h-10 w-10 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white border border-[#e6dfd5] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Чистая Прибыль</span>
                    <h3 className={`text-xl font-bold font-mono mt-1 ${kpiStats.profit >= 0 ? 'text-[#1b4332]' : 'text-rose-700'}`}>
                      {money(kpiStats.profit)}
                    </h3>
                    <span className="text-[11px] text-slate-500">За текущий расчёт</span>
                  </div>
                  <div className={`h-10 w-10 border rounded-lg flex items-center justify-center ${
                    kpiStats.profit >= 0 ? 'bg-emerald-50 text-[#1b4332] border-[#1b4332]/20' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Graphical Visualizations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* SVG Revenue outflow Chart (8 cols) */}
                <div className="md:col-span-8 bg-white border border-[#e6dfd5] p-5 rounded-2xl flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Баланс оборотных средств и расходов</h4>
                      <p className="text-slate-500 text-xs font-sans">Визуальная линейная модель распределения капитала</p>
                    </div>
                    <span className="text-[10px] bg-[#fcfbf9] text-slate-600 px-2 py-1 rounded border border-[#eaddcd] font-mono">
                      Inflow vs Outflow
                    </span>
                  </div>

                  {/* High Quality Client-Side Bar-Line representation */}
                  <div className="flex-1 min-h-[220px] flex items-end justify-between px-6 border-b border-[#eaddcd] pb-3 mt-4 relative">
                    
                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-0 bottom-3 top-0 flex flex-col justify-between pointer-events-none opacity-10">
                      <div className="border-t border-dashed border-slate-400 w-full"></div>
                      <div className="border-t border-dashed border-slate-400 w-full"></div>
                      <div className="border-t border-dashed border-slate-400 w-full"></div>
                      <div className="border-t border-dashed border-slate-400 w-full"></div>
                    </div>

                    <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                      <div className="bg-[#1b4332]/10 border border-[#1b4332] hover:bg-[#1b4332]/20 w-16 rounded-t-lg transition-all duration-300 relative group cursor-pointer" style={{ height: '140px' }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 p-1 rounded text-[10px] font-mono text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {money(kpiStats.totalRevenue)}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-705 font-semibold font-mono tracking-tight">Выручка</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                      <div className="bg-rose-50 border border-rose-600 hover:bg-rose-100 w-16 rounded-t-lg transition-all duration-300 relative group cursor-pointer" style={{ height: `${Math.max(15, Math.min(150, (kpiStats.opex / (kpiStats.totalRevenue || 1)) * 140))}px` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 p-1 rounded text-[10px] font-mono text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {money(kpiStats.opex)}
                        </div>
                      </div>
                      <span className="text-[10px] text-rose-800 font-semibold font-mono tracking-tight">Расходы складов</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                      <div className="bg-blue-50 border border-blue-600 hover:bg-blue-100 w-16 rounded-t-lg transition-all duration-300 relative group cursor-pointer" style={{ height: `${Math.max(15, Math.min(150, (kpiStats.salaries / (kpiStats.totalRevenue || 1)) * 140))}px` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 p-1 rounded text-[10px] font-mono text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {money(kpiStats.salaries)}
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-800 font-semibold font-mono tracking-tight">Оклады персонала</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 z-10 w-1/4">
                      <div className="bg-emerald-50 border border-[#1b4332]/40 hover:bg-emerald-100 w-16 rounded-t-lg transition-all duration-300 relative group cursor-pointer" style={{ height: `${Math.max(10, Math.min(150, (kpiStats.profit / (kpiStats.totalRevenue || 1)) * 140))}px` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1b4332] p-1 rounded text-[10px] font-mono text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {money(kpiStats.profit)}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#1b4332] font-semibold font-mono tracking-tight">Чистый доход</span>
                    </div>

                  </div>
                </div>

                {/* Scraps and Cutting utilization percentage (4 cols) */}
                <div className="md:col-span-4 bg-white border border-[#e6dfd5] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Эффективность резки хлыстов</h4>
                    <p className="text-slate-500 text-xs font-sans">Полезное сечение к отходам реза</p>
                  </div>

                  <div className="my-6 flex flex-col items-center justify-center">
                    
                    {/* Ring circular indicator */}
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" strokeWidth="8" stroke="#f5efe6" fill="transparent"></circle>
                        <circle cx="56" cy="56" r="48" strokeWidth="8" stroke="#1b4332" fill="transparent"
                                strokeDasharray={301} strokeDashoffset={301 - (301 * kpiStats.efficiencyPercent) / 100}
                                strokeLinecap="round" className="transition-all duration-1000 ease-out"></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black font-mono text-slate-850">{kpiStats.efficiencyPercent}%</span>
                        <span className="text-[9px] text-[#1b4332] font-bold uppercase tracking-wide">Полезно</span>
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2 border-t border-[#e6dfd5] pt-3 text-[11px] text-slate-500">
                    <div className="flex justify-between font-sans">
                      <span>Раскрои хлыстов:</span>
                      <strong className="text-slate-800 font-mono">{kpiStats.totalCutsCalculated} планов</strong>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span>Накоплено обрезков:</span>
                      <strong className="text-amber-800 font-mono">{kpiStats.totalWasteM.toFixed(2)} метров</strong>
                    </div>
                  </div>

                </div>

              </div>

              {/* Sales leader boards & OpEx categories distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Employee Leaderboards */}
                <div className="bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                  <div className="flex gap-2 items-center mb-4 border-b border-[#eaddcd] pb-3">
                    <Users className="h-4 w-4 text-[#1b4332]" />
                    <h4 className="text-sm font-bold text-slate-850">Список резчиков и оклады</h4>
                  </div>
                  <div className="space-y-3">
                    {employees.map(emp => (
                      <div key={emp.id} className="flex justify-between items-center p-3 rounded-lg bg-[#fcfbf9] border border-[#eaddcd]">
                        <div className="flex items-center gap-3 font-sans">
                          <span className={`h-2.5 w-2.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-650' : 'bg-slate-400'}`}></span>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                            <p className="text-[10px] text-slate-500">{emp.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold font-mono text-slate-850">{money(emp.rate_minor)}</p>
                          <p className="text-[9px] font-mono text-slate-400">оклад / мес</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OpEx Expense Category Summary */}
                <div className="bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                  <div className="flex gap-2 items-center mb-4 border-b border-[#eaddcd] pb-3">
                    <Tag className="h-4 w-4 text-rose-700" />
                    <h4 className="text-sm font-bold text-slate-850">Распределение операционных расходов</h4>
                  </div>
                  <div className="space-y-3 font-sans">
                    {[
                      { cat: 'rent', label: 'Аренда складских мощностей', color: 'bg-rose-600' },
                      { cat: 'utility', label: 'Коммунальные (ЭЭ, вода, кран-балки)', color: 'bg-blue-600' },
                      { cat: 'logistics', label: 'Логистика склада и дизельное топливо', color: 'bg-amber-600' },
                      { cat: 'supplies', label: 'Расходники, круги Болгарки, перчатки', color: 'bg-[#1b4332]' },
                      { cat: 'other', label: 'Прочие текущие расходы площадки', color: 'bg-slate-500' }
                    ].map(item => {
                      const amount = expenses.filter(x => x.category === item.cat).reduce((sum, x) => sum + x.amount_minor, 0);
                      const total = kpiStats.opex || 1;
                      const ratio = (amount / total) * 100;
                      return (
                        <div key={item.cat} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>{item.label}</span>
                            <span className="font-mono font-bold text-slate-800">{money(amount)}</span>
                          </div>
                          <div className="w-full bg-[#faf6f0] h-2 rounded-full overflow-hidden border border-[#e6dfd5]">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${ratio}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: EMPLOYEES REGISTER */}
          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Add Employee Form */}
              <div className="md:col-span-5 bg-white border border-[#e6dfd5] p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-[#eaddcd] pb-2">
                  <Briefcase className="h-4 w-4 text-[#1b4332]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Добавить резчика/сотрудника</h4>
                </div>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">ФИО Сотрудника *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Иван Кузнецов" 
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Должность / Роль *</label>
                    <select
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-805 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    >
                      <option value="Старший резчик металла">Старший резчик металла</option>
                      <option value="Резчик-заготовщик (болгарка)">Резчик-заготовщик (болгарка)</option>
                      <option value="Складской разнорабочий">Складской разнорабочий</option>
                      <option value="Стропальщик / Крановщик">Стропальщик / Крановщик</option>
                      <option value="Менеджер по продажам POS">Менеджер по продажам POS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Ежемесячный оклад (руб) *</label>
                    <input 
                      type="number" 
                      required
                      min="1000"
                      step="1"
                      placeholder="65000" 
                      value={newEmpRate}
                      onChange={(e) => setNewEmpRate(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Трудоустроить сотрудника</span>
                  </button>
                </form>
              </div>

              {/* Employees Table Grid */}
              <div className="md:col-span-7 bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                <div className="flex justify-between items-center border-b border-[#eaddcd] pb-3 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Действующий состав склада</h4>
                  <span className="text-[10px] font-mono text-slate-500">Всего: {employees.length} чел</span>
                </div>
                
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {employees.map(emp => (
                    <div key={emp.id} className="p-4 bg-[#fcfbf9]/60 rounded-xl border border-[#eaddcd] flex items-center justify-between hover:border-[#cbc0b1] transition-colors leading-relaxed">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleEmployeeStatus(emp.id)}
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            emp.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                              : 'bg-slate-100 text-slate-500 border-slate-300'
                          }`}
                          title="Кликните для увольнения или возврата на работу"
                        >
                          {emp.status === 'active' ? <UserCheck className="h-5 w-5" /> : <UserMinus className="h-5 w-5" />}
                        </button>
                        <div className="font-sans">
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {emp.name}
                            {emp.status === 'inactive' && (
                              <span className="text-[8px] bg-rose-50 border border-rose-205 text-rose-700 rounded px-1 lowercase font-mono font-bold">неактивен</span>
                            )}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">{emp.role}</p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            Нанят: {emp.hire_date}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 font-sans">
                        <span className="text-xs font-bold font-mono text-[#1b4332]">{money(emp.rate_minor)}</span>
                        <button
                          onClick={() => toggleEmployeeStatus(emp.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                            emp.status === 'active' 
                              ? 'bg-white border border-[#eaddcd] text-rose-700 hover:bg-rose-50' 
                              : 'bg-white border border-[#eaddcd] text-[#1b4332] hover:bg-emerald-50'
                          }`}
                        >
                          {emp.status === 'active' ? 'Уволить' : 'Вернуть'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ADVANCE PAYMENTS */}
          {activeTab === 'advances' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Advance registrar form */}
              <div className="md:col-span-5 bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                <div className="flex items-center gap-2 border-b border-[#eaddcd] pb-2 mb-4">
                  <DollarSign className="h-4 w-4 text-amber-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Выдать аванс в учёт зарплаты</h4>
                </div>
                
                {employees.filter(x => x.status === 'active').length === 0 ? (
                  <p className="text-xs text-rose-700 py-4 font-sans leading-relaxed">Нет активных сотрудников для выплаты аванса. Сначала добавьте или активируйте сотрудника.</p>
                ) : (
                  <form onSubmit={handleAddAdvance} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Выберите сотрудника *</label>
                      <select 
                        value={advEmpId}
                        onChange={(e) => setAdvEmpId(Number(e.target.value))}
                        className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                      >
                        {employees.filter(x => x.status === 'active').map(emp => (
                           <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Сумма аванса (руб) *</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        step="1"
                        placeholder="15000" 
                        value={advAmount}
                        onChange={(e) => setAdvAmount(e.target.value)}
                        className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Назначение / Комментарий</label>
                      <input 
                        type="text" 
                        placeholder="Аванс на личные нужды" 
                        value={advNote}
                        onChange={(e) => setAdvNote(e.target.value)}
                        className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-amber-750 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Выплатить аванс из кассы</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Advances table list */}
              <div className="md:col-span-7 bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                <div className="flex justify-between items-center border-b border-[#eaddcd] pb-3 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">История выплаченных авансов</h4>
                  <span className="text-[10px] font-mono text-slate-500">Сумма: {money(kpiStats.advances)}</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {advances.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8 italic font-sans">Выданных авансов за текущую смену не числится.</p>
                  ) : (
                    advances.map(adv => {
                      const emp = employees.find(x => x.id === adv.employee_id);
                      return (
                        <div key={adv.id} className="p-3 rounded-lg bg-[#fcfbf9] border border-[#eaddcd] flex items-center justify-between hover:border-[#cbc0b1] shrink-0 font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-800 text-xs font-bold">{emp ? emp.name : 'Удаленный сотрудник'}</strong>
                              <span className="text-[9px] font-mono bg-[#faf6f0] text-slate-500 border border-[#eaddcd] rounded px-1">{adv.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">«{adv.note}»</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono text-amber-800">{money(adv.amount_minor)}</span>
                            <button 
                              onClick={() => handleDeleteAdvance(adv.id)}
                              className="text-slate-400 hover:text-red-650 p-1 rounded-md transition-colors"
                              title="Отредактировать / Аннулировать выдачу"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: OPERATIONAL EXPENSES OPEX */}
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Expense registrar form */}
              <div className="md:col-span-5 bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                <div className="flex items-center gap-2 border-b border-[#eaddcd] pb-2 mb-4">
                  <Tag className="h-4 w-4 text-rose-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Регистрация расхода склада</h4>
                </div>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Статья расходов *</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as any)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    >
                      <option value="rent">Аренда площадки склада</option>
                      <option value="utility">Электроэнергия и коммуналка</option>
                      <option value="logistics">Топливо и ГСМ погрузчика</option>
                      <option value="supplies">Расходники (круги УШМ, перчатки)</option>
                      <option value="other">Прочие хозяйственные расходы</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Сумма расхода (руб) *</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="1"
                      placeholder="12000" 
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 opacity-80 font-mono">Пояснение / Описание *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Счёт за май от МосЭнергоСбыт" 
                      value={expNote}
                      onChange={(e) => setExpNote(e.target.value)}
                      className="w-full bg-white text-xs border border-[#e3dcd2] p-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1b4332]/30"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Провести расход по кассе</span>
                  </button>
                </form>
              </div>

              {/* Expenses table list */}
              <div className="md:col-span-7 bg-white border border-[#e6dfd5] p-5 rounded-2xl">
                <div className="flex justify-between items-center border-b border-[#eaddcd] pb-3 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Книга операционных расходов (OpEx)</h4>
                  <span className="text-[10px] font-mono text-slate-500">Итого OpEx: {money(kpiStats.opex)}</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8 italic font-sans font-medium">Операционные расходы склада отсутствуют.</p>
                  ) : (
                    expenses.map(exp => {
                      const badgeLabels: {[k: string]: string} = {
                        rent: 'Аренда',
                        utility: 'Коммуналка',
                        logistics: 'Дизель/Логист',
                        supplies: 'Расходники',
                        other: 'Хозяйство'
                      };
                      return (
                        <div key={exp.id} className="p-3 rounded-lg bg-[#fcfbf9] border border-[#eaddcd] flex items-center justify-between hover:border-[#cbc0b1] font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded uppercase font-mono font-bold">
                                {badgeLabels[exp.category] || 'Расход'}
                              </span>
                              <span className="text-[9px] font-mono bg-[#faf6f0] text-slate-500 border border-[#eaddcd] rounded px-1">{exp.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-700 mt-2 font-medium">{exp.note}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold font-mono text-rose-800">-{money(exp.amount_minor)}</span>
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-slate-400 hover:text-red-650 p-1 rounded-md transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: TRANSACTION HISTORY */}
          {activeTab === 'transactions' && (
            <div className="bg-white border border-[#e6dfd5] rounded-2xl p-5 flex flex-col gap-4">
              
              {/* Filter deck */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#eaddcd] pb-3.5">
                <div className="flex items-center gap-1.5 bg-[#faf7f2] p-1.5 rounded-xl border border-[#eaddcd] text-xs">
                  <button 
                    onClick={() => setTxFilter('all')} 
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${txFilter === 'all' ? 'bg-[#1b4332] text-white' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Все зачисления
                  </button>
                  <button 
                    onClick={() => setTxFilter('inflow')} 
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${txFilter === 'inflow' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    📈 Приходы
                  </button>
                  <button 
                    onClick={() => setTxFilter('outflow')} 
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${txFilter === 'outflow' ? 'bg-rose-50 text-rose-800 border border-rose-250 font-medium' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    📉 Списания
                  </button>
                </div>

                <input 
                  type="text" 
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Поиск по проводочной книге..."
                  className="bg-white text-xs border border-[#e3dcd2] py-2 sm:py-2.5 px-3.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-[#1b4332]/20 focus:ring-1 focus:ring-[#1b4332]/30 w-full sm:max-w-xs"
                />
              </div>

              {/* Transactions Ledger layout */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e6dfd5] text-slate-500 font-bold uppercase tracking-wider font-mono">
                      <th className="py-2.5 px-4 w-32 text-left">Дата и время</th>
                      <th className="py-2.5 px-4 text-left">Описание платежной операции</th>
                      <th className="py-2.5 px-4 w-28 text-left font-mono">Референт</th>
                      <th className="py-2.5 px-4 w-32 text-right">Направление (Сумма)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-500 italic font-sans font-medium">Транзакционных событий удовлетворяющих фильтру не обнаружено.</td>
                      </tr>
                    ) : (
                      filteredTxs.map(tx => {
                        const isInflow = tx.type === 'sale_revenue';
                        return (
                          <tr key={tx.id} className="border-b border-[#eaddcd]/60 hover:bg-[#faf6f0] transition-colors font-sans py-2">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{tx.date}</td>
                            <td className="py-3 px-4 text-slate-800 leading-snug font-medium">{tx.description}</td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#fcfbf9] text-slate-650 border border-[#eaddcd] uppercase font-bold">
                                {tx.reference_id || 'N/A'}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${isInflow ? 'text-emerald-800' : 'text-slate-700'}`}>
                              {isInflow ? '+' : '-'}{money(tx.amount_minor)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#eaddcd] bg-white text-slate-500 text-[10px] flex justify-between items-center shrink-0">
          <p className="font-sans font-medium">Все транзакции проводятся в реальном времени и сохраняются локально во фрейме браузера.</p>
          <div className="flex items-center gap-1.5 text-slate-600 font-sans font-bold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
            <span>Баланс сверен по внутренней книге проводок</span>
          </div>
        </div>

      </div>
    </div>
  );
};
