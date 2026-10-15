import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import middleware from "./utils/middleware";

const app = express();

app.use(cors());
app.use(middleware.requestLogger);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_request, response) => {
  response.json({ message: "API peTravel funcionando" });
});

// Agregar las rutas de la API antes del manejo de errores.
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
