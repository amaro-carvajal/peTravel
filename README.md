# peTravel

Plataforma web que conecta a dueños de mascotas que necesitan ayuda para realizar paseos diarios con paseadores disponibles para ofrecer este servicio de manera confiable.

## Arquitectura y tecnología

* **Frontend (`frontend/`):** SPA desarrollada con React, TypeScript, Vite, React Router, Zustand (`authStore` y `bookingsStore`) y Mantine (`@mantine/core`).
* **Backend (`backend/`):** API REST en TypeScript con Express 5, Mongoose y MongoDB; autenticación mediante JWT en cookie `httpOnly` con protección CSRF (`X-CSRF-Token`) y respuestas de error consistentes en JSON.
* **Pruebas E2E (`e2etests/`):** Suite automatizada con Playwright ejecutada contra el build de producción servido por Express y una instancia temporal de MongoDB.

## Características principales

* **Búsqueda y filtros interactivos:** Filtra paseadores por texto, comuna, calificación mínima y tarifa máxima, con estados vacíos diferenciados y botón para limpiar filtros.
* **Cuentas, roles y rutas protegidas:** Registro e inicio de sesión para dueños (`owner`) y paseadores (`walker`), protección de rutas por rol en frontend y backend, y restauración de sesión al recargar (`F5`).
* **Gestión de mascotas:** CRUD completo de mascotas para dueños (registro, listado, edición y eliminación confirmada con protección ante reservas vinculadas).
* **Perfiles de paseador:** Disponibilidad semanal en bloques de 30 minutos, comunas de cobertura, tarifa por hora, contacto directo, historial de reseñas y banner de configuración inicial cuando el paseador aún no crea su perfil.
* **Agendamiento y gestión de paseos:** Solicitud de paseos con validación de disponibilidad y horarios ocupados; vista de gestión con solicitudes pendientes, sección fija de paseos agendados, historial reciente/completo y banners de notificación (paseos pendientes o agendados para paseadores y reseñas pendientes para dueños).
* **Reseñas y reputación:** Calificación de 1 a 5 estrellas con comentarios en paseos finalizados y recálculo automático del promedio del paseador al crear, editar o eliminar reseñas.
* **Diseño responsive:** Interfaz adaptada a escritorio y móvil (`375×812`).

## Estructura del repositorio

* [`frontend/`](frontend): Aplicación SPA en React + TypeScript.
* [`backend/`](backend): Servidor Express + Mongoose en TypeScript.
* [`e2etests/`](e2etests): Suite de pruebas end-to-end con Playwright.

## Variables de entorno

El backend lee su configuración desde `backend/.env` (ignorado por Git). Puedes tomar como base [`backend/.env.example`](backend/.env.example):

| Variable | Descripción | Valor por defecto (desarrollo) |
| --- | --- | --- |
| `MONGODB_URI` | URI de conexión a MongoDB (ej. `mongodb://127.0.0.1:27017`) | — *(requerida para conectar)* |
| `MONGODB_DBNAME` | Nombre de la base de datos en MongoDB | — *(ej. `petravel`)* |
| `PORT` | Puerto en que escucha Express | `3001` |
| `HOST` | Host de escucha de Express | `localhost` |
| `JWT_SECRET` | Secreto para firmar los tokens JWT de sesión | `my_secret` *(solo respaldo local; definir en `.env`)* |
| `CLIENT_URL` | Origen permitido por CORS en desarrollo | `http://localhost:5173` |

## Ejecución local

### Modo desarrollo (frontend y backend separados)

1. **Backend** (con una instancia de MongoDB corriendo localmente y `backend/.env` configurado):
   ```bash
   cd backend
   npm ci
   npm run dev
   ```
   > Nota: El script opcional `npm run seed` inserta paseadores de ejemplo sin cuentas de usuario asociadas. Para probar el flujo completo de reservas, aceptación y reseñas, crea cuentas de dueño y paseador desde `/registro`.

2. **Frontend** (en otra terminal, con proxy de Vite hacia `http://localhost:3001`):
   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

### Build de producción local

Con las dependencias ya instaladas y `backend/.env` apuntando a MongoDB local, ejecuta desde la raíz:

```bash
npm --prefix frontend run build
npm --prefix backend run build
npm --prefix backend start
```

Express sirve tanto la SPA compilada (`frontend/dist`) como la API desde el mismo origen (`http://localhost:3001` por defecto). Puedes abrir directamente rutas internas como `/mis-paseos` y recargar (`F5`): si no hay sesión activa, la aplicación redirige a `/login` y luego vuelve a la ruta solicitada.

## Pruebas E2E y verificación

Desde la raíz del repositorio puedes ejecutar las verificaciones estáticas y la suite E2E:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend run build
npm --prefix e2etests run typecheck
npm --prefix e2etests test
```

La suite Playwright se ejecuta contra el build de producción servido por Express y una instancia temporal de MongoDB. Consulta la [guía de pruebas E2E](e2etests/README.md) para los requisitos previos (`mongod`, Chromium), comandos específicos y reportes.
