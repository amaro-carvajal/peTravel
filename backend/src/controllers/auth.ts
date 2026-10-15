import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user";
import config from "../utils/config";
import middleware from "../utils/middleware";

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_TIME_LIMIT= 60 * 60 * 1000; // 1h

const cookieOptions = {
  httpOnly: true,
};

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

// POST /auth/register: crea el usuario guardando solo el hash
router.post("/register", async (request, response) => {
  const { name, email, password, role } = request.body;

  if (!name || name.trim().length < 2) {
    response.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    response.status(400).json({ error: "El correo es inválido" });
    return;
  }
  if (!password || password.length < 8) {
    response
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }
  if (role !== "owner" && role !== "walker") {
    response.status(400).json({ error: "El rol debe ser dueño o paseador" });
    return;
  }

  const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingEmail) {
    response.status(409).json({ error: "El email ya está registrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, passwordHash, role });
  const savedUser = await user.save();

  response.status(201).json(savedUser); 
});

// POST /auth/login: JWT en cookie httpOnly + token CSRF en un header
router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  const user =
    email && password
      ? await User.findOne({ email: email.trim().toLowerCase() })
      : null;
  const passwordCorrect =
    user && (await bcrypt.compare(password as string, user.passwordHash));

  if (!user || !passwordCorrect) {
    // mismo mensaje para email y contraseña: no revela cuál falló
    response.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const csrf = crypto.randomUUID();

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, csrf },
    config.JWT_SECRET,
    { expiresIn: "1h" }
  );

  response
    .cookie("token", token, { ...cookieOptions, maxAge: SESSION_TIME_LIMIT })
    .header("X-CSRF-Token", csrf)
    .json(user);
});

// GET /auth/me: usuario de la sesión actual
router.get("/me", middleware.withUser, async (request, response) => {
  const user = await User.findById(request.userId);

  if (!user) {
    response.status(401).json({ error: "Sesión requerida" });
    return;
  }

  // se reenvía el csrf por si el localStorage se limpió pero la cookie sigue viva
  response.header("X-CSRF-Token", request.csrfToken).json(user);
});

// POST /auth/logout: borra la cookie
router.post("/logout", middleware.withUser, async (_request, response) => {
  response.clearCookie("token", cookieOptions).json({ message: "Sesión cerrada" });
});

export default router;
