import type { ReactNode } from "react";
import { Center, Loader } from "@mantine/core";
import { Navigate, createSearchParams, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { RolUsuario } from "../types/data";
import { destinoAutorizado } from "./rutasProtegidas";

const CargandoSesion = () => (
  <Center py="xl" role="status" aria-label="Recuperando sesión">
    <Loader color="blue" />
  </Center>
);

interface ProtectedRouteProps {
  roles: readonly RolUsuario[];
  children: ReactNode;
}

export const ProtectedRoute = ({ roles, children }: ProtectedRouteProps) => {
  const inicializando = useAuthStore((state) => state.inicializando);
  const usuario = useAuthStore((state) => state.usuario);
  const { pathname, search, hash } = useLocation();

  if (inicializando) return <CargandoSesion />;

  if (!usuario) {
    const destino = createSearchParams({ next: pathname + search + hash });
    return <Navigate to={{ pathname: "/login", search: destino.toString() }} replace />;
  }

  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  return children;
};

export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const inicializando = useAuthStore((state) => state.inicializando);
  const usuario = useAuthStore((state) => state.usuario);
  const [searchParams] = useSearchParams();

  if (inicializando) return <CargandoSesion />;
  if (usuario) return <Navigate to={destinoAutorizado(searchParams.get("next"), usuario.rol)} replace />;

  return children;
};
