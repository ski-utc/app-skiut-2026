import React, { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@/contexts/UserContext";
import * as config from "../../constants/api/apiConfig";
import { apiGet } from "@/constants/api/apiCalls";
import { useNavigation, useRouter } from "expo-router";

export default function OAuthScreen() {
  console.log("OAuthScreen");
  const { setUser } = useUser();
  const [canEnter, setCanEnter] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();

  // Ajout d'un mode bypass pour un utilisateur fictif
  useEffect(() => {
    const bypassAuth = async () => {
      if (config.APP_NO_LOGIN) { // Vérifie si le contournement est activé
        console.log("Bypass authentication activated.");
        try {
          // Utilisateur fictif
          const fakeUser = {
            id: "12345",
            name: "John",
            lastName: "Doe",
            room: 1,
            admin: 0,
          };

          // Stocker des jetons fictifs
          await SecureStore.setItemAsync("accessToken", "fakeAccessToken");
          await SecureStore.setItemAsync("refreshToken", "fakeRefreshToken");

          // Mettre à jour le contexte utilisateur avec l'utilisateur fictif
          setUser(fakeUser);

          // Redirection après authentification réussie
          router.push("/HomeScreen")
          } catch (error) {
          console.error("Error during bypass authentication:", error);
          Alert.alert("Erreur", "Impossible de configurer l'utilisateur fictif.");
        }
      }
    };

    bypassAuth();
  }, []);

  const handleNavigationStateChange = async (state: any) => {
    const url = state.url;

    if (canEnter && url.includes(`${config.BASE_URL}/api/connected`)) {
      setCanEnter(false);

      // Récupère les tokens de la redirection OAuth
      const accessToken = new URL(url).searchParams.get("access_token");
      const refreshToken = new URL(url).searchParams.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);

          const userData = await apiGet("getUserData");
          
          // Mets à jour le contexte utilisateur
          setUser({
            id: userData.id,
            name: userData.name,
            lastName: userData.lastName,
            room: userData.room,
            admin: userData.admin
          });

          // Redirection après authentification réussie
          navigation.replace("HomeScreen");
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
      {!config.APP_NO_LOGIN && (
        <WebView
          source={{ uri: `${config.BASE_URL}/auth/login` }}
          originWhitelist={["*"]}
          style={{ flex: 1, marginTop: 20 }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}
    </View>
  );
}
