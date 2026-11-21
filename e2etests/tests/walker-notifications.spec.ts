import { expect, test, type APIRequestContext } from "@playwright/test";
import { crearUsuario, iniciarSesion } from "./helper";

interface IdResponse {
  id: string;
}

const iniciarSesionApi = async (
  api: APIRequestContext,
  email: string,
  password: string,
): Promise<string> => {
  const loginRes = await api.post("/auth/login", { data: { email, password } });
  expect(loginRes.status()).toBe(200);
  const csrfToken = loginRes.headers()["x-csrf-token"];
  expect(csrfToken).toBeTruthy();
  return csrfToken;
};

test.describe("Notificaciones de paseador", () => {
  test("muestra, actualiza, descarta y limpia notificaciones de paseos al iniciar sesión", async ({
    page,
    playwright,
    baseURL,
  }) => {
    const apiBaseUrl = baseURL ?? "http://127.0.0.1:4317";
    const walkerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });
    const ownerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });

    const walker = await crearUsuario(walkerApi, "walker");

    try {
      const walkerCsrf = await iniciarSesionApi(walkerApi, walker.email, walker.password);
      const walkerRes = await walkerApi.post("/walkers", {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: {
          name: "Paseador Notificaciones",
          description: "Paseador disponible toda la semana",
          coverageAreas: ["Providencia"],
          hourlyRate: 5000,
          phone: "+56 9 1111 2222",
          email: walker.email,
          availability: [
            {
              days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
              startTime: "08:00",
              endTime: "20:00",
            },
          ],
        },
      });
      expect(walkerRes.status()).toBe(201);
      const walkerProfile = (await walkerRes.json()) as IdResponse;

      const owner = await crearUsuario(ownerApi, "owner");
      const ownerCsrf = await iniciarSesionApi(ownerApi, owner.email, owner.password);

      const petRes = await ownerApi.post("/pets", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: { name: "Toby", breed: "Beagle", size: "medium" },
      });
      expect(petRes.status()).toBe(201);
      const pet = (await petRes.json()) as IdResponse;

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const bookingRes = await ownerApi.post("/bookings", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: {
          pet: pet.id,
          walker: walkerProfile.id,
          date: tomorrow,
          startTime: "10:00",
          durationMinutes: 60,
          pickupAddress: "Av. Providencia 123",
          totalPrice: 5000,
        },
      });
      expect(bookingRes.status()).toBe(201);
    } finally {
      await Promise.all([walkerApi.dispose(), ownerApi.dispose()]);
    }

    // 1 y 2. Al iniciar sesión como paseador aparece la notificación de solicitud pendiente
    await iniciarSesion(page, walker);
    const alerta = page.getByRole("status");
    await expect(alerta).toContainText("Tienes una solicitud de paseo pendiente");
    await expect(alerta).toContainText("1 solicitud pendiente");
    await expect(alerta).toContainText("Toby");

    // 3. El botón "Ver mis paseos" lleva a /mis-paseos y oculta el banner en esa vista
    await page.getByRole("link", { name: "Ver mis paseos" }).click();
    await expect(page).toHaveURL(/\/mis-paseos$/);
    await expect(page.getByText("Tienes una solicitud de paseo pendiente")).toBeHidden();

    // 4. Aceptar la solicitud pasa el paseo a agendado ("Aceptado")
    await page.getByRole("button", { name: "Aceptar" }).click();
    await expect(page.getByText("Aceptado", { exact: true }).first()).toBeVisible();

    // 5. Al volver al inicio, la notificación refleja el paseo agendado
    await page.getByRole("link", { name: /peTravel/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(alerta).toContainText("Tienes un paseo agendado");
    await expect(alerta).toContainText("1 paseo agendado");

    // 6. Descartar la notificación la mantiene oculta al navegar entre rutas SPA
    await page.getByRole("button", { name: "Cerrar notificación de paseos" }).click();
    await expect(page.getByText("Tienes un paseo agendado")).toBeHidden();
    await page.getByRole("button", { name: "Abrir menú Mi espacio" }).click();
    await page.getByRole("menuitem", { name: "Mi perfil" }).click();
    await expect(page).toHaveURL(/\/mi-perfil$/);
    await page.getByRole("link", { name: "Volver a paseadores" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Ver mis paseos" })).toHaveCount(0);

    // 7. Cerrar sesión y volver a iniciar sesión vuelve a mostrar la notificación de paseo agendado
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
    await iniciarSesion(page, walker);
    await expect(page.getByRole("status")).toContainText("Tienes un paseo agendado");

    // 8. Finalizar el paseo limpia la notificación activa
    await page.getByRole("link", { name: "Ver mis paseos" }).click();
    await expect(page).toHaveURL(/\/mis-paseos$/);
    await page.getByRole("button", { name: "Marcar como finalizado" }).first().click();
    await expect(page.getByText("Finalizado", { exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: /peTravel/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Ver mis paseos" })).toHaveCount(0);
  });
});
