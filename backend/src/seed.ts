import mongoose from "mongoose";
import bcrypt from "bcrypt"; 
import config from "./utils/config";
import logger from "./utils/logger";
import Walker from "./models/walker";
import User from "./models/user";
import Booking from "./models/booking";
import Review from "./models/review";
import type { WalkerDay } from "./models/walker";

interface SampleWalker {
  name: string;
  photo?: string;
  description: string;
  coverageAreas: string[];
  hourlyRate: number;
  rating: number;
  availability: {
    days: WalkerDay[];
    startTime: string;
    endTime: string;
  }[];
  phone: string;
  email: string;
}

const sampleWalkers: SampleWalker[] = [
  {
    name: "Carlos Pérez",
    photo: "https://i.pravatar.cc/150?img=11",
    description: "Experiencia paseando perros medianos y grandes.",
    coverageAreas: ["Providencia", "Ñuñoa", "Las Condes"],
    hourlyRate: 5000,
    rating: 4.5,
    availability: [
      {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        startTime: "09:00",
        endTime: "13:00",
      },
      {
        days: ["saturday"],
        startTime: "10:00",
        endTime: "14:00",
      },
    ],
    phone: "+56 9 1234 5678",
    email: "carlos.perez@petravel.cl",
  },
  {
    name: "Ana Soto",
    photo: "https://i.pravatar.cc/150?img=31",
    description: "Amante de los animales y paseadora con experiencia.",
    coverageAreas: ["Ñuñoa", "Providencia", "Macul"],
    hourlyRate: 6000,
    rating: 4.8,
    availability: [
      {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        startTime: "15:00",
        endTime: "20:00",
      },
      {
        days: ["sunday"],
        startTime: "09:00",
        endTime: "13:00",
      },
    ],
    phone: "+56 9 8765 4321",
    email: "ana.soto@petravel.cl",
  },
  {
    name: "Diego Morales",
    description: "Disponible para paseos durante tardes y fines de semana.",
    coverageAreas: ["Quilicura", "Renca", "Conchalí"],
    hourlyRate: 4500,
    rating: 3.8,
    availability: [
      {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        startTime: "17:00",
        endTime: "21:00",
      },
      {
        days: ["saturday", "sunday"],
        startTime: "09:00",
        endTime: "18:00",
      },
    ],
    phone: "+56 9 5555 7777",
    email: "diego.morales@petravel.cl",
  },
  {
    name: "Valentina Castro",
    photo: "https://i.pravatar.cc/150?img=47",
    description: "Estudiante de veterinaria, apasionada por el cuidado y bienestar.",
    coverageAreas: ["Providencia", "Santiago Centro", "Recoleta"],
    hourlyRate: 5500,
    rating: 4.6,
    availability: [
      {
        days: ["monday", "wednesday", "friday"],
        startTime: "08:00",
        endTime: "12:00",
      },
      {
        days: ["saturday", "sunday"],
        startTime: "15:00",
        endTime: "19:00",
      },
    ],
    phone: "+56 9 4444 3333",
    email: "valentina.castro@petravel.cl",
  },
  {
    name: "Javier Muñoz",
    photo: "https://i.pravatar.cc/150?img=59",
    description: "Paseos intensivos para razas con alta energía. Rutas seguras.",
    coverageAreas: ["Santiago Centro", "Estación Central"],
    hourlyRate: 8000,
    rating: 4.8,
    availability: [
      {
        days: ["tuesday", "thursday"],
        startTime: "07:00",
        endTime: "11:00",
      },
      {
        days: ["saturday"],
        startTime: "08:00",
        endTime: "13:00",
      },
    ],
    phone: "+56 9 1122 3344",
    email: "javier.munoz@petravel.cl",
  },
  {
    name: "Laura Rojas",
    photo: "https://i.pravatar.cc/150?img=44",
    description: "Servicio Premium. Paseos individuales con entrenamiento básico.",
    coverageAreas: ["Providencia", "Vitacura", "Las Condes"],
    hourlyRate: 12000,
    rating: 5.0,
    availability: [
      {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        startTime: "10:00",
        endTime: "18:00",
      },
    ],
    phone: "+56 9 9988 7766",
    email: "laura.rojas@petravel.cl",
  },
  {
    name: "Felipe Ibáñez",
    description: "Especialista en comportamiento canino. Terapia de habituación.",
    coverageAreas: ["Las Condes", "La Reina"],
    hourlyRate: 15000,
    rating: 4.1,
    availability: [
      {
        days: ["wednesday", "friday"],
        startTime: "15:00",
        endTime: "19:00",
      },
    ],
    phone: "+56 9 3322 1100",
    email: "felipe.ibanez@petravel.cl",
  },
];

interface SampleReview {
  author: string;
  rating: number; // entero 1-5 (el modelo valida Number.isInteger)
  comment: string;
  date: string;
}

