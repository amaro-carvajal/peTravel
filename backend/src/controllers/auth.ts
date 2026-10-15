import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user";
import config from "../utils/config";
import middleware from "../utils/middleware";

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_TIME_LIMIT = 60 * 60 * 1000; // 1h

const cookieOptions = {
  httpOnly: true,
};

// POST /auth/register: crea el usuario guardando solo el hash
router.post("/register", async (request, response) => {
  if (
    !request.body ||
    typeof request.body !== "object" ||
    Array.isArray(request.body)
  ) {
    response.status(400).json({ error: "Datos de registro inválidos" });
    return;
  }

  const { name, email, password, role } = request.body;

  // Primero validamos los tipos recibidos
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    response.status(400).json({ error: "Datos de registro inválidos" });
    return;
  }

  if (name.trim().length < 2) {
    response.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    response.status(400).json({ error: "El correo es inválido" });
    return;
  }

  if (password.length < 8) {
    response
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  if (role !== "owner" && role !== "walker") {
    response.status(400).json({ error: "El rol debe ser dueño o paseador" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    response.status(409).json({ error: "El email ya está registrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

// POST /auth/login: JWT en cookie httpOnly + token CSRF en un header
router.post("/login", async (request, response) => {
  if (
    !request.body ||
    typeof request.body !== "object" ||
    Array.isArray(request.body)
  ) {
    response.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const { email, password } = request.body;

  // Login inválido siempre responde igual
  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    response.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  const passwordCorrect = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordCorrect) {
    // mismo mensaje para email y contraseña: no revela cuál falló
    response.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const csrf = crypto.randomUUID();

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
      csrf,
    },
    config.JWT_SECRET,
    { expiresIn: "1h" }
  );

  response
    .cookie("token", token, {
      ...cookieOptions,
      maxAge: SESSION_TIME_LIMIT,
    })
    .header("X-CSRF-Token", csrf)
    .json(user);
});

// GET /auth/me: usuario de la sesión actual
router.get("/me", middleware.withUser, async (request, response) => {
  const user = await User.findById(request.userId);

  if (!user) {
    response.status(404).json({ error: "Sesión requerida" });
    return;
  }

  response.status(200).json(user);
});

// POST /auth/logout: borra la cookie
router.post("/logout", middleware.withUser, async (_request, response) => {
  response
    .clearCookie("token", cookieOptions)
    .json({ message: "Sesión cerrada" });
});

export default router;