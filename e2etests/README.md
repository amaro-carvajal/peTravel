# Pruebas E2E de peTravel

Se necesita Node.js (v24+), npm y el ejecutable `mongod` en el `PATH`. Desde la raíz del repositorio, instala las dependencias de los tres paquetes y Chromium:

```bash
npm --prefix frontend ci
npm --prefix backend ci
npm --prefix e2etests ci
cd e2etests
npx playwright install chromium
```

Desde `e2etests/`:

```bash
npm run typecheck
npm test
npm test -- tests/pets.spec.ts
npm run test:ui
npm run report
```

También puedes ejecutarlos desde la raíz del repositorio con `--prefix e2etests`:

```bash
npm --prefix e2etests run typecheck
npm --prefix e2etests test
```

Los scripts de pruebas y de modo UI compilan el frontend y el backend antes de iniciar Playwright. Playwright arranca Express en `http://127.0.0.1:4317` y sirve el bundle de producción. Mantén ese puerto libre.

El lanzador (`start-test-system.mjs`) crea su propio proceso MongoDB en loopback, con puerto libre, directorio temporal y una base nueva con prefijo `petravel_e2e_`. Inicia Express con `NODE_ENV=test` y un secreto JWT generado para esa ejecución. El backend de pruebas ignora `.env` y requiere una URI local con el nombre de base de pruebas explícito. El lanzador limpia el directorio al terminar normalmente. Cada caso que requiere sesión registra su propia cuenta por la API y ejecuta los flujos principales desde la interfaz.

## Cobertura de la suite (14 pruebas)

- **Autenticación** (`tests/auth.spec.ts`): portada, retorno a *Mis mascotas* tras el login, credenciales incorrectas, cierre de sesión y bloqueo por rol en rutas protegidas.
- **Mascotas** (`tests/pets.spec.ts`): registro, listado, edición de todos los campos y eliminación confirmada, verificando persistencia tras recargar.
- **Navegación** (`tests/navigation.spec.ts`): enlaces internos, botones atrás y adelante del navegador, acceso directo a rutas internas, recarga autenticada (`F5`) y página 404.
- **Notificaciones y gestión de paseos** (`tests/walker-notifications.spec.ts`): notificación de solicitudes pendientes y paseos agendados al iniciar sesión como paseador, descarte en sesión SPA, reaparición al volver a iniciar sesión, limpieza al finalizar el paseo y visibilidad permanente de paseos aceptados en la pestaña *Solicitudes* aunque existan más de 3 paseos finalizados.
- **Usabilidad y reseñas** (`tests/usability.spec.ts`): título de la página, badge `Sin reseñas`, filtrado sin coincidencias y botón *Limpiar filtros*, banner de reseña pendiente para dueños, envío de reseña de 5 estrellas con actualización real de reputación (`⭐ 5`), badge `Reseña enviada`, bloqueo al reabrir el formulario de un paseo ya reseñado y banner para configurar el perfil inicial de paseador.
- **Diseño responsive móvil** (`tests/responsive.spec.ts`): comprobación de ausencia de desborde horizontal (`scrollWidth <= innerWidth`) en viewport `375×812` en vistas públicas, sesión de paseador y sesión de dueño.

El reporte HTML queda en `playwright-report/`. Las trazas de casos fallidos quedan en `test-results/`.
