import React, { useState, useEffect } from 'react';
import { MOCK_REUNIONES, Reunion } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { Calendar, Volume2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Meetings() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ titulo: '', fecha: '', hora: '', descripcion: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { speak, speakOnClick } = useTTS();

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    setLoading(true);
    speak('Cargando lista de reuniones');
    // Simulamos carga
    setTimeout(() => {
      setReuniones(MOCK_REUNIONES);
      setLoading(false);
      speak(`Se han cargado ${MOCK_REUNIONES.length} reuniones`);
    }, 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const meetingToAdd: Reunion = {
      ...newMeeting,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    setReuniones([meetingToAdd, ...reuniones]);
    setStatus({ type: 'success', message: 'Reunión creada con éxito (Mock)' });
    speak(`Reunión ${newMeeting.titulo} creada con éxito`);
    setNewMeeting({ titulo: '', fecha: '', hora: '', descripcion: '' });
    setShowForm(false);
    
    setTimeout(() => setStatus(null), 3000);
  }

  const handleListen = (r: Reunion) => {
    const dateStr = format(new Date(r.fecha), "eeee d 'de' MMMM", { locale: es });
    speak(`${r.titulo}. Fecha: ${dateStr}. Hora: ${r.hora || 'No especificada'}. ${r.descripcion || ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reuniones</h2>
        <button
          onClick={() => speakOnClick(showForm ? 'Cerrando formulario' : 'Abriendo formulario para nueva reunión', () => setShowForm(!showForm))}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          <Calendar size={20} />
          <span>Nueva</span>
        </button>
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
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Título</label>
                <input
                  required
                  type="text"
                  value={newMeeting.titulo}
                  onChange={(e) => setNewMeeting({ ...newMeeting, titulo: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Título de la reunión"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <input
                  required
                  type="date"
                  value={newMeeting.fecha}
                  onChange={(e) => setNewMeeting({ ...newMeeting, fecha: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Hora</label>
                <input
                  type="time"
                  value={newMeeting.hora}
                  onChange={(e) => setNewMeeting({ ...newMeeting, hora: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={newMeeting.descripcion}
                  onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => speakOnClick('Cancelar creación de reunión', () => setShowForm(false))}
                className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => speak('Guardando reunión')}
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700"
              >
                Guardar Reunión
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando reuniones...</div>
        ) : reuniones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay reuniones registradas.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reuniones.map((r) => (
              <div 
                key={r.id} 
                onClick={() => speakOnClick(`Escuchar detalles de ${r.titulo}`, () => handleListen(r))}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex flex-col items-center justify-center font-bold">
                    <span className="text-xs uppercase">{format(new Date(r.fecha), 'MMM', { locale: es })}</span>
                    <span className="text-lg leading-none">{format(new Date(r.fecha), 'd')}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{r.titulo}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{r.hora || 'Sin hora'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakOnClick(`Escuchar detalles de ${r.titulo}`, () => handleListen(r));
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                    title="Escuchar"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
