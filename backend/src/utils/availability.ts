import Booking from "../models/booking";
import type { BookingStatus } from "../models/booking";
import Walker from "../models/walker";
import type { WalkerData } from "../models/walker";

export const BLOCKING_STATUSES: BookingStatus[] = ["pending", "accepted"];
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Las fechas del paseo representan días civiles; se comparan en UTC para no desplazar el día.
export const bookingDay = (value: string | Date): Date | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  if (typeof value === "string" && (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) ||
      parsed.toISOString().slice(0, 10) !== value.slice(0, 10))) return null;
  return new Date(`${parsed.toISOString().slice(0, 10)}T00:00:00.000Z`);
};

export const dayRange = (day: Date) => ({
  $gte: day,
  $lt: new Date(day.getTime() + 24 * 60 * 60 * 1000),
});

export const fitsAvailability = (
  availability: WalkerData["availability"], day: Date, startTime: string, durationMinutes: number
): boolean => {
  if (!TIME_PATTERN.test(startTime) || !Number.isInteger(durationMinutes) || durationMinutes < 30) return false;
  const start = timeToMinutes(startTime);
  return availability.some((block) =>
    block.days.includes(DAYS[day.getUTCDay()]) && TIME_PATTERN.test(block.startTime) &&
    TIME_PATTERN.test(block.endTime) && block.startTime < block.endTime &&
    start >= timeToMinutes(block.startTime) && start + durationMinutes <= timeToMinutes(block.endTime)
  );
};

export const overlaps = (
  startTime: string, durationMinutes: number,
  occupied: { startTime: string; durationMinutes: number }
): boolean => {
  const start = timeToMinutes(startTime);
  const otherStart = timeToMinutes(occupied.startTime);
  return start < otherStart + occupied.durationMinutes && start + durationMinutes > otherStart;
};

export const validateBookingSlot = async (
  walkerId: string, date: Date, startTime: string, durationMinutes: number, excludeId?: string
): Promise<{ status: number; error: string } | null> => {
  const walker = await Walker.findById(walkerId);
  if (!walker) return { status: 404, error: "Paseador no encontrado" };
  const day = bookingDay(date);
  if (!day || !fitsAvailability(walker.availability ?? [], day, startTime, durationMinutes)) {
    return { status: 400, error: "El horario solicitado no está dentro de la disponibilidad del paseador" };
  }
  const occupied = await Booking.find({
    walker: walkerId, date: dayRange(day), status: { $in: BLOCKING_STATUSES },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("startTime durationMinutes");
  if (occupied.some((booking) => overlaps(startTime, durationMinutes, booking))) {
    return { status: 409, error: "El horario solicitado ya está ocupado. Selecciona otro horario" };
  }
  return null;
};
