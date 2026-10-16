import mongoose from "mongoose";
import config from "./utils/config";
import logger from "./utils/logger";
import Walker from "./models/walker";
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

const seed = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error("MONGODB_URI no está definido en el archivo .env");
    }

    await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME || "petravel" });
    logger.info("Conectado a MongoDB para poblar datos...");

    // Limpia paseadores existentes para no duplicar en cada ejecución
    await Walker.deleteMany({});
    logger.info("Colección de paseadores limpiada.");

    // Inserta todos los paseadores de prueba
    await Walker.insertMany(sampleWalkers);
    logger.info(`¡Éxito! Se insertaron ${sampleWalkers.length} paseadores de prueba en MongoDB.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error("Error al poblar la base de datos:", error);
    process.exit(1);
  }
};

seed();