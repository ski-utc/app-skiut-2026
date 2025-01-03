import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts } from "@/constants/GraphSettings"
import React from "react";
import OAuthScreen from "./OAuthScreen";

export default function LoginScreen() {
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
});
