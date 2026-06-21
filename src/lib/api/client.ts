import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

import type { ApiResponse, AuthTokens, NormalizedApiError } from './types';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const REFRESH_TOKEN_KEY = 'irb_refresh_token';

/**
 * SecureStore is async-only, unlike the web app's synchronous localStorage.
 * The refresh token is cached in memory after `tokenStore.hydrate()` runs once
 * at app boot (see _layout.tsx), so `getRefresh()` can stay synchronous for the
 * axios interceptors below.
 */
export const tokenStore = {
  accessToken: null as string | null,
  refreshToken: null as string | null,

  async hydrate(): Promise<void> {
    this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  getRefresh(): string | null {
    return this.refreshToken;
  },

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    void SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  },

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    void SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

/* Attach access token to every outgoing request */
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

/* Silent token refresh on 401 */
client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } = error.config;

    const status: number = error.response?.status;
    const isRefreshEndpoint = original.url?.includes('/auth/refresh');

    if (status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true;

      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) {
        tokenStore.clear();
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post<ApiResponse<AuthTokens>>(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        tokenStore.setTokens(accessToken, newRefresh);
        drainQueue(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return client(original);
      } catch {
        tokenStore.clear();
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

/**
 * Proactively refreshes the access token using the stored refresh token.
 * Call this on app init so the access token is valid before any API request.
 * Returns true on success, false if the refresh token is missing or expired.
 */
export async function silentRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await axios.post<ApiResponse<AuthTokens>>(`${BASE_URL}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const { accessToken, refreshToken: newRefresh } = res.data.data;
    tokenStore.setTokens(accessToken, newRefresh);
    return true;
  } catch {
    // Only clear if the stored token hasn't been replaced by a concurrent login().
    if (tokenStore.getRefresh() === refreshToken) {
      tokenStore.clear();
    }
    return false;
  }
}

function normalizeError(err: unknown): NormalizedApiError {
  const e = err as {
    response?: { data?: { success?: boolean; error?: Partial<NormalizedApiError> } };
    message?: string;
  };
  const apiError = e?.response?.data?.error;
  if (e?.response?.data?.success === false && apiError) {
    return {
      code: apiError.code ?? 'UNKNOWN',
      message: apiError.message ?? 'An error occurred.',
      details: apiError.details ?? [],
    };
  }
  return {
    code: 'NETWORK_ERROR',
    message: e?.message ?? 'No response from server.',
    details: [],
  };
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, data, config);
  return res.data.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await client.patch<ApiResponse<T>>(url, data, config);
  return res.data.data;
}

export async function apiDelete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}

export default client;
