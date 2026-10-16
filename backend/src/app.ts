import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./utils/config";
import logger from "./utils/logger";
import middleware from "./utils/middleware";
import authRouter from "./controllers/auth";
import walkersRouter from "./controllers/walker";
import petsRouter from "./controllers/pet";
import bookingsRouter from "./controllers/booking";
import reviewsRouter from "./controllers/review";
import usersRouter from "./controllers/user";

const app = express();

mongoose.set("strictQuery", false);

if (config.MONGODB_URI) {
  mongoose
    .connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
    .then(() => logger.info("connected to MongoDB"))
    .catch((error) => {
      logger.error("error connecting to MongoDB:", error.message);
    });
}

app.use(express.static("dist"));
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true, 
    exposedHeaders: ["X-CSRF-Token"], 
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(middleware.requestLogger);

app.use("/auth", authRouter);
app.use("/walkers", walkersRouter);
app.use("/pets", petsRouter);
app.use("/bookings", bookingsRouter);
app.use("/reviews", reviewsRouter);
app.use("/users", usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
