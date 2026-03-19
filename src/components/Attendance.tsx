import { useState, useEffect } from 'react';
import { MOCK_MIEMBROS, MOCK_REUNIONES, MOCK_ASISTENCIAS, Miembro, Reunion, Asistencia } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { CheckSquare, Volume2, CheckCircle2, XCircle, Users, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Attendance() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<string>('');
  const [asistencias, setAsistencias] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { speak } = useTTS();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedReunion) {
      fetchAttendance(selectedReunion);
    }
  }, [selectedReunion]);

  async function fetchInitialData() {
    setLoading(true);
    speak('Cargando datos para asistencia');
    // Simulamos carga
    setTimeout(() => {
      setMiembros(MOCK_MIEMBROS.filter(m => m.activo));
      setReuniones(MOCK_REUNIONES);
      if (MOCK_REUNIONES.length > 0) {
        setSelectedReunion(MOCK_REUNIONES[0].id);
      }
      setLoading(false);
      speak('Datos cargados correctamente');
    }, 500);
  }

  async function fetchAttendance(reunionId: string) {
    const data = MOCK_ASISTENCIAS.filter(a => a.reunion_id === reunionId);
    
    const attendanceMap: Record<string, boolean> = {};
    data.forEach(a => {
      attendanceMap[a.miembro_id] = a.asistio;
    });
    setAsistencias(attendanceMap);
  }

  async function toggleAttendance(miembroId: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setAsistencias(prev => ({ ...prev, [miembroId]: newStatus }));

    const miembro = miembros.find(m => m.id === miembroId);
    speak(`${miembro?.nombre} marcado como ${newStatus ? 'presente' : 'ausente'} (Mock)`);
  }

  const handleListenRow = (m: Miembro) => {
    const isPresent = asistencias[m.id] || false;
    speak(`${m.nombre}. Estado: ${isPresent ? 'Presente' : 'Ausente'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Pasar Asistencia</h2>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <Calendar size={20} className="text-gray-400 ml-2" />
          <select
            value={selectedReunion}
            onChange={(e) => {
              setSelectedReunion(e.target.value);
              const r = reuniones.find(r => r.id === e.target.value);
              speak(`Cambiando a reunión: ${r?.titulo}`);
            }}
            className="bg-transparent border-none outline-none font-medium text-gray-700 pr-8"
          >
            {reuniones.map(r => (
              <option key={r.id} value={r.id}>
                {r.titulo} ({format(new Date(r.fecha), 'dd/MM')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3"
          >
            <XCircle size={20} />
            <span className="font-medium">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            Cargando datos...
          </div>
        ) : miembros.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            No hay miembros activos para pasar lista.
          </div>
        ) : (
          miembros.map((m) => {
            const isPresent = asistencias[m.id] || false;
            return (
              <motion.div 
                layout
                key={m.id} 
                className={`bg-white p-4 rounded-3xl shadow-sm border transition-all flex flex-col items-center text-center gap-3 relative ${
                  isPresent ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-100'
                }`}
              >
                <button
                  onClick={() => toggleAttendance(m.id, isPresent)}
                  className={`relative w-20 h-20 rounded-3xl overflow-hidden border-4 transition-all ${
                    isPresent ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent opacity-60 grayscale'
                  }`}
                >
                  <img 
                    src={m.foto} 
                    alt={m.nombre} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isPresent && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <CheckSquare className="text-white drop-shadow-md" size={32} />
                    </div>
                  )}
                </button>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{m.nombre}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isPresent ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {isPresent ? 'Presente' : 'Ausente'}
                  </p>
                </div>

                <button
                  onClick={() => handleListenRow(m)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Volume2 size={16} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
