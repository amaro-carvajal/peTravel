import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import walkersRouter from "./controllers/walkers";
import middleware from "./utils/middleware";
import config from "./utils/config";
import logger from "./utils/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(cookieParser());

app.use("/walkers", walkersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(Number(config.PORT), config.HOST, () => {
  logger.info(`Servidor escuchando en http://${config.HOST}:${config.PORT}`);
});
