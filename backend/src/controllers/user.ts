import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user";
import middleware from "../utils/middleware";

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/", async (_request, response) => {
  const users = await User.find({});
  response.json(users);
});

router.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id);

  if (!user) {
    response.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  response.json(user);
});

router.post("/", async (request, response) => {
  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos de registro inválidos" });
    return;
  }

  const fields = body as Record<string, unknown>;

  if (Object.keys(fields).some((field) => !["name", "email", "password", "role"].includes(field))) {
    response.status(400).json({ error: "Campos no permitidos" });
    return;
  }

  const { name, email, password, role } = fields;

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || typeof role !== "string") {
    response.status(400).json({ error: "Datos de registro inválidos" });
    return;
  }

  if (name.trim().length < 2 || name.trim().length > 80) {
    response.status(400).json({ error: "El nombre debe tener entre 2 y 80 caracteres" });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    response.status(400).json({ error: "El correo es inválido" });
    return;
  }

  if (password.length < 8) {
    response.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  if (role !== "owner" && role !== "walker") {
    response.status(400).json({ error: "El rol debe ser dueño o paseador" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingEmail = await User.findOne({ email: normalizedEmail });

  if (existingEmail) {
    response.status(409).json({ error: "El email ya está registrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ name: name.trim(), email: normalizedEmail, passwordHash, role });
  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

router.put("/:id", middleware.withUser, async (request, response) => {
  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    response.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const user = await User.findById(request.params.id);

  if (!user) {
    response.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (user.id !== request.userId) {
    response.status(403).json({ error: "No puedes modificar esta cuenta" });
    return;
  }

  const fields = body as Record<string, unknown>;

  if (Object.keys(fields).some((field) => !["name", "email", "password"].includes(field))) {
    response.status(400).json({ error: "Campos no permitidos" });
    return;
  }

  const { name, email, password } = fields;

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)) {
    response.status(400).json({ error: "El nombre debe tener entre 2 y 80 caracteres" });
    return;
  }

  if (email !== undefined && (typeof email !== "string" || !EMAIL_REGEX.test(email))) {
    response.status(400).json({ error: "El correo es inválido" });
    return;
  }

  if (password !== undefined && (typeof password !== "string" || password.length < 8)) {
    response.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });

    if (existingEmail) {
      response.status(409).json({ error: "El email ya está registrado" });
      return;
    }

    user.email = normalizedEmail;
  }

  if (name !== undefined) user.name = name.trim();
  if (password !== undefined) user.passwordHash = await bcrypt.hash(password, 10);

  const updatedUser = await user.save();
  response.json(updatedUser);
});

router.delete("/:id", middleware.withUser, async (request, response) => {
  const user = await User.findById(request.params.id);

  if (!user) {
    response.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (user.id !== request.userId) {
    response.status(403).json({ error: "No puedes eliminar esta cuenta" });
    return;
  }

  await User.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

export default router;
