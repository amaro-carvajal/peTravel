export interface Resena {
  id: number;
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