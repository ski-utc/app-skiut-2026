import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, Image } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { useState } from "react";
import BoutonProfil from "../../components/profil/boutonProfil";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { Phone, PhoneCall, Map, MapPin, Gauge, Bus, UserRoundCheck } from 'lucide-react-native';
import { useUser } from "@/contexts/UserContext";
import * as config from '../../constants/api/apiConfig';
import WebView from "react-native-webview";
import Admin from "../admin/adminScreen";

const LogoutButton: React.FC<{ setShowLogoutWebView: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setShowLogoutWebView }) => {
    const { logout } = useUser();
  
    const handleLogout = () => {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
                setShowLogoutWebView(true);
                await logout();
            },
          },
        ]
      );
    };
  
    return (
      <TouchableOpacity
        style={{
          backgroundColor: Colors.orange,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
        onPress={handleLogout}
      >
        <Text
          style={{
            color: Colors.white,
            fontSize: 16,
            fontFamily: Fonts.Inter.Basic,
            fontWeight: '600',
          }}
        >
          Déconnexion
        </Text>
      </TouchableOpacity>
    );
  };
  

export default function Profil() {
    const { user } = useUser();
    console.log(user?.admin); 
    const [showLogoutWebview, setShowLogoutWebView] = useState(false);

    if(showLogoutWebview){
        return(
            <View style={{ flex: 1 }}>
                <WebView
                source={{ uri: `${config.API_BASE_URL}/auth/logout` }}
                originWhitelist={["*"]}
                style={{ flex: 1, marginTop: 20 }}
                />
            </View>
        )
    }

    console.log("user?.admin", user?.admin);


    return (
        <View 
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                backgroundColor: "white",
                paddingBottom: 8,
            }}
        >
            <Header/>
            <View
                style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'start',
                    alignItems: 'center',
                    paddingBottom: 8,
                    paddingHorizontal: 20,
                    gap: 25
                }}
            >
                <Image source={require("../../assets/images/OursCabine.png")} style={{height: 164, width: 164}} />
                <View
                >
                    <Text
                        style={{
                            fontSize: 24,
                            fontFamily: Fonts.Inter.Basic,
                            fontWeight: '600',
                        }}
                    >
                        {user?.name} {user?.lastName}
                    </Text>
                    <Text
                        style={{
                            fontSize: 18,
                            fontFamily: Fonts.Inter.Basic,
                            fontWeight: '400',
                            color: Colors.gray,
                        }}
                    >
                        Chambre {user?.room}
                    </Text>
                </View>
            </View>
            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"ContactScreen"} 
                    options={{
                        title: 'Contact',
                        icon: Phone,
                    }}
                />
            </View>
            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"StopVssScreen"} 
                    options={{
                        title: 'Stop VSS',
                        icon: PhoneCall,
                    }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"PlanDesPistesScreen"} 
                    options={{
                        title: 'Plan des pistes',
                        icon: Map,
                    }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"PlanStationScreen"} 
                    options={{
                        title: 'Plan de la station',
                        icon: MapPin,
                    }}
                />
            </View>
            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"VitesseDeGlisseScreen"} 
                    options={{
                        title: 'Vitesse de glisse',
                        icon: Gauge,
                    }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"NavettesScreen"} 
                    options={{
                        title: 'Navettes',
                        icon: Bus,
                    }}
                />
            </View>

            {/* Afficher le bouton admin uniquement si l'utilisateur est admin */}
            {user?.admin === 1 && ( // 1 = true (admin)
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"AdminNavigator"} options={{ title: 'Contrôle Admin', icon: UserRoundCheck }} />
                </View>
            )}
            {/*<View style={styles.navigationContainer}>
                <BoutonProfil nextRoute={"AdminNavigator"} options={{ title: 'Contrôle Admin', icon: UserRoundCheck }} />
            </View>*/}
            <LogoutButton setShowLogoutWebView={setShowLogoutWebView} />
        </View>
    );
}

const styles = StyleSheet.create({
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      },
});