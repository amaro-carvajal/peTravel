import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";
import config from "./config";
import type { UserRole } from "../models/user";

export interface SessionPayload extends jwt.JwtPayload {
  id: string;
  name: string;
  role: UserRole;
  csrf: string;
}

// Datos de la sesión disponibles en request después de withUser
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userName?: string;
      userRole?: UserRole;
      csrfToken?: string;
    }
  }
}

const sanitizeBody = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const sanitized = { ...(body as Record<string, unknown>) };

  if ("password" in sanitized) {
    sanitized.password = "[REDACTED]";
  }

  if ("passwordHash" in sanitized) {
    sanitized.passwordHash = "[REDACTED]";
  }

  return sanitized;
};

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", sanitizeBody(request.body));
  logger.info("---");
  next();
};

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: {
    name: string;
    message: string;
    code?: number;
    status?: number;
    type?: string;
  },
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  logger.error(error.message);

  if (
    error.name === "SyntaxError" &&
    error.status === 400 &&
    error.type === "entity.parse.failed"
  ) {
    response.status(400).json({ error: "JSON inválido" });
  } else if (error.name === "CastError") {
    response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "Token expirado" });
  } else if (error.name === "JsonWebTokenError") {
    response.status(401).json({ error: "Token inválido" });
  } else if (error.code === 11000) {
    // índice único violado (por ejemplo, email repetido)
    response.status(409).json({
      error: "Ya existe un registro con esos datos",
    });
  } else {
    // siempre JSON, nunca el HTML por defecto de Express
    response.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

const withUser = (request: Request, response: Response, next: NextFunction) => {
  const token = request.cookies?.token;
  if (!token) {
    response.status(401).json({ error: "Sesión requerida" });
    return;
  }

  const decoded = jwt.verify(token, config.JWT_SECRET) as {
    id: string;
    name: string;
    role: UserRole;
    csrf: string;
  };

  const csrfHeader = request.header("X-CSRF-Token");
  if (!csrfHeader || csrfHeader !== decoded.csrf) {
    response.status(403).json({ error: "CSRF inválido" });
    return;
  }

  request.userId = decoded.id;
  request.userName = decoded.name;
  request.userRole = decoded.role;
  next();
};

const requireRole =
  (role: UserRole) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (request.userRole !== role) {
      response.status(403).json({ error: "No tienes permisos para esta acción" });
      return;
    }
    next();
  };

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  withUser,
  requireRole,
};
