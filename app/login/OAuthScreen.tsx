import React, { useState } from "react";
import { View, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@/contexts/UserContext";
import * as config from "../../constants/api/apiConfig";
import { apiGet } from "@/constants/api/apiCalls";

export default function OAuthScreen() {
  const { setUser } = useUser();
  const [canEnter, setCanEnter] = useState(true);

  const handleNavigationStateChange = async (state: any) => {
    const url = state.url;
    const { hostname, path, queryParams } = Linking.parse(url);

    if (canEnter && hostname == config.DOMAIN && path == "skiutc/api/connected") {
      setCanEnter(false); 

      const accessToken = queryParams?.access_token;
      const refreshToken = queryParams?.refresh_token;

      if (accessToken && refreshToken) {
        try {
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);

          const userData = await apiGet("getUserData");

          // Mets à jour le contexte utilisateur
          setUser({
            id: userData.id,
            name: userData.name,
          });

        } catch (error) {
          console.error("Error during authentication:", error);
          Alert.alert("Erreur", "Impossible de récupérer les données utilisateur.");
          setCanEnter(true); 
        }
      } else {
        Alert.alert("Erreur", "Access token ou refresh token manquant.");
        setCanEnter(true);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: `${config.BASE_URL}/auth/login` }}
        originWhitelist={["*"]}
        style={{ flex: 1, marginTop: 20 }}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
}
