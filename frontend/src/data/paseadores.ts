import type { PaseadorData } from "../types/data";

export const paseadores: PaseadorData[] = [
  {
    id: "1",
    nombre: "Carlos Pérez",
    comuna: "Providencia",
    foto: "https://i.pravatar.cc/150?img=11",
    tarifa: 5000,
    calificacion: 4.5,
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
        puntaje: 4,
        comentario: "Buen servicio en general, cumple con la hora estipulada.",
        fecha: "2026-08-28",
      },
      {
        id: 3,
        autor: "Carla Espinoza",
        puntaje: 4.5,
        comentario: "Lleva a mi perro a los parques de Providencia, llega muy feliz.",
        fecha: "2026-09-05",
      }
    ],
  },
  {
    id: "2",
    nombre: "Ana Soto",
    comuna: "Ñuñoa",
    foto: "https://i.pravatar.cc/150?img=31",
    tarifa: 6000,
    calificacion: 4.8,
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
        fecha: "2026-08-02",
      },
      {
        id: 2,
        autor: "Felipe Castro",
        puntaje: 5,
        comentario: "Flexible con los horarios y muy comunicativa por WhatsApp.",
        fecha: "2026-08-15",
      },
      {
        id: 3,
        autor: "Macarena Pino",
        puntaje: 4.5,
        comentario: "Muy dedicada, aunque una vez se retrasó 10 minutos.",
        fecha: "2026-09-10",
      }
    ],
  },
  {
    id: "3",
    nombre: "Diego Morales",
    comuna: "Quilicura",
    tarifa: 4500,
    calificacion: 3.8,
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
        puntaje: 3,
        comentario: "El paseo estuvo bien, pero canceló una vez a última hora.",
        fecha: "2026-08-05",
      },
      {
        id: 3,
        autor: "Sebastián Vera",
        puntaje: 4,
        comentario: "Buen recorrido por las plazas de Quilicura, a mi perro le agrada.",
        fecha: "2026-09-01",
      }
    ],
  },
  {
    id: "4",
    nombre: "Valentina Castro",
    comuna: "Providencia",
    tarifa: 5500,
    calificacion: 4.6,
    descripcion: "Estudiante de veterinaria, apasionada por el cuidado y bienestar.",
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
        comentario: "Excelente disposición, mi perro es ansioso y ella lo maneja perfecto.",
        fecha: "2026-08-15",
      },
      {
        id: 2,
        autor: "Sofía Medina",
        puntaje: 4,
        comentario: "Responsable. Me gustaría que mandara más fotos en el recorrido.",
        fecha: "2026-08-30",
      },
      {
        id: 3,
        autor: "Jorge Valenzuela",
        puntaje: 5,
        comentario: "Súper atenta a las indicaciones médicas de mi perrito mayor.",
        fecha: "2026-09-18",
      }
    ],
  },
  {
    id: "5",
    nombre: "Javier Muñoz",
    comuna: "Santiago Centro",
    tarifa: 8000,
    calificacion: 4.8,
    descripcion: "Paseos intensivos para razas con alta energía. Rutas seguras.",
    foto: "https://i.pravatar.cc/150?img=59",
    disponibilidad: [
      "Martes y Jueves: 07:00 - 11:00",
      "Sábados: 08:00 - 13:00",
    ],
    zonas: ["Santiago Centro", "Estación Central"],
    contacto: {
      telefono: "+56 9 1122 3344",
      email: "javier.munoz@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Luis Aránguiz",
        puntaje: 5,
        comentario: "Agotó a mi Husky. Excelente trabajo físico.",
        fecha: "2026-09-02",
      },
      {
        id: 2,
        autor: "Andrea Riquelme",
        puntaje: 4.5,
        comentario: "Muy profesional, recomendado para perros grandes y fuertes.",
        fecha: "2026-09-14",
      },
      {
        id: 3,
        autor: "Tomás Reyes",
        puntaje: 5,
        comentario: "Sabe usar arnés antitirones a la perfección.",
        fecha: "2026-09-16",
      }
    ],
  },
  {
    id: "6",
    nombre: "Laura Rojas",
    comuna: "Las Condes",
    tarifa: 12000,
    calificacion: 5.0,
    descripcion: "Servicio Premium. Paseos individuales con entrenamiento básico.",
    foto: "https://i.pravatar.cc/150?img=44",
    disponibilidad: [
      "Lunes a Domingo: 10:00 - 18:00",
    ],
    zonas: ["Providencia", "Vitacura", "Las Condes"],
    contacto: {
      telefono: "+56 9 9988 7766",
      email: "laura.rojas@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Consuelo Valdés",
        puntaje: 5,
        comentario: "Vale cada peso. Mi perro ya no tira la correa al caminar.",
        fecha: "2026-08-20",
      },
      {
        id: 2,
        autor: "Patricio Guzmán",
        puntaje: 5,
        comentario: "Impecable, es prácticamente una entrenadora canina.",
        fecha: "2026-09-18",
      }
    ],
  },
  {
    id: "7",
    nombre: "Felipe Ibáñez",
    comuna: "Las Condes",
    tarifa: 15000,
    calificacion: 4.1,
    descripcion: "Especialista en comportamiento canino. Terapia de habituación.",
    disponibilidad: [
      "Miércoles y Viernes: 15:00 - 19:00",
    ],
    zonas: ["Las Condes", "La Reina"],
    contacto: {
      telefono: "+56 9 3322 1100",
      email: "felipe.ibanez@petravel.cl",
    },
    resenas: [
      {
        id: 1,
        autor: "Roberto Silva",
        puntaje: 3.5,
        comentario: "Sabe mucho, pero los paseos son muy lentos por la terapia.",
        fecha: "2026-08-10",
      },
      {
        id: 2,
        autor: "Daniela Pavez",
        puntaje: 4.5,
        comentario: "Ha ayudado mucho con la reactividad de mi perro hacia las motos.",
        fecha: "2026-09-05",
      },
      {
        id: 3,
        autor: "Valentina Ortiz",
        puntaje: 4.5,
        comentario: "Excelente profesional, aunque es un poco caro.",
        fecha: "2026-09-12",
      }
    ],
  }
];