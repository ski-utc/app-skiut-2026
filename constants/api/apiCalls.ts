import axios, { AxiosResponse, AxiosRequestConfig, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from "react-native-toast-message/lib/src/Toast";

import * as config from "./apiConfig";
import { apiCache } from "./apiCache";
import { User } from "@/contexts/UserContext";

/**
 * --- TYPES ---
 */
type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
  pending?: false;
};

type ApiErrorResponse = {
  success: false;
  pending?: false;
  message: string;
  code?: string;
};

type ApiPendingResponse = {
  success: false;
  pending: true;
  message: string;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse | ApiPendingResponse;

type PendingRequest = {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data: unknown;
  options: ApiCallOptions;
  timestamp: number;
};

export type SyncPendingRequestsResult = {
  success: number;
  failed: number;
  errors: { request?: unknown; error: string }[];
};

type ApiCallOptions = {
  useCache?: boolean;
  cacheTTL?: number;
  multimedia?: boolean;
  invalidateCache?: string | string[];
};

export class AuthError extends Error {
  constructor(public code: 'NO_REFRESH_TOKEN' | 'JWT_EXPIRED' | 'JWT_INVALID') {
    super(code);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export type AppError = AuthError | ApiError | Error;

export const isPendingResponse = (res: ApiResponse): res is ApiPendingResponse => res.success === false && res.pending === true;
export const isSuccessResponse = <T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> => res.success === true;
export const isAuthError = (err: unknown): err is AuthError => err instanceof AuthError;
export const isNetworkError = (error: unknown): boolean => {
  if (!isAxiosError(error)) return false;
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    !error.response
  );
};

/**
 * --- STORAGE HELPERS ---
 */
const STORAGE_KEYS = {
  PENDING: 'pending_requests',
  OFFLINE_PREFIX: 'offline_cache_',
};

const savePendingRequest = async (req: PendingRequest) => {
  try {
    const current = await getPendingRequests();
    current.push(req);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(current));
  } catch (e) { console.error("Save pending error", e); }
};

export const getPendingRequests = async (): Promise<PendingRequest[]> => {
  try {
    const str = await AsyncStorage.getItem(STORAGE_KEYS.PENDING);
    return str ? JSON.parse(str) : [];
  } catch { return []; }
};

const removePendingRequest = async (id: string) => {
  try {
    const current = await getPendingRequests();
    const filtered = current.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(filtered));
  } catch (e) { console.error("Remove pending error", e); }
};

