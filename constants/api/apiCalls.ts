import axios from "axios";
import * as config from "./apiConfig";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { apiCache } from "./apiCache";
import AsyncStorage from '@react-native-async-storage/async-storage';

const savePendingRequest = async (request: any) => {
  try {
    const pendingStr = await AsyncStorage.getItem('pendingRequests');
    const pending = pendingStr ? JSON.parse(pendingStr) : [];
    pending.push({
      ...request,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random()}`
    });
    await AsyncStorage.setItem('pendingRequests', JSON.stringify(pending));
  } catch (error) {
    console.error('Error saving pending request:', error);
  }
};

export const getPendingRequests = async () => {
  try {
    const pendingStr = await AsyncStorage.getItem('pendingRequests');
    return pendingStr ? JSON.parse(pendingStr) : [];
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
};

const removePendingRequest = async (requestId: string) => {
  try {
    const pendingStr = await AsyncStorage.getItem('pendingRequests');
    const pending = pendingStr ? JSON.parse(pendingStr) : [];
    const filtered = pending.filter((req: any) => req.id !== requestId);
    await AsyncStorage.setItem('pendingRequests', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending request:', error);
  }
};

const saveOfflineCache = async (url: string, data: any) => {
  try {
    const key = `${'offline_cache_'}${url}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving offline cache:', error);
  }
};

const getOfflineCache = async (url: string) => {
  try {
    const key = `${'offline_cache_'}${url}`;
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data } = JSON.parse(cached);
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting offline cache:', error);
    return null;
  }
};

const isNetworkError = (error: any): boolean => {
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.message?.includes('timeout') ||
    error.message?.includes('network') ||
    !error.response
  );
};

const refreshTokens = async () => {
  const refreshtoken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshtoken) {
    Alert.alert("Déconnexion", "Vous avez été déconnecté.", [{ text: "Ok" }]);
    throw new Error('NoRefreshTokenError');
  }
  const apiConfig = { headers: { Authorization: `Bearer ${refreshtoken}` } };
  try {
    const res = await axios.get(`${config.API_BASE_URL}/auth/refresh`, apiConfig);
    await SecureStore.setItemAsync("accessToken", res.data.access_token);
    return true;
  } catch (_e) {
    await SecureStore.setItemAsync("accessToken", "");
    throw new Error('NoRefreshTokenError');
  }
};

const apiCall = async (method = 'GET', url: string, data = null, options: any = {}) => {
  const {
    useCache = false,
    cacheTTL = undefined,
    multimedia = false,
    invalidateCache = null,
  } = options;

  if (method.toUpperCase() === 'GET' && useCache) {
    const cachedData = apiCache.get(url);
    if (cachedData) {
      return cachedData;
    }
  }

  let response;
  const accessToken = await SecureStore.getItemAsync("accessToken");
  const apiConfig = {
    headers: multimedia
      ? { Authorization: `Bearer ${accessToken}`, "content-type": "multipart/form-data" }
      : { Authorization: `Bearer ${accessToken}` },
    timeout: 10000
  };

  try {
    const url_full = `${config.API_BASE_URL}/${url}`;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(url_full, apiConfig);
        break;
      case 'POST':
        response = await axios.post(url_full, data, apiConfig);
        break;
      case 'PUT':
        response = await axios.put(url_full, data, apiConfig);
        break;
      case 'DELETE':
        response = await axios.delete(url_full, apiConfig);
        break;
      case 'PATCH':
        response = await axios.patch(url_full, data, apiConfig);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    if (method.toUpperCase() === 'GET' && response.data) {
      await saveOfflineCache(url, response.data);

      if (useCache) {
        apiCache.set(url, response.data, cacheTTL);
      }
    }

  } catch (error: any) {
    if (error.response?.data?.JWT_ERROR) {
      await refreshTokens();
      return await apiCall(method, url, data, options);
    }

    if (isNetworkError(error)) {
      if (method.toUpperCase() === 'GET') {
        const offlineData = await getOfflineCache(url);
        if (offlineData) {
          return offlineData;
        }
        throw new Error('NetworkError_NoCache');
      }

      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        await savePendingRequest({
          method,
          url,
          data,
          options
        });
        return {
          success: false,
          pending: true,
          message: 'La requête a été sauvegardée et sera synchronisée plus tard'
        };
      }
    }

    throw new Error(error.response?.data?.message || "RequestError");
  }

  if (invalidateCache) {
    if (typeof invalidateCache === 'string') {
      apiCache.deleteByPrefix(invalidateCache);
    } else if (Array.isArray(invalidateCache)) {
      invalidateCache.forEach(key => apiCache.delete(key));
    }
  }

  return response.data;
};

export const syncPendingRequests = async () => {
  const pending = await getPendingRequests();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const request of pending) {
    try {
      await apiCall(request.method, request.url, request.data, request.options);
      await removePendingRequest(request.id);
      results.success++;
    } catch (error: any) {
      if (!isNetworkError(error)) {
        await removePendingRequest(request.id);
        results.errors.push({
          request,
          error: error.message
        });
      }
      results.failed++;
    }
    setTimeout(() => { return; }, 1000);
  }

  return results;
};

export const apiGet = async (url: string, useCache = false, cacheTTL = undefined) => {
  return apiCall('GET', url, null, { useCache, cacheTTL });
};

export const apiPost = async (url: string, data: any, multimedia = false, invalidateCache = null) => {
  return apiCall('POST', url, data, { multimedia, invalidateCache });
};

export const apiPut = async (url: string, data: any, options = {}) => {
  return apiCall('PUT', url, data, options);
};

export const apiDelete = async (url: string, options = {}) => {
  return apiCall('DELETE', url, null, options);
};

export const apiPatch = async (url: string, data: any, options = {}) => {
  return apiCall('PATCH', url, data, options);
};
