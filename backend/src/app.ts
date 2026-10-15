import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import middleware from "./utils/middleware";
import walkersRouter from "./controllers/walkers";

const app = express();

app.use(express.static("dist"));
app.use(cors());
app.use(middleware.requestLogger);
app.use(express.json());
app.use(cookieParser());


app.use("/walkers", walkersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
