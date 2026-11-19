import { matchPath, parsePath } from "react-router-dom";
import type { RolUsuario } from "../types/data";

const owner = ["owner"] as const;
const walker = ["walker"] as const;

export const rutasProtegidas = {
  agendar: { path: "/paseadores/:id/agendar", roles: owner },
  perfil: { path: "/mi-perfil", roles: walker },
  registrarMascota: { path: "/mascotas/nueva", roles: owner },
  mascotas: { path: "/mis-mascotas", roles: owner },
  paseos: { path: "/mis-paseos", roles: ["owner", "walker"] },
  resena: { path: "/paseos/:id/resena", roles: owner },
} satisfies Record<string, { path: string; roles: readonly RolUsuario[] }>;

export const destinoAutorizado = (destino: string | null, rol: RolUsuario): string => {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) return "/";

  const { pathname } = parsePath(destino);
  if (!pathname || /%2f|%5c/i.test(pathname)) return "/";

  try {
    const url = new URL(destino, "https://petravel.invalid");
    if (url.origin !== "https://petravel.invalid" || url.pathname !== pathname) return "/";
  } catch {
    return "/";
  }

  const autorizada = Object.values(rutasProtegidas).some(
    ({ path, roles }) => roles.some((permitido) => permitido === rol) && matchPath(path, pathname),
  );
  return autorizada ? destino : "/";
};