const saveOfflineCache = async <T>(url: string, data: T) => {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEYS.OFFLINE_PREFIX}${url}`, JSON.stringify(data));
  } catch (e) { console.error("Save offline error", e); }
};

const getOfflineCache = async <T>(url: string): Promise<T | null> => {
  try {
    const str = await AsyncStorage.getItem(`${STORAGE_KEYS.OFFLINE_PREFIX}${url}`);
    return str ? JSON.parse(str) : null;
  } catch { return null; }
};

/**
 * --- CORE API FUNCTION ---
 */
const apiCall = async <T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data: unknown = null,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> => {
  const { useCache = false, cacheTTL, multimedia = false, invalidateCache } = options;

  if (method === 'GET' && useCache) {
    const cached = apiCache.get<T>(url);
    if (cached) return { success: true, data: cached };
  }

  try {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const fullUrl = `${config.API_BASE_URL}/${url}`;

    const configAxios: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(multimedia ? { "Content-Type": "multipart/form-data" } : {})
      },
      timeout: 10000,
    };

    let response: AxiosResponse;

    switch (method) {
      case 'GET': response = await axios.get(fullUrl, configAxios); break;
      case 'POST': response = await axios.post(fullUrl, data, configAxios); break;
      case 'PUT': response = await axios.put(fullUrl, data, configAxios); break;
      case 'DELETE': response = await axios.delete(fullUrl, configAxios); break;
      case 'PATCH': response = await axios.patch(fullUrl, data, configAxios); break;
      default: throw new Error(`Method ${method} not supported`);
    }

    const responseData = response.data;

    const finalData = (responseData && responseData.success !== undefined) ? responseData.data : responseData;
    const successState = (responseData && responseData.success !== undefined) ? responseData.success : true;

    if (!successState) {
      throw new ApiError(responseData.message || "Erreur API", response.status);
    }

    if (method === 'GET') {
      await saveOfflineCache(url, finalData);
      if (useCache) apiCache.set(url, finalData, cacheTTL);
    }

    if (invalidateCache) {
      const keys = Array.isArray(invalidateCache) ? invalidateCache : [invalidateCache];
      keys.forEach(k => apiCache.deleteByPrefix(k));
    }

    return { success: true, data: finalData };

  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 401) {
      try {
        const refreshed = await refreshTokens();
        if (refreshed) {
          return apiCall<T>(method, url, data, options);
        }
      } catch (authErr) {
        throw authErr;
      }
    }

    if (isNetworkError(error)) {
      if (method === 'GET') {
        const offlineData = await getOfflineCache<T>(url);
        if (offlineData) {
          Toast.show({ type: 'info', text1: 'Mode hors ligne', text2: 'Données récupérées du cache.' });
          return { success: true, data: offlineData };
        }
      }
      else {
        await savePendingRequest({
          id: Date.now().toString(),
          method, url, data, options, timestamp: Date.now()
        });
        return {
          success: false,
          pending: true,
          message: 'Pas de connexion. Action sauvegardée pour plus tard.'
        };
      }
    }

    let errorMessage = "Une erreur est survenue";
    if (isAxiosError(error) && error.response?.data) {
      const d = error.response.data as any;
      errorMessage = d.message || d.error || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new ApiError(errorMessage);
  }
};

/**
 * --- HELPERS ---
 */

const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) throw new AuthError('NO_REFRESH_TOKEN');

  try {
    const res = await axios.get(`${config.API_BASE_URL}/auth/refresh`, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    await SecureStore.setItemAsync("accessToken", res.data.access_token);
    return true;
  } catch (error) {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    throw new AuthError('JWT_EXPIRED');
  }
};

export const syncPendingRequests = async (): Promise<SyncPendingRequestsResult> => {
  const pending = await getPendingRequests();
  if (pending.length === 0) return { success: 0, failed: 0, errors: [] };

  Toast.show({ type: 'info', text1: 'Synchronisation...', text2: `${pending.length} actions en attente.` });

  let success = 0;
  let failed = 0;
  const errors: { request?: unknown; error: string }[] = [];

  for (const req of pending) {
    try {
      await apiCall(req.method, req.url, req.data, { ...req.options, useCache: false });
      await removePendingRequest(req.id);
      success++;
    } catch (e) {
      if (!isNetworkError(e)) {
        await removePendingRequest(req.id);
        failed++;
        errors.push({ request: req.data, error: e instanceof Error ? e.message : 'Erreur inconnue' });
      }
    }
  }
  Toast.show({ type: 'success', text1: 'Synchronisation terminée' });
  return { success, failed, errors };
};

export const handleApiErrorToast = (error: unknown, setUser: (u: User | null) => void) => {
  if (isAuthError(error)) {
    setUser(null);
    return;
  }

  const message = error instanceof ApiError ? error.message : (error instanceof Error ? error.message : "Erreur inconnue");

  Toast.show({
    type: 'error',
    text1: 'Erreur',
    text2: message
  });
};

export const handleApiErrorScreen = (error: unknown, setUser: (user: User | null) => void, setError: (error: string) => void) => {  // TODO : relabel to handleApiErrorState
  if (isAuthError(error)) {
    setUser(null);
    return;
  }

  const message = error instanceof ApiError ? error.message : (error instanceof Error ? error.message : "Erreur inconnue");
  setError(message);
};

export const apiGet = <T>(url: string, useCache = false, cacheTTL?: number) => apiCall<T>('GET', url, null, { useCache, cacheTTL });
export const apiPost = <T>(url: string, data: any, multimedia = false, invalidateCache?: string | string[]) => apiCall<T>('POST', url, data, { multimedia, invalidateCache });
export const apiPut = <T>(url: string, data: any, options?: ApiCallOptions) => apiCall<T>('PUT', url, data, options);
export const apiDelete = <T>(url: string) => apiCall<T>('DELETE', url);
export const apiPatch = <T>(url: string, data: any) => apiCall<T>('PATCH', url, data);
