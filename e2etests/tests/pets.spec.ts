import { expect, test } from "@playwright/test";
import { abrirMiEspacio, crearUsuario, iniciarSesion } from "./helper";

test.describe("Mascotas", () => {
  test.beforeEach(async ({ page, request }) => {
    await iniciarSesion(page, await crearUsuario(request, "owner"));
    await abrirMiEspacio(page, "Mis mascotas");
    await expect(page.getByText("Aún no tienes mascotas registradas.")).toBeVisible();
  });

  test("registra, edita y elimina una mascota desde la interfaz", async ({ page }) => {
    await page.getByRole("link", { name: "Registrar mascota" }).click();
    await page.getByLabel("Nombre de la mascota").fill("Luna");
    await page.getByLabel("Raza").fill("Mestiza");
    await page.getByLabel("Tamaño").selectOption("medium");
    await page.getByLabel(/Notas o cuidados especiales/).fill("Usa arnés");
    await page.getByRole("button", { name: "Guardar mascota" }).click();
    await expect(page.getByRole("status")).toContainText("Luna ya está en tu lista");
    await expect(page.getByRole("link", { name: "Editar a Luna", exact: true })).toBeVisible();
    await expect(page.getByText("Mestiza", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Editar a Luna", exact: true }).click();
    await expect(page.getByLabel("Nombre de la mascota")).toHaveValue("Luna");
    await page.getByLabel("Nombre de la mascota").fill("Luna actualizada");
    await page.getByLabel("Raza").fill("Labrador");
    await page.getByLabel("Tamaño").selectOption("large");
    await page.getByLabel(/Notas o cuidados especiales/).fill("Paseos tranquilos");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("Cambios guardados para Luna actualizada");

    const verificarEdicion = async () => {
      await expect(page.getByRole("link", { name: "Editar a Luna actualizada" })).toBeVisible();
      await expect(page.getByText("Labrador", { exact: true })).toBeVisible();
      await expect(page.getByText("Grande", { exact: true })).toBeVisible();
      await expect(page.getByText("Paseos tranquilos", { exact: true })).toBeVisible();
    };
    await verificarEdicion();
    await page.reload();
    await verificarEdicion();

    await page.getByRole("button", { name: "Eliminar a Luna actualizada" }).click();
    await page.getByRole("dialog", { name: "Eliminar mascota" })
      .getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(page.getByRole("status")).toContainText("Luna actualizada se eliminó correctamente");
    await expect(page.getByText("Aún no tienes mascotas registradas.")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Aún no tienes mascotas registradas.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Editar a Luna actualizada" })).toHaveCount(0);
  });
});
