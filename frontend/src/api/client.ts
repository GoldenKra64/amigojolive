import axios, { AxiosError, type AxiosInstance } from 'axios';

export const TOKEN_STORAGE_KEY = 'amigojolive_token';

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const path = `${config.baseURL ?? ''}${config.url ?? ''}`;
  const isPublicAuth =
    path.includes('/auth/login') ||
    path.includes('/auth/register-request');

  config.headers = config.headers ?? {};

  if (isPublicAuth) {
    delete config.headers.Authorization;
    return config;
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      onUnauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(
  error: unknown,
  fallback = 'Error inesperado, intente nuevamente.'
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'El servidor tardó demasiado en responder. Compruebe que el backend esté en marcha y la conexión a la base de datos.';
    }
    if (!error.response) {
      return 'No hay conexión con el API. Verifique VITE_API_URL y que el backend esté ejecutándose en el puerto 3000.';
    }
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
