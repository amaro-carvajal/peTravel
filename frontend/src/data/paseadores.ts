import type { PaseadorData } from "../types/data";

export const paseadores: PaseadorData[] = [
  {
    id: 1,
    nombre: "Carlos Pérez",
    comuna: "Providencia",
    foto: "https://i.pravatar.cc/150?img=11",
    tarifa: 5000,
    calificacion: 4.8,
    descripcion: "Experiencia paseando perros medianos y grandes.",
    disponibilidad: [
      "Lunes a Viernes: 09:00 - 13:00",
      "Sábados: 10:00 - 14:00",
    ],
    zonas: ["Providencia", "Ñuñoa", "Las Condes"],
    contacto: {
      telefono: "+56 9 1234 5678",
      email: "carlos.perez@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "María González",
        puntaje: 5,
        comentario: "Muy puntual y mi perro lo adora. Totalmente recomendado.",
        fecha: "2026-08-12",
      },
      {
        id: 2,
        autor: "Pedro Ramírez",
        puntaje: 4.5,
        comentario: "Buen servicio, envía fotos durante el paseo.",
        fecha: "2026-08-28",
      },
    ],
  },
  {
    id: 2,
    nombre: "Ana Soto",
    comuna: "Ñuñoa",
    foto: "https://i.pravatar.cc/150?img=31",
    tarifa: 6000,
    calificacion: 4.9,
    descripcion: "Amante de los animales y paseadora con experiencia.",
    disponibilidad: [
      "Lunes a Viernes: 15:00 - 20:00",
      "Domingos: 09:00 - 13:00",
    ],
    zonas: ["Ñuñoa", "Providencia", "Macul"],
    contacto: {
      telefono: "+56 9 8765 4321",
      email: "ana.soto@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Javiera Fuentes",
        puntaje: 5,
        comentario: "Excelente trato, se nota la experiencia con gatos y perros.",
        fecha: "2026-09-02",
      },
      {
        id: 2,
        autor: "Felipe Castro",
        puntaje: 5,
        comentario: "Flexible con los horarios y muy comunicativa.",
        fecha: "2026-09-10",
      },
    ],
  },
  {
    id: 3,
    nombre: "Diego Morales",
    comuna: "Quilicura",
    tarifa: 4500,
    calificacion: 4.6,
    descripcion: "Disponible para paseos durante tardes y fines de semana.",
    disponibilidad: [
      "Lunes a Viernes: 17:00 - 21:00",
      "Sábados y Domingos: 09:00 - 18:00",
    ],
    zonas: ["Quilicura", "Renca", "Conchalí"],
    contacto: {
      telefono: "+56 9 5555 7777",
      email: "diego.morales@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Camila Rojas",
        puntaje: 4.5,
        comentario: "Buen paseador, mi perrita llega feliz y cansada.",
        fecha: "2026-07-20",
      },
      {
        id: 2,
        autor: "Nicolás Paredes",
        puntaje: 4.5,
        comentario: "Cumple con lo acordado, lo recomiendo para fines de semana.",
        fecha: "2026-08-05",
      },
    ],
  },
  {
    id: 4,
    nombre: "Valentina Castro",
    comuna: "Providencia",
    tarifa: 5500,
    calificacion: 4.7,
    descripcion: "Estudiante de veterinaria, apasionada por el cuidado y bienestar de tus mascotas.",
    foto: "https://i.pravatar.cc/150?img=47",
    disponibilidad: [
      "Lunes, Miércoles y Viernes: 08:00 - 12:00",
      "Fines de semana: 15:00 - 19:00",
    ],
    zonas: ["Providencia", "Santiago Centro", "Recoleta"],
    contacto: {
      telefono: "+56 9 4444 3333",
      email: "valentina.castro@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Martín Vargas",
        puntaje: 5,
        comentario: "Excelente disposición, mi perro es muy ansioso y ella supo manejarlo perfecto.",
        fecha: "2026-09-15",
      },
      {
        id: 2,
        autor: "Sofía Medina",
        puntaje: 4.5,
        comentario: "Muy responsable con los horarios. Me manda fotos durante el recorrido.",
        fecha: "2026-09-18",
      },
    ],
  }
];
