import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import BoutonProfil from "../../components/profil/boutonProfil";
import { Fonts, Colors, TextStyles, loadFonts } from "@/constants/GraphSettings";
import { Phone, PhoneCall, Map, MapPin, Gauge, Bus, UserRoundCheck, Heart } from 'lucide-react-native';
import { useUser } from "@/contexts/UserContext";
import * as config from '../../constants/api/apiConfig';
import WebView from "react-native-webview";
import BoutonLien from '../../components/divers/boutonLien';
import { Link } from 'lucide-react-native';

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
            style={styles.logoutButton}
            onPress={handleLogout}
        >
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
    );
};

export default function Profil() {
    const { user } = useUser();
    const [showLogoutWebview, setShowLogoutWebView] = useState(false);

    useEffect(() => {
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, [user]);

    if (showLogoutWebview) {
        return (
            <View style={{ flex: 1 }}>
                <WebView
                    source={{ uri: `${config.API_BASE_URL}/auth/logout` }}
                    originWhitelist={["*"]}
                    style={{ flex: 1, marginTop: 20 }}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.profileContainer}>
                    <Image source={require("../../assets/images/OursCabine.png")} style={styles.profileImage} />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userName}>{user?.name} {user?.lastName}</Text>
                        <Text style={styles.userRoom}>{`Chambre ${user?.roomName || 'Non attribuée'}`}</Text>
                    </View>
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"ContactScreen"} options={{ title: 'Contact', icon: Phone }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"StopVssScreen"} options={{ title: 'Stop VSS', icon: PhoneCall }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"PlanDesPistesScreen"} options={{ title: 'Plan des pistes', icon: Map }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"PlanStationScreen"} options={{ title: 'Plan de la station', icon: MapPin }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"VitesseDeGlisseScreen"} options={{ title: 'Vitesse de glisse', icon: Gauge }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"SkinderNavigator"} options={{ title: 'Skinder', icon: Heart }} />
                </View>
                <View style={styles.navigationContainer}>
                    <BoutonProfil nextRoute={"NavettesScreen"} options={{ title: 'Navettes', icon: Bus }} />
                </View>
                {user?.admin === 1 && (
                    <View style={styles.navigationContainer}>
                        <BoutonProfil nextRoute={"AdminNavigator"} options={{ title: 'Contrôle Admin', icon: UserRoundCheck }} />
                    </View>
                )}
                <View style={styles.actionButtonsContainer}>
                    <LogoutButton setShowLogoutWebView={setShowLogoutWebView} />
                    <BoutonLien
                        url="https://assos.utc.fr/skiutc/public/CharteRGPD.html"
                        title="Charte RGPD"
                        IconComponent={Link}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        backgroundColor: "white",
        paddingBottom: 8,
    },
    scrollViewContainer: {
        alignItems: "center",
        justifyContent: "start",
        paddingBottom: 8,
    },
    profileContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'start',
        alignItems: 'center',
        paddingBottom: 8,
        paddingHorizontal: 20,
        gap: 25,
    },
    profileImage: {
        height: 164,
        width: 164,
    },
    userInfoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    userName: {
        fontSize: 24,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    userRoom: {
        fontSize: 18,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '400',
        color: Colors.gray,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
        marginTop: 20,
    },
    logoutButton: {
        backgroundColor: Colors.orange,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
    },
});
