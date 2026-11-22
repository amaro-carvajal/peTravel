import express from "express";
import type { QueryFilter } from "mongoose";
import Walker from "../models/walker";
import type { WalkerData } from "../models/walker";
import middleware from "../utils/middleware";

const router = express.Router();

router.get("/", async (request, response) => {
  const { commune, maxRate, minRating, search } = request.query;
  const filter: QueryFilter<WalkerData> = {};

  if (typeof commune === "string") {
    filter.coverageAreas = { $in: [commune] };
  }

  if (typeof maxRate === "string") {
    const maxRateNumber = Number(maxRate);

    if (Number.isNaN(maxRateNumber) || maxRateNumber < 0) {
      response.status(400).json({ error: "maxRate inválido" });
      return;
    }

    filter.hourlyRate = { $lte: maxRateNumber };
  }

  if (typeof minRating === "string") {
    const minRatingNumber = Number(minRating);

    if (
      Number.isNaN(minRatingNumber) ||
      minRatingNumber < 0 ||
      minRatingNumber > 5
    ) {
      response.status(400).json({ error: "minRating inválido" });
      return;
    }

    filter.rating = { $gte: minRatingNumber };
  }

  if (typeof search === "string") {
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(escapedSearch, "i");

    filter.$or = [
      { name: regex },
      { description: regex },
    ];
  }

  const walkers = await Walker.find(filter);
  response.json(walkers);
});

router.get("/me", middleware.withUser, async (request, response) => {
  const walker = await Walker.findOne({ user: request.userId });

  if (!walker) {
    response.status(404).json({ error: "Aún no tienes un perfil de paseador" });
    return;
  }

  response.json(walker);
});

router.get("/:id", async (request, response) => {
  const walker = await Walker.findById(request.params.id);
  if (!walker) {
    response.status(404).json({ error: "Paseador no encontrado" });
    return;
  }
  response.json(walker);
});

router.post(
  "/",
  middleware.withUser,
  middleware.requireRole("walker"),
  async (request, response) => {
    if (!request.userId) {
      response.status(401).json({ error: "Sesión requerida" });
      return;
    }

    if (
      !request.body ||
      typeof request.body !== "object" ||
      Array.isArray(request.body)
    ) {
      response.status(400).json({ error: "Datos inválidos" });
      return;
    }

    const {
      name,
      photo,
      description,
      coverageAreas,
      hourlyRate,
      availability,
      phone,
      email,
    } = request.body;

    if (!name) {
      response.status(400).json({ error: "El nombre es obligatorio" });
      return;
    }

    if (!description) {
      response.status(400).json({ error: "La descripción es obligatoria" });
      return;
    }

    if (!coverageAreas) {
      response.status(400).json({ error: "Las comunas de cobertura son obligatorias" });
      return;
    }

    if (hourlyRate === undefined) {
      response.status(400).json({ error: "La tarifa por hora es obligatoria" });
      return;
    }

    if (!phone) {
      response.status(400).json({ error: "El teléfono es obligatorio" });
      return;
    }

    if (!email) {
      response.status(400).json({ error: "El correo es obligatorio" });
      return;
    }

    const walker = new Walker({
      name,
      photo,
      description,
      coverageAreas,
      hourlyRate,
      availability,
      phone,
      email,
      user: request.userId,
    });

    const savedWalker = await walker.save();

    response.status(201).json(savedWalker);
  }
);

router.put(
  "/:id",
  middleware.withUser,
  middleware.requireRole("walker"),
  async (request, response) => {
    if (!request.userId) {
      response.status(401).json({ error: "Sesión requerida" });
      return;
    }

    if (
      !request.body ||
      typeof request.body !== "object" ||
      Array.isArray(request.body)
    ) {
      response.status(400).json({ error: "Datos inválidos" });
      return;
    }

    const walker = await Walker.findById(request.params.id);

    if (!walker) {
      response.status(404).json({ error: "Paseador no encontrado" });
      return;
    }

    if (!walker.user || walker.user.toString() !== request.userId) {
      response
        .status(403)
        .json({ error: "No puedes modificar este perfil" });
      return;
    }

    const {
      name,
      photo,
      description,
      coverageAreas,
      hourlyRate,
      availability,
      phone,
      email,
    } = request.body;

    if (name !== undefined) {
      walker.name = name;
    }

    if (photo !== undefined) {
      walker.photo = photo;
    }

    if (description !== undefined) {
      walker.description = description;
    }

    if (coverageAreas !== undefined) {
      walker.coverageAreas = coverageAreas;
    }

    if (hourlyRate !== undefined) {
      walker.hourlyRate = hourlyRate;
    }

    if (availability !== undefined) {
      walker.availability = availability;
    }

    if (phone !== undefined) {
      walker.phone = phone;
    }

    if (email !== undefined) {
      walker.email = email;
    }

    const updatedWalker = await walker.save();

    response.json(updatedWalker);
  }
);

router.delete(
  "/:id",
  middleware.withUser,
  middleware.requireRole("walker"),
  async (request, response) => {
    if (!request.userId) {
      response.status(401).json({ error: "Sesión requerida" });
      return;
    }

    const walker = await Walker.findById(request.params.id);

    if (!walker) {
      response.status(404).json({ error: "Paseador no encontrado" });
      return;
    }

    if (!walker.user || walker.user.toString() !== request.userId) {
      response
        .status(403)
        .json({ error: "No puedes eliminar este perfil" });
      return;
    }

    await Walker.findByIdAndDelete(request.params.id);

    response.status(204).end();
  }
);

export default router;