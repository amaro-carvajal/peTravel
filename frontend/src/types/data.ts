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