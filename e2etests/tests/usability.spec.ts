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

test.describe("Usabilidad y reseñas", () => {
  test("flujo de reseña actualiza reputación, marca reseña enviada y permite limpiar filtros", async ({
    page,
    playwright,
    baseURL,
  }) => {
    const apiBaseUrl = baseURL ?? "http://127.0.0.1:4317";
    const walkerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });
    const ownerApi = await playwright.request.newContext({ baseURL: apiBaseUrl });

    const walker = await crearUsuario(walkerApi, "walker");
    const owner = await crearUsuario(ownerApi, "owner");

    let completedBookingId = "";

    try {
      const walkerCsrf = await iniciarSesionApi(walkerApi, walker.email, walker.password);
      const walkerRes = await walkerApi.post("/walkers", {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: {
          name: "Paseador Usabilidad",
          description: "Especialista en paseos tranquilos y responsables.",
          coverageAreas: ["Providencia"],
          hourlyRate: 5500,
          phone: "+56 9 3333 4444",
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
      const walkerId = ((await walkerRes.json()) as IdResponse).id;

      const ownerCsrf = await iniciarSesionApi(ownerApi, owner.email, owner.password);
      const petRes = await ownerApi.post("/pets", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: { name: "Milo", breed: "Poodle", size: "small" },
      });
      expect(petRes.status()).toBe(201);
      const petId = ((await petRes.json()) as IdResponse).id;

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const bookingRes = await ownerApi.post("/bookings", {
        headers: { "X-CSRF-Token": ownerCsrf },
        data: {
          pet: petId,
          walker: walkerId,
          date: tomorrow,
          startTime: "14:00",
          durationMinutes: 60,
          pickupAddress: "Av. Nueva Providencia 456",
          totalPrice: 5500,
        },
      });
      expect(bookingRes.status()).toBe(201);
      completedBookingId = ((await bookingRes.json()) as IdResponse).id;

      const acceptRes = await walkerApi.put(`/bookings/${completedBookingId}`, {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: { status: "accepted" },
      });
      expect(acceptRes.status()).toBe(200);

      const completeRes = await walkerApi.put(`/bookings/${completedBookingId}`, {
        headers: { "X-CSRF-Token": walkerCsrf },
        data: { status: "completed" },
      });
      expect(completeRes.status()).toBe(200);
    } finally {
      await Promise.all([walkerApi.dispose(), ownerApi.dispose()]);
    }

    // 1. Título de la página y badge "Sin reseñas" para paseador nuevo
    await page.goto("/");
    await expect(page).toHaveTitle("peTravel · Paseadores de mascotas");
    const tarjeta = page.locator(".mantine-Card-root", { hasText: "Paseador Usabilidad" });
    await expect(tarjeta).toBeVisible();
    await expect(tarjeta).toContainText("Sin reseñas");

    // 2. Filtro sin coincidencias y botón "Limpiar filtros"
    await page.getByLabel("Buscar:").fill("NoExiste123");
    await expect(page.getByText("No se encontraron paseadores con esos filtros.")).toBeVisible();
    await page.getByRole("button", { name: "Limpiar filtros" }).click();
    await expect(tarjeta).toBeVisible();

    // 3 y 4. Iniciar sesión como dueño, probar el banner de reseña pendiente y enviar reseña de 5 estrellas
    await iniciarSesion(page, owner);
    const alertaResena = page.getByRole("status");
    await expect(alertaResena).toContainText("Tienes una reseña pendiente");
    await expect(alertaResena).toContainText("1 paseo finalizado pendiente de calificar");
    await expect(alertaResena).toContainText("Milo");

    await page.getByRole("button", { name: "Cerrar notificación de reseñas" }).click();
    await expect(page.getByText("Tienes una reseña pendiente")).toBeHidden();
    await page.getByRole("button", { name: "Abrir menú Mi espacio" }).click();
    await page.getByRole("menuitem", { name: "Mis mascotas" }).click();
    await expect(page).toHaveURL(/\/mis-mascotas$/);
    await page.getByRole("link", { name: /peTravel/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: "Dejar reseña" })).toHaveCount(0);

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
    await iniciarSesion(page, owner);
    await expect(page.getByRole("status")).toContainText("Tienes una reseña pendiente");

    await page.getByRole("link", { name: "Dejar reseña" }).click();
    await expect(page).toHaveURL(new RegExp(`/paseos/${completedBookingId}/resena$`));
    await expect(page.getByText("Tienes una reseña pendiente")).toBeHidden();

    await page.locator('input[type="radio"][value="5"] + label').click();
    await page.getByLabel("Cuéntanos tu experiencia").fill("Excelente paseo con Milo");
    await page.getByRole("button", { name: "Enviar reseña" }).click();
    await expect(page.getByText("¡Gracias por tu reseña!")).toBeVisible();

    // 5. Al volver al inicio, la tarjeta muestra ⭐ 5 y desaparece el banner de reseña pendiente
    await page.getByRole("button", { name: "Volver al inicio" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(tarjeta).toContainText("⭐ 5");
    await expect(page.getByRole("link", { name: "Dejar reseña" })).toHaveCount(0);

    // 6. En Mis paseos ahora aparece el badge "Reseña enviada" en lugar del botón
    await page.goto("/mis-paseos");
    await expect(page.getByText("Reseña enviada", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Dejar reseña" })).toHaveCount(0);

    // 7. Acceder directamente al formulario de un paseo ya reseñado muestra el aviso correspondiente
    await page.goto(`/paseos/${completedBookingId}/resena`);
    await expect(page.getByText("Reseña ya enviada")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar reseña" })).toHaveCount(0);
  });

  test("muestra el banner para configurar perfil de paseador y lo oculta al crearlo", async ({
    page,
    request,
  }) => {
    const walker = await crearUsuario(request, "walker");
    await iniciarSesion(page, walker);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("¿Listo para ofrecer tus paseos?")).toBeVisible();
    await page.getByRole("link", { name: "Configurar perfil de paseador" }).click();

    await expect(page).toHaveURL(/\/mi-perfil$/);
    await expect(page.getByRole("heading", { name: "Crea tu perfil de paseador" })).toBeVisible();

    await page.getByLabel("Descripción").fill("Paseos diarios en Providencia");
    const comunasInput = page.getByRole("combobox", { name: "Comunas de cobertura" });
    await comunasInput.click();
    await comunasInput.fill("Providencia");
    await page.getByRole("option", { name: "Providencia", exact: true }).click();
    await comunasInput.press("Escape");

    await page.getByLabel("Tarifa por hora (CLP)").fill("6000");
    await page.getByLabel("Teléfono").fill("+56 9 5555 6666");
    await page.getByRole("button", { name: "Crear mi perfil" }).click();

    await expect(page.getByRole("link", { name: "Volver a paseadores" })).toBeVisible();
    await page.getByRole("link", { name: "Volver a paseadores" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("¿Listo para ofrecer tus paseos?")).toBeHidden();
    await expect(page.getByRole("link", { name: "Configurar perfil de paseador" })).toHaveCount(0);
  });
});
