import axios from "axios";

export const authConfig = () => {
  const token = localStorage.getItem("petravel_csrf_token") ?? sessionStorage.getItem("csrfToken");
  return { withCredentials: true, headers: token ? { "X-CSRF-Token": token } : {} };
};

// Saca el mensaje { error: "..." } que devuelve el backend
export const mensajeError = (err: unknown, porDefecto: string): string => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) return "Debes iniciar sesión para ver esto.";
    return err.response?.data?.error ?? porDefecto;
  }
  return porDefecto;
};