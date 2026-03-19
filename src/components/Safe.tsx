import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vault, 
  TrendingUp, 
  TrendingDown, 
  History, 
  Plus, 
  Minus,
  Trash2,
  Calendar,
  Calculator as CalcIcon,
  Coins,
  Banknote,
  Delete,
  ArrowLeftRight,
  Utensils,
  Wrench,
  Users,
  HelpCircle,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import { useCaja } from '../context/CajaContext';
import { useTTS } from '../hooks/useTTS';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Denomination {
  value: number;
  label: string;
  type: 'coin' | 'bill';
  color: string;
}

const DENOMINATIONS: Denomination[] = [
  { value: 0.01, label: '1¢ Centavo', type: 'coin', color: 'bg-amber-700' },
  { value: 0.05, label: '5¢ Cinco centavos', type: 'coin', color: 'bg-gray-400' },
  { value: 0.10, label: '10¢ Diez centavos', type: 'coin', color: 'bg-gray-400' },
  { value: 0.25, label: '25¢ Quarter', type: 'coin', color: 'bg-gray-400' },
  { value: 1, label: '$1 Moneda', type: 'coin', color: 'bg-yellow-500' },
  { value: 1, label: '$1 Billete', type: 'bill', color: 'bg-emerald-500' },
  { value: 5, label: '$5 Billete', type: 'bill', color: 'bg-emerald-600' },
  { value: 10, label: '$10 Billete', type: 'bill', color: 'bg-emerald-700' },
  { value: 20, label: '$20 Billete', type: 'bill', color: 'bg-green-800' },
  { value: 50, label: '$50 Billete', type: 'bill', color: 'bg-amber-600' },
  { value: 100, label: '$100 Billete', type: 'bill', color: 'bg-orange-800' },
];

