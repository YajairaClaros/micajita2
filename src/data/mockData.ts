export interface Miembro {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  activo: boolean;
  foto: string;
  negocio: string;
  estilo_vida: string;
  referido_por: string | null; // ID of the member who referred them, or null if original
  created_at: string;
}

export interface Reunion {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  descripcion: string;
  created_at: string;
}

export interface Asistencia {
  id: string;
  reunion_id: string;
  miembro_id: string;
  asistio: boolean;
  created_at: string;
}

export interface Pago {
  id: string;
  miembro_id: string;
  reunion_id: string | null;
  monto: number;
  tipo: 'cuota' | 'donacion' | 'multa';
  fecha: string;
  created_at: string;
}

export const MOCK_MIEMBROS: Miembro[] = [
  { 
    id: '1', 
    nombre: 'Juan Pérez', 
    telefono: '555-0101', 
    email: 'juan@example.com', 
    activo: true, 
    foto: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg', 
    negocio: 'Planta frijoles y maíz de temporal',
    estilo_vida: 'Le gusta la pesca y madrugar para trabajar el campo',
    referido_por: null,
    created_at: new Date().toISOString() 
  },
  { 
    id: '2', 
    nombre: 'María García', 
    telefono: '555-0102', 
    email: 'maria@example.com', 
    activo: true, 
    foto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', 
    negocio: 'Venta de comida corrida y antojitos',
    estilo_vida: 'Participa en el coro de la iglesia y hace yoga',
    referido_por: '1',
    created_at: new Date().toISOString() 
  },
  { 
    id: '3', 
    nombre: 'Carlos López', 
    telefono: '555-0103', 
    email: 'carlos@example.com', 
    activo: true, 
    foto: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg', 
    negocio: 'Carpintería y reparación de muebles',
    estilo_vida: 'Aficionado al fútbol y coleccionista de herramientas antiguas',
    referido_por: null,
    created_at: new Date().toISOString() 
  },
  { 
    id: '4', 
    nombre: 'Ana Martínez', 
    telefono: '555-0104', 
    email: 'ana@example.com', 
    activo: true, 
    foto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', 
    negocio: 'Costura y arreglos de ropa',
    estilo_vida: 'Amante de las plantas de sombra y la lectura',
    referido_por: '2',
    created_at: new Date().toISOString() 
  },
  { 
    id: '5', 
    nombre: 'Luis Rodríguez', 
    telefono: '555-0105', 
    email: 'luis@example.com', 
    activo: false, 
    foto: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg', 
    negocio: 'Mecánico automotriz',
    estilo_vida: 'Le apasionan las carreras de caballos',
    referido_por: '3',
    created_at: new Date().toISOString() 
  },
];

export const MOCK_REUNIONES: Reunion[] = [
  { id: '101', titulo: 'Reunión Semanal', fecha: new Date().toISOString().split('T')[0], hora: '18:00', descripcion: 'Planificación de la semana', created_at: new Date().toISOString() },
  { id: '102', titulo: 'Asamblea General', fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hora: '10:00', descripcion: 'Discusión de presupuestos', created_at: new Date().toISOString() },
  { id: '103', titulo: 'Taller de Capacitación', fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], hora: '15:00', descripcion: 'Nuevas herramientas', created_at: new Date().toISOString() },
];

export const MOCK_ASISTENCIAS: Asistencia[] = [
  { id: 'a1', reunion_id: '101', miembro_id: '1', asistio: true, created_at: new Date().toISOString() },
  { id: 'a2', reunion_id: '101', miembro_id: '2', asistio: true, created_at: new Date().toISOString() },
  { id: 'a3', reunion_id: '101', miembro_id: '3', asistio: false, created_at: new Date().toISOString() },
  { id: 'a4', reunion_id: '103', miembro_id: '1', asistio: true, created_at: new Date().toISOString() },
  { id: 'a5', reunion_id: '103', miembro_id: '4', asistio: true, created_at: new Date().toISOString() },
];

export const MOCK_PAGOS: Pago[] = [
  { id: 'p1', miembro_id: '1', reunion_id: '101', monto: 50.00, tipo: 'cuota', fecha: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: 'p2', miembro_id: '2', reunion_id: '101', monto: 50.00, tipo: 'cuota', fecha: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: 'p3', miembro_id: '3', reunion_id: null, monto: 100.00, tipo: 'donacion', fecha: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: 'p4', miembro_id: '4', reunion_id: '103', monto: 25.00, tipo: 'multa', fecha: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
];
