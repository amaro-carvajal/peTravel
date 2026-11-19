# Pruebas E2E de peTravel

Se necesita Node.js 24, npm y el ejecutable `mongod` en el PATH. Desde la raíz del repositorio, instala los tres paquetes y Chromium:

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

Los scripts de pruebas y de modo UI compilan el frontend y el backend antes de iniciar Playwright. Playwright arranca Express en `http://127.0.0.1:4317` y sirve el bundle de producción. Mantén ese puerto libre.

El lanzador crea su propio proceso MongoDB en loopback, con puerto libre, directorio temporal y una base nueva con prefijo `petravel_e2e_`. Inicia Express con `NODE_ENV=test` y un secreto JWT generado para esa ejecución. El backend de pruebas ignora `.env` y requiere una URI local con el nombre de base de pruebas explícito. El lanzador limpia el directorio al terminar normalmente. Cada caso que requiere sesión registra su propia cuenta por la API. El CRUD completo se ejecuta desde la interfaz con esa cuenta.

- **Autenticación** cubre portada, retorno a Mis mascotas tras el login, credenciales incorrectas, logout y permisos del rol walker.
- **Mascotas** cubre registro, listado, edición de todos los campos y eliminación confirmada. Se verifica la persistencia de la edición y de la eliminación al recargar.
- **Navegación** cubre enlaces internos, atrás, adelante, acceso directo, recarga autenticada y la página 404.

El reporte HTML queda en `playwright-report/`. Las trazas de casos fallidos quedan en `test-results/`.
