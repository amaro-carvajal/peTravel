import axios from 'axios';
import type { RolUsuario, UsuarioData } from '../types/data';

const baseUrl = '/auth';
const CSRF_STORAGE_KEY = 'petravel_csrf_token';

axios.defaults.withCredentials = true;

const savedCsrf = localStorage.getItem(CSRF_STORAGE_KEY);
if (savedCsrf) {
  axios.defaults.headers.common['X-CSRF-Token'] = savedCsrf;
}

const setCsrfToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(CSRF_STORAGE_KEY, token);
    axios.defaults.headers.common['X-CSRF-Token'] = token;
  } else {
    localStorage.removeItem(CSRF_STORAGE_KEY);
    delete axios.defaults.headers.common['X-CSRF-Token'];
  }
};

const adaptUser = (backendUser: any): UsuarioData => ({
  id: backendUser.id,
  nombre: backendUser.name,
  email: backendUser.email,
  rol: backendUser.role,
});

const login = async (email: string, password: string): Promise<UsuarioData> => {
  const response = await axios.post(`${baseUrl}/login`, { email, password });
  const csrfToken = response.headers['x-csrf-token'];
  if (csrfToken) {
    setCsrfToken(csrfToken);
  }
  return adaptUser(response.data);
};

const register = async (
  nombre: string,
  email: string,
  password: string,
  rol: RolUsuario
): Promise<UsuarioData> => {
  const response = await axios.post(`${baseUrl}/register`, {
    name: nombre,
    email,
    password,
    role: rol,
  });
  return adaptUser(response.data);
};

const getMe = async (): Promise<UsuarioData> => {
  const response = await axios.get(`${baseUrl}/me`);
  return adaptUser(response.data);
};

const logout = async (): Promise<void> => {
  try {
    await axios.post(`${baseUrl}/logout`);
  } finally {
    setCsrfToken(null);
  }
};

export default { login, register, getMe, logout };