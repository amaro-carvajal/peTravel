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
npm run server
```