import React, { useState, useEffect } from 'react';
import { MOCK_MIEMBROS, MOCK_REUNIONES, MOCK_PAGOS, Miembro, Reunion, Pago } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { useCaja } from '../context/CajaContext';
import { CreditCard, Volume2, CheckCircle2, XCircle, Plus, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PagoExtended extends Pago {
  miembros: { nombre: string; foto: string };
  reuniones: { titulo: string } | null;
}

export default function Payments() {
  const [pagos, setPagos] = useState<PagoExtended[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterReunion, setFilterReunion] = useState<string>('all');
  const [newPago, setNewPago] = useState({ 
    miembro_id: '', 
    reunion_id: '', 
    monto: '', 
    tipo: 'cuota' as const,
    fecha: new Date().toISOString().split('T')[0]
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { speak } = useTTS();
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
    // Simulamos carga
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
    }, 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const miembro = MOCK_MIEMBROS.find(m => m.id === newPago.miembro_id);
    const pagoToAdd: PagoExtended = {
      id: Math.random().toString(36).substr(2, 9),
      miembro_id: newPago.miembro_id,
      reunion_id: newPago.reunion_id || null,
      monto: parseFloat(newPago.monto),
      tipo: newPago.tipo,
      fecha: newPago.fecha,
      created_at: new Date().toISOString(),
      miembros: { 
        nombre: miembro?.nombre || 'Desconocido',
        foto: miembro?.foto || `https://picsum.photos/seed/unknown/200`
      },
      reuniones: newPago.reunion_id ? { titulo: MOCK_REUNIONES.find(r => r.id === newPago.reunion_id)?.titulo || '' } : null
    };

    setPagos([pagoToAdd, ...pagos]);
    
    // Registrar en la Caja Fuerte
    addTransaction('income', pagoToAdd.monto, `Pago de ${pagoToAdd.tipo}: ${miembro?.nombre}`);
    
    setStatus({ type: 'success', message: 'Pago registrado con éxito y guardado en caja' });
    speak(`Pago de ${newPago.monto} pesos de ${miembro?.nombre} registrado con éxito`);
    setNewPago({ miembro_id: '', reunion_id: '', monto: '', tipo: 'cuota', fecha: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    
    setTimeout(() => setStatus(null), 3000);
  }

  const handleListen = (p: PagoExtended) => {
    const dateStr = format(new Date(p.fecha), "d 'de' MMMM", { locale: es });
    speak(`${p.miembros.nombre}. Monto: ${p.monto} pesos. Tipo: ${p.tipo}. Fecha: ${dateStr}. ${p.reuniones ? 'Reunión: ' + p.reuniones.titulo : ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            speak(showForm ? 'Cerrando formulario' : 'Abriendo formulario para nuevo pago');
          }}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <Filter size={20} className="text-gray-400 ml-2 flex-shrink-0" />
        <select
          value={filterReunion}
          onChange={(e) => setFilterReunion(e.target.value)}
          className="bg-transparent border-none outline-none font-medium text-gray-700 pr-8 min-w-[150px]"
        >
          <option value="all">Todas las reuniones</option>
          {reuniones.map(r => (
            <option key={r.id} value={r.id}>{r.titulo}</option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span className="font-medium">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Miembro</label>
                <select
                  required
                  value={newPago.miembro_id}
                  onChange={(e) => {
                    setNewPago({ ...newPago, miembro_id: e.target.value });
                    const m = miembros.find(m => m.id === e.target.value);
                    speak(`Seleccionado miembro: ${m?.nombre}`);
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Seleccionar miembro...</option>
                  {miembros.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Reunión (Opcional)</label>
                <select
                  value={newPago.reunion_id}
                  onChange={(e) => setNewPago({ ...newPago, reunion_id: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Sin reunión específica</option>
                  {reuniones.map(r => (
                    <option key={r.id} value={r.id}>{r.titulo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Monto</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={newPago.monto}
                  onChange={(e) => setNewPago({ ...newPago, monto: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <select
                  required
                  value={newPago.tipo}
                  onChange={(e) => {
                    setNewPago({ ...newPago, tipo: e.target.value });
                    speak(`Tipo de pago: ${e.target.value}`);
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="cuota">Cuota</option>
                  <option value="donacion">Donación</option>
                  <option value="multa">Multa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <input
                  required
                  type="date"
                  value={newPago.fecha}
                  onChange={(e) => setNewPago({ ...newPago, fecha: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700"
              >
                Registrar Pago
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            Cargando pagos...
          </div>
        ) : pagos.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            No hay pagos registrados.
          </div>
        ) : (
          pagos.map((p) => (
            <motion.div 
              layout
              key={p.id} 
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={p.miembros.foto} 
                    alt={p.miembros.nombre} 
                    className="w-12 h-12 rounded-2xl object-cover border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{p.miembros.nombre}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {format(new Date(p.fecha), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleListen(p)}
                  className="p-2 text-orange-600 bg-orange-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Monto</p>
                  <p className="text-2xl font-black text-gray-900">${p.monto}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  p.tipo === 'cuota' ? 'bg-orange-100 text-orange-600' : 
                  p.tipo === 'donacion' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  {p.tipo}
                </div>
              </div>
              
              {p.reuniones && (
                <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-xl">
                  <Calendar size={12} />
                  <span className="truncate">{p.reuniones.titulo}</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
