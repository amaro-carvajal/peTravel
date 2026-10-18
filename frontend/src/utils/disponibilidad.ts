import type { BackendAvailability, HorarioOcupado } from "../types/data";

const DIAS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const minutosDeHora = (hora: string): number => {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
};

export const generarHorasDisponibles = (
  availability: BackendAvailability[],
  fecha: string,
  duracion: number,
  ocupados: HorarioOcupado[]
): string[] => {
  const date = new Date(`${fecha}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== fecha || !Number.isInteger(duracion) || duracion < 30) return [];

  const dia = DIAS[date.getUTCDay()];
  const inicios = new Set<number>();
  for (const bloque of availability) {
    if (!bloque.days.includes(dia) || !HORA_REGEX.test(bloque.startTime) || !HORA_REGEX.test(bloque.endTime)) continue;
    const fin = minutosDeHora(bloque.endTime);
    // Inicios cada 30 minutos, contados desde el inicio del bloque.
    for (let inicio = minutosDeHora(bloque.startTime); inicio + duracion <= fin; inicio += 30) {
      const solapado = ocupados.some((reserva) => {
        const ocupado = minutosDeHora(reserva.startTime);
        return inicio < ocupado + reserva.durationMinutes && inicio + duracion > ocupado;
      });
      if (!solapado) inicios.add(inicio);
    }
  }
  return [...inicios].sort((a, b) => a - b).map((inicio) =>
    `${String(Math.floor(inicio / 60)).padStart(2, "0")}:${String(inicio % 60).padStart(2, "0")}`
  );
};
