import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
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

const sinDesbordeHorizontal = async (page: Page, ruta: string) => {
  const medidas = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    medidas.scrollWidth,
    `Desborde horizontal en ${ruta} (${medidas.scrollWidth}px > ${medidas.innerWidth}px)`,
  ).toBeLessThanOrEqual(medidas.innerWidth);
};

test.describe("Diseño responsive móvil", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("no genera desborde horizontal en las vistas públicas ni autenticadas", async ({
    page,
    playwright,
    baseURL,
  }) => {
    const apiBaseUrl = baseURL ?? "http://127.0.0.1:4317";
    const walkerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });
    const ownerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });

    const walker = await crearUsuario(walkerApi, "walker");
    const owner = await crearUsuario(ownerApi, "owner");

    let walkerId = "";
    let completedBookingId = "";

    try {
      const walkerCsrf = await iniciarSesionApi(walkerApi, walker.email, walker.password);
      const walkerRes = await walkerApi.post("/walkers", {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: {
          name: "Paseador Responsive",
          description: "Paseos seguros y puntuales en móvil y escritorio.",
          coverageAreas: ["Providencia", "Ñuñoa"],
          hourlyRate: 6500,
          phone: "+56 9 2222 3333",
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
      walkerId = ((await walkerRes.json()) as IdResponse).id;

      const ownerCsrf = await iniciarSesionApi(ownerApi, owner.email, owner.password);
      const petRes = await ownerApi.post("/pets", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: { name: "Toby", breed: "Beagle", size: "medium", notes: "Usa arnés" },
      });
      expect(petRes.status()).toBe(201);
      const petId = ((await petRes.json()) as IdResponse).id;

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const bookingAcceptedRes = await ownerApi.post("/bookings", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: {
          pet: petId,
          walker: walkerId,
          date: tomorrow,
          startTime: "10:00",
          durationMinutes: 60,
          pickupAddress: "Av. Providencia 123",
          totalPrice: 6500,
        },
      });
      expect(bookingAcceptedRes.status()).toBe(201);
      const acceptedBookingId = ((await bookingAcceptedRes.json()) as IdResponse).id;

      const bookingCompletedRes = await ownerApi.post("/bookings", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: {
          pet: petId,
          walker: walkerId,
          date: tomorrow,
          startTime: "12:00",
          durationMinutes: 60,
          pickupAddress: "Av. Providencia 123",
          totalPrice: 6500,
        },
      });
      expect(bookingCompletedRes.status()).toBe(201);
      completedBookingId = ((await bookingCompletedRes.json()) as IdResponse).id;

      // Aceptar ambas reservas y marcar la segunda como completada
      for (const id of [acceptedBookingId, completedBookingId]) {
        const acceptRes = await walkerApi.put(`/bookings/${id}`, {
          headers: { "X-CSRF-Token": walkerCsrf },
          data: { status: "accepted" },
        });
        expect(acceptRes.status()).toBe(200);
      }
      const completeRes = await walkerApi.put(`/bookings/${completedBookingId}`, {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: { status: "completed" },
      });
      expect(completeRes.status()).toBe(200);
    } finally {
      await Promise.all([walkerApi.dispose(), ownerApi.dispose()]);
    }

    // Vistas públicas
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Paseadores disponibles" })).toBeVisible();
    await expect(page.getByText("Paseador Responsive")).toBeVisible();
    await sinDesbordeHorizontal(page, "/");

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    await sinDesbordeHorizontal(page, "/login");

    await page.goto("/registro");
    await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
    await sinDesbordeHorizontal(page, "/registro");

    await page.goto(`/paseadores/${walkerId}`);
    await expect(page.getByRole("heading", { name: "Paseador Responsive" })).toBeVisible();
    await sinDesbordeHorizontal(page, `/paseadores/${walkerId}`);

    // Sesión de paseador
    await iniciarSesion(page, walker);
    await expect(page.getByRole("heading", { name: "Paseadores disponibles" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Tienes un paseo agendado");
    await sinDesbordeHorizontal(page, "/ (walker)");

    await page.goto("/mis-paseos");
    await expect(page.getByRole("heading", { name: "Mis paseos" })).toBeVisible();
    await expect(page.getByText("Aceptado", { exact: true }).first()).toBeVisible();
    await sinDesbordeHorizontal(page, "/mis-paseos (walker)");

    await page.goto("/mi-perfil");
    await expect(page.getByRole("heading", { name: "Paseador Responsive" })).toBeVisible();
    await sinDesbordeHorizontal(page, "/mi-perfil");

    await page.getByRole("button", { name: "Editar perfil" }).click();
    await expect(page.getByRole("heading", { name: "Edita tu perfil de paseador" })).toBeVisible();
    await sinDesbordeHorizontal(page, "/mi-perfil (edición)");

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();

    // Sesión de dueño
    await iniciarSesion(page, owner);
    await page.goto("/mis-mascotas");
    await expect(page.getByRole("heading", { name: "Mis mascotas" })).toBeVisible();
    await expect(page.getByText("🐾 Toby")).toBeVisible();
    await sinDesbordeHorizontal(page, "/mis-mascotas");

    await page.goto("/mascotas/nueva");
    await expect(page.getByRole("heading", { name: /Registrar a tu mascota/ })).toBeVisible();
    await sinDesbordeHorizontal(page, "/mascotas/nueva");

    await page.goto(`/paseadores/${walkerId}/agendar`);
    await expect(page.getByRole("heading", { name: "Agenda un paseo con Paseador Responsive" })).toBeVisible();
    await sinDesbordeHorizontal(page, `/paseadores/${walkerId}/agendar`);

    await page.goto("/mis-paseos");
    await expect(page.getByRole("heading", { name: "Mis paseos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dejar reseña" }).first()).toBeVisible();
    await sinDesbordeHorizontal(page, "/mis-paseos (owner)");

    await page.goto(`/paseos/${completedBookingId}/resena`);
    await expect(page.getByText("Paseo finalizado")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar reseña" })).toBeVisible();
    await sinDesbordeHorizontal(page, `/paseos/${completedBookingId}/resena`);
  });
});
