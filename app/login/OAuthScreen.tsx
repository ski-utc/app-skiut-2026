import React, { useState } from "react";
import { View, Alert, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@/contexts/UserContext";
import * as config from "../../constants/api/apiConfig";
import { apiGet } from "@/constants/api/apiCalls";
import { useNavigation } from "expo-router";

export default function OAuthScreen() {
  console.log("OAuthScreen");
  const { setUser } = useUser();
  const [canEnter, setCanEnter] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(""); // L'état pour stocker l'URL actuelle

  const handleNavigationStateChange2 = (navState) => {
    setCurrentUrl(navState.url);
  };
  const navigation = useNavigation();

  console.log("currentUrl", currentUrl === "" ? "empty" : currentUrl);  // Affiche l'URL actuelle ou "empty"
  console.log(`${config.BASE_URL}/auth/login`);  // Affiche l'URL de connexion
  const handleNavigationStateChange = async (state: any) => {
    console.log("handleNavigationStateChange triggered");

    const url = state.url;
    const { hostname, path, queryParams } = Linking.parse(url);

    console.log("Parsed URL:", { url, hostname, path, queryParams });

    // Met à jour l'état avec l'URL actuelle
    setCurrentUrl(url);

    console.log("canEnter:", canEnter);

    if (canEnter && hostname === config.DOMAIN && path === "skiutc/api/connected") {
      setCanEnter(false);

      const accessToken = queryParams?.access_token;
      const refreshToken = queryParams?.refresh_token;

      console.log("Tokens:", { accessToken, refreshToken });

      if (accessToken && refreshToken) {
        try {
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);

          const userData = await apiGet("getUserData");
          console.log("User data fetched:", userData);

          // Mets à jour le contexte utilisateur
          setUser({
            id: userData.id,
            name: userData.name,
            lastName: userData.lastName,
            room: userData.room,
            admin: userData.admin
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
      <Text>Connexion en cours : {config.BASE_URL}</Text>
      <WebView
        source={{ uri: `${config.BASE_URL}/auth/login` }}
        originWhitelist={["*"]}
        style={{ flex: 1, marginTop: 20 }}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </View>
  );
}
