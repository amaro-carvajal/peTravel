# peTravel

Plataforma web que conecta a dueños de mascotas que necesitan ayuda para realizar paseos diarios, con personas disponibles para ofrecer este servicio de manera confiable. 

## Características Principales
*   **Búsqueda interactiva:** Filtra paseadores disponibles según su comuna, tarifa máxima y calificación de otros usuarios.
*   **Perfiles detallados:** Revisa la disponibilidad horaria, zonas de cobertura, datos de contacto y el historial de reseñas de cada paseador.
*   **Tecnología:** El almacenamiento y manejo de la información se realiza mediante un backend completamente simulado.

## Ejecución del Proyecto

El proyecto está dividido en dos partes: el cliente (Frontend) y una API local (Backend). Para probar la aplicación, es necesario levantar ambos entornos en terminales separadas.

### Frontend
Levantar la interfaz de usuario:
```bash
cd frontend
npm install
npm run dev
```

### Backend

Levantar el servidor local de datos:

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Probar el build de producción localmente

Con las dependencias ya instaladas y un `backend/.env` que apunte a MongoDB local, ejecuta desde la raíz:

```bash
npm --prefix frontend run build
npm --prefix backend run build
npm --prefix backend start
```

Express sirve la SPA y la API desde el mismo origen (`http://localhost:3001` por defecto). Puedes abrir directamente una ruta como `/mis-paseos`. Si la sesión está cerrada, la aplicación pedirá iniciar sesión y luego volverá a esa ruta. El proxy de Vite sigue disponible al usar `npm run dev` en `frontend/`.

### Pruebas end-to-end

La suite Playwright se ejecuta contra el build de producción servido por Express y una instancia temporal de MongoDB. Consulta la [guía de pruebas E2E](e2etests/README.md) para instalar Chromium, ejecutar la suite y abrir el reporte.
