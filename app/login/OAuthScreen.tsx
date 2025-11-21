import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from '@react-navigation/native';
import { X } from "lucide-react-native";

import { useUser } from "@/contexts/UserContext";
import { apiGet } from "@/constants/api/apiCalls";
import { Colors } from "@/constants/GraphSettings";
import ErrorScreen from "@/components/pages/errorPage";

import * as config from "../../constants/api/apiConfig";

export default function OAuthScreen() {
  const { setUser } = useUser();
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const [canEnter, setCanEnter] = useState(true);
  const [isWebViewVisible, setWebViewVisible] = useState(true);

  const handleNavigationStateChange = async (state: any) => {
    const url = state.url;
    const { hostname, path, queryParams } = Linking.parse(url);

    if (canEnter && hostname === config.DOMAIN && path === "skiutc/api/connected") {
      setCanEnter(false);

      const accessToken = Array.isArray(queryParams?.access_token)
        ? queryParams.access_token[0]
        : queryParams?.access_token;
      const refreshToken = Array.isArray(queryParams?.refresh_token)
        ? queryParams.refresh_token[0]
        : queryParams?.refresh_token;

      if (accessToken && refreshToken) {
        try {
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);

          const response = await apiGet("auth/me");
          if (response.success) {
            setUser({
              id: response.id,
              name: response.name,
              lastName: response.lastName,
              room: response.room,
              roomName: response.roomName,
              admin: response.admin,
              member: response.member
            });
          } else {
            setWebViewVisible(false);
            setError(`Une erreur est survenue lors de la récupération du user : ${response.message}`);
          }
        } catch (err: any) {
          if (err?.JWT_ERROR) {
            setUser(null);
          } else {
            setWebViewVisible(false);
            setError(err?.message || 'Une erreur est survenue');
          }
        }
      } else {
        setWebViewVisible(false);
        setError("Access Token ou Refresh Token manquant")
        setCanEnter(true);
      }
    } else if (hostname === config.DOMAIN && path === "skiutc/api/notConnected") {
      setWebViewVisible(false);
      const message = Array.isArray(queryParams?.message)
        ? queryParams.message[0]
        : queryParams?.message;
      setError(message || 'Erreur de connexion');
    }
  };

  if (error !== '') {
    return (
      <ErrorScreen error={error} />
    );
  }

  return (
    <View style={styles.container}>
      {isWebViewVisible && (
        <>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: `${config.BASE_URL}/auth/login` }}
            originWhitelist={["*"]}
            style={styles.webView}
            onNavigationStateChange={handleNavigationStateChange}
            incognito={true}
            show
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 22,
    elevation: 5,
    height: 44,
    justifyContent: 'center',
    opacity: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 44,
  },
  closeButtonContainer: {
    paddingRight: 16,
    paddingTop: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  webView: {
    flex: 1,
  }
});
