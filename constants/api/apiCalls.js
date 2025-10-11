import axios from "axios";
import * as config from "./apiConfig";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { apiCache } from "./apiCache";

// Rafraichir les tokens
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
    Alert.alert("Déconnexion", "Vous avez été déconnecté.", [{ text: "Ok" }]);
    throw new Error('NoRefreshTokenError');
  }
};

// apiGet avec JWT et cache optionnel
export const apiGet = async (url, useCache = false, cacheTTL = undefined) => {
  if (useCache) {
    const cachedData = apiCache.get(url);
    if (cachedData) {
      return cachedData;
    }
  }

  let response;
  let accessToken = await SecureStore.getItemAsync("accessToken");
  let apiConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  try {
    response = await axios.get(`${config.API_BASE_URL}/${url}`, apiConfig);
  } catch (error) {
    if (error.response?.data?.JWT_ERROR) {
      await refreshTokens();
      return await apiGet(url, useCache, cacheTTL); // Retry with new token
    } else {
      throw new Error(error.response?.data?.message || "RequestError");
    }
  }

  if (useCache && response.data) {
    apiCache.set(url, response.data, cacheTTL);
  }

  return response.data;
};

// apiPost avec JWT (invalide le cache si nécessaire)
export const apiPost = async (url, data, multimedia = false, invalidateCache = null) => {
  let response;
  let accessToken = await SecureStore.getItemAsync("accessToken");
  let apiConfig = {
    headers: multimedia
      ? { Authorization: `Bearer ${accessToken}`, "content-type": "multipart/form-data" }
      : { Authorization: `Bearer ${accessToken}` },
  };

  try {
    response = await axios.post(`${config.API_BASE_URL}/${url}`, data, apiConfig);
  } catch (error) {
    if (error.response?.data?.JWT_ERROR) {
      await refreshTokens();
      return await apiPost(url, data, multimedia, invalidateCache); // Retry with new token
    } else {
      throw new Error(error.response?.data?.message || "RequestError");
    }
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

// Public GET sans JWT
export const apiGetPublic = async (url) => {
  const response = await axios.get(`${config.API_BASE_URL}/${url}`);
  return response.data;
};