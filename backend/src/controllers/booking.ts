import express from "express";
import mongoose from "mongoose";
import Booking from "../models/booking";
import Pet from "../models/pet";
import Walker from "../models/walker";
import middleware from "../utils/middleware";
import { BLOCKING_STATUSES, bookingDay, dayRange, validateBookingSlot } from "../utils/availability";

const router = express.Router();

// Solo se exponen los intervalos ocupados, sin datos de owners, mascotas ni direcciones.
router.get("/occupied", middleware.withUser, async (request, response) => {
  const { walker, date } = request.query;
  const day = typeof date === "string" ? bookingDay(date) : null;
  if (typeof walker !== "string" || !mongoose.isObjectIdOrHexString(walker) || !day) {
    response.status(400).json({ error: "Paseador o fecha inválidos" });
    return;
  }
  if (!await Walker.exists({ _id: walker })) {
    response.status(404).json({ error: "Paseador no encontrado" });
    return;
  }
  const occupied = await Booking.find({
    walker, date: dayRange(day), status: { $in: BLOCKING_STATUSES },
  }).select("startTime durationMinutes -_id");
  response.json(occupied.map((booking) => ({
    startTime: booking.startTime, durationMinutes: booking.durationMinutes,
  })));
});

router.get("/", middleware.withUser, async (request, response) => {
  if (request.userRole === "owner") {
    const bookings = await Booking.find({ owner: request.userId });
    response.json(bookings);
    return;
  }

  if (request.userRole !== "walker") {
    response.status(403).json({ error: "No tienes permisos para esta acción" });
    return;
  }

  const walkers = await Walker.find({ user: request.userId });
  const walkerIds = walkers.map((walker) => walker._id);
  const bookings = await Booking.find({ walker: { $in: walkerIds } });
  response.json(bookings);
});

router.get("/:id", middleware.withUser, async (request, response) => {
  const booking = await Booking.findById(request.params.id);

  if (!booking) {
    response.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  if (request.userRole === "owner" && booking.owner.toString() === request.userId) {
    response.json(booking);
    return;
  }

  if (request.userRole === "walker") {
    const walker = await Walker.exists({ _id: booking.walker, user: request.userId });

    if (walker) {
      response.json(booking);
      return;
    }
  }

  response.status(403).json({ error: "No puedes consultar esta reserva" });
});

router.post("/", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Sesión requerida" });
    return;
  }

  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const { pet, walker, date, startTime, durationMinutes, pickupAddress, notes, totalPrice } = body as Record<string, unknown>;

  if (typeof pet !== "string" || !mongoose.isObjectIdOrHexString(pet) ||
      typeof walker !== "string" || !mongoose.isObjectIdOrHexString(walker)) {
    response.status(400).json({ error: "Mascota o paseador inválido" });
    return;
  }

  if (typeof date !== "string" || date.trim().length === 0 || !bookingDay(date)) {
    response.status(400).json({ error: "Fecha inválida" });
    return;
  }

  if (typeof startTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    response.status(400).json({ error: "Hora inválida" });
    return;
  }

  if (typeof durationMinutes !== "number" || !Number.isInteger(durationMinutes) || durationMinutes < 30) {
    response.status(400).json({ error: "Duración inválida" });
    return;
  }

  if (typeof pickupAddress !== "string" || pickupAddress.trim().length === 0) {
    response.status(400).json({ error: "Dirección obligatoria" });
    return;
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    response.status(400).json({ error: "Notas inválidas" });
    return;
  }

  if (typeof totalPrice !== "number" || !Number.isFinite(totalPrice) || totalPrice < 0) {
    response.status(400).json({ error: "Precio inválido" });
    return;
  }

  const selectedPet = await Pet.findById(pet);

  if (!selectedPet) {
    response.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  if (selectedPet.owner.toString() !== request.userId) {
    response.status(403).json({ error: "La mascota no te pertenece" });
    return;
  }

  const slotError = await validateBookingSlot(walker, new Date(date), startTime, durationMinutes);
  if (slotError) {
    response.status(slotError.status).json({ error: slotError.error });
    return;
  }

  const booking = new Booking({
    owner: request.userId,
    pet,
    walker,
    date: new Date(date),
    startTime,
    durationMinutes,
    pickupAddress,
    notes,
    totalPrice,
  });

  const savedBooking = await booking.save();
  response.status(201).json(savedBooking);
});

