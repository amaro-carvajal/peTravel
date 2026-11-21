import axios from 'axios';
import type {
  BackendAvailability,
  BackendReview,
  BackendUser,
  BackendWalker,
  PaseadorData,
  Resena,
} from '../types/data';

const baseUrl = '/walkers';

const DIAS_MAP: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábados',
  sunday: 'Domingos',
};

const formatDays = (days: string[]): string => {
  if (!days || days.length === 0) return 'Días a coordinar';

  const lowerDays = days.map((d) => d.toLowerCase());
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const allWeek = [...weekdays, 'saturday', 'sunday'];

  if (allWeek.every((d) => lowerDays.includes(d))) {
    return 'Lunes a Domingo';
  }

  if (lowerDays.length === 5 && weekdays.every((d) => lowerDays.includes(d))) {
    return 'Lunes a Viernes';
  }

  if (lowerDays.length === 2 && lowerDays.includes('saturday') && lowerDays.includes('sunday')) {
    return 'Sábados y Domingos';
  }

  const translated = lowerDays.map((d) => DIAS_MAP[d] || d);
  if (translated.length === 1) return translated[0];
  if (translated.length === 2) return `${translated[0]} y ${translated[1]}`;
  return `${translated.slice(0, -1).join(', ')} y ${translated[translated.length - 1]}`;
};

export interface PerfilPaseadorData extends PaseadorData {
  horarios: BackendAvailability[];
}

const adaptWalker = (backendWalker: BackendWalker, resenas: Resena[] = []): PerfilPaseadorData => ({
  id: backendWalker.id,
  nombre: backendWalker.name,
  comuna: backendWalker.coverageAreas?.[0] || 'Sin comuna',
  zonas: backendWalker.coverageAreas || [],
  tarifa: backendWalker.hourlyRate,
  calificacion: backendWalker.rating ?? 0,
  descripcion: backendWalker.description,
  foto: backendWalker.photo,
  horarios: backendWalker.availability || [],
  disponibilidad: (backendWalker.availability || []).map(
    (a: BackendAvailability) => `${formatDays(a.days)}: ${a.startTime} - ${a.endTime}`
  ),
  contacto: {
    telefono: backendWalker.phone,
    email: backendWalker.email,
  },
  resenas,
});

const fetchWalkerReviews = async (walkerId: string): Promise<Resena[]> => {
  const reviewsRes = await axios
    .get<BackendReview[]>(`/reviews?walker=${walkerId}`)
    .catch(() => ({ data: [] as BackendReview[] }));

  let usuariosMap: Record<string, string> = {};

  if (reviewsRes.data.length > 0) {
    try {
      const usersRes = await axios.get<BackendUser[]>('/users');
      usuariosMap = Object.fromEntries(
        usersRes.data.map((u: BackendUser) => [u.id, u.name])
      );
    } catch {
      usuariosMap = {};
    }
  }

  return reviewsRes.data.map((r: BackendReview) => ({
    id: r.id,
    autor: usuariosMap[r.author] || 'Cliente verificado',
    puntaje: r.rating,
    comentario: r.comment,
    fecha: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'Reciente',
  }));
};

const getAll = async (): Promise<PaseadorData[]> => {
  const response = await axios.get<BackendWalker[]>(baseUrl);
  return response.data.map((walker: BackendWalker) => adaptWalker(walker));
};

const getById = async (id: string): Promise<PerfilPaseadorData> => {
  const [walkerRes, resenas] = await Promise.all([
    axios.get<BackendWalker>(`${baseUrl}/${id}`),
    fetchWalkerReviews(id),
  ]);

  return adaptWalker(walkerRes.data, resenas);
};

const getMe = async (): Promise<PerfilPaseadorData> => {
  const response = await axios.get<BackendWalker>(`${baseUrl}/me`);
  const resenas = await fetchWalkerReviews(response.data.id);
  return adaptWalker(response.data, resenas);
};

export interface NuevoPaseadorData {
  name: string;
  description: string;
  coverageAreas: string[];
  hourlyRate: number;
  phone: string;
  email: string;
  photo?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  }[];
}

const create = async (paseador: NuevoPaseadorData): Promise<PerfilPaseadorData> => {
  const response = await axios.post<BackendWalker>(baseUrl, paseador);
  return adaptWalker(response.data);
};

export type ActualizarPaseadorData = Pick<
  NuevoPaseadorData,
  'description' | 'coverageAreas' | 'hourlyRate' | 'phone' | 'photo' | 'availability'
>;

const update = async (id: string, paseador: ActualizarPaseadorData): Promise<PerfilPaseadorData> => {
  const { description, coverageAreas, hourlyRate, phone, photo, availability } = paseador;
  const response = await axios.put<BackendWalker>(`${baseUrl}/${id}`, {
    description, coverageAreas, hourlyRate, phone, photo, availability,
  });
  return adaptWalker(response.data);
};

export default { getAll, getById, getMe, create, update };
