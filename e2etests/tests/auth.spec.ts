import { expect, test } from "@playwright/test";
import { crearUsuario, enviarLogin, iniciarSesion } from "./helper";

test.describe("Autenticación", () => {
  test("abre la página principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Paseadores disponibles" })).toBeVisible();
  });

  test("vuelve a Mis mascotas después de iniciar sesión", async ({ page, request }) => {
    const owner = await crearUsuario(request, "owner");
    await page.goto("/mis-mascotas");
    await expect(page).toHaveURL(/\/login\?next=%2Fmis-mascotas$/);
    await enviarLogin(page, owner);
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
  });

  test("muestra el error de credenciales incorrectas", async ({ page, request }) => {
    const owner = await crearUsuario(request, "owner");
    await page.goto("/login");
    await enviarLogin(page, { ...owner, password: "contraseña incorrecta" });
    await expect(page.getByText("Credenciales inválidas", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("cerrar sesión bloquea el acceso protegido", async ({ page, request }) => {
    await iniciarSesion(page, await crearUsuario(request, "owner"));
    await page.goto("/mis-mascotas");
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Fmis-mascotas$/);
    await page.goto("/mis-paseos");
    await expect(page).toHaveURL(/\/login\?next=%2Fmis-paseos$/);
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("un walker no puede acceder a rutas de owner", async ({ page, request }) => {
    await iniciarSesion(page, await crearUsuario(request, "walker"));

    for (const ruta of ["/mis-mascotas", "/mascotas/nueva", "/mascotas/id/editar",
      "/paseadores/id/agendar", "/paseos/id/resena"]) {
      await page.goto(ruta);
      await expect(page).toHaveURL("/");
      await expect(page.getByRole("heading", { name: "Paseadores disponibles" })).toBeVisible();
    }
  });
});
