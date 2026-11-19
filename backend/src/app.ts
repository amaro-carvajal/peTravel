import express from "express";
import path from "node:path";
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
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

mongoose.set("strictQuery", false);

if (config.MONGODB_URI) {
  mongoose
    .connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
    .then(() => logger.info("connected to MongoDB"))
    .catch((error) => {
      logger.error("error connecting to MongoDB:", error.message);
    });
}

app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true, 
    exposedHeaders: ["X-CSRF-Token"], 
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(middleware.requestLogger);

app.use("/auth", authRouter, middleware.unknownEndpoint);
app.use("/walkers", walkersRouter, middleware.unknownEndpoint);
app.use("/pets", petsRouter, middleware.unknownEndpoint);
app.use("/bookings", bookingsRouter, middleware.unknownEndpoint);
app.use("/reviews", reviewsRouter, middleware.unknownEndpoint);
app.use("/users", usersRouter, middleware.unknownEndpoint);

app.use(express.static(frontendDist, { index: false, redirect: false }));
app.use(["/api", "/assets"], middleware.unknownEndpoint);

app.use((request, response, next) => {
  const navegacion = request.method === "GET" || request.method === "HEAD";
  if (!navegacion) return next();

  try {
    if (path.posix.extname(decodeURIComponent(request.path))) return next();
  } catch {
    return next();
  }

  response.vary("Accept");
  if (!request.accepts().includes("text/html")) return next();

  response.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next("status" in error && error.status === 404 ? undefined : error);
  });
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
