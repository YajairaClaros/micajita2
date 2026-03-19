import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  CreditCard, 
  BarChart3,
  Vault,
  BookOpen
} from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { useCaja } from '../context/CajaContext';
import { motion } from 'framer-motion';
import logo from './miCAJIAAA.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const { speak, speakOnClick } = useTTS();
  const { balance } = useCaja();

  const menuItems = [
    { path: '/miembros', label: 'Miembros', icon: Users, color: 'bg-blue-500', description: 'Gestionar personas' },
    { path: '/directorio', label: 'Directorio', icon: BookOpen, color: 'bg-rose-500', description: 'Negocios y favores' },
    { path: '/reuniones', label: 'Reuniones', icon: Calendar, color: 'bg-purple-500', description: 'Actividades y eventos' },
    { path: '/asistencias', label: 'Asistencia', icon: CheckSquare, color: 'bg-emerald-500', description: 'Pasar lista' },
    { path: '/pagos', label: 'Pagos', icon: CreditCard, color: 'bg-orange-500', description: 'Cuotas y donaciones' },
    { path: '/reportes', label: 'Reportes', icon: BarChart3, color: 'bg-indigo-500', description: 'Ver resultados' },
    { path: '/caja-fuerte', label: 'Caja & Calculadora', icon: Vault, color: 'bg-slate-700', description: 'Balance y cuentas' },
  ];

  const handleCardClick = (item: typeof menuItems[0]) => {
    speakOnClick(`Abriendo ${item.label}. ${item.description}`, () => navigate(item.path));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 flex flex-col items-center">
        <img 
          src={logo} 
          alt="MiCajita Logo" 
          className="w-24 h-24 object-contain mb-2"
        />
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido a MiCajita</h2>
          <p className="text-gray-500">¿Qué quieres hacer hoy?</p>
        </div>
      </div>

      {/* Balance General */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Vault size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">Balance Total en Caja</p>
          <h3 className="text-5xl font-black tracking-tighter">
            ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Actualizado ahora
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(item)}
              className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center group"
            >
              <div className={`w-20 h-20 ${item.color} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={40} />
              </div>
              <span className="text-xl font-bold text-gray-900">{item.label}</span>
              <span className="text-sm text-gray-500 mt-1">{item.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
