import axios from 'axios';
import type { BackendPet, MascotaData, NuevaMascotaData } from '../types/data';

const baseUrl = '/pets';

const adaptPet = (backendPet: BackendPet): MascotaData => ({
  id: backendPet.id,
  nombre: backendPet.name,
  raza: backendPet.breed,
  tamano: backendPet.size,
  notas: backendPet.notes,
});

const getAll = async (): Promise<MascotaData[]> => {
  const response = await axios.get<BackendPet[]>(baseUrl);
  return response.data.map(adaptPet);
};

const payloadMascota = (mascota: NuevaMascotaData) => ({
  name: mascota.nombre,
  breed: mascota.raza,
  size: mascota.tamano,
  notes: mascota.notas?.trim(),
});

const getById = async (id: string): Promise<MascotaData> => {
  const response = await axios.get<BackendPet>(`${baseUrl}/${encodeURIComponent(id)}`);
  return adaptPet(response.data);
};

const create = async (mascota: NuevaMascotaData): Promise<MascotaData> => {
  const payload = payloadMascota(mascota);
  const response = await axios.post<BackendPet>(baseUrl, { ...payload, notes: payload.notes || undefined });
  return adaptPet(response.data);
};

const update = async (id: string, mascota: NuevaMascotaData): Promise<MascotaData> => {
  const response = await axios.put<BackendPet>(`${baseUrl}/${encodeURIComponent(id)}`, payloadMascota(mascota));
  return adaptPet(response.data);
};

const remove = async (id: string): Promise<void> => {
  await axios.delete(`${baseUrl}/${encodeURIComponent(id)}`);
};

export default { getAll, getById, create, update, remove };
