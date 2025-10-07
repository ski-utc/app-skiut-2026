import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { useUser } from "@/contexts/UserContext";
import * as config from "../../constants/api/apiConfig";
import { apiGet } from "@/constants/api/apiCalls";
import { Colors, Fonts, TextStyles } from "@/constants/GraphSettings";
import { useNavigation } from '@react-navigation/native';

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
              roomName: response.roomName,
              admin: response.admin
            });
          } else {
            setWebViewVisible(false);
            setError(`Une erreur est survenue lors de la récupération du user : ${response.message}`);
          }
        } catch (err) {
          if (err.JWT_ERROR) {
            setUser(null);
          } else {
            setWebViewVisible(false);
            setError(err.message);
          }
        }
      } else {
        setWebViewVisible(false);
        setError("Access Token ou Refresh Token manquant")
        setCanEnter(true);
      }
    } else if (hostname === config.DOMAIN && path === "skiutc/api/notConnected") {
      setWebViewVisible(false);
      const message = queryParams?.message;
      setError(message);
    }
  };

  if (error !== '') {
    return (
      <View
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            ...TextStyles.h1,
            color: Colors.error,
            padding: 10,
            textAlign: "center",
          }}
        >
          Une erreur est survenue...
        </Text>
        <Text
          style={{
            ...TextStyles.h3,
            color: Colors.primaryBorder,
            padding: 10,
            paddingBottom: 32,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <Text
          style={{
            ...TextStyles.body,
            color: Colors.muted,
            padding: 16,
            textAlign: "center",
          }}
        >
          Si l'erreur persiste, merci de contacter Mathis Delmaere
        </Text>
        <TouchableOpacity
          onPress={() => { navigation.goBack(); }}
          style={{
            width: '90%',
            alignSelf: 'center',
            backgroundColor: Colors.accent,
            paddingVertical: 15,
            marginVertical: 16,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{
            ...TextStyles.buttonLarge,
            color: Colors.white,
          }}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {isWebViewVisible && (
        <WebView
          source={{ uri: `${config.BASE_URL}/auth/login` }}
          originWhitelist={["*"]}
          style={{ flex: 1 }}
          onNavigationStateChange={handleNavigationStateChange}
          incognito={true}
          show
        />
      )}
    </View>
  );
}