router.put("/:id", middleware.withUser, async (request, response) => {
  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const booking = await Booking.findById(request.params.id);

  if (!booking) {
    response.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  const isOwner = request.userRole === "owner" && booking.owner.toString() === request.userId;
  const walker = request.userRole === "walker"
    ? await Walker.exists({ _id: booking.walker, user: request.userId })
    : null;

  if (!isOwner && !walker) {
    response.status(403).json({ error: "No puedes modificar esta reserva" });
    return;
  }

  const fields = body as Record<string, unknown>;
  const allowedFields = isOwner
    ? ["date", "startTime", "durationMinutes", "pickupAddress", "notes", "totalPrice", "status"]
    : ["status"];

  if (Object.keys(fields).some((field) => !allowedFields.includes(field))) {
    response.status(400).json({ error: "Campos no permitidos" });
    return;
  }

  const { date, startTime, durationMinutes, pickupAddress, notes, totalPrice, status } = fields;

  if (date !== undefined && (typeof date !== "string" || date.trim().length === 0 || !bookingDay(date))) {
    response.status(400).json({ error: "Fecha inválida" });
    return;
  }

  if (startTime !== undefined && (typeof startTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime))) {
    response.status(400).json({ error: "Hora inválida" });
    return;
  }

  if (durationMinutes !== undefined && (typeof durationMinutes !== "number" || !Number.isInteger(durationMinutes) || durationMinutes < 30)) {
    response.status(400).json({ error: "Duración inválida" });
    return;
  }

  if (pickupAddress !== undefined && (typeof pickupAddress !== "string" || pickupAddress.trim().length === 0)) {
    response.status(400).json({ error: "Dirección obligatoria" });
    return;
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    response.status(400).json({ error: "Notas inválidas" });
    return;
  }

  if (totalPrice !== undefined && (typeof totalPrice !== "number" || !Number.isFinite(totalPrice) || totalPrice < 0)) {
    response.status(400).json({ error: "Precio inválido" });
    return;
  }

  if (status !== undefined && status !== "pending" && status !== "accepted" && status !== "rejected" && status !== "completed" && status !== "cancelled") {
    response.status(400).json({ error: "Estado inválido" });
    return;
  }

  if (status !== undefined) {
    if (isOwner && status !== "cancelled") {
      response.status(403).json({ error: "Solo puedes cancelar tu reserva" });
      return;
    }

    if (!isOwner && status !== "accepted" && status !== "rejected" && status !== "completed" && status !== "cancelled") {
      response.status(403).json({ error: "No puedes asignar este estado" });
      return;
    }

    if (!isOwner && status === "cancelled" && booking.status !== "accepted" && booking.status !== "cancelled") {
      response.status(400).json({ error: "Debes aceptar la reserva antes de cancelarla" });
      return;
    }

    if (status !== booking.status) {
      if (booking.status === "completed" || booking.status === "rejected" || booking.status === "cancelled") {
        response.status(400).json({ error: "No puedes cambiar el estado de una reserva finalizada" });
        return;
      }

      if (status === "completed" && booking.status !== "accepted") {
        response.status(400).json({ error: "La reserva debe estar aceptada antes de completarla" });
        return;
      }
    }
  }

  // Evita eludir la validación cambiando la fecha/hora o aceptando una reserva antigua.
  const nextStatus = status ?? booking.status;
  if ((nextStatus === "pending" || nextStatus === "accepted") &&
      (date !== undefined || startTime !== undefined || durationMinutes !== undefined || status === "accepted")) {
    const slotError = await validateBookingSlot(
      booking.walker.toString(),
      typeof date === "string" ? new Date(date) : booking.date,
      typeof startTime === "string" ? startTime : booking.startTime,
      typeof durationMinutes === "number" ? durationMinutes : booking.durationMinutes,
      booking.id,
    );
    if (slotError) {
      response.status(slotError.status).json({ error: slotError.error });
      return;
    }
  }

  if (date !== undefined) booking.date = new Date(date);
  if (startTime !== undefined) booking.startTime = startTime;
  if (durationMinutes !== undefined) booking.durationMinutes = durationMinutes;
  if (pickupAddress !== undefined) booking.pickupAddress = pickupAddress;
  if (notes !== undefined) booking.notes = notes;
  if (totalPrice !== undefined) booking.totalPrice = totalPrice;
  if (status !== undefined) booking.status = status;

  const updatedBooking = await booking.save();
  response.json(updatedBooking);
});

router.delete("/:id", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  const booking = await Booking.findById(request.params.id);

  if (!booking) {
    response.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  if (booking.owner.toString() !== request.userId) {
    response.status(403).json({ error: "No puedes eliminar esta reserva" });
    return;
  }

  await Booking.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

export default router;
