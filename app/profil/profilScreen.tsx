import { View, StyleSheet } from "react-native";
import { Text } from "react-native";
import Header from "../../components/header";
import React from 'react';
import BoutonProfil from "../../components/profil/boutonProfil";


export default function Profil() {
    return (
        <View style={styles.container}>
            <Header  />
            <View style={styles.headerContainer}>
                <Text>John Doe</Text>
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
                    nextRoute={"StationScreen"} 
                    profil={{
                        title:"Plan de la station",
                        iconName:"map-pinned",
                        iconLibrary:"MaterialCommunityIcons"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"VitesseScreen"} 
                    profil={{
                        title:"Vitesse de glisse",
                        iconName:"vector",
                        iconLibrary:"MaterialCommunityIcons"
                     }}
                />
            </View>

            <View style={styles.navigationContainer}>
                <BoutonProfil 
                    nextRoute={"NavetteScreen"} 
                    profil={{
                        title:"Navette",
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
    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        paddingBottom: 8,
    },
    headerContainer: {
        width: '100%',
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      },
});