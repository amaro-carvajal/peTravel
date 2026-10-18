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

const create = async (mascota: NuevaMascotaData): Promise<MascotaData> => {
  const payload = {
    name: mascota.nombre,
    breed: mascota.raza,
    size: mascota.tamano,
    notes: mascota.notas?.trim() ? mascota.notas.trim() : undefined,
  };
  const response = await axios.post<BackendPet>(baseUrl, payload);
  return adaptPet(response.data);
};

export default { getAll, create };