import { useState, useMemo } from 'react';
import { 
  Search, 
  Briefcase, 
  Heart, 
  UserPlus, 
  ShieldCheck, 
  Phone, 
  Mail,
  Filter,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_MIEMBROS, Miembro } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'original' | 'referred'>('all');
  const { speak, speakOnClick } = useTTS();

  const filteredMembers = useMemo(() => {
    return MOCK_MIEMBROS.filter(member => {
      const matchesSearch = 
        member.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.estilo_vida.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'original' && !member.referido_por) ||
        (filterType === 'referred' && member.referido_por);

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  const getReferrerName = (id: string | null) => {
    if (!id) return null;
    return MOCK_MIEMBROS.find(m => m.id === id)?.nombre || 'Miembro desconocido';
  };

  const handleMemberClick = (member: Miembro) => {
    const referrer = getReferrerName(member.referido_por);
    const originText = member.referido_por 
      ? `Referido por ${referrer}` 
      : 'Miembro original de la comunidad';
    
    const text = `${member.nombre}. Negocio: ${member.negocio}. Estilo de vida: ${member.estilo_vida}. ${originText}.`;
    speak(text);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Directorio de Miembros</h2>
          <p className="text-gray-500">Encuentra colaboradores y conoce a tu comunidad</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, negocio o intereses (ej. frijoles)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'original', 'referred'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                speak(`Filtrando por ${type === 'all' ? 'todos' : type === 'original' ? 'miembros originales' : 'referidos'}`);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'Todos' : type === 'original' ? 'Originales' : 'Referidos'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={member.id}
              onClick={() => handleMemberClick(member)}
              className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {member.referido_por ? <UserPlus size={48} /> : <ShieldCheck size={48} />}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={member.foto} 
                  alt={member.nombre}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{member.nombre}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {member.referido_por ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                        <UserPlus size={10} /> Referido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={10} /> Original
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Briefcase size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Negocio / Actividad</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{member.negocio}</p>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 group-hover:bg-rose-50 transition-colors">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <Heart size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Estilo de Vida</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{member.estilo_vida}</p>
                </div>

                {member.referido_por && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 pl-2">
                    <ArrowRight size={12} />
                    <span>Referido por <span className="font-semibold text-gray-600">{getReferrerName(member.referido_por)}</span></span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakOnClick(`Llamando a ${member.nombre} al ${member.telefono}`, () => {});
                    }}
                    className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Phone size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakOnClick(`Enviando correo a ${member.email}`, () => {});
                    }}
                    className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Mail size={18} />
                  </button>
                </div>
                <button 
                  className="text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMemberClick(member);
                  }}
                >
                  Ver más
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No se encontraron miembros</h3>
          <p className="text-gray-500 mt-2">Prueba con otros términos de búsqueda o filtros</p>
        </div>
      )}
    </div>
  );
}
