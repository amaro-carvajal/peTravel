import axios from "axios";
import { create } from "zustand";
import authService from "../services/auth";
import type { RolUsuario, UsuarioData } from "../types/data";
import { useBookingsStore } from "./bookingsStore";

type AccionAuth = "restaurar" | "login" | "registro" | "logout";

interface AuthStore {
  usuario: UsuarioData | null;
  inicializando: boolean;
  cargando: boolean;
  error: { accion: AccionAuth; mensaje: string } | null;
  restaurarSesion: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registro: (nombre: string, email: string, password: string, rol: RolUsuario) => Promise<void>;
  logout: () => Promise<void>;
  limpiarError: (accion: AccionAuth) => void;
}

const mensajeAuth = (err: unknown, porDefecto: string) => {
  const mensaje = axios.isAxiosError<{ error?: unknown }>(err) ? err.response?.data?.error : undefined;
  return typeof mensaje === "string" ? mensaje : porDefecto;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  let restauracion: Promise<void> | undefined;

  const cambiarUsuario = (usuario: UsuarioData | null) => {
    if (get().usuario?.id !== usuario?.id) useBookingsStore.getState().limpiar();
    set({ usuario });
  };

  const autenticar = async (
    accion: "login" | "registro",
    operacion: () => Promise<UsuarioData>,
    mensaje: string,
  ) => {
    if (get().inicializando || get().cargando) return;
    set({ cargando: true, error: null });
    try {
      cambiarUsuario(await operacion());
    } catch (err: unknown) {
      set({ error: { accion, mensaje: mensajeAuth(err, mensaje) } });
    } finally {
      set({ cargando: false });
    }
  };

  const restaurar = async () => {
    try {
      cambiarUsuario(await authService.getMe());
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status !== 401 && status !== 404) {
        set({ error: { accion: "restaurar", mensaje: mensajeAuth(err, "No se pudo recuperar la sesión.") } });
      }
    } finally {
      set({ inicializando: false });
    }
  };

  return {
    usuario: null,
    inicializando: true,
    cargando: false,
    error: null,
    restaurarSesion: () => restauracion ??= restaurar(),
    login: (email, password) => autenticar(
      "login",
      () => authService.login(email, password),
      "Error al iniciar sesión. Verifica tus datos.",
    ),
    registro: (nombre, email, password, rol) => autenticar("registro", async () => {
      await authService.register(nombre, email, password, rol);
      return authService.login(email, password);
    }, "No se pudo completar el registro."),
    logout: async () => {
      if (!get().usuario || get().cargando) return;
      set({ cargando: true, error: null });
      try {
        await authService.logout();
        cambiarUsuario(null);
      } catch (err: unknown) {
        set({ error: { accion: "logout", mensaje: mensajeAuth(err, "No se pudo cerrar sesión. Intenta nuevamente.") } });
      } finally {
        set({ cargando: false });
      }
    },
    limpiarError: (accion) => {
      if (get().error?.accion === accion) set({ error: null });
    },
  };
});
