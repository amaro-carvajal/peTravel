import axios from "axios";
import type { EstadoPaseo, PaseoData } from "../types/data";
import walkerService from "./walkers";
import { authConfig } from "./http";

interface BackendBooking {
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
  status: EstadoPaseo;
}

interface BackendPet {
  id: string;
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
}

interface BackendUser {
  id: string;
  name: string;
}

const TAMANOS = { small: "pequeño", medium: "mediano", large: "grande" } as const;

const adaptBooking = (
  b: BackendBooking,
  pet?: BackendPet,
  dueno?: string,
  paseador?: string
): PaseoData => ({
  id: b.id,
  mascota: pet?.name ?? "Mascota",
  raza: pet?.breed ?? "",
  tamano: pet ? TAMANOS[pet.size] : "",
  fecha: b.date.slice(0, 10),
  hora: b.startTime,
  direccion: b.pickupAddress,
  duracionMin: b.durationMinutes,
  precio: b.totalPrice,
  dueno: dueno ?? "",
  paseador: paseador ?? "",
  estado: b.status,
});

// Reservas del paseador logueado (el backend filtra según la sesión)
const getAll = async (): Promise<PaseoData[]> => {
  const [bookingsRes, petsRes] = await Promise.all([
    axios.get<BackendBooking[]>("/bookings", authConfig()),
    axios.get<BackendPet[]>("/pets", authConfig()),
  ]);

  const bookings = bookingsRes.data;
  const pets = new Map(petsRes.data.map((p) => [p.id, p]));

  const ownerIds = [...new Set(bookings.map((b) => b.owner))];
  const owners = await Promise.all(
    ownerIds.map((id) => axios.get<BackendUser>(`/users/${id}`).then((r) => r.data))
  );
  const ownerNames = new Map(owners.map((o) => [o.id, o.name]));

  return bookings.map((b) => adaptBooking(b, pets.get(b.pet), ownerNames.get(b.owner)));
};

// Una reserva del dueño logueado, con nombre de mascota y de paseador
const getById = async (id: string): Promise<PaseoData> => {
  const { data: booking } = await axios.get<BackendBooking>(`/bookings/${id}`, authConfig());
  const [pet, walker] = await Promise.all([
    axios.get<BackendPet>(`/pets/${booking.pet}`, authConfig()).then((r) => r.data),
    walkerService.getById(booking.walker),
  ]);
  return adaptBooking(booking, pet, undefined, walker.nombre);
};

const updateStatus = async (id: string, status: EstadoPaseo): Promise<EstadoPaseo> => {
  const response = await axios.put<BackendBooking>(`/bookings/${id}`, { status }, authConfig());
  return response.data.status;
};

export default { getAll, getById, updateStatus };