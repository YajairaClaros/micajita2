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
  RotateCcw,
  Keyboard,
  ArrowLeftRight
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

export default function Safe() {
  const { balance, totalIncome, totalExpenses, transactions, addTransaction, clearHistory } = useCaja();
  const { speak } = useTTS();
  const [showForm, setShowForm] = useState<'income' | 'expense' | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Calculator State
  const [calcTotal, setCalcTotal] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<'money' | 'numeric'>('money');
  const [numericValue, setNumericValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !showForm) return;

    const numAmount = parseFloat(amount);
    addTransaction(showForm, numAmount, description);
    
    speak(`${showForm === 'income' ? 'Ingreso' : 'Egreso'} de ${numAmount} pesos guardado correctamente.`);
    
    setAmount('');
    setDescription('');
    setShowForm(null);
  };

  // Calculator Logic
  const addCalcAmount = (val: number, label: string) => {
    setCalcTotal(prev => parseFloat((prev + val).toFixed(2)));
    speak(`Sumando ${label}. Total actual: ${calcTotal + val} pesos`);
  };

  const clearCalc = () => {
    setCalcTotal(0);
    setNumericValue('');
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

  const useCalcValue = () => {
    setAmount(calcTotal.toString());
    setShowCalculator(false);
    speak(`Monto de ${calcTotal} pesos transferido al formulario`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Vault className="text-blue-600" />
          Caja Fuerte
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setShowCalculator(!showCalculator);
              speak(showCalculator ? 'Cerrando calculadora' : 'Abriendo calculadora');
            }}
            className={`p-2 rounded-xl transition-colors ${showCalculator ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Calculadora"
          >
            <CalcIcon size={20} />
          </button>
          <button 
            onClick={clearHistory}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Vaciar historial"
          >
            <Trash2 size={20} />
          </button>
        </div>
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

      {/* Calculadora Integrada */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <CalcIcon size={18} className="text-blue-600" />
                  Calculadora de Conteo
                </h4>
                <button onClick={clearCalc} className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reiniciar</button>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Calculado</p>
                <h5 className="text-4xl font-black text-gray-900">${calcTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h5>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCalcMode(calcMode === 'money' ? 'numeric' : 'money')}
                  className="flex-1 py-3 bg-gray-100 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight size={14} />
                  {calcMode === 'money' ? 'Modo Numérico' : 'Modo Dinero'}
                </button>
                <button
                  onClick={useCalcValue}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Usar este monto
                </button>
              </div>

              {calcMode === 'money' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {DENOMINATIONS.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => addCalcAmount(d.value, d.label)}
                      className="bg-gray-50 p-2 rounded-2xl border border-gray-100 flex flex-col items-center gap-1 hover:bg-blue-50 transition-all active:scale-90"
                    >
                      <div className={`w-8 h-8 rounded-full ${d.color} flex items-center justify-center text-white`}>
                        {d.type === 'coin' ? <Coins size={16} /> : <Banknote size={16} />}
                      </div>
                      <p className="font-black text-gray-900 text-xs">${d.value < 1 ? `${d.value * 100}¢` : d.value}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleNumericInput(n.toString())}
                      className="h-12 bg-gray-50 rounded-2xl text-lg font-black text-gray-900 hover:bg-blue-50"
                    >
                      {n}
                    </button>
                  ))}
                  <button onClick={backspace} className="h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <Delete size={20} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acciones Rápidas */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowForm('income')}
          className="flex-1 py-4 bg-emerald-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} />
          Registrar Ingreso
        </button>
        <button
          onClick={() => setShowForm('expense')}
          className="flex-1 py-4 bg-red-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Minus size={20} />
          Registrar Egreso
        </button>
      </div>

      {/* Formulario de Transacción */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className={`font-bold text-lg ${showForm === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {showForm === 'income' ? 'Nuevo Ingreso' : 'Nuevo Egreso'}
              </h4>
              <button type="button" onClick={() => setShowForm(null)} className="text-gray-400 hover:text-gray-600">
                Cancelar
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase ml-2">Monto ($)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-xl"
                  placeholder="0.00"
                />
                <button 
                  type="button"
                  onClick={() => setShowCalculator(true)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xs uppercase"
                >
                  Calcular
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase ml-2">Descripción</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                placeholder="Ej: Pago de cuota, Compra de materiales..."
              />
            </div>
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-white font-bold transition-all ${
                showForm === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Guardar {showForm === 'income' ? 'Ingreso' : 'Egreso'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Historial de Movimientos */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <History className="text-gray-400" />
          <h4 className="font-bold text-gray-900">Historial de Movimientos</h4>
        </div>
        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Vault size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No hay movimientos registrados</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Calendar size={12} />
                      {format(new Date(t.date), "d 'de' MMMM, HH:mm", { locale: es })}
                    </div>
                  </div>
                </div>
                <p className={`font-black text-lg ${
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
