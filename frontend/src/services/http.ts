import axios from "axios";

export const authConfig = () => {
  const token = localStorage.getItem("petravel_csrf_token") ?? sessionStorage.getItem("csrfToken");
  return { withCredentials: true, headers: token ? { "X-CSRF-Token": token } : {} };
};

// Saca el mensaje { error: "..." } que devuelve el backend
export const mensajeError = (err: unknown, porDefecto: string): string => {
  if (axios.isAxiosError<{ error?: unknown }>(err)) {
    if (err.response?.status === 401) return "Debes iniciar sesión para ver esto.";
    const mensaje = err.response?.data?.error;
    return typeof mensaje === "string" ? mensaje : porDefecto;
  }
  return porDefecto;
};