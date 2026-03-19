import { useState, useEffect, useMemo } from 'react';
import { MOCK_MIEMBROS, MOCK_REUNIONES, MOCK_ASISTENCIAS, MOCK_PAGOS } from '../data/mockData';
import { useTTS } from '../hooks/useTTS';
import { useCaja } from '../context/CajaContext';
import { 
  BarChart3, 
  Volume2, 
  Users, 
  CreditCard, 
  CheckSquare, 
  XCircle, 
  Vault, 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface PagoReporte {
  nombre: string;
  foto: string;
  total_pagado: number;
  cantidad_pagos: number;
}

interface AsistenciaReporte {
  nombre: string;
  foto: string;
  reunion: string;
  fecha: string;
  asistio: boolean;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { balance, totalIncome, totalExpenses, transactions } = useCaja();
  const [pagoReportes, setPagoReportes] = useState<PagoReporte[]>([]);
  const [asistenciaReportes, setAsistenciaReportes] = useState<AsistenciaReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pagos' | 'asistencia' | 'caja'>('pagos');
  const { speak, speakOnClick } = useTTS();

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    speak('Generando reportes financieros y de asistencia');
    
    // Simulamos carga
    setTimeout(() => {
      // Agregamos pagos
      const aggregated: Record<string, PagoReporte> = {};
      MOCK_PAGOS.forEach((p) => {
        const miembro = MOCK_MIEMBROS.find(m => m.id === p.miembro_id);
        const nombre = miembro?.nombre || 'Desconocido';
        const foto = miembro?.foto || `https://picsum.photos/seed/unknown/200`;
        if (!aggregated[nombre]) {
          aggregated[nombre] = { nombre, foto, total_pagado: 0, cantidad_pagos: 0 };
        }
        aggregated[nombre].total_pagado += p.monto;
        aggregated[nombre].cantidad_pagos += 1;
      });
      setPagoReportes(Object.values(aggregated).sort((a, b) => b.total_pagado - a.total_pagado));

      // Formateamos asistencias
      const formatted = MOCK_ASISTENCIAS.map((a) => {
        const miembro = MOCK_MIEMBROS.find(m => m.id === a.miembro_id);
        const reunion = MOCK_REUNIONES.find(r => r.id === a.reunion_id);
        return {
          nombre: miembro?.nombre || 'Desconocido',
          foto: miembro?.foto || `https://picsum.photos/seed/unknown/200`,
          reunion: reunion?.titulo || 'Desconocida',
          fecha: reunion?.fecha || '',
          asistio: a.asistio
        };
      });
      setAsistenciaReportes(formatted);

      setLoading(false);
      speak('Reportes generados correctamente');
    }, 500);
  }

  const cajaPieData = useMemo(() => [
    { name: 'Ingresos', value: totalIncome, color: '#10b981' },
    { name: 'Egresos', value: totalExpenses, color: '#ef4444' }
  ], [totalIncome, totalExpenses]);

  const balanceTrendData = useMemo(() => {
    let currentBalance = balance - (totalIncome - totalExpenses); // Start from initial balance if we had one, but let's just track relative to 0
    let runningBalance = 0;
    return [...transactions].reverse().map((t, i) => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      return {
        name: i + 1,
        balance: runningBalance,
        date: new Date(t.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      };
    });
  }, [transactions, balance, totalIncome, totalExpenses]);

  const handleListenPago = (r: PagoReporte) => {
    speak(`${r.nombre}. Total pagado: ${r.total_pagado} pesos en ${r.cantidad_pagos} pagos.`);
  };

  const handleListenAsistencia = (r: AsistenciaReporte) => {
    speak(`${r.nombre} en ${r.reunion}. ${r.asistio ? 'Asistió' : 'No asistió'}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Reportes</h2>
          <p className="text-gray-500 text-sm font-medium">Análisis detallado de la comunidad</p>
        </div>
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
          <BarChart3 size={24} />
        </div>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-2xl">
        <button
          onClick={() => speakOnClick('Mostrando resumen de pagos', () => setActiveTab('pagos'))}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'pagos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard size={18} />
            <span>Pagos</span>
          </div>
        </button>
        <button
          onClick={() => speakOnClick('Mostrando registro de asistencia', () => setActiveTab('asistencia'))}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'asistencia' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckSquare size={18} />
            <span>Asistencia</span>
          </div>
        </button>
        <button
          onClick={() => speakOnClick('Mostrando balance de caja fuerte', () => setActiveTab('caja'))}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'caja' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Vault size={18} />
            <span>Caja</span>
          </div>
        </button>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="p-20 text-center text-gray-500 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Generando reportes...</p>
          </div>
        ) : activeTab === 'pagos' ? (
          <div className="space-y-6">
            {/* Gráfico de Pagos */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                Distribución de Pagos
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pagoReportes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="nombre" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Bar dataKey="total_pagado" radius={[8, 8, 0, 0]}>
                      {pagoReportes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagoReportes.length === 0 ? (
                <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
                  No hay datos de pagos.
                </div>
              ) : (
                pagoReportes.map((r, i) => (
                  <motion.div 
                    layout
                    key={i} 
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4 hover:shadow-md transition-all relative group"
                  >
                    <div className="relative">
                      <img 
                        src={r.foto} 
                        alt={r.nombre} 
                        className="w-20 h-20 rounded-3xl object-cover border-4 border-indigo-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                        {i + 1}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{r.nombre}</h3>
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-2xl font-black text-indigo-600">${r.total_pagado}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {r.cantidad_pagos} pagos realizados
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => speakOnClick(`Escuchar resumen de pagos de ${r.nombre}`, () => handleListenPago(r))}
                      className="absolute top-4 right-4 p-2 text-indigo-600 bg-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Volume2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'asistencia' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {asistenciaReportes.length === 0 ? (
                <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100">
                  No hay datos de asistencia.
                </div>
              ) : (
                asistenciaReportes.map((r, i) => (
                  <motion.div 
                    layout
                    key={i} 
                    className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all relative group"
                  >
                    <div className="relative">
                      <img 
                        src={r.foto} 
                        alt={r.nombre} 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                        r.asistio ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                        {r.asistio ? <CheckSquare size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{r.nombre}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                        {r.reunion}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {r.fecha}
                      </p>
                    </div>

                    <button
                      onClick={() => speakOnClick(`Escuchar asistencia de ${r.nombre}`, () => handleListenAsistencia(r))}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    >
                      <Volume2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Balance Actual</p>
                <p className={`text-3xl font-black ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Ingresos</p>
                <p className="text-3xl font-black text-emerald-700">
                  ${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 text-center">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Total Egresos</p>
                <p className="text-3xl font-black text-red-700">
                  ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Ingresos vs Egresos */}
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <PieChartIcon size={20} className="text-indigo-600" />
                  Ingresos vs Egresos
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cajaPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {cajaPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Tendencia */}
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-600" />
                  Tendencia de Balance
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#4f46e5" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                Últimos Movimientos
              </h4>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-700 block">{t.description}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`font-black text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
