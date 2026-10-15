import express from "express";
import type { QueryFilter } from "mongoose";
import Walker from "../models/walker";
import type { WalkerData } from "../models/walker";

interface WalkerQuery {
  commune?: string;
  maxRate?: number; 
  minRating?: number; 
  search?: string;
}

interface WalkerBody extends Partial<Omit<WalkerData, "id" | "rating">> {
  rating?: unknown;
}

const router = express.Router();

router.get("/", async (request, response) => {
  const { commune, maxRate, minRating, search } = request.query as unknown as WalkerQuery;
  const filter: QueryFilter<WalkerData> = {};

  if (commune !== undefined) {
    filter.coverageAreas = { $in: [commune] };
  }

  if (maxRate !== undefined) {
    filter.hourlyRate = { $lte: maxRate};
  }

  if (minRating !== undefined) {
    filter.rating = { $gte: minRating};
  }

  if (search !== undefined) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const walkers = await Walker.find(filter);
  response.json(walkers);
});

router.get("/:id", async (request, response) => {
  const walker = await Walker.findById(request.params.id);
  if (!walker) {
    response.status(404).json({ error: "Walker no encontrado" });
    return;
  }
  response.json(walker);
});

router.post("/", async (request, response) => {
  const { rating: _rating, ...body } = request.body as WalkerBody;
  const walker = await Walker.create(body);
  response.status(201).json(walker);
});

router.put("/:id", async (request, response) => {
  const { rating: _rating, ...body } = request.body as WalkerBody;
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

router.delete("/:id", async (request, response) => {
  const walker = await Walker.findByIdAndDelete(request.params.id);
  if (!walker) {
    response.status(404).json({ error: "Walker no encontrado" });
    return;
  }
  response.status(204).end();
});

export default router;