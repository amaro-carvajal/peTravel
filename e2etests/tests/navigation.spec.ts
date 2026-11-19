import { expect, test } from "@playwright/test";
import { abrirMiEspacio, crearUsuario, iniciarSesion } from "./helper";

test.describe("Navegación con sesión", () => {
  test.beforeEach(async ({ page, request }) => {
    await iniciarSesion(page, await crearUsuario(request, "owner"));
  });

  test("navega entre vistas y conserva el historial atrás y adelante", async ({ page }) => {
    await abrirMiEspacio(page, "Mis mascotas");
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await abrirMiEspacio(page, "Mis paseos");
    await expect(page.getByRole("heading", { name: "Mis paseos" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/mis-paseos$/);
    await expect(page.getByRole("heading", { name: "Mis paseos" })).toBeVisible();
  });

  test("abre una ruta interna directamente y restaura sesión al recargar", async ({ page }) => {
    const response = await page.goto("/mis-mascotas");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
    const recarga = await page.reload();
    expect(recarga?.status()).toBe(200);
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  });
});

test.describe("Navegación pública", () => {
  test("muestra la página 404 y permite volver al inicio", async ({ page }) => {
    await page.goto("/ruta-inexistente");
    await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
    await page.getByRole("link", { name: "Volver al inicio" }).click();
    await expect(page.getByRole("heading", { name: "Paseadores disponibles" })).toBeVisible();
  });
});
