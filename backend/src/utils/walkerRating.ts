import mongoose from "mongoose";
import Review from "../models/review";
import Walker from "../models/walker";

const pendingRatingUpdates = new Map<string, Promise<void>>();

/** Redondea una calificación promedio a un decimal. */
export const roundRating = (value: number): number => Math.round(value * 10) / 10;

/**
 * Recalcula y persiste la calificación promedio de un paseador a partir de sus reseñas,
 * serializando actualizaciones concurrentes en este proceso para el mismo paseador.
 */
export const syncWalkerRating = async (walkerId: mongoose.Types.ObjectId): Promise<number> => {
  const key = walkerId.toString();
  const previous = pendingRatingUpdates.get(key) ?? Promise.resolve();

  const current = previous.then(async (): Promise<number> => {
    const [summary] = await Review.aggregate<{ averageRating: number }>([
      { $match: { walker: walkerId } },
      { $group: { _id: "$walker", averageRating: { $avg: "$rating" } } },
    ]);

    const rating =
      summary && typeof summary.averageRating === "number" && Number.isFinite(summary.averageRating)
        ? roundRating(summary.averageRating)
        : 0;

    await Walker.findByIdAndUpdate(walkerId, { rating });
    return rating;
  });

  const queueEntry = current.then(
    () => undefined,
    () => undefined
  );
  pendingRatingUpdates.set(key, queueEntry);

  try {
    return await current;
  } finally {
    if (pendingRatingUpdates.get(key) === queueEntry) {
      pendingRatingUpdates.delete(key);
    }
  }
};
