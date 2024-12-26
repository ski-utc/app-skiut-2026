import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { BYPASS_LOGIN } from "@/constants/api/apiConfig";
import { useUser } from "@/contexts/UserContext";
import { Colors, Fonts } from "@/constants/GraphSettings"
import React from "react";
import OAuthScreen from "./OAuthScreen";

export default function LoginScreen() {
    const { setUser } = useUser();

    useEffect(() => {
        if (BYPASS_LOGIN) {
            setUser({
                id: 1,
                name: 'Prénom',
                lastName: 'Nom',
                room: 333,
                admin: true,
            });
        }
    }, [setUser]);

    return (
        <SafeAreaView style={styles.container}>
          <OAuthScreen/>
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
    flexGrow: {
        flex: 1,
    },
    boutonContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        paddingBottom: 16,
    }
});
