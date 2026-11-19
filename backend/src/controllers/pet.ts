import express from "express";
import Pet from "../models/pet";
import Walker from "../models/walker";
import Booking from "../models/booking";
import middleware from "../utils/middleware";
import { withPetLock } from "../utils/petLock";

const router = express.Router();

router.get("/", middleware.withUser, async (request, response) => {
  if (request.userRole === "owner") {
    const pets = await Pet.find({ owner: request.userId });
    response.json(pets);
    return;
  }

  if (request.userRole !== "walker") {
    response.status(403).json({ error: "No tienes permisos para esta acción" });
    return;
  }

  const walkers = await Walker.find({ user: request.userId });
  const walkerIds = walkers.map((walker) => walker._id);
  const bookings = await Booking.find({ walker: { $in: walkerIds } });
  const petIds = bookings.map((booking) => booking.pet);
  const pets = await Pet.find({ _id: { $in: petIds } });

  response.json(pets);
});

router.get("/:id", middleware.withUser, async (request, response) => {
  if (request.userRole === "owner") {
    const pet = await Pet.findOne({
      _id: request.params.id,
      owner: request.userId,
    });

    if (!pet) {
      response.status(404).json({ error: "Mascota no encontrada" });
      return;
    }

    response.json(pet);
    return;
  }

  if (request.userRole !== "walker") {
    response.status(403).json({ error: "No tienes permisos para esta acción" });
    return;
  }

  const walkers = await Walker.find({ user: request.userId });
  const walkerIds = walkers.map((walker) => walker._id);
  const booking = await Booking.exists({
    walker: { $in: walkerIds },
    pet: request.params.id,
  });

  if (!booking) {
    response.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  const pet = await Pet.findById(request.params.id);

  if (!pet) {
    response.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  response.json(pet);
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

  const { name, breed, size, notes } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    response.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }

  if (typeof breed !== "string" || breed.trim().length === 0) {
    response.status(400).json({ error: "La raza es obligatoria" });
    return;
  }

  if (size !== "small" && size !== "medium" && size !== "large") {
    response.status(400).json({ error: "Tamaño inválido" });
    return;
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    response.status(400).json({ error: "Notas inválidas" });
    return;
  }

  const pet = new Pet({
    owner: request.userId,
    name,
    breed,
    size,
    notes,
  });

  const savedPet = await pet.save();
  response.status(201).json(savedPet);
});

router.put("/:id", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Sesión requerida" });
    return;
  }

  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const pet = await Pet.findById(request.params.id);

  if (!pet) {
    response.status(404).json({ error: "Mascota no encontrada" });
    return;
  }

  if (pet.owner.toString() !== request.userId) {
    response.status(403).json({ error: "No puedes modificar esta mascota" });
    return;
  }

  const { name, breed, size, notes } = body as Record<string, unknown>;

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    response.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }

  if (breed !== undefined && (typeof breed !== "string" || breed.trim().length === 0)) {
    response.status(400).json({ error: "La raza es obligatoria" });
    return;
  }

  if (size !== undefined && size !== "small" && size !== "medium" && size !== "large") {
    response.status(400).json({ error: "Tamaño inválido" });
    return;
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
    response.status(400).json({ error: "Notas inválidas" });
    return;
  }

  if (name !== undefined) {
    pet.name = name;
  }

  if (breed !== undefined) {
    pet.breed = breed;
  }

  if (size !== undefined) {
    pet.size = size;
  }

  if (notes !== undefined) {
    pet.notes = notes;
  }

  const updatedPet = await pet.save();
  response.json(updatedPet);
});

router.delete("/:id", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  if (!request.userId) {
    response.status(401).json({ error: "Sesión requerida" });
    return;
  }

  const { id } = request.params;
  if (typeof id !== "string") {
    response.status(400).json({ error: "ID de mascota inválido" });
    return;
  }

  await withPetLock(id, async () => {
    const pet = await Pet.findById(id);

    if (!pet) {
      response.status(404).json({ error: "Mascota no encontrada" });
      return;
    }

    if (pet.owner.toString() !== request.userId) {
      response.status(403).json({ error: "No puedes eliminar esta mascota" });
      return;
    }

    if (await Booking.exists({ pet: pet._id })) {
      response.status(409).json({ error: "No puedes eliminar una mascota vinculada a reservas" });
      return;
    }

    await pet.deleteOne();
    response.status(204).end();
  });
});

export default router;
