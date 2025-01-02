import axios from "axios";
import * as config from "./apiConfig";
import * as SecureStore from "expo-secure-store";

// Rafraichir les tokens
const refreshTokens = async () => {
  const refreshtoken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshtoken) {
    return null;
  }
  const apiConfig = { headers: { Authorization: `Bearer ${refreshtoken}` } };
  try {
    const res = await axios.get(`${config.API_BASE_URL}/auth/refresh`, apiConfig);      
    await SecureStore.setItemAsync("accessToken", res.data.access_token);
    return true;
  } catch (e) {
    await SecureStore.setItemAsync("accessToken", "");
    throw new Error("JWT expired");
  }
};

// apiGet avec JWT
export const apiGet = async (url) => {
  let response;
  let accessToken = await SecureStore.getItemAsync("accessToken");
  let apiConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  try {
    if (config.BYPASS_LOGIN) {
      console.log(`Bypassing login on ${config.API_BASE_URL}/${url}`);
      response = await axios.get(`${config.API_BASE_URL}/${url}`, { headers: {} });
    } else {
      response = await axios.get(`${config.API_BASE_URL}/${url}`, apiConfig);
    }
  } catch (error) {
    if (error.response?.data?.JWT_ERROR) {
      console.error("JWT expired, attempting to refresh tokens...");
      await refreshTokens();
      return await apiGet(url); // Retry with new token
    } else {
      throw new Error(error.response?.data?.message || "RequestError");
    }
  }

  return response.data;
};

// apiPost avec JWT
export const apiPost = async (url, data, multimedia = false) => {
  let response;
  let accessToken = await SecureStore.getItemAsync("accessToken");
  let apiConfig = {
    headers: multimedia
      ? { Authorization: `Bearer ${accessToken}`, "content-type": "multipart/form-data" }
      : { Authorization: `Bearer ${accessToken}` },
  };

  try {
    if (config.BYPASS_LOGIN) {
      console.log(`Bypassing login on ${config.API_BASE_URL}/${url}`);
      response = await axios.post(`${config.API_BASE_URL}/${url}`, data, { headers: {} });
    } else {
      response = await axios.post(`${config.API_BASE_URL}/${url}`, data, apiConfig);
    }
  } catch (error) {
    if (error.response?.data?.JWT_ERROR) {
      console.error("JWT expired, attempting to refresh tokens...");
      await refreshTokens();
      return await apiPost(url, data, multimedia); // Retry with new token
    } else {
      throw new Error(error.response?.data?.message || "RequestError");
    }
  }

  return response.data;
};

// Public GET sans JWT
export const apiGetPublic = async (url) => {
  const response = await axios.get(`${config.API_BASE_URL}/${url}`);
  return response.data;
};