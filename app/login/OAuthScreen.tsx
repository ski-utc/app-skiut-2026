import React, { useState } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@/contexts/UserContext";
import * as config from "../../constants/api/apiConfig";
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from "@/components/pages/errorPage";

export default function OAuthScreen() {
  const { setUser } = useUser();
  const [error, setError] = useState('');
  const [canEnter, setCanEnter] = useState(true);

  const handleNavigationStateChange = async (state: any) => {
    const url = state.url;
    const { hostname, path, queryParams } = Linking.parse(url);

    if (canEnter && hostname === config.DOMAIN && path === "skiutc/api/connected") {
      setCanEnter(false);

      const accessToken = queryParams?.access_token;
      const refreshToken = queryParams?.refresh_token;

      if (accessToken && refreshToken) {
        try {
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);
      
          const response = await apiGet("getUserData");
          
          if (response.success) {
            setUser({
              id: response.id,
              name: response.name,
              lastName: response.lastName,
              room: response.room,
              admin: response.admin
            });
          } else {
            setError(`Une erreur est survenue lors de la récupération du user : ${response.message}`);
          }
        } catch (error) {
          if (error.JWT_ERROR) {
            setUser(null);
          } else {
            setError(error.message);
          }
        }
      } else {
        setError("Access Token ou Refresh Token manquant")
        setCanEnter(true);
      }
    }
  };

  if(error!='') {
    return(
      <ErrorScreen error={error}/>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: `${config.BASE_URL}/auth/login` }}
        originWhitelist={["*"]}
        style={{ flex: 1 }}
        onNavigationStateChange={handleNavigationStateChange}
        incognito={true}
      />
    </View>
  );
}
