export interface Resena {
  id: number | string;
  autor: string;
  puntaje: number;
  comentario: string;
  fecha: string;
}

export interface PaseadorData {
  id: string;
  nombre: string;
  comuna: string;
  tarifa: number;
  calificacion: number;
  descripcion: string;
  foto?: string;
  disponibilidad: string[];
  zonas: string[];
  contacto: {
    telefono: string;
    email: string;
  };
  resenas: Resena[];
}

export type RolUsuario = "owner" | "walker";
export interface UsuarioData {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface MascotaData {
  id: string;
  nombre: string;
  raza: string;
  tamano: 'small' | 'medium' | 'large';
  notas?: string;
}

export interface NuevaMascotaData {
  nombre: string;
  raza: string;
  tamano: 'small' | 'medium' | 'large';
  notas?: string;
}

export interface NuevaReservaData {
  mascotaId: string;
  paseadorId: string;
  fecha: string;
  horaInicio: string;
  duracionMinutos: number;
  direccionRetiro: string;
  notas?: string;
  precioTotal: number;
}

export type EstadoReserva = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface ReservaData {
  id: string;
  walker: string;
  owner: string;
  pet: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  pickupAddress: string;
  notes?: string;
  totalPrice: number;
  status: EstadoReserva;
}

export interface BackendAvailability {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface HorarioOcupado {
  startTime: string;
  durationMinutes: number;
}

export interface BackendWalker {
  id: string;
  name: string;
  photo?: string;
  description: string;
  coverageAreas: string[];
  hourlyRate: number;
  rating?: number;
  availability?: BackendAvailability[];
  phone: string;
  email: string;
}

export interface BackendReview {
  id: string | number;
  walker: string;
  author: string;
  booking: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: RolUsuario;
}

export interface BackendPet {
  id: string;
  name: string;
  breed: string;
  size: 'small' | 'medium' | 'large';
  notes?: string;
}

export type EstadoPaseo = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface PaseoData {
  id: string;
  mascota: string;
  raza: string;
  tamano: string; // "pequeño", "mediano", "grande"
  fecha: string; // "YYYY-MM-DD"
  hora: string; // "HH:mm"
  direccion: string;
  duracionMin: number;
  precio: number;
  dueno: string;
  paseador: string;
  estado: EstadoPaseo;
}
