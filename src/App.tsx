import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  CreditCard, 
  BarChart3, 
  Home,
  Volume2
} from 'lucide-react';
import { useTTS } from './hooks/useTTS';
import { CajaProvider } from './context/CajaContext';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Meetings from './components/Meetings';
import Attendance from './components/Attendance';
import Payments from './components/Payments';
import Reports from './components/Reports';
import Safe from './components/Safe';
import { Vault } from 'lucide-react';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const hasValidSupabase = Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

function Navigation() {
  const location = useLocation();
  const { speak } = useTTS();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/miembros', label: 'Miembros', icon: Users },
    { path: '/reuniones', label: 'Reuniones', icon: Calendar },
    { path: '/asistencias', label: 'Asistencia', icon: CheckSquare },
    { path: '/pagos', label: 'Pagos', icon: CreditCard },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/caja-fuerte', label: 'Caja & Calc', icon: Vault },
  ];

  const handleNavClick = (label: string) => {
    speak(`Navegando a ${label}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 px-2 py-2 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:flex-col md:w-24 md:h-full md:border-r md:border-t-0 md:justify-start md:pt-8 md:gap-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => handleNavClick(item.label)}
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
    </nav>
  );
}

export default function App() {
  return (
    <CajaProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 md:pl-24">
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <img 
                src="/src/components/miCAJIAAA.png" 
                alt="MiCajita Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">MiCajita</h1>
            </div>
            <button 
              onClick={() => window.speechSynthesis.cancel()}
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
