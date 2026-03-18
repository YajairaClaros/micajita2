import React, { useState, useEffect } from 'react';
import { MOCK_MIEMBROS, Miembro } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { UserPlus, Volume2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Members() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ nombre: '', telefono: '', email: '', activo: true, foto: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { speak } = useTTS();

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    // Simulamos carga
    setTimeout(() => {
      setMiembros(MOCK_MIEMBROS);
      setLoading(false);
    }, 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const memberToAdd: Miembro = {
      ...newMember,
      id: Math.random().toString(36).substr(2, 9),
      foto: newMember.foto || `https://picsum.photos/seed/${newMember.nombre}/200`,
      created_at: new Date().toISOString()
    };

    setMiembros([memberToAdd, ...miembros]);
    setStatus({ type: 'success', message: 'Miembro creado con éxito (Mock)' });
    speak(`Miembro ${newMember.nombre} creado con éxito`);
    setNewMember({ nombre: '', telefono: '', email: '', activo: true, foto: '' });
    setShowForm(false);
    
    setTimeout(() => setStatus(null), 3000);
  }

  const handleListen = (m: Miembro) => {
    speak(`${m.nombre}. Teléfono: ${m.telefono || 'No disponible'}. Estado: ${m.activo ? 'Activo' : 'Inactivo'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Miembros</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            speak(showForm ? 'Cerrando formulario' : 'Abriendo formulario para nuevo miembro');
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          <span>Nuevo</span>
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre</label>
                <input
                  required
                  type="text"
                  value={newMember.nombre}
                  onChange={(e) => setNewMember({ ...newMember, nombre: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={newMember.telefono}
                  onChange={(e) => setNewMember({ ...newMember, telefono: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Correo electrónico"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">URL de Foto (Opcional)</label>
                <input
                  type="url"
                  value={newMember.foto}
                  onChange={(e) => setNewMember({ ...newMember, foto: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="activo"
                  checked={newMember.activo}
                  onChange={(e) => setNewMember({ ...newMember, activo: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Miembro Activo</label>
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
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
              >
                Guardar Miembro
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
              <div className="h-4 w-32 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ) : miembros.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
            No hay miembros registrados.
          </div>
        ) : (
          miembros.map((m) => (
            <motion.div 
              layout
              key={m.id} 
              className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow relative group"
            >
              <div className="relative">
                <img 
                  src={m.foto} 
                  alt={m.nombre} 
                  className={`w-24 h-24 rounded-3xl object-cover border-4 ${m.activo ? 'border-blue-500' : 'border-gray-200'}`}
                  referrerPolicy="no-referrer"
                />
                {!m.activo && (
                  <div className="absolute inset-0 bg-gray-900/60 rounded-3xl flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Inactivo</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{m.nombre}</h3>
                <p className="text-sm text-gray-500 font-medium">{m.telefono || 'Sin teléfono'}</p>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">{m.email || 'Sin email'}</p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleListen(m)}
                  className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors"
                  title="Escuchar"
                >
                  <Volume2 size={20} />
                </button>
                <button
                  className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
