import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

type Rol = "owner" | "walker";

interface Credenciales {
  email: string;
  password: string;
}

export const crearUsuario = async (request: APIRequestContext, role: Rol): Promise<Credenciales> => {
  const credenciales = { email: `${role}-${randomUUID()}@petravel.test`, password: randomUUID() };
  const response = await request.post("/auth/register", {
    data: { ...credenciales, name: role === "owner" ? "Dueña de prueba" : "Paseador de prueba", role },
  });
  expect(response.status()).toBe(201);
  return credenciales;
};

export const enviarLogin = async (page: Page, { email, password }: Credenciales) => {
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel(/^Contraseña/).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
};

export const iniciarSesion = async (page: Page, usuario: Credenciales) => {
  await page.goto("/login");
  await enviarLogin(page, usuario);
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
};

export const abrirMiEspacio = async (page: Page, vista: "Mis mascotas" | "Mis paseos") => {
  await page.getByRole("button", { name: "Abrir menú Mi espacio" }).click();
  await page.getByRole("menuitem", { name: vista }).click();
};
