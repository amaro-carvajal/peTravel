import axios from 'axios';
import type { NuevaReservaData } from '../types/data';

const baseUrl = '/bookings';

const create = async (reserva: NuevaReservaData) => {
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
  const response = await axios.post(baseUrl, payload);
  return response.data;
};

export default { create };