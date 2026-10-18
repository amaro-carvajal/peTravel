import axios from 'axios';
import type { HorarioOcupado, NuevaReservaData, ReservaData } from '../types/data';
import { authConfig } from './http';

const baseUrl = '/bookings';

const create = async (reserva: NuevaReservaData): Promise<ReservaData> => {
  const payload = {
    pet: reserva.mascotaId,
    walker: reserva.paseadorId,
    date: reserva.fecha,
    startTime: reserva.horaInicio,
    durationMinutes: reserva.duracionMinutos,
    pickupAddress: reserva.direccionRetiro,
    notes: reserva.notas?.trim() ? reserva.notas.trim() : undefined,
    totalPrice: reserva.precioTotal,
  };
  const response = await axios.post<ReservaData>(baseUrl, payload);
  return response.data;
};

const getOccupied = async (walker: string, date: string): Promise<HorarioOcupado[]> => {
  const response = await axios.get<HorarioOcupado[]>(`${baseUrl}/occupied`, {
    ...authConfig(), params: { walker, date },
  });
  return response.data;
};

export default { create, getOccupied };
