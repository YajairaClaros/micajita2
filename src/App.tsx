import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  CreditCard, 
  BarChart3, 
  Home,
  Volume2,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react';
import { useTTS } from './hooks/useTTS';
import { CajaProvider } from './context/CajaContext';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Directory from './components/Directory';
import Meetings from './components/Meetings';
import Attendance from './components/Attendance';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Safe from './components/Safe';
import { Vault, BookOpen } from 'lucide-react';
import logo from './components/miCAJIAAA.png';
import { AnimatePresence, motion } from 'framer-motion';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const hasValidSupabase = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

function Navigation() {
  const location = useLocation();
  const { speak, speakOnClick } = useTTS();
  const isFirstMount = useRef(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home, description: 'Pantalla principal', main: true },
    { path: '/pagos', label: 'Pagos', icon: CreditCard, description: 'Cuotas y donaciones', main: true },
    { path: '/caja-fuerte', label: 'Caja', icon: Vault, description: 'Balance y cuentas', main: true },
    { path: '/reportes', label: 'Reportes', icon: BarChart3, description: 'Ver resultados', main: true },
    { path: '/miembros', label: 'Miembros', icon: Users, description: 'Gestionar personas' },
    { path: '/directorio', label: 'Directorio', icon: BookOpen, description: 'Explorar negocios y favores' },
    { path: '/reuniones', label: 'Reuniones', icon: Calendar, description: 'Actividades y eventos' },
    { path: '/asistencias', label: 'Asistencia', icon: CheckSquare, description: 'Pasar lista' },
  ];

  useEffect(() => {
    // Announce page change
    const item = navItems.find(i => i.path === location.pathname);
    if (item) {
      if (isFirstMount.current) {
        speak(`Bienvenido a MiCajita. Estás en: ${item.label}. ${item.description}`);
        isFirstMount.current = false;
      } else {
        speak(`Estás en: ${item.label}. ${item.description}`);
      }
    }
    setIsMenuOpen(false);
  }, [location.pathname]);

  const mainItems = navItems.filter(item => item.main);
  const otherItems = navItems.filter(item => !item.main);

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 pb-12 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900">Más Opciones</h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {otherItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => speakOnClick(`Abriendo ${item.label}`, () => {})}
                      className="flex flex-col items-center p-6 bg-gray-50 rounded-[2rem] hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <Icon size={24} className="text-blue-600" />
                      </div>
                      <span className="font-bold text-gray-900">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:flex-col md:w-24 md:h-full md:border-r md:border-t-0 md:justify-start md:pt-8 md:gap-4">
        {/* Desktop: All items / Mobile: Main items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          // On mobile, only show main items
          if (!item.main) return (
            <Link
              key={item.path}
              to={item.path}
              className={`hidden md:flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 shadow-sm scale-105' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={isActive ? 26 : 24} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => speakOnClick(`Abriendo ${item.label}`, () => {})}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 shadow-sm scale-105' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={isActive ? 26 : 24} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mobile: More Button */}
        <button
          onClick={() => speakOnClick('Ver más opciones', () => setIsMenuOpen(true))}
          className="flex flex-col items-center p-2 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-gray-50 md:hidden"
        >
          <MoreHorizontal size={24} />
          <span className="text-[10px] mt-1 font-semibold opacity-70">Más</span>
        </button>
      </nav>
    </>
  );
}

export default function App() {
  const { speak, speakOnClick } = useTTS();

  return (
    <CajaProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 md:pl-24">
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => speakOnClick('Mi Cajita. Tu aplicación de gestión financiera comunitaria.', () => {})}
            >
              <img 
                src={logo} 
                alt="MiCajita Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">MiCajita</h1>
            </div>
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                speak('Voz detenida');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Detener voz"
            >
              <Volume2 size={20} />
            </button>
          </header>

          <main className="p-4 md:p-8 max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/miembros" element={<Members />} />
              <Route path="/directorio" element={<Directory />} />
              <Route path="/reuniones" element={<Meetings />} />
              <Route path="/asistencias" element={<Attendance />} />
              <Route path="/pagos" element={<Payments />} />
              <Route path="/reportes" element={<Reports />} />
              <Route path="/caja-fuerte" element={<Safe />} />
            </Routes>
          </main>

          <Navigation />
        </div>
      </Router>
    </CajaProvider>
  );
}
