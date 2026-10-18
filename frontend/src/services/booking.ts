import axios from 'axios';
import type { NuevaReservaData, ReservaData } from '../types/data';

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

export default { create };