import express from "express";
import mongoose from "mongoose";
import Review from "../models/review";
import Booking from "../models/booking";
import middleware from "../utils/middleware";
import { syncWalkerRating } from "../utils/walkerRating";

const router = express.Router();

router.get("/", async (request, response) => {
  const { walker } = request.query;

  if (walker !== undefined && (typeof walker !== "string" || !mongoose.isObjectIdOrHexString(walker))) {
    response.status(400).json({ error: "Paseador inválido" });
    return;
  }

  const reviews = await Review.find(walker === undefined ? {} : { walker });
  response.json(reviews);
});

router.get("/:id", async (request, response) => {
  const review = await Review.findById(request.params.id);

  if (!review) {
    response.status(404).json({ error: "Reseña no encontrada" });
    return;
  }

  response.json(review);
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

  const fields = body as Record<string, unknown>;

  if (Object.keys(fields).some((field) => !["booking", "rating", "comment"].includes(field))) {
    response.status(400).json({ error: "Campos no permitidos" });
    return;
  }

  const { booking, rating, comment } = fields;

  if (typeof booking !== "string" || !mongoose.isObjectIdOrHexString(booking)) {
    response.status(400).json({ error: "Reserva inválida" });
    return;
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    response.status(400).json({ error: "La calificación debe ser un entero entre 1 y 5" });
    return;
  }

  if (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 500) {
    response.status(400).json({ error: "Comentario inválido" });
    return;
  }

  const selectedBooking = await Booking.findById(booking);

  if (!selectedBooking) {
    response.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  if (selectedBooking.owner.toString() !== request.userId) {
    response.status(404).json({ error: "Reserva no encontrada" });
    return;
  }

  if (selectedBooking.status !== "completed") {
    response.status(400).json({ error: "La reserva debe estar completada" });
    return;
  }

  const existingReview = await Review.findOne({ booking });

  if (existingReview) {
    response.status(409).json({ error: "La reserva ya tiene una reseña" });
    return;
  }

  const review = new Review({
    author: request.userId,
    walker: selectedBooking.walker,
    booking: selectedBooking._id,
    rating,
    comment,
  });

  try {
    const savedReview = await review.save();
    await syncWalkerRating(savedReview.walker);
    response.status(201).json(savedReview);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      response.status(409).json({ error: "La reserva ya tiene una reseña" });
      return;
    }

    throw error;
  }
});

router.put("/:id", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const review = await Review.findById(request.params.id);

  if (!review) {
    response.status(404).json({ error: "Reseña no encontrada" });
    return;
  }

  if (review.author.toString() !== request.userId) {
    response.status(403).json({ error: "No puedes modificar esta reseña" });
    return;
  }

  const fields = body as Record<string, unknown>;

  if (Object.keys(fields).some((field) => !["rating", "comment"].includes(field))) {
    response.status(400).json({ error: "Campos no permitidos" });
    return;
  }

  const { rating, comment } = fields;

  if (rating !== undefined && (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)) {
    response.status(400).json({ error: "La calificación debe ser un entero entre 1 y 5" });
    return;
  }

  if (comment !== undefined && (typeof comment !== "string" || comment.trim().length === 0 || comment.length > 500)) {
    response.status(400).json({ error: "Comentario inválido" });
    return;
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;

  const updatedReview = await review.save();
  await syncWalkerRating(updatedReview.walker);
  response.json(updatedReview);
});

router.delete("/:id", middleware.withUser, middleware.requireRole("owner"), async (request, response) => {
  const review = await Review.findById(request.params.id);

  if (!review) {
    response.status(404).json({ error: "Reseña no encontrada" });
    return;
  }

  if (review.author.toString() !== request.userId) {
    response.status(403).json({ error: "No puedes eliminar esta reseña" });
    return;
  }

  await Review.findByIdAndDelete(request.params.id);
  await syncWalkerRating(review.walker);
  response.status(204).end();
});

export default router;
