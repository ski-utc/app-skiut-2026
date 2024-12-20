import { View, StyleSheet } from "react-native";
import { Text, Image } from "react-native";
import Header from "../../components/header";
import React from 'react';
import BoutonProfil from "../../components/profil/boutonProfil";
import { Fonts, Colors } from "@/constants/GraphSettings";


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
                <Image source={require("../../assets/images/OursCabine.png")} style={{height: '164px', width: '164px'}} />
                <View style={{

                    }}
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
                    profil={{
                        title:"Contact",
                        iconName:"phone",
                        iconLibrary:"FontAwesome"
                     }}
                />
            </View>
            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"StopVssScreen"} 
                    profil={{
                        title:"Stop VSS",
                        iconName:"phone-call",
                        iconLibrary:"Feather"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"PlanDesPistesScreen"} 
                    profil={{
                        title:"Plan des pistes",
                        iconName:"map",
                        iconLibrary:"FontAwesome"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"PlanStationScreen"} 
                    profil={{
                        title:"Plan de la station",
                        iconName:"map-pin",
                        iconLibrary:"Feather"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"VitesseDeGlisseScreen"} 
                    profil={{
                        title:"Vitesse de glisse",
                        iconName:"zap",
                        iconLibrary:"Feather"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"NavettesScreen"} 
                    profil={{
                        title:"Navettes",
                        iconName:"bus",
                        iconLibrary:"FontAwesome"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"AdminScreen"} 
                    profil={{
                        title:"Contrôle admin",
                        iconName:"check-circle",
                        iconLibrary:"Feather"
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