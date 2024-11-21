import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts } from "@/constants/GraphSettings"
import React from "react";
import BoutonNavigation from "@/components/divers/boutonNavigation"

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titre}>Donne nous tes plus beaux identifiants</Text>
            <Text style={styles.soustitre}>Si tu as un problème de connexion contact les resp informatique.</Text>
            <View style={styles.boutonContainer}>
                <BoutonNavigation
                    nextRoute={"homeScreen"}
                    title={"Se connecter"}
                    IconComponent={""}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    titre: {
        color: Colors.black,
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: '500',
        width: 348,
        height: 78,
        marginTop: 100,
        marginLeft: 32,
        marginRight: 34,
    },
    soustitre: {
        color: Colors.gray,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 21,
        marginTop: 12,
        marginLeft: 32,
        marginRight: 34,
    },
    boutonContainer: {
        marginLeft: 32,
        marginRight: 32,
        alignItems: 'center',
    }
});