const CATEGORIES = [
  { id: 'comida', label: 'Comida', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'materiales', label: 'Materiales', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
  { id: 'cuota', label: 'Cuota Miembros', icon: Users, color: 'bg-purple-100 text-purple-600' },
  { id: 'otro', label: 'Otro', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' },
];

export default function Safe() {
  const { balance, totalIncome, totalExpenses, transactions, addTransaction, clearHistory } = useCaja();
  const { speak } = useTTS();
  
  // Calculator State
  const [calcTotal, setCalcTotal] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<'money' | 'numeric'>('money');
  const [numericValue, setNumericValue] = useState<string>('');
  
  // Transaction Flow State
  const [step, setStep] = useState<'calc' | 'type' | 'category'>('calc');
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const addCalcAmount = (val: number, label: string) => {
    setCalcTotal(prev => parseFloat((prev + val).toFixed(2)));
    speak(`Sumando ${label}. Total actual: ${calcTotal + val} pesos`);
  };

  const clearCalc = () => {
    setCalcTotal(0);
    setNumericValue('');
    setStep('calc');
    setSelectedType(null);
    setSelectedCategory(null);
    speak('Calculadora reiniciada');
  };

  const handleNumericInput = (num: string) => {
    if (num === '.' && numericValue.includes('.')) return;
    const newValue = numericValue + num;
    setNumericValue(newValue);
    setCalcTotal(parseFloat(newValue) || 0);
  };

  const backspace = () => {
    const newValue = numericValue.slice(0, -1);
    setNumericValue(newValue);
    setCalcTotal(parseFloat(newValue) || 0);
  };

  const handleTypeSelect = (type: 'income' | 'expense') => {
    if (calcTotal <= 0) {
      speak('Por favor, ingresa un monto primero');
      return;
    }
    setSelectedType(type);
    setStep('category');
    speak(`Has seleccionado ${type === 'income' ? 'Ingreso' : 'Egreso'}. Ahora elige una categoría.`);
  };

  const handleCategorySelect = (catId: string, catLabel: string) => {
    if (!selectedType) return;
    
    addTransaction(selectedType, calcTotal, catLabel);
    speak(`${selectedType === 'income' ? 'Ingreso' : 'Egreso'} de ${calcTotal} pesos por ${catLabel} guardado correctamente.`);
    
    // Reset
    clearCalc();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Vault className="text-blue-600" />
          Caja Fuerte
        </h2>
        <button 
          onClick={() => {
            clearHistory();
            speak('Historial de caja vaciado');
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Vaciar historial"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Resumen de Caja */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Balance Total</p>
          <h3 className={`text-4xl font-black ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 text-center"
        >
          <div className="flex justify-center mb-2">
            <TrendingUp className="text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Ingresos</p>
          <h3 className="text-2xl font-black text-emerald-700">
            ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h3>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 text-center"
        >
          <div className="flex justify-center mb-2">
            <TrendingDown className="text-red-600" />
          </div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Total Egresos</p>
          <h3 className="text-2xl font-black text-red-700">
            ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h3>
        </motion.div>
      </div>

      {/* Interfaz Principal de Conteo y Registro */}
      <div className="bg-white p-6 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <CalcIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Registrar Dinero</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Calculadora con Iconos</p>
            </div>
          </div>
          <button 
            onClick={clearCalc}
            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Pantalla de Total */}
        <motion.div 
          layout
          className="bg-gray-900 p-8 rounded-[2.5rem] text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 relative z-10">Monto a Registrar</p>
          <h4 className="text-6xl font-black text-white tracking-tighter relative z-10">
            ${calcTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h4>
        </motion.div>

        {/* Flujo de Pasos */}
        <AnimatePresence mode="wait">
          {step === 'calc' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCalcMode(calcMode === 'money' ? 'numeric' : 'money');
                    speak(`Cambiando a modo ${calcMode === 'money' ? 'teclado numérico' : 'conteo de dinero'}`);
                  }}
                  className="flex-1 py-4 bg-gray-100 rounded-3xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftRight size={18} />
                  {calcMode === 'money' ? 'Usar Teclado' : 'Usar Monedas'}
                </button>
              </div>

              {calcMode === 'money' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {DENOMINATIONS.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => addCalcAmount(d.value, d.label)}
                      className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-90"
                    >
                      <div className={`w-12 h-12 rounded-full ${d.color} flex items-center justify-center text-white shadow-md`}>
                        {d.type === 'coin' ? <Coins size={24} /> : <Banknote size={24} />}
                      </div>
                      <p className="font-black text-gray-900 text-sm">${d.value < 1 ? `${d.value * 100}¢` : d.value}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleNumericInput(n.toString())}
                      className="h-16 bg-gray-50 rounded-3xl text-2xl font-black text-gray-900 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all active:scale-90"
                    >
                      {n}
                    </button>
                  ))}
                  <button onClick={backspace} className="h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center hover:bg-red-100 transition-all active:scale-90">
                    <Delete size={24} />
                  </button>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => handleTypeSelect('income')}
                  disabled={calcTotal <= 0}
                  className={`flex-1 py-6 rounded-[2rem] font-black text-xl flex flex-col items-center gap-2 transition-all shadow-lg ${
                    calcTotal > 0 ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Plus size={32} />
                  <span>INGRESO</span>
                </button>
                <button
                  onClick={() => handleTypeSelect('expense')}
                  disabled={calcTotal <= 0}
                  className={`flex-1 py-6 rounded-[2rem] font-black text-xl flex flex-col items-center gap-2 transition-all shadow-lg ${
                    calcTotal > 0 ? 'bg-red-600 text-white shadow-red-600/20 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Minus size={32} />
                  <span>EGRESO</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h4 className={`text-2xl font-black ${selectedType === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  ¿En qué se usó el dinero?
                </h4>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Selecciona un dibujo</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id, cat.label)}
                      className={`p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-md ${cat.color}`}
                    >
                      <Icon size={48} />
                      <span className="font-black text-lg uppercase tracking-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setStep('calc');
                  speak('Volviendo a la calculadora');
                }}
                className="w-full py-4 bg-gray-100 text-gray-500 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <X size={20} />
                Atrás
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Historial de Movimientos */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="text-gray-400" />
            <h4 className="font-black text-gray-900 uppercase tracking-tight">Movimientos Recientes</h4>
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <Vault size={64} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">Caja Vacía</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg leading-none mb-1">{t.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <Calendar size={12} />
                      {format(new Date(t.date), "d 'de' MMMM", { locale: es })}
                    </div>
                  </div>
                </div>
                <p className={`font-black text-2xl tracking-tighter ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
