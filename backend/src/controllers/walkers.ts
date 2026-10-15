import express from "express";
import type { Request } from "express";
import type { QueryFilter } from "mongoose";
import Walker from "../models/walker";
import type { WalkerData } from "../models/walker";

interface WalkerParams {
  id: string;
}

interface WalkerQuery {
  commune?: string;
  maxRate?: string;
  minRating?: string;
  search?: string;
}

interface WalkerBody extends Partial<Omit<WalkerData, "id" | "rating">> {
  rating?: unknown;
}

const router = express.Router();

router.get("/", async (
  request: Request<Record<string, never>, unknown, unknown, WalkerQuery>,
  response
) => {
  const { commune, maxRate, minRating, search } = request.query;
  const filter: QueryFilter<WalkerData> = {};

  if (commune !== undefined) {
    filter.coverageAreas = { $in: [commune] };
  }

  if (maxRate !== undefined) {
    const rate = Number(maxRate);
    if (typeof maxRate !== "string" || maxRate.trim() === "" || !Number.isFinite(rate)) {
      response.status(400).json({ error: "maxRate inválido" });
      return;
    }
    filter.hourlyRate = { $lte: rate };
  }

  if (minRating !== undefined) {
    const rating = Number(minRating);
    if (typeof minRating !== "string" || minRating.trim() === "" || !Number.isFinite(rating)) {
      response.status(400).json({ error: "minRating inválido" });
      return;
    }
    filter.rating = { $gte: rating };
  }

  if (search !== undefined) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const walkers = await Walker.find(filter);
  response.json(walkers);
});

router.get("/:id", async (request: Request<WalkerParams, unknown, unknown>, response) => {
  const walker = await Walker.findById(request.params.id);
  if (!walker) {
    response.status(404).json({ error: "Walker no encontrado" });
    return;
  }
  response.json(walker);
});

router.post("/", async (
  request: Request<Record<string, never>, unknown, WalkerBody>,
  response
) => {
  const { rating: _rating, ...body } = request.body;
  const walker = await Walker.create(body);
  response.status(201).json(walker);
});

router.put("/:id", async (request: Request<WalkerParams, unknown, WalkerBody>, response) => {
  const { rating: _rating, ...body } = request.body;
  const walker = await Walker.findByIdAndUpdate(request.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!walker) {
    response.status(404).json({ error: "Walker no encontrado" });
    return;
  }
  response.json(walker);
});

router.delete("/:id", async (request: Request<WalkerParams, unknown, unknown>, response) => {
  const walker = await Walker.findByIdAndDelete(request.params.id);
  if (!walker) {
    response.status(404).json({ error: "Walker no encontrado" });
    return;
  }
  response.status(204).end();
});

export default router;