import React, { useState, useEffect, useRef } from 'react';
import { MOCK_MIEMBROS, MOCK_REUNIONES, MOCK_PAGOS, Miembro, Reunion, Pago } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { useCaja } from '../context/CajaContext';
import { 
  CreditCard, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Filter, 
  Calendar,
  Coins,
  Heart,
  AlertTriangle,
  User,
  Calculator as CalcIcon,
  Banknote,
  Delete,
  ArrowLeftRight,
  Check,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PagoExtended extends Pago {
  miembros: { nombre: string; foto: string };
  reuniones: { titulo: string } | null;
}

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

const PAYMENT_TYPES = [
  { id: 'cuota', label: 'Cuota', icon: Coins, color: 'bg-orange-100 text-orange-600' },
  { id: 'donacion', label: 'Donación', icon: Heart, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'multa', label: 'Multa', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
];

export default function Payments() {
  const [pagos, setPagos] = useState<PagoExtended[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterReunion, setFilterReunion] = useState<string>('all');
  
  // Form Flow State
  const [step, setStep] = useState<'member' | 'calc' | 'type' | 'reunion'>('member');
  const [selectedMiembro, setSelectedMiembro] = useState<Miembro | null>(null);
  const [calcTotal, setCalcTotal] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<'money' | 'numeric'>('money');
  const [numericValue, setNumericValue] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'cuota' | 'donacion' | 'multa'>('cuota');
  const [selectedReunion, setSelectedReunion] = useState<string>('');
  
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { speak, speakOnClick } = useTTS();
  const { addTransaction } = useCaja();

  useEffect(() => {
    fetchInitialData();
    fetchPayments();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filterReunion]);

  async function fetchInitialData() {
    setMiembros(MOCK_MIEMBROS.filter(m => m.activo));
    setReuniones(MOCK_REUNIONES);
  }

  async function fetchPayments() {
    setLoading(true);
    speak('Cargando historial de pagos');
    setTimeout(() => {
      let filtered = MOCK_PAGOS;
      if (filterReunion !== 'all') {
        filtered = filtered.filter(p => p.reunion_id === filterReunion);
      }

      const extended: PagoExtended[] = filtered.map(p => {
        const miembro = MOCK_MIEMBROS.find(m => m.id === p.miembro_id);
        return {
          ...p,
          miembros: { 
            nombre: miembro?.nombre || 'Desconocido',
            foto: miembro?.foto || `https://picsum.photos/seed/unknown/200`
          },
          reuniones: p.reunion_id ? { titulo: MOCK_REUNIONES.find(r => r.id === p.reunion_id)?.titulo || '' } : null
        };
      });

      setPagos(extended);
      setLoading(false);
      speak(`Se han cargado ${extended.length} pagos`);
    }, 500);
  }

  const handleMemberSelect = (m: Miembro) => {
    setSelectedMiembro(m);
    setStep('calc');
    speak(`Has seleccionado a ${m.nombre}. Ahora ingresa el monto.`);
  };

  const addCalcAmount = (val: number, label: string) => {
    setCalcTotal(prev => parseFloat((prev + val).toFixed(2)));
    speak(`Sumando ${label}. Total: ${calcTotal + val} pesos`);
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

  const handleCalcConfirm = () => {
    if (calcTotal <= 0) {
      speak('Por favor, ingresa un monto mayor a cero');
      return;
    }
    setStep('type');
    speak(`Monto de ${calcTotal} pesos. Ahora selecciona el tipo de pago.`);
  };

  const handleTypeSelect = (type: 'cuota' | 'donacion' | 'multa') => {
    setSelectedType(type);
    setStep('reunion');
    speak(`Has seleccionado ${type}. Finalmente, selecciona la reunión si corresponde.`);
  };

  const resetForm = () => {
    setShowForm(false);
    setStep('member');
    setSelectedMiembro(null);
    setCalcTotal(0);
    setNumericValue('');
    setSelectedType('cuota');
    setSelectedReunion('');
  };

  const handleFinalSubmit = () => {
    if (!selectedMiembro || calcTotal <= 0) return;

    const pagoToAdd: PagoExtended = {
      id: Math.random().toString(36).substr(2, 9),
      miembro_id: selectedMiembro.id,
      reunion_id: selectedReunion || null,
      monto: calcTotal,
      tipo: selectedType,
      fecha: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      miembros: { 
        nombre: selectedMiembro.nombre,
        foto: selectedMiembro.foto
      },
      reuniones: selectedReunion ? { titulo: MOCK_REUNIONES.find(r => r.id === selectedReunion)?.titulo || '' } : null
    };

    setPagos([pagoToAdd, ...pagos]);
    
    // Registrar en la Caja Fuerte
    addTransaction('income', pagoToAdd.monto, `Pago de ${pagoToAdd.tipo}: ${selectedMiembro.nombre}`);
    
    setStatus({ type: 'success', message: 'Pago registrado con éxito' });
    speak(`Pago de ${calcTotal} pesos de ${selectedMiembro.nombre} por ${selectedType} registrado con éxito.`);
    
    resetForm();
    setTimeout(() => setStatus(null), 3000);
  };

  const handleListen = (p: PagoExtended) => {
    const dateStr = format(new Date(p.fecha), "d 'de' MMMM", { locale: es });
    speak(`${p.miembros.nombre}. Monto: ${p.monto} pesos. Tipo: ${p.tipo}. Fecha: ${dateStr}. ${p.reuniones ? 'Reunión: ' + p.reuniones.titulo : ''}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="text-orange-600" />
          Pagos
        </h2>
        <button
          onClick={() => {
            if (showForm) speakOnClick('Cancelando registro de pago', () => resetForm());
            else {
              speakOnClick('Abriendo formulario para nuevo pago. Selecciona un miembro.', () => setShowForm(true));
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${
            showForm 
              ? 'bg-red-50 text-red-600 shadow-red-600/10' 
              : 'bg-orange-600 text-white shadow-orange-600/20 hover:scale-105 active:scale-95'
          }`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? 'Cancelar' : 'Nuevo'}</span>
        </button>
      </div>

      {!showForm && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          <Filter size={20} className="text-gray-400 ml-2 flex-shrink-0" />
          <select
            value={filterReunion}
            onChange={(e) => {
              const r = reuniones.find(r => r.id === e.target.value);
              const dateStr = r ? `, del ${format(new Date(r.fecha), "d 'de' MMMM", { locale: es })}` : '';
              speakOnClick(`Filtrando por: ${r ? r.titulo : 'Todas las reuniones'}${dateStr}`, () => setFilterReunion(e.target.value));
            }}
            className="bg-transparent border-none outline-none font-bold text-gray-700 pr-8 min-w-[200px] uppercase tracking-widest text-xs"
          >
            <option value="all">Todas las reuniones</option>
            {reuniones.map(r => (
              <option key={r.id} value={r.id}>{r.titulo}</option>
            ))}
          </select>
        </div>
      )}

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-[2.5rem] flex items-center gap-4 shadow-xl ${
              status.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            <span className="font-black text-lg uppercase tracking-tight">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8"
          >
            {/* Indicador de Pasos */}
            <div className="flex justify-between items-center px-4">
              {['member', 'calc', 'type', 'reunion'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                    step === s ? 'bg-orange-600 text-white' : i < ['member', 'calc', 'type', 'reunion'].indexOf(step) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < ['member', 'calc', 'type', 'reunion'].indexOf(step) ? <Check size={20} /> : i + 1}
                  </div>
                  {i < 3 && <div className={`w-8 sm:w-16 h-1 mx-2 rounded-full ${i < ['member', 'calc', 'type', 'reunion'].indexOf(step) ? 'bg-emerald-200' : 'bg-gray-100'}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 'member' && (
                <motion.div
                  key="member"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900">¿Quién paga?</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Selecciona una foto</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {miembros.map(m => (
                      <button
                        key={m.id}
                        onClick={() => speakOnClick(`Seleccionado ${m.nombre}`, () => handleMemberSelect(m))}
                        className="group flex flex-col items-center gap-3 p-4 rounded-[2.5rem] hover:bg-orange-50 transition-all active:scale-95 border border-transparent hover:border-orange-200"
                      >
                        <div className="relative">
                          <img 
                            src={m.foto} 
                            alt={m.nombre} 
                            className="w-24 h-24 rounded-[2rem] object-cover shadow-md group-hover:shadow-orange-200"
                            referrerPolicy="no-referrer"
                          />
                          {selectedMiembro?.id === m.id && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-black text-gray-900 uppercase tracking-tight text-sm">{m.nombre}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'calc' && (
                <motion.div
                  key="calc"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900">¿Cuánto paga?</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Usa las monedas o el teclado</p>
                  </div>

                  <div className="bg-gray-900 p-8 rounded-[2.5rem] text-center">
                    <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Monto del Pago</p>
                    <h4 className="text-6xl font-black text-white tracking-tighter">
                      ${calcTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => speakOnClick(calcMode === 'money' ? 'Cambiando a teclado numérico' : 'Cambiando a monedas', () => setCalcMode(calcMode === 'money' ? 'numeric' : 'money'))}
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
                          onClick={() => speakOnClick(`Sumando ${d.label}`, () => addCalcAmount(d.value, d.label))}
                          className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-90"
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
                          onClick={() => speakOnClick(`Número ${n}`, () => handleNumericInput(n.toString()))}
                          className="h-16 bg-gray-50 rounded-3xl text-2xl font-black text-gray-900 hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all active:scale-90"
                        >
                          {n}
                        </button>
                      ))}
                      <button onClick={() => speakOnClick('Borrar último dígito', backspace)} className="h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center hover:bg-red-100 transition-all active:scale-90">
                        <Delete size={24} />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => speakOnClick('Volver a selección de miembro', () => setStep('member'))}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Atrás
                    </button>
                    <button
                      onClick={() => speakOnClick(`Confirmar monto de ${calcTotal} pesos`, handleCalcConfirm)}
                      disabled={calcTotal <= 0}
                      className={`flex-[2] py-4 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-lg ${
                        calcTotal > 0 ? 'bg-orange-600 text-white shadow-orange-600/20 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      <span>SIGUIENTE</span>
                      <Check size={24} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'type' && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900">¿Qué tipo de pago es?</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Selecciona un dibujo</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PAYMENT_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => speakOnClick(`Seleccionado tipo ${type.label}`, () => handleTypeSelect(type.id as any))}
                          className={`p-10 rounded-[3rem] flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-md ${type.color}`}
                        >
                          <Icon size={64} />
                          <span className="font-black text-xl uppercase tracking-tight">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => speakOnClick('Volver a ingresar monto', () => setStep('calc'))}
                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Atrás
                  </button>
                </motion.div>
              )}

              {step === 'reunion' && (
                <motion.div
                  key="reunion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900">¿De qué reunión es?</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Opcional: Selecciona una fecha</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => speakOnClick('Sin reunión específica seleccionada', () => setSelectedReunion(''))}
                      className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
                        selectedReunion === '' ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <span className="font-black text-gray-900 uppercase tracking-tight">Sin reunión específica</span>
                      {selectedReunion === '' && <Check className="text-orange-600" />}
                    </button>
                    {reuniones.map(r => (
                      <button
                        key={r.id}
                        onClick={() => speakOnClick(`Seleccionada reunión: ${r.titulo}, del ${format(new Date(r.fecha), "d 'de' MMMM", { locale: es })}`, () => setSelectedReunion(r.id))}
                        className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
                          selectedReunion === r.id ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-black text-gray-900 uppercase tracking-tight">{r.titulo}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{format(new Date(r.fecha), 'dd MMM yyyy', { locale: es })}</p>
                        </div>
                        {selectedReunion === r.id && <Check className="text-orange-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => speakOnClick('Volver a selección de tipo de pago', () => setStep('type'))}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      Atrás
                    </button>
                    <button
                      onClick={() => speakOnClick('Guardando registro de pago', handleFinalSubmit)}
                      className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 size={32} />
                      <span>GUARDAR PAGO</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-24 text-center text-gray-400 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Cargando pagos...</p>
              </div>
            ) : pagos.length === 0 ? (
              <div className="col-span-full p-24 text-center text-gray-400 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <CreditCard size={64} className="mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase tracking-widest text-xs">No hay pagos registrados</p>
              </div>
            ) : (
              pagos.map((p) => (
                <motion.div 
                  layout
                  key={p.id} 
                  className="bg-white p-6 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col gap-5 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={p.miembros.foto} 
                        alt={p.miembros.nombre} 
                        className="w-16 h-16 rounded-[1.5rem] object-cover border border-gray-100 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">{p.miembros.nombre}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {format(new Date(p.fecha), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => speakOnClick(`Escuchar detalles del pago de ${p.miembros.nombre}`, () => handleListen(p))}
                      className="p-3 text-orange-600 bg-orange-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Monto Pagado</p>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">${p.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      p.tipo === 'cuota' ? 'bg-orange-100 text-orange-600' : 
                      p.tipo === 'donacion' ? 'bg-emerald-100 text-emerald-600' : 
                      'bg-red-100 text-red-600'
                    }`}>
                      {p.tipo}
                    </div>
                  </div>
                  
                  {p.reuniones && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 p-3 rounded-2xl font-bold uppercase tracking-widest">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="truncate">{p.reuniones.titulo}</span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
