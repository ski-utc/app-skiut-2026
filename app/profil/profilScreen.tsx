import { View, StyleSheet } from "react-native";
import { Text, Image } from "react-native";
import Header from "../../components/header";
import React from 'react';
import BoutonProfil from "../../components/profil/boutonProfil";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { Phone, PhoneCall, Map, MapPin, Gauge, Bus, UserRoundCheck } from 'lucide-react-native';


export default function Profil() {
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
                            fontSize: 32,
                            fontFamily: Fonts.Inter.Basic,
                            fontWeight: '600',
                        }}
                    >
                        John Doe
                    </Text>
                    <Text
                        style={{
                            fontSize: 20,
                            fontFamily: Fonts.Inter.Basic,
                            fontWeight: '400',
                            color: Colors.gray,
                        }}
                    >
                        Chambre 112
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

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"AdminNavigator"} 
                    options={{
                        title: 'Contrôle Admin',
                        icon: UserRoundCheck,
                    }}
                />
            </View>

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