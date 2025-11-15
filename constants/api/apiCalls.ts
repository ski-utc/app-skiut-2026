import axios from "axios";
import * as config from "./apiConfig";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { apiCache } from "./apiCache";

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
    // Alert.alert("Déconnexion", "Vous avez été déconnecté.", [{ text: "Ok" }]);
    throw new Error('NoRefreshTokenError');
  }
};

const apiCall = async (method = 'GET', url, data = null, options = {}) => {
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
      : { Authorization: `Bearer ${accessToken}` }
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
  } catch (error) {
    if (error.response?.data?.JWT_ERROR) {
      await refreshTokens();
      return await apiCall(method, url, data, options);
    } else {
      throw new Error(error.response?.data?.message || "RequestError");
    }
  }

  if (method.toUpperCase() === 'GET' && useCache && response.data) {
    apiCache.set(url, response.data, cacheTTL);
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

export const apiGet = async (url, useCache = false, cacheTTL = undefined) => {
  return apiCall('GET', url, null, { useCache, cacheTTL });
};

export const apiPost = async (url, data, multimedia = false, invalidateCache = null) => {
  return apiCall('POST', url, data, { multimedia, invalidateCache });
};

export const apiPut = async (url, data, options = {}) => {
  return apiCall('PUT', url, data, options);
};

export const apiDelete = async (url, options = {}) => {
  return apiCall('DELETE', url, null, options);
};

export const apiPatch = async (url, data, options = {}) => {
  return apiCall('PATCH', url, data, options);
};
