export interface Resena {
  id: number;
  autor: string;
  puntaje: number;
  comentario: string;
  fecha: string;
}

export interface PaseadorData {
  id: number;
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