// Las llaves coinciden con el campo "name" de sampleWalkers
const sampleReviews: Record<string, SampleReview[]> = {
  "Carlos Pérez": [
    { author: "María González", rating: 5, comment: "Muy puntual y mi perro lo adora. Totalmente recomendado.", date: "2026-08-12" },
    { author: "Pedro Ramírez", rating: 4, comment: "Buen servicio en general, cumple con la hora estipulada.", date: "2026-08-28" },
    { author: "Carla Espinoza", rating: 5, comment: "Lleva a mi perro a los parques de Providencia, llega muy feliz.", date: "2026-09-05" },
  ],
  "Ana Soto": [
    { author: "Javiera Fuentes", rating: 5, comment: "Excelente trato, se nota la experiencia con gatos y perros.", date: "2026-08-02" },
    { author: "Felipe Castro", rating: 5, comment: "Flexible con los horarios y muy comunicativa por WhatsApp.", date: "2026-08-15" },
    { author: "Macarena Pino", rating: 5, comment: "Muy dedicada, aunque una vez se retrasó 10 minutos.", date: "2026-09-10" },
  ],
  "Diego Morales": [
    { author: "Camila Rojas", rating: 5, comment: "Buen paseador, mi perrita llega feliz y cansada.", date: "2026-07-20" },
    { author: "Nicolás Paredes", rating: 3, comment: "El paseo estuvo bien, pero canceló una vez a última hora.", date: "2026-08-05" },
    { author: "Sebastián Vera", rating: 4, comment: "Buen recorrido por las plazas de Quilicura, a mi perro le agrada.", date: "2026-09-01" },
  ],
  "Valentina Castro": [
    { author: "Martín Vargas", rating: 5, comment: "Excelente disposición, mi perro es ansioso y ella lo maneja perfecto.", date: "2026-08-15" },
    { author: "Sofía Medina", rating: 4, comment: "Responsable. Me gustaría que mandara más fotos en el recorrido.", date: "2026-08-30" },
    { author: "Jorge Valenzuela", rating: 5, comment: "Súper atenta a las indicaciones médicas de mi perrito mayor.", date: "2026-09-18" },
  ],
  "Javier Muñoz": [
    { author: "Luis Aránguiz", rating: 5, comment: "Agotó a mi Husky. Excelente trabajo físico.", date: "2026-09-02" },
    { author: "Andrea Riquelme", rating: 5, comment: "Muy profesional, recomendado para perros grandes y fuertes.", date: "2026-09-14" },
    { author: "Tomás Reyes", rating: 5, comment: "Sabe usar arnés antitirones a la perfección.", date: "2026-09-16" },
  ],
  "Laura Rojas": [
    { author: "Consuelo Valdés", rating: 5, comment: "Vale cada peso. Mi perro ya no tira la correa al caminar.", date: "2026-08-20" },
    { author: "Patricio Guzmán", rating: 5, comment: "Impecable, es prácticamente una entrenadora canina.", date: "2026-09-18" },
  ],
  "Felipe Ibáñez": [
    { author: "Roberto Silva", rating: 4, comment: "Sabe mucho, pero los paseos son muy lentos por la terapia.", date: "2026-08-10" },
    { author: "Daniela Pavez", rating: 5, comment: "Ha ayudado mucho con la reactividad de mi perro hacia las motos.", date: "2026-09-05" },
    { author: "Valentina Ortiz", rating: 5, comment: "Excelente profesional, aunque es un poco caro.", date: "2026-09-12" },
  ],
};

const emailFromName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, ".") + "@seed.petravel.cl";

const seed = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido en el archivo .env");
    }

    await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME || "petravel" });
    logger.info("Conectado a MongoDB para poblar datos...");

    // Limpieza para no duplicar en cada ejecución
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await User.deleteMany({ email: /@seed\.petravel\.cl$/ });
    await Walker.deleteMany({});
    logger.info("Colecciones limpiadas.");

    const walkers = await Walker.insertMany(sampleWalkers);
    logger.info(`Se insertaron ${walkers.length} paseadores.`);

    const authorNames = [
      ...new Set(Object.values(sampleReviews).flatMap((reviews) => reviews.map((r) => r.author))),
    ];
    const passwordHash = await bcrypt.hash("password123", 10);
    const authors = await User.insertMany(
      authorNames.map((name) => ({
        name,
        email: emailFromName(name),
        passwordHash,
        role: "owner" as const,
      }))
    );
    const authorIdByName = new Map(authors.map((u) => [u.name, u._id]));

    let reviewCount = 0;
    for (const walker of walkers) {
      const reviews = sampleReviews[walker.name] ?? [];
      if (reviews.length === 0) continue;

      const bookings = await Booking.insertMany(
        reviews.map((r) => ({
          walker: walker._id,
          owner: authorIdByName.get(r.author)!,
          pet: new mongoose.Types.ObjectId(), 
          date: new Date(r.date),
          startTime: "10:00",
          durationMinutes: 60,
          pickupAddress: "Dirección de ejemplo 123",
          totalPrice: walker.hourlyRate,
          status: "completed" as const,
        }))
      );

      await Review.insertMany(
        reviews.map((r, i) => ({
          walker: walker._id,
          author: authorIdByName.get(r.author)!,
          booking: bookings[i]._id,
          rating: r.rating,
          comment: r.comment,
          createdAt: new Date(r.date), 
        }))
      );
      reviewCount += reviews.length;
    }
    logger.info(`¡Éxito! Se insertaron ${authors.length} usuarios, ${reviewCount} reservas y ${reviewCount} reseñas.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error("Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

seed();