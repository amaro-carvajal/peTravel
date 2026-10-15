import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";
import config from "./config";


const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: { name: string; message: string },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "token expirado" });
  } else {
    next(error);
  }
};

export default { requestLogger, unknownEndpoint, errorHandler };